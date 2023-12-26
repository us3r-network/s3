import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CeramicNetwork {
  MAINNET = 'mainnet',
  TESTNET = 'testnet-clay',
  ALL = 'all',
}

export enum CeramicStatus {
  PREPARING = 'Preparing',
  RUNNING = 'Running',
  // PAUSE = 'Pause',
  // RESUMING = 'Resuming',
  TERMINATE = 'Terminate',
  FAILED = 'Failed',
  ALL = 'All',
}

export class CeramicServiceK8sMetadata {
  // k8s namespace is created by `ns_${creater_did}_${id}`
  keramikObjectName: string;
  ceramicLoadbalanceHost: string;
  ceramicLoadbalancePort: number;
}

@Entity({ name: 'ceramics' })
export class Ceramic extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Index()
  @Column({ nullable: true })
  network: CeramicNetwork;

  @Index()
  @Column({ nullable: false, default: CeramicStatus.PREPARING })
  status: CeramicStatus;

  @Column({ nullable: true })
  namespace: string;

  @Column({ nullable: true })
  private_key: string;

  @Index()
  @Column({ nullable: true })
  creater_did: string;

  @Index({ unique: true })
  @Column({ nullable: true })
  url_identity: string;

  @Column({ nullable: true })
  api_key: string;

  @Column({
    type: 'jsonb',
    default: {},
  })
  service_k8s_metadata: CeramicServiceK8sMetadata;

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

  get getNamespace(): string {
    return this.namespace;
  }
  set setNamespace(namespace: string) {
    this.namespace = namespace;
  }

  get getNetwork(): CeramicNetwork {
    return this.network;
  }
  set setNetwork(network: CeramicNetwork) {
    this.network = network;
  }

  get getStatus(): CeramicStatus {
    return this.status;
  }
  set setStatus(status: CeramicStatus) {
    this.status = status;
  }

  get getPrivateKey(): string {
    return this.private_key;
  }
  set setPrivateKey(privateKey: string) {
    this.private_key = privateKey;
  }

  get getCreaterDid(): string {
    return this.creater_did;
  }
  set setCreaterDid(createrDid: string) {
    this.creater_did = createrDid;
  }

  get getUrlIdentity(): string {
    return this.url_identity;
  }
  set setUrlIdentity(urlIdentity: string) {
    this.url_identity = urlIdentity;
  }

  get getApiKey(): string {
    return this.api_key;
  }
  set setApiKey(apiKey: string) {
    this.api_key = apiKey;
  }

  get getServiceK8sMetadata(): CeramicServiceK8sMetadata {
    return this.service_k8s_metadata;
  }
  set setServiceK8sMetadata(serviceK8sMetadata: CeramicServiceK8sMetadata) {
    this.service_k8s_metadata = serviceK8sMetadata;
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
