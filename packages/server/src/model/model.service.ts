import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import {
  CeramicModelMainNet,
  CeramicModelTestNet,
  MetaModel,
  MetaModelMainnet,
} from '../entities/model/model.entity';
import {
  CeramicModelMainNetRepository,
  CeramicModelTestNetRepository,
  MetaModelMainnetRepository,
  MetaModelRepository,
} from '../entities/model/model.repository';
import { EntityManager, In, Repository } from 'typeorm';
import { Network, Stream } from 'src/entities/stream/stream.entity';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import {
  S3_MAINNET_MODELS_USE_COUNT_ZSET,
  S3_TESTNET_MODELS_USE_COUNT_ZSET,
} from 'src/common/constants';
import { Cron } from '@nestjs/schedule';
import {
  getCeramicNode,
  getCeramicNodeAdminKey,
  importDynamic,
} from 'src/common/utils';

@Injectable()
export default class ModelService {
  private readonly logger = new Logger(ModelService.name);

  constructor(
    @InjectRepository(MetaModel, 'testnet')
    private readonly metaModelRepository: MetaModelRepository,

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

  async getStreams(network: Network, modelStreamId: string, pageSize: number, pageNumber: number): Promise<any[]> {
    let ceramicEntityManager: EntityManager;
    network == Network.MAINNET ? ceramicEntityManager = this.mainnetCeramicEntityManager : ceramicEntityManager = this.testnetCeramicEntityManager;

    const mids = await ceramicEntityManager.query(`select * from ${modelStreamId} order by created_at DESC limit ${pageSize} offset ${pageSize * (pageNumber - 1)}`)
    if (mids.length == 0) return [];

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

  async getMid(network: Network, modelStreamId: string, midStreamId: string): Promise<any> {
    let ceramicEntityManager: EntityManager;
    network == Network.MAINNET ? ceramicEntityManager = this.mainnetCeramicEntityManager : ceramicEntityManager = this.testnetCeramicEntityManager;

    const mids = await ceramicEntityManager.query(`select * from ${modelStreamId} where stream_id='${midStreamId}'`)
    if (mids.length == 0) return;

    const indexedModels = await this.findIndexedModelIds(network, [modelStreamId]);

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
    network == Network.MAINNET ? ceramicEntityManager = this.mainnetCeramicEntityManager : ceramicEntityManager = this.testnetCeramicEntityManager;

    const metaModel = 'kh4q0ozorrgaq2mezktnrmdwleo1d';
    const mids = await ceramicEntityManager.query(`select * from ${metaModel} where stream_id='${modelStreamId}'`)
    if (mids.length == 0) return;

    const indexedModels = await this.findIndexedModelIds(network, [modelStreamId]);

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


  // Currently only support testnet.
  async indexTopModelsForTestNet(topNum: number) {
    try {
      const modelMap = await this.getModelsByDecsPagination(
        Network.TESTNET,
        topNum,
        1,
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
        where: { model: In(Array.from(modelMap.keys())) },
      });
      const indexedModelIds = indexedModels.map((m) => m.getModel);
      for await (const m of modelMap) {
        try {
          this.logger.log(`To index models, stream id:${m[0]}`);
          if (indexedModelIds.includes(m[0])) continue;
          this.logger.log(`Index models, stream id:${m[0]}`);
          const res = await ceramic.admin.startIndexingModels([m[0]]);
          this.logger.log(`Indexed model: ${m[0]}.`);
        } catch (error) {
          this.logger.error(`Add model ${m[0]} index err: ${error}`);
        }
      }
    } catch (error) {
      this.logger.error(`Add models index err: ${error}`);
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
  ): Promise<MetaModel[] | MetaModelMainnet[]> {
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

  async findIndexedModelIds(network: Network, modelStreamIds: string[]): Promise<string[]> {
    let models: any[] = [];
    if (network == Network.MAINNET) {
      models = await this.ceramicModelMainNetRepository.find({ where: { model: In(modelStreamIds) } });
    } else if (network == Network.TESTNET) {
      models = await this.ceramicModelTestNetRepository.find({ where: { model: In(modelStreamIds) } });
    }

    return models?.map(m => m.getModel);
  }

  async findModels(
    pageSize: number,
    pageNumber: number,
    name?: string,
    did?: string,
    description?: string,
    startTimeMs?: number,
    network?: Network,
  ): Promise<MetaModel[] | MetaModelMainnet[]> {
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

  async getModelStatistics(
    network: Network = Network.TESTNET,
  ): Promise<any> {

    console.time(`${network}-getModelStatistics`);

    const models = await this.getMetaModelRepository(network)
      .createQueryBuilder('kh4q0ozorrgaq2mezktnrmdwleo1d')
      .select(['kh4q0ozorrgaq2mezktnrmdwleo1d.created_at'])
      .orderBy('created_at', 'DESC')
      .getMany();

    console.timeEnd(`${network}-getModelStatistics`);

    const now = Math.floor((new Date()).getTime() / 1000);
    const today = Math.floor(now / (24 * 3600)) * 24 * 3600;
    let i = 0;
    for (i = 0; i < models.length; ++i) {
      const t = Math.floor(models[i].getCreatedAt.getTime() / 1000);
      if (t < today) { break; }
    }
    return { totalModels: models.length, todayModels: i + 1 }
  }

}
