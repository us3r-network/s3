import { ApiProperty } from '@nestjs/swagger';
import { Stream } from 'src/entities/stream/stream.entity';

export class StreamsReponseDto {
  @ApiProperty()
  streams: StreamDto[];

  //TODO Used to count some values.
  @ApiProperty()
  streamCount: number;
  @ApiProperty()
  didCount: number;
}

export function ConvertToStreamsReponseDto(
  streams: Stream[],
  streamCount: number,
  didCount: number,
): StreamsReponseDto {
  const streamsReponseDto = new StreamsReponseDto();
  streamsReponseDto.streams = streams.map((s) => ConvertToStream(s));
  streamsReponseDto.streamCount = streamCount;
  streamsReponseDto.didCount = didCount;
  return streamsReponseDto;
}

export function ConvertToStream(stream: Stream): StreamDto {
  const streamDto = new StreamDto();
  streamDto.streamId = stream.getStreamId;
  streamDto.network = stream.getNetwork;
  streamDto.network = stream.getNetwork;
  streamDto.indexingTime = stream.getCreatedAt.getTime();
  streamDto.familyOrApp = stream.getFamily;
  streamDto.type = stream.getType;
  streamDto.did = stream.getDid;
  streamDto.tags = stream.getTags;
  streamDto.anchorStatus = stream.getAnchorStatus;
  streamDto.anchorHash = stream.getAnchorHash;
  streamDto.anchorDate = stream.getAnchorDate?.getTime();
  streamDto.schema = stream.getSchema;
  streamDto.commitIds = stream.getCommitIds;
  streamDto.content = stream.getContent;
  streamDto.model = stream.getModel;
  streamDto.metadata = stream.getMetadata;
  return streamDto;
}

export class StreamDto {
  @ApiProperty()
  streamId: string;
  @ApiProperty()
  network: string;
  @ApiProperty()
  indexingTime: number;
  @ApiProperty()
  familyOrApp: string;
  @ApiProperty()
  type: string;
  @ApiProperty()
  did: string;
  @ApiProperty()
  tags: string[];
  @ApiProperty()
  anchorStatus: string;
  @ApiProperty()
  anchorHash: string;
  @ApiProperty()
  anchorDate: number;
  @ApiProperty()
  schema: string;
  @ApiProperty()
  model: string;
  @ApiProperty()
  commitIds: string[];
  @ApiProperty()
  content: string;
  @ApiProperty()
  metadata: string;
}
