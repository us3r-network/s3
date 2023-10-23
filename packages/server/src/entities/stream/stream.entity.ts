import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
export enum Network {
  MAINNET = 'MAINNET',
  TESTNET = 'TESTNET',
  ALL = 'ALL'
}

export enum Status {
  ANCHORED = 'ANCHORED',
  NOT_ANCHORED = 'NOT_ANCHORED',
}

@Index(['network', 'stream_id'], { unique: true })
@Entity({ name: 'streams' })
export class Stream extends BaseEntity {
  @PrimaryGeneratedColumn()
  private id: number;

  @Index()
  @Column({ nullable: false })
  private stream_id: string;

  @Index()
  @Column({ nullable: true })
  private network: Network;

  @Index()
  @Column({ nullable: true })
  private family: string;

  @Column({ nullable: true })
  private app: string;

  @Column({ nullable: true })
  private type: string;

  @Index()
  @Column({ nullable: true })
  private did: string;

  @Column({
    type: 'text',
    array: true,
    default: [],
  })
  private tags: string[];

  @Column({ nullable: true })
  private anchor_status: Status;

  @Column({ nullable: true })
  private anchor_hash: string;

  @Column({ nullable: true, type: 'timestamptz' })
  private anchor_date: Date;

  @Column({ nullable: true })
  private schema: string;

  @Column({ nullable: true })
  private model: string;

  @Index()
  @Column({ nullable: true })
  private domain: string;

  @Column({
    type: 'text',
    array: true,
    default: [],
  })
  private commit_ids: string[];

  @Column({ type: 'jsonb', default: {} })
  private content: any;

  @Column({ type: 'jsonb', default: {} })
  private metadata: any;

  @Column({ type: 'jsonb', default: {} })
  private origin_data: any;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  private created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  private last_modified_at: Date;

  get getId(): number {
    return this.id;
  }
  set setId(id: number) {
    this.id = id;
  }

  get getNetwork(): Network {
    return this.network;
  }
  set setNetwork(network: Network) {
    this.network = network;
  }

  get getType(): string {
    return this.type;
  }
  set setType(type: string) {
    this.type = type;
  }
  get getFamily(): string {
    return this.family;
  }
  set setFamily(family: string) {
    this.family = family;
  }
  get getTags(): string[] {
    return this.tags;
  }
  set setTags(tags: string[]) {
    this.tags = tags;
  }

  get getStreamId(): string {
    return this.stream_id;
  }
  set setStreamId(streamId: string) {
    this.stream_id = streamId;
  }

  get getDomain(): string {
    return this.domain;
  }
  set setDomain(domain: string) {
    this.domain = domain;
  }

  get getDid(): string {
    return this.did;
  }
  set setDid(did: string) {
    this.did = did;
  }

  get getAnchorStatus(): Status {
    return this.anchor_status;
  }
  set setAnchorStatus(anchorStatus: Status) {
    this.anchor_status = anchorStatus;
  }

  get getAnchorHash(): string {
    return this.anchor_hash;
  }
  set setAnchorHash(anchorHash: string) {
    this.anchor_hash = anchorHash;
  }

  get getApp(): string {
    return this.app;
  }
  set setApp(app: string) {
    this.app = app;
  }

  get getAnchorDate(): Date {
    return this.anchor_date;
  }
  set setAnchorDate(anchorDate: Date) {
    this.anchor_date = anchorDate;
  }

  get getSchema(): string {
    return this.schema;
  }
  set setSchema(schema: string) {
    this.schema = schema;
  }

  get getCommitIds(): string[] {
    return this.commit_ids;
  }
  set setCommitIds(commitIds: string[]) {
    this.commit_ids = commitIds;
  }

  get getModel(): string {
    return this.model;
  }
  set setModel(model: string) {
    this.model = model;
  }

  get getContent(): any {
    return this.content;
  }
  set setContent(content: any) {
    this.content = content;
  }

  get getMetadata(): any {
    return this.metadata;
  }
  set setMetadata(metadata: any) {
    this.metadata = metadata;
  }

  get getOriginData(): any {
    return this.origin_data;
  }
  set setOriginData(originData: any) {
    this.origin_data = originData;
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

@Entity({ name: 'history_sync_state' })
export class HistorySyncState extends BaseEntity {

  @Column({ nullable: false })
  private chain_id: string;

  @Column({ nullable: true })
  private processed_block_hash: string;

  @Column({ nullable: false })
  private processed_block_number: string;

  get getChainId(): string {
    return this.chain_id;
  }
  set setChainId(chainId: string) {
    this.chain_id = chainId;
  }

  get getProcessedBlockHash(): string {
    return this.processed_block_hash;
  } 
  set setProcessedBlockHash(processedBlockHash: string) { 
    this.processed_block_hash = processedBlockHash;
  }

  get getProcessedBlockNumber(): string {
    return this.processed_block_number;
  }
  set setProcessedBlockNumber(processedBlockNumber: string) {
      this.processed_block_number = processedBlockNumber;
  }
}