import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import ModelService from 'src/model/model.service';
import { Network, Status, Stream } from '../entities/stream/stream.entity';
import { StreamRepository } from '../entities/stream/stream.repository';
import { StatsDto } from './dtos/common.dto';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { Cron } from '@nestjs/schedule';
import { number } from 'joi';
import { IsNull, MoreThan, Not } from 'typeorm';

@Injectable()
export default class StreamService {
  private readonly logger = new Logger(StreamService.name);

  constructor(
    @InjectRepository(Stream, 'testnet')
    private readonly streamRepository: StreamRepository,
    private readonly modelService: ModelService,
    @InjectRedis() private readonly redis: Redis,
  ) { }

  async findByStreamId(network: Network, streamId: string): Promise<Stream> {
    return await this.streamRepository.findOne({
      where: { network: network, stream_id: streamId },
    });
  }
  async findStreamCountByDuration(
    network: Network,
    durationSecond: number
  ): Promise<number> {
    return await this.streamRepository.count({ where: { network: network, last_modified_at: MoreThan(new Date(new Date().getTime() - durationSecond * 1000)) } });
  }


  async findStreams(
    network: Network,
    familyOrApps: string[],
    did: string,
    pageSize: number,
    pageNumber: number,
    types: string[],
  ): Promise<Stream[]> {
    let whereSql = 'network=:network';
    if (familyOrApps && familyOrApps.length > 0) {
      if (whereSql.length > 0) {
        whereSql += ' AND ';
      }
      whereSql +=
        '(family IN (:...familyOrApps) OR domain IN (:...familyOrApps))';
    }
    if (did?.trim().length > 0) {
      if (whereSql.length > 0) {
        whereSql += ' AND ';
      }
      whereSql += 'did=:did';
    }
    if (types && types.length > 0) {
      if (whereSql.length > 0) {
        whereSql += ' AND ';
      }
      whereSql += 'type In (:...types)';
    }

    return await this.streamRepository
      .createQueryBuilder()
      .where(whereSql, {
        network: network,
        familyOrApps: familyOrApps,
        did: did,
        types: types,
      })
      .limit(pageSize)
      .offset(pageSize * (pageNumber - 1))
      .orderBy('last_modified_at', 'DESC')
      .getMany();
  }

  async getStreamsCount(network: Network, modelStreamIds: string) {
    if (!modelStreamIds || modelStreamIds.trim().length == 0) return 0;
    const ids = modelStreamIds.split(',').map((id) => id.trim());
    if (ids.length == 0) return 0;
    const whereSql = `network=:network AND model IN (:...ids)`;
    const count = await this.streamRepository
      .createQueryBuilder()
      .where(whereSql, {
        network: network,
        ids: ids,
      })
      .getCount();
    return count;
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

    // set model use count to 0 if not exist
    models.forEach((model) => {
      if (!useCountMap.has(model)) {
        useCountMap.set(model, 0);
      }
    });
    return useCountMap;
  }
  async findModelUseCountByModels(
    models: string[],
  ): Promise<Map<string, number>> {
    const useCountMap = new Map<string, number>();

    const useCountResult = await this.streamRepository
      .createQueryBuilder('streams')
      .select(['streams.model, count(streams.stream_id) as count'])
      .where('streams.model IN (:...models)', { models: models })
      .groupBy('streams.model')
      .getRawMany();

    useCountResult?.forEach((r) => {
      useCountMap.set(r['model'], Number(r['count']));
    });

    // set model use count to 0 if not exist
    models.forEach((model) => {
      if (!useCountMap.has(model)) {
        useCountMap.set(model, 0);
      }
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

  @Cron('*/2 * * * *')
  async getTopicsTimer() {
    this.getTopicsJob(Network.MAINNET);
    this.getTopicsJob(Network.TESTNET);
  }

  async getTopics(network: Network) {
    const val = await this.redis.get(`cscan-streams-topics-${network}`);
    if (!val) {
      return {};
    }
    return JSON.parse(val);
  }

  async getTopicsJob(network: Network): Promise<any> {
    const sortmap = (map) => {
      const arr = Array.from(map);
      arr.sort((a, b) => b[1] - a[1]);
      return arr;
    };
    const sortmapex = (map) => {
      return sortmap(map).map((e) => ({ name: e[0], num: e[1] }));
    };

    console.time(`${network}-getTopics`);

    const streams = await this.streamRepository
      .createQueryBuilder('streams')
      .select([
        'streams.id',
        'streams.family',
        'streams.domain',
        'streams.network',
      ])
      .limit(200000)
      .orderBy('id', 'DESC')
      .getMany();

    console.timeEnd(`${network}-getTopics`);

    const familyMap = new Map<string, number>();
    const domainMap = new Map<string, number>();

    streams.forEach((e) => {
      if (e.getNetwork != network) {
        return;
      }

      let key, map;

      key = e.getFamily;
      map = familyMap;
      if (key) {
        map.set(key, (map.get(key) ?? 0) + 1);
      }

      key = e.getDomain;
      map = domainMap;
      if (key) {
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    });

    const res = {
      familys: sortmapex(familyMap),
      domains: sortmapex(domainMap),
    };

    await this.redis.set(
      `cscan-streams-topics-${network}`,
      JSON.stringify(res),
    );

    return res;
  }

  async getStats(network: Network): Promise<StatsDto> {
    const val = await this.redis.get(`cscan-stats-${network}`);
    if (!val) {
      return new StatsDto();
    }
    return JSON.parse(val);
  }

  // Calculate all model domain data for all streams
  async getModelDomainMap(network: Network): Promise<Map<string, string>> {
    const modelDomainMap = new Map<string, string>();
    const streams = await this.streamRepository.query(`select distinct  model, domain  from streams where network='${network}' and domain not in ('localhost','127.0.0.1') and domain is not null and model is not null and model != '' and domain like '%.%' group by network,model,domain;`);
    streams.forEach((stream) => {
      modelDomainMap.set(stream.model, stream.domain);
    });
    return modelDomainMap;
  }

  @Cron('*/2 * * * *')
  async getStatsTimer() {
    this.getStatsJob(Network.MAINNET);
    this.getStatsJob(Network.TESTNET);
  }

  async getStatsJob(network: Network): Promise<StatsDto> {
    try {
      const dto = new StatsDto();

      const now = Math.floor(new Date().getTime() / 1000);
      const weekAgo = new Date((now - 7 * 24 * 3600) * 1000);

      console.time(`${network}-getStats`);

      let [streams, modelStatistics, totalCount] = await Promise.all([
        this.streamRepository
          .createQueryBuilder('streams')
          .select(['streams.id', 'streams.network', 'streams.last_modified_at'])
          .where('last_modified_at BETWEEN :start AND :end', {
            start: weekAgo,
            end: new Date(),
          })
          .orderBy('last_modified_at', 'DESC')
          .getMany(),
        this.modelService.getModelStatistics(network),
        this.streamRepository.count({ where: { network: network } }),
      ]);

      console.timeEnd(`${network}-getStats`);

      streams = streams.filter((e) => e.getNetwork == network);
      if (!streams || streams.length == 0) {
        console.log('getStatsJob found no streams');
        return dto;
      }

      const t1 = Math.floor(streams[0].getLastModifiedAt.getTime() / 1000);
      const t2 = Math.floor(
        streams[streams.length - 1].getLastModifiedAt.getTime() / 1000,
      );

      const weeks = [0, 0, 0, 0, 0, 0, 0];
      for (let i = 0; i < streams.length; ++i) {
        const t = Math.floor(streams[i].getLastModifiedAt.getTime() / 1000);
        if (t > now) {
          continue;
        }
        const idx = weeks.length - 1 - Math.floor((now - t) / (24 * 3600));
        if (idx < 0) {
          break;
        }
        weeks[idx] += 1;
      }

      dto.totalStreams = totalCount;
      dto.streamsPerHour = Math.floor((streams.length * 3600) / (t1 - t2));
      dto.streamsLastWeek = weeks;

      Object.assign(dto, modelStatistics);

      await this.redis.set(`cscan-stats-${network}`, JSON.stringify(dto));

      return dto;
    } catch (e) {
      console.log(`get StatsJob failed: ${e}`);
    }
  }
}
