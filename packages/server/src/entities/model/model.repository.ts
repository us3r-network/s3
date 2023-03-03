import { EntityRepository, Repository } from 'typeorm';
import { MetaModel } from './model.entity';

@EntityRepository(MetaModel)
export class MetaModelRepository extends Repository<MetaModel> {}
