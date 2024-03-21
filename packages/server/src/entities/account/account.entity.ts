import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AccountType {
  EMAIL = 'email',
  ALL = 'all',
}

export class AccountData {
  refreshToken: string;
  accessToken: string;
  tokenType: string;
  scope: string;
  expiresAt: Date;
}

@Index(['did', 'thirdparty_id', 'account_type'], { unique: true })
@Entity({ name: 'accounts' })
export class Account extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  did: string;

  @Column({ nullable: true })
  account_type: AccountType;

  @Column({ nullable: true })
  pub_key: string;

  @Column({ nullable: false })
  thirdparty_id: string;

  @Column({ nullable: true })
  thirdparty_name: string;

  @Column({ type: 'jsonb', default: {} })
  data: AccountData;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  last_modified_at: Date;

  get getId(): number {
    return this.id;
  }
  set setId(id: number) {
    this.id = id;
  }

  get getDid(): string {
    return this.did;
  }
  set setDid(did: string) {
    this.did = did;
  }

  get getAccountType(): AccountType {
    return this.account_type;
  }
  set setAccountType(accountType: AccountType) {
    this.account_type = accountType;
  }

  get getThirdpartyId(): string {
    return this.thirdparty_id;
  }
  set setThirdpartyId(thirdpartyId: string) {
    this.thirdparty_id = thirdpartyId;
  }

  get getThirdpartyName(): string {
    return this.thirdparty_name;
  }
  set setThirdpartyName(thirdpartyName: string) {
    this.thirdparty_name = thirdpartyName;
  }

  get getData(): AccountData {
    return this.data;
  }
  set setData(data: AccountData) {
    this.data = data;
  }

  get getPubKey(): string {
    return this.pub_key;
  }
  set setPubKey(pubKey: string) {
    this.pub_key = pubKey;
  }

  get getCreatedAt(): Date {
    return this.created_at;
  }
  set setCreatedAt(createdAt: Date) {
    this.created_at = createdAt;
  }

  get getLastModifiedAt(): Date {
    return this.last_modified_at;
  }
  set setLastModifiedAt(LastModifiedAt: Date) {
    this.last_modified_at = LastModifiedAt;
  }
}
