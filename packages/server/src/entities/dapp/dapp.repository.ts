import { EntityRepository, Repository } from 'typeorm';
import { Dapp, DappComposite, DappDomain } from './dapp.entity';

@EntityRepository(Dapp)
export class DappRepository extends Repository<Dapp> {}

@EntityRepository(DappComposite)
export class DappCompositeRepository extends Repository<DappComposite> {}

@EntityRepository(DappDomain)
export class DappDomainRepository extends Repository<DappDomain> {}