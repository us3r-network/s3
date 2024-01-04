/*
 * @Author: bufan bufan@hotmail.com
 * @Date: 2023-12-15 10:06:03
 * @LastEditors: bufan bufan@hotmail.com
 * @LastEditTime: 2023-12-27 16:19:42
 * @FilePath: /s3/packages/client/dashboard/src/types.d.ts
 * @Description: 
 */
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
  dapps?: ClientDApp[]
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

export type CeramicDto = {
  id: number;
  name: string;
  network: CeramicNetwork;
  status: string;
  privateKey: string;
  apiKey: string;
  namespace: string;
  serviceHost: string;
  serviceUrl: string;
  serviceK8sMetadata: CeramicServiceK8sMetadata;
  createdAt: number;
  lastModifiedAt: number;
}

export type CeramicRequestDto = {
  name: string;
  network: CeramicNetwork;
}

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

export type CeramicServiceK8sMetadata = {
  // k8s namespace is created by `ns_${creater_did}_${id}`
  keramikObjectName: string;
  ceramicLoadbalanceHost: string;
  ceramicLoadbalancePort: number;
}
