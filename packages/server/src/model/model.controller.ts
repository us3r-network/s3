import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import ModelService from './model.service';
import { BasicMessageDto } from '../common/dto';
import StreamService from 'src/stream/stream.service';
import { Network } from 'src/entities/stream/stream.entity';
import { CreateModelDto } from './dtos/model.dto';
import { importDynamic } from 'src/common/utils';
@ApiTags('/models')
@Controller('/models')
export class ModelController {
  private readonly logger = new Logger(ModelController.name);
  constructor(
    private readonly modelService: ModelService,
    private readonly streamService: StreamService,
  ) { }

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
    @Query('description') description?: string,
    @Query('startTimeMs') startTimeMs: number = 0,
    @Query('pageSize') pageSize?: number,
    @Query('pageNumber') pageNumber?: number,
  ): Promise<BasicMessageDto> {
    if (!pageSize || pageSize == 0) pageSize = 50;
    if (!pageNumber || pageNumber == 0) pageNumber = 1;

    const metaModels = await this.modelService.findModels(
      pageSize,
      pageNumber,
      name,
      description,
      startTimeMs,
    );
    if (metaModels?.length == 0) return new BasicMessageDto('ok', 0, []);

    const models = metaModels.map((m) => m.getStreamId);
    const useCountMap = await this.streamService.findModelUseCount(
      Network.TESTNET,
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

  @ApiOkResponse({ type: BasicMessageDto })
  @Post('/')
  async CreateAndDeployModel(@Body() dto: CreateModelDto) {
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
    const ceramic = new CeramicClient(process.env.CERAMIC_NODE);
    try {
      // Hexadecimal-encoded private key for a DID having admin access to the target Ceramic node
      // Replace the example key here by your admin private key
      const privateKey = fromString(
        process.env.CERAMIC_NODE_ADMIN_PRIVATE_KEY,
        'base16',
      );
      const did = new DID({
        resolver: getResolver(),
        provider: new Ed25519Provider(privateKey),
      });
      await did.authenticate();
      // An authenticated DID with admin access must be set on the Ceramic instance
      ceramic.did = did;
      this.logger.log('Connected to the our ceramic node!');
    } catch (e) {
      this.logger.error((e as Error).message);
      throw new ServiceUnavailableException((e as Error).message);
    }

    //1 Create My Composite
    let composite;
    try {
      this.logger.log('Creating the composite...');
      composite = await Composite.create({
        ceramic: ceramic,
        schema: dto.graphql,
      });
      this.logger.log(
        `Creating the composite... Done! The encoded representation:`,
      );
      this.logger.log(composite);
    } catch (e) {
      this.logger.error((e as Error).message);
      throw new ServiceUnavailableException((e as Error).message);
    }

    //2 Deploy My Composite
    let doRetryTimes = 2;
    do {
      try {
        this.logger.log('Deploying the composite...');
        // Notify the Ceramic node to index the models present in the composite
        await composite.startIndexingOn(ceramic);
        doRetryTimes = 0;
        // Logging the model stream IDs to stdout, so that they can be piped using standard I/O or redirected to a file
        this.logger.log(
          JSON.stringify(Object.keys(composite.toParams().definition.models)),
        );
        this.logger.log(`Deploying the composite... Done!`);
      } catch (e) {
        this.logger.error((e as Error).message);
        doRetryTimes--;
      }
    } while (doRetryTimes > 0);

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
}
