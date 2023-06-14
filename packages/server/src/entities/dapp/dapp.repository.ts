import { EntityRepository, Repository } from 'typeorm';
import { Dapp } from './dapp.entity';

@EntityRepository(Dapp)
export class DappRepository extends Repository<Dapp> {}
