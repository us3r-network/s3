import { EntityRepository, Repository } from 'typeorm';
import {
  CeramicModelTestNet,
  MetaModel,
  MetaModelMainnet,
} from './model.entity';

@EntityRepository(MetaModel)
export class MetaModelRepository extends Repository<MetaModel> {}

@EntityRepository(MetaModelMainnet)
export class MetaModelMainnetRepository extends Repository<MetaModelMainnet> {}

@EntityRepository(CeramicModelTestNet)
export class CeramicModelTestNetRepository extends Repository<CeramicModelTestNet> {}
