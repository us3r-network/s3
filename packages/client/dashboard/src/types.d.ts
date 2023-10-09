export type ClientDApp = {
  id?: number
  modelId?: string
  icon?: string
  name: string
  network: string
  type?: string
  stage?: string
  url?: string
  description?: string
  socialLinks?: { platform: string; url: string }[]
  tags?: string[]
  models?: string[]
  createdAt?: number
  lastModifiedAt?: number
}

export type ModelStream = {
  stream_id: string
  controller_did: string
  tip: string
  streamContent: {
    name: string
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
  updated_at: string
  useCount: number
  recentlyUseCount?: number
  firstRecordTime?: string
  isIndexed?: boolean
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

export type ModelMid = {
  streamId: string
  controllerDid: string
  createdAt: number
  updatedAt: number
}

export type DappComposite = {
  id: number
  name: string
  dappId: number
  graphql: string
  composite: string
  runtimeDefinition: string
  createdAt: number
  lastModifiedAt: number
}
