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
