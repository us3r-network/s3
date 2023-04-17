import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Network, Status, Stream } from '../entities/stream/stream.entity';
import { StreamRepository } from '../entities/stream/stream.repository';

@Injectable()
export default class StreamService {
  private readonly logger = new Logger(StreamService.name);

  constructor(
    @InjectRepository(Stream, 'testnet')
    private readonly streamRepository: StreamRepository,
  ) {}

  async findByStreamId(network: Network, streamId: string): Promise<Stream> {
    return await this.streamRepository.findOne({
      where: { network: network, stream_id: streamId },
    });
  }

  async findStreams(
    network: Network,
    familyOrApp: string,
    did: string,
    pageSize: number,
    pageNumber: number,
  ): Promise<Stream[]> {
    let whereSql = 'network=:network';
    if (familyOrApp?.trim().length > 0) {
      if (whereSql.length > 0) {
        whereSql += ' AND ';
      }
      whereSql += 'family=:familyOrApp OR domain=:familyOrApp';
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

  async getRelationStreamIds(
    ceramic: any,
    modelStreamId: string,
  ): Promise<string[]> {
    if (!ceramic || modelStreamId?.length == 0) return [];

    const stream = await ceramic.loadStream(modelStreamId);
    const relationModelStreamIds = Object.values(
      stream?.content?.relations,
    ).map((o: any) => o.model);
    return relationModelStreamIds;
  }

  async findModelUseCount(
    network: Network,
    models: string[],
  ): Promise<Map<string, number>> {
    const useCountMap = new Map<string, number>();

    const useCountResult = await this.streamRepository
      .createQueryBuilder('streams')
      .select(['streams.model, count(streams.stream_id) as count'])
      .where('network=:network', {
        network: network,
      })
      .andWhere('streams.model IN (:...models)', { models: models })
      .groupBy('streams.model')
      .getRawMany();

    useCountResult?.forEach((r) => {
      useCountMap.set(r['model'], Number(r['count']));
    });
    return useCountMap;
  }

  async findModelUseCountOrderByUseCount(
    network: Network,
    models: string[],
    pageSize?: number,
    pageNumber?: number,
  ): Promise<Map<string, number>> {
    const useCountMap = new Map<string, number>();

    const useCountResult = await this.streamRepository
      .createQueryBuilder('streams')
      .select(['streams.model, count(streams.stream_id) as count'])
      .where('network=:network', {
        network: network,
      })
      .andWhere('model IN (:...models)', {
        models: models,
      })
      .groupBy('streams.model')
      .limit(pageSize)
      .offset(pageSize * (pageNumber - 1))
      .orderBy('count', 'DESC')
      .getRawMany();

    useCountResult?.forEach((r) => {
      useCountMap.set(r['model'], Number(r['count']));
    });
    return useCountMap;
  }

  async findAllModelUseCount(
    network: Network,
    models: string[],
  ): Promise<Map<string, number>> {
    const useCountMap = new Map<string, number>();

    const useCountResult = await this.streamRepository
      .createQueryBuilder('streams')
      .select(['streams.model, count(streams.stream_id) as count'])
      .where('network=:network', {
        network: network,
      })
      .andWhere('model IN (:...models)', {
        models: models,
      })
      .groupBy('streams.model')
      .getRawMany();

    useCountResult?.forEach((r) => {
      useCountMap.set(r['model'], Number(r['count']));
    });
    return useCountMap;
  }
}
