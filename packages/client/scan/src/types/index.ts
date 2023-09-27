type Json = any

export type Stream = {
  streamId: string
  did: string
  network: string
  indexingTime: number
  familyOrApp: string | null
  type: string
  from: string
  tags: string[]
  status: string
  hash: string
  schema: string
  model?: string
  anchorStatus: string
  commitIds: string[]
  content: Json
  metadata: Json
  domain?: string
}

export enum Network {
  MAINNET = 'MAINNET',
  TESTNET = 'TESTNET',
}

export type ModelStream = {
  stream_id: string
  streamId: string
  controller_did: string
  controllerDid: string
  tip: string
  streamContent: {
    name: string
    description: string | null
    schema: {
      type: 'object'
      $schema: 'https://json-schema.org/draft/2020-12/schema'
      required: ['myData']
      properties: {
        myData: {
          type: 'integer'
          maximum: 10000
          minimum: 0
        }
      }
      additionalProperties: false
    }
    version: '1.0'
    accountRelation: {
      type: 'list'
    }
  }
  stream_content: {
    name: string
    description: string | null
    schema: {
      type: 'object'
      $schema: 'https://json-schema.org/draft/2020-12/schema'
      required: ['myData']
      properties: {
        myData: {
          type: 'integer'
          maximum: 10000
          minimum: 0
        }
      }
      additionalProperties: false
    }
    version: '1.0'
    accountRelation: {
      type: 'list'
    }
  }
  last_anchored_at: null
  first_anchored_at: null
  created_at: string
  createdAt: string
  updated_at: string
  useCount: number
  recentlyUseCount?: number
  isIndexed?: boolean
  firstRecordTime?: string
  dapps?: { name: string; description: string; icon: string; id: number }[]
}

export type ModelStreamInfo = {
  content: any
  state: any
}

export type ModeCreateResult = {
  composite: any
  runtimeDefinition: any
}

export type ModeQueryResult = {
  composite: any
  runtimeDefinition: any
  graphqlSchema: string
  graphqlSchemaDefinition?: string
  isIndexed?: boolean
}

export type Stats = {
  streamsLastWeek: number[]
  streamsPerHour: number | null
  todayModels: number | null
  totalModels: number | null
  totalStreams: number | null
}

export type ModelMid = {
  streamId: string
  controllerDid: string
  createdAt: number
  updatedAt: number
  streamContent: StreamContent
}

export interface Dapp {
  id: number
  name: string
  description: string
  icon: string
  url: string
  socialLinks: SocialLink[]
  tags: any[]
  models: string[]
  modelDetails: ModelDetail[]
  schemas: string[]
  schemaDetails: SchemaDetail[]
  stage: string
  type: string
  network: string
  createdAt: number
  lastModifiedAt: number
}

export interface SocialLink {
  url: string
  platform: string
}

export interface ModelDetail {
  stream_id: string
  controller_did: string
  tip: string
  stream_content: StreamContent
  last_anchored_at: string
  first_anchored_at: string
  created_at: string
  updated_at: string
}

export interface StreamContent {
  name: string
  version: string
  description: string
  date: string
  type: string
  url: string
}

export interface SchemaDetail {
  streamId: string
  network: string
  indexingTime: number
  familyOrApp: string
  type: string
  did: string
  tags: string[]
  anchorStatus: string
  anchorHash: string
  anchorDate: number
  schema: any
  commitIds: string[]
  content: Content
  model: string
  metadata: Metadata
  domain: any
}

export interface Content {
  type: string
  title: string
  $schema: string
  required: string[]
  properties: Properties
}

export interface Properties {
  master: Master
  reply_to: ReplyTo
  conversation_id: ConversationId
  encryptedMessage: EncryptedMessage
}

export interface Master {
  type: string[]
}

export interface ReplyTo {
  type: string[]
}

export interface ConversationId {
  type: string
}

export interface EncryptedMessage {
  type: string
  properties: Properties2
}

export interface Properties2 {
  encryptedString: EncryptedString
  encryptedSymmetricKey: EncryptedSymmetricKey
  accessControlConditions: AccessControlConditions
}

export interface EncryptedString {
  type: string
}

export interface EncryptedSymmetricKey {
  type: string
}

export interface AccessControlConditions {
  type: string
}

export interface Metadata {
  tags: string[]
  family: string
  unique: string
  controllers: string[]
}
