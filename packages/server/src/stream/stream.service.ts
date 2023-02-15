import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Network, Status, Stream } from '../entities/stream/stream.entity';
import { StreamRepository } from '../entities/stream/stream.repository';

@Injectable()
export default class StreamService {
  private readonly logger = new Logger(StreamService.name);

  constructor(
    @InjectRepository(Stream)
    private readonly streamRepository: StreamRepository,
  ) { }

  async findByStreamId(network: Network, streamId: string): Promise<Stream> {
    return await this.streamRepository.findOne({ where: { network: network, stream_id: streamId } });
  }

  async findStreams(
    network: Network,
    familyOrApp: string,
    did: string,
    pageSize: number,
    pageNumber: number): Promise<Stream[]> {

    let whereSql = 'network=:network';
    if (familyOrApp?.trim().length > 0) {
      if (whereSql.length > 0) {
        whereSql += ' AND ';
      }
      whereSql += 'family=:familyOrApp';
    }
    if (did?.trim().length > 0) {
      if (whereSql.length > 0) {
        whereSql += ' AND ';
      }
      whereSql += 'did=:did';
    }
    return await this.streamRepository
      .createQueryBuilder()
      .where(whereSql, {
        network: network,
        familyOrApp: familyOrApp,
        did: did,
      })
      .limit(pageSize)
      .offset(pageSize * (pageNumber - 1))
      .orderBy('created_at', 'DESC')
      .getMany();
  }
}
