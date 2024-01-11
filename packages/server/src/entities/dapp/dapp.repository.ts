import { EntityRepository, Repository } from 'typeorm';
import { Dapp, DappComposite, DappCompositeMapping, DappDomain, DappModel } from './dapp.entity';

@EntityRepository(Dapp)
export class DappRepository extends Repository<Dapp> {}

@EntityRepository(DappComposite)
export class DappCompositeRepository extends Repository<DappComposite> {}

@EntityRepository(DappModel)
export class DappModelRepository extends Repository<DappModel> {}

@EntityRepository(DappCompositeMapping)
export class DappCompositeMappingRepository extends Repository<DappCompositeMapping> {}

@EntityRepository(DappDomain)
export class DappDomainRepository extends Repository<DappDomain> {}