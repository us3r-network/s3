import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
@Injectable()
export class AccountRepository extends Repository<Account> {}
