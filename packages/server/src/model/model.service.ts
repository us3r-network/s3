import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MetaModel } from '../entities/model/model.entity';
import { MetaModelRepository } from '../entities/model/model.repository';

@Injectable()
export default class ModelService {
  private readonly logger = new Logger(ModelService.name);

  constructor(
    @InjectRepository(MetaModel)
    private readonly metaModelRepository: MetaModelRepository,
  ) { }

  async findModels(
    pageSize: number,
    pageNumber: number,
    name?: string,
    description?: string,
    startTimeMs?: number,
  ): Promise<MetaModel[]> {
    let whereSql = '';
    if (name?.trim().length > 0) {
      if (whereSql.length > 0) {
        whereSql += ' AND ';
      }
      whereSql += `LOWER(stream_content->>'name') LIKE :nameValue`;
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

    return await this.metaModelRepository
      .createQueryBuilder()
      .where(whereSql, {
        nameValue: '%' + name?.toLowerCase() + '%',
        descriptionValue: '%' + description?.toLowerCase() + '%',
        startTime: new Date(Number(startTimeMs)),
      })
      .limit(pageSize)
      .offset(pageSize * (pageNumber - 1))
      .orderBy('created_at', 'DESC')
      .getMany();
  }
}
