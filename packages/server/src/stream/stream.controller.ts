import {
  Controller,
  Get,
  Logger,
  Param,
  NotFoundException,
  Query,
  Post,
  Req,
  Res,
  All,
} from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Network, Stream } from '../entities/stream/stream.entity';
import StreamService from './stream.service';
import { BasicMessageDto } from './dtos/common.dto';
import {
  ConvertToStream,
  ConvertToStreamsReponseDto,
  StreamDto,
} from './dtos/stream.dto';
import { createGraphqlDefaultQuery, importDynamic } from 'src/common/utils';
import { count } from 'console';
@ApiTags('/')
@Controller('/')
export class StreamController {
  private readonly logger = new Logger(StreamController.name);
  constructor(private readonly streamService: StreamService) { }

  @Get('/streams')
  @ApiQuery({
    name: 'familyOrApp',
    required: false,
  })
  @ApiQuery({
    name: 'did',
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
  @ApiQuery({
    name: 'type',
    required: false,
  })
  @ApiOkResponse({ type: BasicMessageDto })
  async getStreams(
    @Query('network') network: Network,
    @Query('familyOrApp') familyOrApps?: string[],
    @Query('did') did?: string,
    @Query('pageSize') pageSize?: number,
    @Query('pageNumber') pageNumber?: number,
    @Query('type') types?: string[],
  ): Promise<BasicMessageDto> {
    if (!pageSize || pageSize == 0) pageSize = 50;
    if (!pageNumber || pageNumber == 0) pageNumber = 1;

    if (familyOrApps && !Array.isArray(familyOrApps)) {
      familyOrApps = [familyOrApps];
    }
    if (types && !Array.isArray(types)) {
      types = [types];
    }

    const streams = await this.streamService.findStreams(
      network,
      familyOrApps,
      did,
      pageSize,
      pageNumber,
      types,
    );
    return new BasicMessageDto(
      'ok',
      0,
      ConvertToStreamsReponseDto(streams, 0, 0),
    );
  }

  @Get('/:network/streams/count')
  @ApiOkResponse({ type: BasicMessageDto })
  async getStreamsCount(
    @Param('network') network: Network,
    @Query('modelStreamIds') modelStreamIds: string,
  ): Promise<BasicMessageDto> {
    const count = await this.streamService.getStreamsCount(
      network,
      modelStreamIds,
    );
    if(count == 0) throw new NotFoundException(); 
    return new BasicMessageDto('ok', 0, count);
  }

  @Get('/:network/streams/topics')
  @ApiOkResponse({ type: BasicMessageDto })
  async getStreamTopics(
    @Param('network') network: Network,
  ): Promise<BasicMessageDto> {
    const topics = await this.streamService.getTopics(network);
    return new BasicMessageDto('ok', 0, topics);
  }

  @Get('/:network/stats')
  @ApiOkResponse({ type: BasicMessageDto })
  async getStats(@Param('network') network: Network): Promise<BasicMessageDto> {
    const stats = await this.streamService.getStats(network);
    return new BasicMessageDto('ok', 0, stats);
  }


  @Get('/:network/streams/monitor')
  @ApiOkResponse({ type: BasicMessageDto })
  async monitor(
    @Param('network') network: Network,
    @Query('durationSecond') durationSecond: number = 60 * 10,
  ): Promise<BasicMessageDto> {
    const count = await this.streamService.findStreamCountByDuration(network, durationSecond);
    return new BasicMessageDto('ok', 0, { count: count });
  }

  @Get('/:network/streams/:streamId')
  @ApiOkResponse({ type: BasicMessageDto })
  async getStream(
    @Param('streamId') streamId: string,
    @Param('network') network: Network,
  ): Promise<BasicMessageDto> {
    const stream = await this.streamService.findByStreamId(network, streamId);
    if (!stream) {
      throw new NotFoundException(
        new BasicMessageDto(`streamId ${streamId} does not exist`, 0),
      );
    }
    return new BasicMessageDto('ok', 0, ConvertToStream(stream));
  }

  @Get('/:network/streams/:streamId/content')
  @ApiOkResponse({ type: BasicMessageDto })
  async getStreamContent(
    @Param('streamId') streamId: string,
    @Param('network') network: string,
  ): Promise<any> {
    const stream = await this.streamService.findByStreamId(
      Network[network.toUpperCase()],
      streamId,
    );
    if (!stream) throw new NotFoundException();
    return stream?.getContent;
  }

  @Get('/:network/streams/:streamId/info')
  @ApiOkResponse({ type: BasicMessageDto })
  async getStreamInfo(
    @Param('streamId') streamId: string,
    @Param('network') network: Network,
  ): Promise<BasicMessageDto> {
    // Currently only suport testnet
    const Ceramic = await importDynamic('@ceramicnetwork/http-client');
    if (network == Network.TESTNET) {
      const ceramicClient = new Ceramic.CeramicClient(
        'https://ceramic-clay.3boxlabs.com',
      );
      const stream = await ceramicClient.loadStream(streamId);
      return new BasicMessageDto('ok', 0, {
        state: stream?.state,
        content: stream?.content,
      });
    }
    return new BasicMessageDto('ok', 0, {});
  }

  @All('/:network/:modelStreamId/graphql')
  async postGraphql(
    @Param('network') network: Network,
    @Param('modelStreamId') modelStreamId: string,
    @Req() req,
    @Res() res,
  ) {
    const { createHandler } = await importDynamic('@composedb/server');
    const { createContext, createGraphQLSchema } = await importDynamic(
      '@composedb/runtime',
    );
    const { Composite } = await importDynamic('@composedb/devtools');
    const { CeramicClient } = await importDynamic(
      '@ceramicnetwork/http-client',
    );

    let ceramic;
    if (network == Network.MAINNET) {
      ceramic = new CeramicClient(process.env.CERAMIC_NODE_MAINNET);
    } else {
      ceramic = new CeramicClient(process.env.CERAMIC_NODE);
    }
    // get definition
    const relationStreamIds = await this.streamService.getRelationStreamIds(
      ceramic,
      modelStreamId,
    );
    const composite = await Composite.fromModels({
      ceramic: ceramic,
      models: [modelStreamId, ...relationStreamIds],
    });
    const definition = composite.toRuntime();
    // build grapgql default query
    const modelName = Object.keys(definition.models)[0];
    const modelProperties = Object.entries(
      Object.values(definition.objects)[0],
    );
    const defaultQuery = createGraphqlDefaultQuery(modelName, modelProperties);

    const handler = createHandler({
      ceramic,
      options: {
        context: createContext({ ceramic }),
        graphiql: {
          defaultQuery: defaultQuery,
        },
        graphqlEndpoint: `/${network}/${modelStreamId}/graphql`,
      },
      schema: createGraphQLSchema({ definition: definition, readonly: false }),
    });

    return handler(req, res, { req, res });
  }
}
