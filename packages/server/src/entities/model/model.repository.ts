import { EntityRepository, Repository } from 'typeorm';
import {
  CeramicModelMainNet,
  CeramicModelTestNet,
  MetaModelTestNet,
  MetaModelMainnet,
} from './model.entity';

@EntityRepository(MetaModelTestNet)
export class MetaModelTestNetRepository extends Repository<MetaModelTestNet> {}

@EntityRepository(MetaModelMainnet)
export class MetaModelMainnetRepository extends Repository<MetaModelMainnet> {}

@EntityRepository(CeramicModelTestNet)
export class CeramicModelTestNetRepository extends Repository<CeramicModelTestNet> {}

@EntityRepository(CeramicModelMainNet)
export class CeramicModelMainNetRepository extends Repository<CeramicModelMainNet> {}
