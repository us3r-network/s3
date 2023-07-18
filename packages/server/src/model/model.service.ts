import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import {
  CeramicModelMainNet,
  CeramicModelTestNet,
  MetaModelTestNet,
  MetaModelMainnet,
} from '../entities/model/model.entity';
import {
  CeramicModelMainNetRepository,
  CeramicModelTestNetRepository,
  MetaModelMainnetRepository,
  MetaModelTestNetRepository,
} from '../entities/model/model.repository';
import { EntityManager, In, Repository } from 'typeorm';
import { Network, Stream } from 'src/entities/stream/stream.entity';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import {
  S3_MAINNET_MODELS_USE_COUNT_ZSET,
  S3_MODEL_GRAPHQL_COMPOSITE_CACHE_PREFIX,
  S3_MODEL_GRAPHQL_GRAPHQLSCHEMA_CACHE_PREFIX,
  S3_MODEL_GRAPHQL_RUNTIMEDEFINITION_CACHE_PREFIX,
  S3_TESTNET_MODELS_USE_COUNT_ZSET,
} from 'src/common/constants';
import { Cron } from '@nestjs/schedule';
import {
  getCeramicNode,
  getCeramicNodeAdminKey,
  importDynamic,
} from 'src/common/utils';
import { get } from 'http';
import { CreateModelDto } from './dtos/model.dto';
import { generateLoadModelGraphqls, parseToCreateModelGraphqls } from 'src/utils/graphql/parser';
import { type } from 'os';

@Injectable()
export default class ModelService {
  private readonly logger = new Logger(ModelService.name);

  constructor(
    @InjectRepository(MetaModelTestNet, 'testnet')
    private readonly metaModelRepository: MetaModelTestNetRepository,

    @InjectRepository(MetaModelMainnet, 'mainnet')
    private readonly metaModelMainnetRepository: MetaModelMainnetRepository,

    @InjectRepository(CeramicModelTestNet, 'testnet')
    private readonly ceramicModelTestNetRepository: CeramicModelTestNetRepository,

    @InjectRepository(CeramicModelMainNet, 'mainnet')
    private readonly ceramicModelMainNetRepository: CeramicModelMainNetRepository,

    @InjectEntityManager('testnet')
    private testnetCeramicEntityManager: EntityManager,

    @InjectEntityManager('mainnet')
    private mainnetCeramicEntityManager: EntityManager,

    @InjectRedis() private readonly redis: Redis,
  ) { }

  async saveModelGraphCache(
    network: Network,
    model: string,
    composite: any,
    runtimeDefinition: any,
    graphqlSchema: any,
  ) {
    try {
      const pipeline = this.redis.pipeline();
      pipeline.set(
        S3_MODEL_GRAPHQL_COMPOSITE_CACHE_PREFIX + network + ':' + model,
        JSON.stringify(composite),
      );
      pipeline.set(
        S3_MODEL_GRAPHQL_RUNTIMEDEFINITION_CACHE_PREFIX + network + ':' + model,
        JSON.stringify(runtimeDefinition),
      );
      pipeline.set(
        S3_MODEL_GRAPHQL_GRAPHQLSCHEMA_CACHE_PREFIX + network + ':' + model,
        graphqlSchema,
      );
      const results = await pipeline.exec();
      this.logger.log(
        `Saving ${network} model ${model} graph cache result ${results}`,
      );
    } catch (error) {
      this.logger.error(
        `Saving ${network} model ${model} graph cache err ${error}`,
      );
    }
  }

  async storeModelGraphql(network: Network, modelStreamId: string, graphqls: string[]) {
    const redisKey = `s3:${network}:model:${modelStreamId}:graphqls`;
    try {
      const result = await this.redis.sadd(redisKey, ...graphqls);
      this.logger.log(`Storing ${network} model ${modelStreamId} graphqls ${graphqls} result ${result}`);
    } catch (error) {
      this.logger.error(`Storing ${network} model ${modelStreamId} graphqls ${graphqls} err ${error}`);
    }
  }

  async getModelGraphql(network: Network, modelStreamId: string): Promise<string[]> {
    const redisKey = `s3:${network}:model:${modelStreamId}:graphqls`;
    try {
      const graphqls = await this.redis.smembers(redisKey);
      this.logger.log(`Getting ${network} model ${modelStreamId} graphqls ${graphqls}`);
      return graphqls;
    } catch (error) {
      this.logger.error(`Getting ${network} model ${modelStreamId} graphqls err ${error}`);
    }
  }

  async createAndDeployModel(dto: CreateModelDto, didSession?: string): Promise<any> {
    try {
      const ceramic_node = getCeramicNode(dto.network);
      const ceramic_node_admin_key = getCeramicNodeAdminKey(dto.network);
      const { CeramicClient } = await importDynamic(
        '@ceramicnetwork/http-client',
      );
      const { Composite } = await importDynamic('@composedb/devtools');
      const { DID } = await importDynamic('dids');
      const { Ed25519Provider } = await importDynamic('key-did-provider-ed25519');
      const { getResolver } = await importDynamic('key-did-resolver');
      const { fromString } = await importDynamic('uint8arrays/from-string');

      // TODO  verify the syntax of the graphql paramter.
      this.logger.log(`Create and deploy model, graphql: ${dto.graphql}`);
      if (!dto.graphql || dto.graphql.length == 0) {
        this.logger.error('Graphql paramter is empty.');
        throw new BadRequestException('Graphql paramter is empty.');
      }

      // Login
      this.logger.log('Connecting to the our ceramic node...');
      const ceramic = new CeramicClient(ceramic_node);
      try {
        if (didSession) {
          const { DIDSession } = await importDynamic('did-session');
          const session = await DIDSession.fromSession(didSession);
          ceramic.did = session.did;
        } else {
          const privateKey = fromString(ceramic_node_admin_key, 'base16');
          const did = new DID({
            resolver: getResolver(),
            provider: new Ed25519Provider(privateKey),
          });
          await did.authenticate();
          ceramic.did = did;
        }
        this.logger.log('Connected to the our ceramic node!');
      } catch (e) {
        this.logger.error((e as Error).message);
        throw new ServiceUnavailableException((e as Error).message);
      }

      // Create composites
      let composites = [];
      const createModelGraphqlsMap = parseToCreateModelGraphqls(dto.graphql);
      const modelStreamIdMap = new Map<string, string>();
      if (createModelGraphqlsMap.size > 0) {
        // For creating model and load model graphql
        for await (const [model, graphqls] of createModelGraphqlsMap) {
          // Generate associated loading model graphql
          const schema: string[] = [];
          const loadingGraphqls = generateLoadModelGraphqls(dto.graphql, model, modelStreamIdMap);
          if (loadingGraphqls?.length > 0) {
            schema.push(...loadingGraphqls)
          }

          schema.push(...graphqls);
          createModelGraphqlsMap.set(model, schema);
          this.logger.log(`Creating ${model} ${schema} the composite...`);
          let composite = await Composite.create({
            ceramic: ceramic,
            schema: schema,
          });
          this.logger.log(
            `Creating ${model} the composite... Done! The encoded representation:${composite.toJSON()}`,
          );
          composites.push(composite);
          modelStreamIdMap.set(model, composite.toRuntime()?.models[model].id);
        }
      } else {
        // For loading model graphql
        let composite = await Composite.create({
          ceramic: ceramic,
          schema: dto.graphql,
        });
        this.logger.log(
          `Creating the composite... Done! The encoded representation:${composite.toJSON()}`,
        );
        composites.push(composite);
      }

      // Merge composites
      const mergedComposite = Composite.from(composites);

      // Compile composites
      let runtimeDefinition;
      try {
        this.logger.log('Compiling the composite...');
        runtimeDefinition = mergedComposite.toRuntime();
        this.logger.log(JSON.stringify(runtimeDefinition));
        this.logger.log(`Compiling the composite... Done!`);
      } catch (e) {
        this.logger.error((e as Error).message);
        throw new ServiceUnavailableException((e as Error).message);
      }

      const { printGraphQLSchema } = await importDynamic('@composedb/runtime');
      const graphqlSchema = printGraphQLSchema(runtimeDefinition);

      // Store the model graphs 
      if (createModelGraphqlsMap.size > 0) {
        for await (const [model, graphqls] of createModelGraphqlsMap) {
          const modelStreamId = runtimeDefinition?.models[model].id;
          await this.storeModelGraphql(
            dto.network,
            modelStreamId,
            graphqls,
          );
        }
      }

      return {
        graphqlSchema: graphqlSchema,
        composite: mergedComposite,
        runtimeDefinition: runtimeDefinition,
      }
    } catch (error) {
      this.logger.error(`Create and deploy model err ${error}`);
      throw new ServiceUnavailableException((error as Error).message);
    }
  }

  async getModelGraphCache(network: Network, model: string): Promise<any> {
    try {
      const composite = await this.redis.get(
        S3_MODEL_GRAPHQL_COMPOSITE_CACHE_PREFIX + network + ':' + model,
      );
      const runtimeDefinition = await this.redis.get(
        S3_MODEL_GRAPHQL_RUNTIMEDEFINITION_CACHE_PREFIX + network + ':' + model,
      );
      const graphqlSchema = await this.redis.get(
        S3_MODEL_GRAPHQL_GRAPHQLSCHEMA_CACHE_PREFIX + network + ':' + model,
      );
      if (composite && runtimeDefinition && graphqlSchema) {
        this.logger.log(
          `Getting ${network} model ${model} graph cache conposite ${JSON.parse(
            composite,
          )},  runtimeDefinition ${JSON.parse(
            runtimeDefinition,
          )},  graphqlSchema ${graphqlSchema}`,
        );
        return {
          composite: JSON.parse(composite),
          runtimeDefinition: JSON.parse(runtimeDefinition),
          graphqlSchema: graphqlSchema,
        };
      }
      return;
    } catch (error) {
      this.logger.error(
        `Getting ${network} model ${model} graph cache err ${error}`,
      );
    }
  }

  async findModelUseCount(
    network: Network,
    models: string[],
  ): Promise<Map<string, number>> {
    const useCountMap = new Map<string, number>();
    let ceramicEntityManager: EntityManager;
    network == Network.MAINNET
      ? (ceramicEntityManager = this.mainnetCeramicEntityManager)
      : (ceramicEntityManager = this.testnetCeramicEntityManager);

    try {
      const modelUseCounts = await Promise.all(models.map(m => {
        return ceramicEntityManager.query(`select count(*) from ${m}`)
      }));

      for (let i = 0; i < models.length; i++) {
        useCountMap.set(models[i], +modelUseCounts[i][0].count);
      }
    } catch (error) {
      this.logger.error(`querying model use count ${models} err: ${error}`);
      throw new ServiceUnavailableException((error as Error).message);
    }

    return useCountMap;
  }

  async findModelFirstRecord(network: Network, models: string[]) {
    const firstRecordMap = new Map<string, any>();
    let ceramicEntityManager: EntityManager;
    network == Network.MAINNET
      ? (ceramicEntityManager = this.mainnetCeramicEntityManager)
      : (ceramicEntityManager = this.testnetCeramicEntityManager);

    try {
      const firstRecords = await Promise.all(
        models.map((m) => {
          return ceramicEntityManager.query(`select * from ${m} limit 1`);
        }),
      );

      for (let i = 0; i < models.length; i++) {
        firstRecordMap.set(models[i], firstRecords[i][0]);
      }
    } catch (error) {
      this.logger.error(`querying model first record ${models} err: ${error}`);
      throw new ServiceUnavailableException((error as Error).message);
    }

    return firstRecordMap;
  }

  async getStreams(
    network: Network,
    modelStreamId: string,
    pageSize: number,
    pageNumber: number,
  ): Promise<any[]> {
    let ceramicEntityManager: EntityManager;
    network == Network.MAINNET
      ? (ceramicEntityManager = this.mainnetCeramicEntityManager)
      : (ceramicEntityManager = this.testnetCeramicEntityManager);

    let mids = [];
    try {
      mids = await ceramicEntityManager.query(
        `select * from ${modelStreamId} order by created_at DESC limit ${pageSize} offset ${pageSize * (pageNumber - 1)
        }`,
      );
    } catch (error) {
      this.logger.error(`querying model ${modelStreamId} err: ${error}`);
    }
    if (mids?.length == 0) return [];

    return mids.map((mid: any) => {
      return {
        streamId: mid.stream_id,
        controllerDid: mid.controller_did,
        tip: mid.tip,
        streamContent: mid.stream_content,
        lastAnchoredAt: mid.last_anchored_at?.getTime(),
        firstAnchoredAt: mid.first_anchored_at?.getTime(),
        createdAt: mid.created_at?.getTime(),
        updatedAt: mid.updated_at?.getTime(),
      };
    });
  }

  async getMid(
    network: Network,
    modelStreamId: string,
    midStreamId: string,
  ): Promise<any> {
    let ceramicEntityManager: EntityManager;
    network == Network.MAINNET
      ? (ceramicEntityManager = this.mainnetCeramicEntityManager)
      : (ceramicEntityManager = this.testnetCeramicEntityManager);

    const mids = await ceramicEntityManager.query(
      `select * from ${modelStreamId} where stream_id='${midStreamId}'`,
    );
    if (mids.length == 0) return;

    const indexedModels = await this.findIndexedModelIds(network, [
      modelStreamId,
    ]);

    const mid = mids[0];
    return {
      streamId: mid.stream_id,
      controllerDid: mid.controller_did,
      tip: mid.tip,
      streamContent: mid.stream_content,
      lastAnchoredAt: mid.last_anchored_at?.getTime(),
      firstAnchoredAt: mid.first_anchored_at?.getTime(),
      createdAt: mid.created_at?.getTime(),
      updatedAt: mid.updated_at?.getTime(),
      isIndexed: indexedModels.length == 1,
    };
  }

  async getModel(network: Network, modelStreamId: string): Promise<any> {
    let ceramicEntityManager: EntityManager;
    network == Network.MAINNET
      ? (ceramicEntityManager = this.mainnetCeramicEntityManager)
      : (ceramicEntityManager = this.testnetCeramicEntityManager);

    const metaModel = 'kh4q0ozorrgaq2mezktnrmdwleo1d';
    const mids = await ceramicEntityManager.query(
      `select * from ${metaModel} where stream_id='${modelStreamId}'`,
    );
    if (mids.length == 0) return;

    const indexedModels = await this.findIndexedModelIds(network, [
      modelStreamId,
    ]);

    const mid = mids[0];
    return {
      streamId: mid.stream_id,
      controllerDid: mid.controller_did,
      tip: mid.tip,
      streamContent: mid.stream_content,
      lastAnchoredAt: mid.last_anchored_at?.getTime(),
      firstAnchoredAt: mid.first_anchored_at?.getTime(),
      createdAt: mid.created_at?.getTime(),
      updatedAt: mid.updated_at?.getTime(),
      isIndexed: indexedModels.length == 1,
    };
  }

  async indexModels(models: string[], network: Network): Promise<void> {
    try {
      // index new models
      const { CeramicClient } = await importDynamic(
        '@ceramicnetwork/http-client',
      );
      const { DID } = await importDynamic('dids');
      const { Ed25519Provider } = await importDynamic(
        'key-did-provider-ed25519',
      );
      const { getResolver } = await importDynamic('key-did-resolver');
      const { fromString } = await importDynamic('uint8arrays/from-string');
      const ceramicNode = getCeramicNode(network);
      const ceramicNodeAdminKey = getCeramicNodeAdminKey(network);
      const ceramic = new CeramicClient(ceramicNode);
      const privateKey = fromString(ceramicNodeAdminKey, 'base16');
      const did = new DID({
        resolver: getResolver(),
        provider: new Ed25519Provider(privateKey),
      });
      await did.authenticate();
      ceramic.did = did;

      for await (const m of models) {
        try {
          this.logger.log(`Index models, stream id:${m}`);
          const res = await ceramic.admin.startIndexingModels([m]);
          this.logger.log(`Indexed model: ${m}.`);
        } catch (error) {
          this.logger.error(`Add model ${m} index err: ${error}`);
        }
      }
    } catch (error) {
      this.logger.error(`Add models index err: ${error}`);
      throw new ServiceUnavailableException((error as Error).message);
    }
  }

  // @Cron('*/3 * * * *')
  async indexNewModelsOnTestNet() {
    try {
      // find new models of a period from kh4...
      const newModels = await this.metaModelRepository
        .createQueryBuilder()
        .where('created_at>:createdAt', {
          createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
        })
        .getMany();
      if (newModels.length == 0) return;
      this.logger.log(
        `To index models lenth:${newModels.length}, stream ids:${newModels.map(
          (m) => m.getStreamId,
        )}`,
      );

      // index new models
      const { CeramicClient } = await importDynamic(
        '@ceramicnetwork/http-client',
      );
      const { DID } = await importDynamic('dids');
      const { Ed25519Provider } = await importDynamic(
        'key-did-provider-ed25519',
      );
      const { getResolver } = await importDynamic('key-did-resolver');
      const { fromString } = await importDynamic('uint8arrays/from-string');
      const ceramicNode = getCeramicNode(Network.TESTNET);
      const ceramicNodeAdminKey = getCeramicNodeAdminKey(Network.TESTNET);
      const ceramic = new CeramicClient(ceramicNode);
      const privateKey = fromString(ceramicNodeAdminKey, 'base16');
      const did = new DID({
        resolver: getResolver(),
        provider: new Ed25519Provider(privateKey),
      });
      await did.authenticate();
      ceramic.did = did;

      const indexedModels = await this.ceramicModelTestNetRepository.find({
        where: { model: In(newModels.map((m) => m.getStreamId)) },
      });
      const indexedModelIds = indexedModels.map((m) => m.getModel);
      for await (const m of newModels) {
        try {
          this.logger.log(`To index models, stream id:${m.getStreamId}`);
          if (indexedModelIds.includes(m.getStreamId)) continue;

          this.logger.log(`Indexing models, stream id:${m.getStreamId}`);
          const res = await ceramic.admin.startIndexingModels([m.getStreamId]);
          this.logger.log(`Indexed models, stream id:${m.getStreamId}`);
        } catch (error) {
          this.logger.error(`Index model ${m.getStreamId}  err: ${error}`);
        }
      }
    } catch (error) {
      this.logger.error(`Index models index err: ${error}`);
    }
  }

  getMetaModelRepository(network: Network) {
    return network == Network.MAINNET
      ? this.metaModelMainnetRepository
      : this.metaModelRepository;
  }

  async findModelsByIds(
    streamIds: string[],
    network: Network = Network.TESTNET,
  ): Promise<MetaModelTestNet[] | MetaModelMainnet[]> {
    return this.getMetaModelRepository(network).find({
      where: { stream_id: In(streamIds) },
    });
  }

  async findAllModelIds(network: Network): Promise<string[]> {
    const result = await this.getMetaModelRepository(network)
      .createQueryBuilder()
      .select(['stream_id'])
      .getRawMany();
    return result.map((r) => r['stream_id']);
  }

  async findIndexedModelIds(
    network: Network,
    modelStreamIds: string[],
  ): Promise<string[]> {
    let models: any[] = [];
    if (network == Network.MAINNET) {
      models = await this.ceramicModelMainNetRepository.find({
        where: { model: In(modelStreamIds), is_indexed: true },
      });
    } else if (network == Network.TESTNET) {
      models = await this.ceramicModelTestNetRepository.find({
        where: { model: In(modelStreamIds), is_indexed: true },
      });
    }

    return models?.map((m) => m.getModel);
  }

  async findModels(
    pageSize: number,
    pageNumber: number,
    name?: string,
    did?: string,
    description?: string,
    startTimeMs?: number,
    network?: Network,
  ): Promise<MetaModelTestNet[] | MetaModelMainnet[]> {
    let whereSql = '';
    if (name?.trim().length > 0) {
      if (whereSql.length > 0) {
        whereSql += ' AND ';
      }
      whereSql += `LOWER(stream_content->>'name') LIKE :nameValue`;
    }
    if (did?.trim().length > 0) {
      if (whereSql.length > 0) {
        whereSql += ' AND ';
      }
      whereSql += `controller_did=:did`;
    }
    if (description?.trim().length > 0) {
      if (whereSql.length > 0) {
        whereSql += ' AND ';
      }
      whereSql += `LOWER(stream_content->>'description') LIKE :descriptionValue`;
    }

    if (startTimeMs > 0) {
      if (whereSql.length > 0) {
        whereSql += ' AND ';
      }
      whereSql += 'created_at > :startTime';
    }

    return await this.getMetaModelRepository(network)
      .createQueryBuilder()
      .where(whereSql, {
        nameValue: '%' + name?.toLowerCase() + '%',
        descriptionValue: '%' + description?.toLowerCase() + '%',
        startTime: new Date(Number(startTimeMs)),
        did: did,
      })
      .limit(pageSize)
      .offset(pageSize * (pageNumber - 1))
      .orderBy('created_at', 'DESC')
      .getMany();
  }

  async getModelsByDecsPagination(
    network: Network,
    pageSize: number,
    pageNumber: number,
  ): Promise<Map<string, number>> {
    const useCountMap = new Map<string, number>();
    const key =
      network == Network.MAINNET
        ? S3_MAINNET_MODELS_USE_COUNT_ZSET
        : S3_TESTNET_MODELS_USE_COUNT_ZSET;
    const memebers = await this.redis.zrange(
      key,
      -(pageSize * pageNumber + 1),
      -((pageNumber - 1) * pageSize + 1),
      'WITHSCORES',
    );
    for (let index = 0; index < memebers.length; index++) {
      if (index % 2 == 0) {
        useCountMap.set(memebers[index], +memebers[index + 1]);
      }
    }
    return useCountMap;
  }

  async updateModelUseCount(
    network: Network,
    useCountMap: Map<string, number>,
  ) {
    const key =
      network == Network.MAINNET
        ? S3_MAINNET_MODELS_USE_COUNT_ZSET
        : S3_TESTNET_MODELS_USE_COUNT_ZSET;
    const members: (string | Buffer | number)[] = [];
    Array.from(useCountMap).forEach(([modelId, useCount]) => {
      members.push(useCount);
      members.push(modelId);
    });
    await this.redis.zadd(key, ...members);
  }

  async getModelStatistics(network: Network = Network.TESTNET): Promise<any> {
    console.time(`${network}-getModelStatistics`);

    const models = await this.getMetaModelRepository(network)
      .createQueryBuilder('kh4q0ozorrgaq2mezktnrmdwleo1d')
      .select(['kh4q0ozorrgaq2mezktnrmdwleo1d.created_at'])
      .orderBy('created_at', 'DESC')
      .getMany();

    console.timeEnd(`${network}-getModelStatistics`);

    const now = Math.floor(new Date().getTime() / 1000);
    const today = Math.floor(now / (24 * 3600)) * 24 * 3600;
    let i = 0;
    for (i = 0; i < models.length; ++i) {
      const t = Math.floor(models[i].getCreatedAt.getTime() / 1000);
      if (t < today) {
        break;
      }
    }
    return { totalModels: models.length, todayModels: i + 1 };
  }
}
