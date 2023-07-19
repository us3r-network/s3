import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import ModelService from './model.service';
import { BasicMessageDto } from '../common/dto';
import StreamService from 'src/stream/stream.service';
import { Network } from 'src/entities/stream/stream.entity';
import { CreateModelDto, ModelIdToGaphqlDto } from './dtos/model.dto';
import {
  getCeramicNode,
  importDynamic,
} from 'src/common/utils';
import { Cron } from '@nestjs/schedule';
import { CodegenConfig, generate } from '@graphql-codegen/cli';
import * as path from 'path';
import * as typescriptPlugin from '@graphql-codegen/typescript';
import * as typescriptOperationsPlugin from '@graphql-codegen/typescript-operations';
import { CodegenPlugin } from '@graphql-codegen/plugin-helpers';
import * as addPlugin from '@graphql-codegen/add';
import * as typescriptValidationPlugin from 'graphql-codegen-typescript-validation-schema';
import * as typescriptReactQueryPlugin from '@graphql-codegen/typescript-react-query';
import * as typescriptReactApolloPlugin from '@graphql-codegen/typescript-react-apollo';


@ApiTags('/models')
@Controller('/models')
export class ModelController {
  private readonly logger = new Logger(ModelController.name);
  constructor(
    private readonly modelService: ModelService,
    private readonly streamService: StreamService,
  ) {
    //test
    //this.initModels();
    //this.testModelId2graphql();
  }

  @Get('/')
  @ApiQuery({
    name: 'name',
    required: false,
  })
  @ApiQuery({
    name: 'description',
    required: false,
  })
  @ApiQuery({
    name: 'startTimeMs',
    required: false,
  })
  @ApiQuery({
    name: 'pageNumber',
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
  })
  @ApiOkResponse({ type: BasicMessageDto })
  async getModels(
    @Query('name') name?: string,
    @Query('did') did?: string,
    @Query('description') description?: string,
    @Query('startTimeMs') startTimeMs: number = 0,
    @Query('useCounting') useCounting?: boolean,
    @Query('pageSize') pageSize?: number,
    @Query('pageNumber') pageNumber?: number,
    @Query('network') network: Network = Network.TESTNET,
  ): Promise<BasicMessageDto> {
    if (!pageSize || pageSize == 0) pageSize = 50;
    if (!pageNumber || pageNumber == 0) pageNumber = 1;
    this.logger.log(`Seaching models: useCounting: ${useCounting}`);

    // hard code for searching name
    if (!name && !did) {
      const useCountMap = await this.modelService.getModelsByDecsPagination(
        network,
        pageSize,
        pageNumber,
      );
      if (useCountMap?.size == 0) return new BasicMessageDto('ok', 0, []);
      this.logger.log(`${network} model usecount ${useCountMap}`);

      const metaModels = await this.modelService.findModelsByIds(
        Array.from(useCountMap.keys()),
        network,
      );
      this.logger.log(`${network} model ${metaModels}`);

      if (metaModels?.length == 0) return new BasicMessageDto('ok', 0, []);
      const modelStreamIds = metaModels.map((m) => m.getStreamId);

      const indexedModelStreamIds = await this.modelService.findIndexedModelIds(
        network,
        modelStreamIds,
      );
      const indexedModelStreamIdSet = new Set(indexedModelStreamIds);

      const dbUseCountMap = await this.modelService.findIndexedModelUseCount(
        network,
        indexedModelStreamIds,
      );
      const firstRecordMap = await this.modelService.findModelFirstRecord(
        network,
        indexedModelStreamIds,
      );

      const dbUseCountMapRecently = await this.modelService.findIndexedModelUseCount(
        network,
        indexedModelStreamIds,
        true,
      );

      return new BasicMessageDto(
        'ok',
        0,
        metaModels
          .map((m) => {
            const isIndexed = indexedModelStreamIdSet.has(m.getStreamId);
            const useCount = isIndexed
              ? dbUseCountMap.get(m.getStreamId)
              : useCountMap?.get(m.getStreamId) ?? 0;

            const firstRecord = firstRecordMap.get(m.getStreamId);
            const firstRecordTime = isIndexed && firstRecord?.created_at;

            const recentlyUseCount =
              isIndexed && dbUseCountMapRecently.get(m.getStreamId);

            return {
              ...m,
              useCount,
              isIndexed,
              firstRecordTime,
              recentlyUseCount,
            };
          })
          .sort((a, b) => b.useCount - a.useCount),
      );
    }

    const metaModels = await this.modelService.findModels(
      pageSize,
      pageNumber,
      name,
      did,
      description,
      startTimeMs,
      network,
    );
    if (metaModels?.length == 0) return new BasicMessageDto('ok', 0, []);

    const modelStreamIds = metaModels.map((m) => m.getStreamId);
    const useCountMap = await this.streamService.findModelUseCount(
      network,
      modelStreamIds,
    );

    const indexedModelStreamIds = await this.modelService.findIndexedModelIds(
      network,
      modelStreamIds,
    );
    const indexedModelStreamIdSet = new Set(indexedModelStreamIds);
    return new BasicMessageDto(
      'ok',
      0,
      metaModels.map((m) => ({
        ...m,
        useCount: useCountMap?.get(m.getStreamId) ?? 0,
        isIndexed: indexedModelStreamIdSet.has(m.getStreamId),
      })),
    );
  }

  @Get('/:modelStreamId/mids')
  @ApiQuery({
    name: 'pageNumber',
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
  })
  @ApiQuery({
    name: 'network',
    required: false,
  })
  @ApiOkResponse({ type: BasicMessageDto })
  async getModelStreams(
    @Query('pageSize') pageSize: number,
    @Query('pageNumber') pageNumber: number,
    @Query('network') network: Network = Network.TESTNET,
    @Param('modelStreamId') modelStreamId: string,
  ): Promise<BasicMessageDto> {
    if (!pageSize || pageSize == 0) pageSize = 50;
    if (!pageNumber || pageNumber == 0) pageNumber = 1;
    this.logger.log(`Seaching model(${modelStreamId})'s streams`);

    const streams = await this.modelService.getStreams(
      network,
      modelStreamId,
      pageSize,
      pageNumber,
    );
    return new BasicMessageDto('ok', 0, streams);
  }

  @Get('/:modelStreamId/mids/:midStreamId')
  @ApiOkResponse({ type: BasicMessageDto })
  async getMid(
    @Param('midStreamId') midStreamId: string,
    @Query('network') network: Network = Network.TESTNET,
    @Param('modelStreamId') modelStreamId: string,
  ): Promise<BasicMessageDto> {
    this.logger.log(`Seaching mid(${midStreamId}) on network ${network}.`);

    const mid = await this.modelService.getMid(
      network,
      modelStreamId,
      midStreamId,
    );
    if (!mid) {
      throw new NotFoundException(
        new BasicMessageDto(
          `midStreamId ${midStreamId} does not exist on network ${network}`,
          0,
        ),
      );
    }
    return new BasicMessageDto('ok', 0, mid);
  }

  @Cron('0/10 * * * *')
  @Post('/usecount/build')
  async buildUseCount(): Promise<BasicMessageDto> {
    const networks = [Network.TESTNET, Network.MAINNET];
    for await (const network of networks) {
      const models = await this.modelService.findAllModelIds(network);
      // console.time(`${network} model count cost`);
      this.logger.log(`All ${network} model count: ${models?.length}`);
      const useCountMap = await this.streamService.findAllModelUseCount(
        network,
      );
      // console.timeEnd(`${network} model count cost`);
      if (useCountMap?.size == 0) return new BasicMessageDto('ok', 0, {});
      await this.modelService.updateModelUseCount(network, useCountMap);
    }
    return new BasicMessageDto('ok', 0);
  }

  @Post('/indexing')
  async indexModels(
    @Query('model') model: string,
    @Query('network') network: Network = Network.TESTNET,
  ): Promise<BasicMessageDto> {
    this.logger.log(`Starting index ${network} models ${model}.`);
    await this.modelService.indexModels([model], network);
    return new BasicMessageDto('ok', 0);
  }

  @ApiOkResponse({ type: BasicMessageDto })
  @Post('/')
  async createAndDeployModel(@Req() req: Request, @Body() dto: CreateModelDto) {
    const res = await this.modelService.createAndDeployModel(dto, req.headers['did-session'] as string);
    return new BasicMessageDto('ok', 0, res);
  }

  @ApiOkResponse({ type: BasicMessageDto })
  @Post('/graphql')
  async modelIdToGraphql(@Body() dto: ModelIdToGaphqlDto) {
    if (dto.models?.length != 1) {
      throw new BadRequestException("models' length is not 1.");
    }

    const graphqlSchemaDefinitionSet = await this.modelService.getModelGraphql(dto.network, dto.models[0]);
    let graphqlSchemaDefinition;
    if (graphqlSchemaDefinitionSet?.length > 0) {
      graphqlSchemaDefinition = graphqlSchemaDefinitionSet.join('\n');
    }

    const graphCache = await this.modelService.getModelGraphCache(
      dto.network,
      dto.models[0],
    );
    if (graphCache) {
      return new BasicMessageDto('ok', 0, { ...graphCache, graphqlSchemaDefinition });
    } else {
      try {
        const { CeramicClient } = await importDynamic(
          '@ceramicnetwork/http-client',
        );
        const { Composite } = await importDynamic('@composedb/devtools');
        const { printGraphQLSchema } = await importDynamic(
          '@composedb/runtime',
        );
        console.time('initing ceramic client');
        const ceramic = new CeramicClient(getCeramicNode(dto.network));
        console.timeEnd('initing ceramic client');

        // build all model stream ids for the model
        console.time('fetching relation model streamIds');
        const allModelStreamIds = [];
        for await (const streamId of dto.models) {
          const relationModelStreamIds =
            await this.streamService.getRelationStreamIds(ceramic, streamId);
          allModelStreamIds.push(...relationModelStreamIds);
        }
        console.timeEnd('fetching relation model streamIds');

        // buid composite
        console.time('creating composite');
        console.log(
          'creating composite models:',
          dto.models,
          allModelStreamIds,
        );
        const composite = await Composite.fromModels({
          ceramic: ceramic,
          models: [...dto.models, ...allModelStreamIds],
        });
        console.timeEnd('creating composite');

        console.time('creating runtimeDefinition');
        const runtimeDefinition = composite.toRuntime();
        console.timeEnd('creating runtimeDefinition');

        console.time('buiding graphqlSchema');
        const graphqlSchema = printGraphQLSchema(runtimeDefinition);
        console.timeEnd('buiding graphqlSchema');

        // cache the model graph info
        await this.modelService.saveModelGraphCache(
          dto.network,
          dto.models[0],
          composite,
          runtimeDefinition,
          graphqlSchema,
        );
        return new BasicMessageDto('ok', 0, {
          composite,
          runtimeDefinition,
          graphqlSchema,
          graphqlSchemaDefinition,
        });
      } catch (e) {
        throw new InternalServerErrorException(`ModelIdToGraphql: ${e}`);
      }
    }
  }

  @ApiOkResponse({ type: BasicMessageDto })
  @Post('/ids')
  async getModelsByIds(@Body() dto: { network: Network; ids: string[] }) {
    const [models, indexedModelStreamIds] = await Promise.all([
      this.modelService.findModelsByIds(dto.ids, dto.network),
      this.modelService.findIndexedModelIds(dto.network, dto.ids),
    ]);
    if (!models) {
      throw new NotFoundException(
        new BasicMessageDto(`no models found for ids ${dto.ids}`, 0),
      );
    }
    if (!indexedModelStreamIds) {
      throw new NotFoundException(
        new BasicMessageDto(`no indexed models found for ids ${dto.ids}`, 0),
      );
    }

    const useCountMap = await this.modelService.findIndexedModelUseCount(dto.network, indexedModelStreamIds);
    const indexedModelStreamIdSet = new Set(indexedModelStreamIds);
    models.forEach((e) => {
      (e.useCount = useCountMap?.get(e.getStreamId) ?? 0),
        (e.isIndexed = indexedModelStreamIdSet.has(e.getStreamId));
    });

    return new BasicMessageDto('ok', 0, models);
  }

  @Get('/:modelStreamId/sdk')
  @ApiOkResponse({ type: BasicMessageDto })
  async getModelSdk(@Param('modelStreamId') modelStreamId: string, @Query('type') type: string = 'ClientPreset', @Query('network') network: string = Network.TESTNET
  ): Promise<BasicMessageDto> {
    this.logger.log(`Seaching model(${modelStreamId}) type(${type}) sdk.`);
    const graphqlInfo: any = await this.modelIdToGraphql({ network: network.toUpperCase() as Network, models: [modelStreamId] });
    const schema = graphqlInfo?.data.graphqlSchema;
    if (!schema) {
      throw new NotFoundException(new BasicMessageDto(`modelStreamId ${modelStreamId} does not exist on network ${network}`, 0));
    }
    this.logger.log(`Generating sdk for model(${modelStreamId}) type(${type}), schema(${schema}).`);

    // Build model query for documents
    const model = Object.keys(graphqlInfo.data.runtimeDefinition.models)[0];
    // query ${model}PersonalList($first: Int, $after: String) {
    //   viewer {
    //       ${model.toLowerCase()}List(first: $first, after: $after) {
    //         edges {
    //           node {
    //             id
    //           }
    //         }
    //         pageInfo {
    //           hasNextPage
    //           hasPreviousPage
    //           startCursor
    //           endCursor
    //       }
    //     }
    //   }
    // }

    // query ${model}List($first: Int, $after: String) {
    //     ${model.toLowerCase()}Index(first: $first, after: $after) {
    //       edges {
    //         node {
    //           id
    //         }
    //       }
    //       pageInfo {
    //         hasNextPage
    //         hasPreviousPage
    //         startCursor
    //         endCursor
    //       }
    //   }
    // }

    const operationGraphql = `query Get${model}($id: ID!) {
      node(id: $id) {
      id
          ...on ${model} {
              id
          }
      }
    }

    mutation Create${model}($input: Create${model}Input!) {
      create${model}(input: $input) {
      document {
          id
      }
      }
    }

    mutation Update${model}($input: Update${model}Input!) {
      update${model}(input: $input) {
      document {
          id
      }
      }
    }
  `
    // Generate the code
    // target output should be a directory, ex: "generated/gql/". Make sure you add "/" at the end of the directory
    const generatedDirectory = 'generated/gql/';
    let config: CodegenConfig;
    if (type == 'ClientPreset') {
      config = {
        schema: schema,
        documents: operationGraphql,
        generates: {
          'generated/gql/': {
            preset: 'client'
          }
        }
      }
    } else if (type == 'ReactQueryHooks') {
      config = {
        schema: schema,
        documents: operationGraphql,
        pluginLoader: (name: string): CodegenPlugin => {
          switch (name) {
            case '@graphql-codegen/typescript':
              return typescriptPlugin
            case '@graphql-codegen/typescript-operations':
              return typescriptOperationsPlugin
            case '@graphql-codegen/add':
              return addPlugin
            case '@graphql-codegen/typescript-validation-schema':
              return typescriptValidationPlugin
            case '@graphql-codegen/typescript-react-query':
              return typescriptReactQueryPlugin
            default:
              throw Error(`couldn't find plugin ${name}`)
          }
        },
        generates: {
          [path.join(generatedDirectory, 'types-and-hooks.tsx')]: {
            plugins: [
              'typescript',
              'typescript-operations',
              'typescript-react-query',
            ],
            config: {
              scalars: {
                CeramicCommitID: 'string',
                CeramicStreamID: 'string',
                Date: 'string',
                DateTime: 'string',
                DID: 'any',
                URI: 'string',
              },
              skipTypeName: true,
              strictScalars: true,
              declarationKind: 'interface',
            },
          },
        }
      }
    } else if (type == 'ReactApolloHooks') {
      config = {
        schema: schema,
        documents: operationGraphql,
        pluginLoader: (name: string): CodegenPlugin => {
          switch (name) {
            case '@graphql-codegen/typescript':
              return typescriptPlugin
            case '@graphql-codegen/typescript-operations':
              return typescriptOperationsPlugin
            case '@graphql-codegen/add':
              return addPlugin
            case '@graphql-codegen/typescript-validation-schema':
              return typescriptValidationPlugin
            case '@graphql-codegen/typescript-react-apollo':
              return typescriptReactApolloPlugin
            default:
              throw Error(`couldn't find plugin ${name}`)
          }
        },
        generates: {
          [path.join(generatedDirectory, 'types-and-hooks.tsx')]: {
            plugins: [
              'typescript',
              'typescript-operations',
              'typescript-react-apollo',
            ],
            config: {
              scalars: {
                CeramicCommitID: 'string',
                CeramicStreamID: 'string',
                Date: 'string',
                DateTime: 'string',
                DID: 'any',
                URI: 'string',
              },
              skipTypeName: true,
              strictScalars: true,
              declarationKind: 'interface',
            },
          },
        }
      }
    } else {
      throw new NotFoundException(new BasicMessageDto(`type ${type} is not supported`, 0));
    }

    const result = await generate(config, false);
    result.push({
      filename: 'runtime-composite.ts',
      content: JSON.stringify(graphqlInfo.data.runtimeDefinition)
    });
    return new BasicMessageDto('ok', 0, result.map(r => { return { filename: r.filename.replace(generatedDirectory, ''), content: r.content }; }));
  }

  @Get('/:modelStreamId')
  @ApiOkResponse({ type: BasicMessageDto })
  async getModel(
    @Query('network') network: Network = Network.TESTNET,
    @Param('modelStreamId') modelStreamId: string,
  ): Promise<BasicMessageDto> {
    this.logger.log(`Seaching model(${modelStreamId}) on network ${network}.`);

    const mid = await this.modelService.getModel(network, modelStreamId);
    if (!mid) {
      throw new NotFoundException(
        new BasicMessageDto(
          `modelStreamId ${modelStreamId} does not exist on network ${network}`,
          0,
        ),
      );
    }
    return new BasicMessageDto('ok', 0, mid);
  }
}
