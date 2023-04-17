import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Post,
  Query,
  Req,
  ServiceUnavailableException,
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
  getCeramicNodeAdminKey,
  importDynamic,
} from 'src/common/utils';
import { Cron } from '@nestjs/schedule';

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
  async getStreams(
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

      const metaModels = await this.modelService.findModelsByIds(
        Array.from(useCountMap.keys()),
        network,
      );
      if (metaModels?.length == 0) return new BasicMessageDto('ok', 0, []);
      return new BasicMessageDto(
        'ok',
        0,
        metaModels
          .map((m) => ({
            ...m,
            useCount: useCountMap?.get(m.getStreamId) ?? 0,
          }))
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

    const models = metaModels.map((m) => m.getStreamId);
    const useCountMap = await this.streamService.findModelUseCount(
      network,
      models,
    );

    return new BasicMessageDto(
      'ok',
      0,
      metaModels.map((m) => ({
        ...m,
        useCount: useCountMap?.get(m.getStreamId) ?? 0,
      })),
    );
  }

  @Cron('0/10 * * * *')
  @Post('/usecount/build')
  async buildUseCount(
    @Query('network') network: Network = Network.TESTNET,
  ): Promise<BasicMessageDto> {
    const models = await this.modelService.findAllModelIds(network);
    this.logger.log(`All ${network} model count: ${models?.length}`);
    const useCountMap = await this.streamService.findAllModelUseCount(
      network,
      models,
    );
    if (useCountMap?.size == 0) return new BasicMessageDto('ok', 0, {});
    await this.modelService.updateModelUseCount(network, useCountMap);
    return new BasicMessageDto('ok', 0, {
      'useCountMap.size': useCountMap.size,
    });
  }

  @Post('/indexing')
  async indexModels(
    @Query('num') num: number = 20000,
  ): Promise<BasicMessageDto> {
    this.logger.log(`Staring index ${num} models on testnet.`);
    await this.modelService.indexTopModelsForTestNet(num);
    return new BasicMessageDto('ok', 0);
  }

  @ApiOkResponse({ type: BasicMessageDto })
  @Post('/')
  async CreateAndDeployModel(@Req() req: Request, @Body() dto: CreateModelDto) {
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

    // 0 Login
    this.logger.log('Connecting to the our ceramic node...');
    const ceramic = new CeramicClient(ceramic_node);
    try {
      const didSession = req.headers['did-session'];
      if (didSession) {
        const { DIDSession } = await importDynamic('did-session');
        const session = await DIDSession.fromSession(didSession);
        ceramic.did = session.did;
      } else {
        // Hexadecimal-encoded private key for a DID having admin access to the target Ceramic node
        // Replace the example key here by your admin private key
        const privateKey = fromString(ceramic_node_admin_key, 'base16');
        const did = new DID({
          resolver: getResolver(),
          provider: new Ed25519Provider(privateKey),
        });
        await did.authenticate();
        // An authenticated DID with admin access must be set on the Ceramic instance
        ceramic.did = did;
      }
      this.logger.log('Connected to the our ceramic node!');
    } catch (e) {
      this.logger.error((e as Error).message);
      throw new ServiceUnavailableException((e as Error).message);
    }

    //1 Create My Composite
    let composite;
    let doRetryTimes = 2;
    do {
      try {
        this.logger.log('Creating the composite...');
        composite = await Composite.create({
          ceramic: ceramic,
          schema: dto.graphql,
        });
        doRetryTimes = 0;
        this.logger.log(
          `Creating the composite... Done! The encoded representation:`,
        );
        this.logger.log(composite);
      } catch (e) {
        this.logger.error((e as Error).message);
        this.logger.log(
          `Creating the composite... retry ${doRetryTimes} times`,
        );
        doRetryTimes--;
      }
    } while (doRetryTimes > 0);

    //2 Deploy My Composite
    try {
      this.logger.log('Deploying the composite...');
      // Notify the Ceramic node to index the models present in the composite
      await composite.startIndexingOn(ceramic);
      // Logging the model stream IDs to stdout, so that they can be piped using standard I/O or redirected to a file
      this.logger.log(
        JSON.stringify(Object.keys(composite.toParams().definition.models)),
      );
      this.logger.log(`Deploying the composite... Done!`);
    } catch (e) {
      this.logger.error((e as Error).message);
      throw new ServiceUnavailableException((e as Error).message);
    }

    //3 Compile My Composite
    let runtimeDefinition;
    try {
      this.logger.log('Compiling the composite...');
      runtimeDefinition = composite.toRuntime();
      this.logger.log(JSON.stringify(runtimeDefinition));
      this.logger.log(`Compiling the composite... Done!`);
    } catch (e) {
      this.logger.error((e as Error).message);
      throw new ServiceUnavailableException((e as Error).message);
    }

    return new BasicMessageDto('ok', 0, {
      composite: composite,
      runtimeDefinition: runtimeDefinition,
    });
  }

  @ApiOkResponse({ type: BasicMessageDto })
  @Post('/graphql')
  async ModelIdToGraphql(@Body() dto: ModelIdToGaphqlDto) {
    const { CeramicClient } = await importDynamic(
      '@ceramicnetwork/http-client',
    );
    const { Composite } = await importDynamic('@composedb/devtools');
    const { printGraphQLSchema } = await importDynamic('@composedb/runtime');

    try {
      const ceramic = new CeramicClient(getCeramicNode(dto.network));
      // build all model stream ids for the model
      const allModelStreamIds = [];
      for await (const streamId of dto.models) {
        const relationModelStreamIds =
          await this.streamService.getRelationStreamIds(ceramic, streamId);
        allModelStreamIds.push(...relationModelStreamIds);
      }
      // buid composite
      const composite = await Composite.fromModels({
        ceramic: ceramic,
        models: [...dto.models, ...allModelStreamIds],
      });
      const runtimeDefinition = composite.toRuntime();
      const graphqlSchema = printGraphQLSchema(runtimeDefinition);
      return new BasicMessageDto('ok', 0, {
        composite,
        runtimeDefinition,
        graphqlSchema,
      });
    } catch (e) {
      throw new InternalServerErrorException(`ModelIdToGraphql: ${e}`);
    }
  }
}
