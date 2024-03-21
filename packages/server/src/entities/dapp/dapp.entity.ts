import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
export class SocialLink {
  platform: string;
  url: string;
}
export enum Network {
  MAINNET = 'Mainnet',
  TESTNET = 'Testnet',
  ALL = 'All',
}
@Entity({ name: 'dapps' })
export class Dapp extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  stage: string;

  @Index()
  @Column({ nullable: true })
  network: Network;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: false, default: false })
  is_deleted: boolean;

  @Index()
  @Column({ nullable: true })
  created_by_did: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: [],
  })
  social_links: SocialLink[];

  @Column({
    type: 'text',
    array: true,
    default: [],
  })
  tags: string[];

  @Column({
    type: 'text',
    array: true,
    default: [],
  })
  models: string[];

  @Column({
    type: 'text',
    array: true,
    default: [],
  })
  schemas: string[];

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

  get getName(): string {
    return this.name;
  }
  set setName(name: string) {
    this.name = name;
  }

  get getDescription(): string {
    return this.description;
  }
  set setDescription(description: string) {
    this.description = description;
  }

  get getIcon(): string {
    return this.icon;
  }
  set setIcon(icon: string) {
    this.icon = icon;
  }

  get getType(): string {
    return this.type;
  }
  set setType(type: string) {
    this.type = type;
  }

  get getStage(): string {
    return this.stage;
  }
  set setStage(stage: string) {
    this.stage = stage;
  }

  get getNetwork(): Network {
    return this.network;
  }
  set setNetwork(network: Network) {
    this.network = network;
  }

  get getUrl(): string {
    return this.url;
  }

  set setUrl(url: string) {
    this.url = url;
  }

  get getIsDeleted(): boolean {
    return this.is_deleted;
  }
  set setIsDeleted(isDeleted: boolean) {
    this.is_deleted = isDeleted;
  }

  get getCreatedByDid(): string {
    return this.created_by_did;
  }
  set setCreatedByDid(createdByDid: string) {
    this.created_by_did = createdByDid;
  }

  get getSocialLinks(): SocialLink[] {
    return this.social_links;
  }
  set setSocialLinks(socialLinks: SocialLink[]) {
    this.social_links = socialLinks;
  }

  get getTags(): string[] {
    return this.tags;
  }
  set setTags(tags: string[]) {
    this.tags = tags;
  }

  get getModels(): string[] {
    return this.models;
  }
  set setModels(models: string[]) {
    this.models = models;
  }

  get getSchemas(): string[] {
    return this.schemas;
  }
  set setSchemas(schemas: string[]) {
    this.schemas = schemas;
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

@Entity({ name: 'dapp_models' })
export class DappModel extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ nullable: true })
  dapp_id: number;

  @Column({ nullable: true })
  model_stream_id: string;

  @Column({ nullable: true })
  graphql: string;

  @Column({ nullable: true })
  composite: string;

  @Column({ nullable: true })
  runtime_definition: string;

  @Column({ nullable: false, default: false })
  is_deleted: boolean;

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

  get getIsDeleted(): boolean {
    return this.is_deleted;
  }
  set setIsDeleted(isDeleted: boolean) {
    this.is_deleted = isDeleted;
  }

  get getRuntimeDefinition(): string {
    return this.runtime_definition;
  }
  set setRuntimeDefinition(runtimeDefinition: string) {
    this.runtime_definition = runtimeDefinition;
  }

  get getGraphql(): string {
    return this.graphql;
  }
  set setGraphql(graphql: string) {
    this.graphql = graphql;
  }

  get getComposite(): string {
    return this.composite;
  }
  set setComposite(composite: string) {
    this.composite = composite;
  }
 
  get getDappId(): number {
    return this.dapp_id;
  }
  set setDappId(dappId: number) {
    this.dapp_id = dappId;
  }

  get getModelStreamId(): string {
    return this.model_stream_id;
  }
  set setModelStreamId(modelStreamId: string) {
    this.model_stream_id = modelStreamId;
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


@Entity({ name: 'dapp_composite_mappings' })
@Index(['dapp_id', 'composite_id'], { unique: true })
export class DappCompositeMapping extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ nullable: true })
  dapp_id: number;

  @Column({ nullable: true })
  composite_id: number;

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

  get getDappId(): number {
    return this.dapp_id;
  }
  set setDappId(dappId: number) {
    this.dapp_id = dappId;
  }

  get getCompositeId(): number {
    return this.composite_id;
  }
  set setCompositeId(compositeId: number) {
    this.composite_id = compositeId;
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

@Entity({ name: 'composites' })
export class DappComposite extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  graphql: string;

  @Column({ nullable: true })
  stream_id: string;

  @Column({ nullable: true })
  composite: string;

  @Index()
  @Column({ nullable: true })
  created_by_did: string;

  @Column({ nullable: true })
  runtime_definition: string;

  @Index()
  @Column({ nullable: false, default: false })
  is_deleted: boolean;

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

  get getIsDeleted(): boolean {
    return this.is_deleted;
  }
  set setIsDeleted(isDeleted: boolean) {
    this.is_deleted = isDeleted;
  }

  get getRuntimeDefinition(): string {
    return this.runtime_definition;
  }
  set setRuntimeDefinition(runtimeDefinition: string) {
    this.runtime_definition = runtimeDefinition;
  }

  get getGraphql(): string {
    return this.graphql;
  }
  set setGraphql(graphql: string) {
    this.graphql = graphql;
  }

  get getStreamId(): string {
    return this.stream_id;
  }
  set setStreamId(streamId: string) {
    this.stream_id = streamId;
  }

  get getComposite(): string {
    return this.composite;
  }
  set setComposite(composite: string) {
    this.composite = composite;
  }

  get getCreatedByDid(): string {
    return this.created_by_did;
  }
  set setCreatedByDid(createdByDid: string) {
    this.created_by_did = createdByDid;
  }

  get getName(): string {
    return this.name;
  }
  set setName(name: string) {
    this.name = name;
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

@Entity({ name: 'dapp_domains' })
export class DappDomain extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ nullable: true })
  dapp_id: number;

  @Column({ nullable: true })
  domain: string;

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

  get getDappId(): number {
    return this.dapp_id;
  }
  set setDappId(dappId: number) {
    this.dapp_id = dappId;
  }

  get getDomain(): string {
    return this.domain;
  }
  set setDomain(domain: string) {
    this.domain = domain;
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