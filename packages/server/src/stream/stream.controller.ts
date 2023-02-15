import {
  Controller,
  Get,
  Logger,
  Param,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Network, Stream } from '../entities/stream/stream.entity';
import StreamService from './stream.service';
import { BasicMessageDto } from './dtos/common.dto';
import { ConvertToStream, ConvertToStreamsReponseDto, StreamDto } from './dtos/stream.dto';

@ApiTags('/')
@Controller('/')
export class StreamController {
  private readonly logger = new Logger(StreamController.name);
  constructor(
    private readonly streamService: StreamService,
  ) { }

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
  @ApiOkResponse({ type: BasicMessageDto })
  async getStreams(
    @Query('network') network: Network,
    @Query('familyOrApp') familyOrApp?: string,
    @Query('did') did?: string,
    @Query('pageSize') pageSize?: number,
    @Query('pageNumber') pageNumber?: number,
  ): Promise<BasicMessageDto> {
    if (!pageSize || pageSize == 0) pageSize = 50;
    if (!pageNumber || pageNumber == 0) pageNumber = 1;

    const streams = await this.streamService.findStreams(network, familyOrApp, did, pageSize, pageNumber);
    return new BasicMessageDto('ok', 0, ConvertToStreamsReponseDto(streams, 0, 0));
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
}
