import { InjectRedis } from "@liaoliaots/nestjs-redis";
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import Redis from "ioredis";
import { S3SeverBizDbName } from "src/common/constants";
import { Account, AccountType } from "src/entities/account/account.entity";
import { AccountRepository } from "src/entities/account/account.repository";
import { DEFAULT_FROM_ADDRESS, TEMPLETES, sendTemplateEmail } from "src/utils/email";

@Injectable()
export default class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(Account, S3SeverBizDbName)
    private readonly accountRepository: AccountRepository,
    @InjectRedis() private readonly redis: Redis,
  ) { }

  async linkByEmail(did: string, email: string) {
    const code = Math.random().toString(10).substring(2, 8);

    await this.redis.set(`link:emails:${email}`, code, 'EX', 600);

    const sendTemplateEmailResult = await sendTemplateEmail(
      TEMPLETES[2].name, //use activateCode-email-u3 templete
      { activateCode: code },
      email,
      DEFAULT_FROM_ADDRESS,
    );

    if (sendTemplateEmailResult.$metadata.httpStatusCode != '200') {
      throw new InternalServerErrorException(
        `send mail failed: ${sendTemplateEmailResult.$metadata.httpStatusCode}`,
      );
    }
  }

  async getAccount(did: string, accountType: AccountType): Promise<Account> {
    const account = await this.accountRepository.findOne({ where: { did: did, account_type: accountType } });
    return account;
  }

  async link(did: string, code: string, type: AccountType, thirdpartyId: string): Promise<Account> {
    const account = await this.getAccount(did, type);
    if (account) {
      throw new BadRequestException('The account has existed.');
    }

    const redisCode = await this.redis.get(`link:emails:${thirdpartyId}`);
    if (redisCode != code) {
      throw new BadRequestException('The verification code is invalid.');
    }

    const newAccount = new Account();
    newAccount.did = did;
    newAccount.account_type = type;
    newAccount.thirdparty_id = thirdpartyId;
    return await this.accountRepository.save(newAccount);
  }
}
