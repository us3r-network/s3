import { EntityRepository, Repository } from 'typeorm';
import { Dapp, DappComposite } from './dapp.entity';

@EntityRepository(Dapp)
export class DappRepository extends Repository<Dapp> {}

@EntityRepository(DappComposite)
export class DappCompositeRepository extends Repository<DappComposite> {}