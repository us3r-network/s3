import { Composite } from '@composedb/devtools'
import { RuntimeCompositeDefinition } from '@composedb/types'
import axios, { AxiosPromise } from 'axios'
import { PassedSchema } from 'graphql-editor/lib/Models/Types'
import { ApiResp } from '.'
import { APP_API_URL, PAGE_SIZE } from '../constants'
import {
  ClientDApp,
  DappModelDto,
  GraphqlGenType,
  GraphqlGenTypeServer,
  ModeCreateResult,
  ModeQueryResult,
  ModelMid,
  ModelStream,
  Network,
} from '../types.d'

export function getDappModels({
  dapp: { id },
  did,
}: {
  dapp: ClientDApp
  did?: string
}): AxiosPromise<ApiResp<DappModelDto[]>> {
  let host = APP_API_URL

  return axios({
    url: host + `/dapps/${id}/models`,
    method: 'GET',
    headers: {
      'did-session': did || '',
    },
  })
}

export function createDappModels({
  did,
  dapp,
  data,
}: {
  did: string
  dapp: ClientDApp
  data: { mdoelStreamId:string, gqlSchema:PassedSchema , composite:Composite, runtimeDefinition:RuntimeCompositeDefinition}
}) {
  let host = APP_API_URL
  return axios({
    url: host + `/dapps/${dapp.id}/models`,
    method: 'POST',
    headers: {
      'did-session': did,
    },
    data: { mdoelStreamId:data.mdoelStreamId, graphql: data.gqlSchema.code, composite: data.composite, runtimeDefinition: data.runtimeDefinition },
  })
}

// export function bindingDappModels({
//   did,
//   dapp,
//   modelId,
// }: {
//   did: string
//   dapp: ClientDApp
//   modelId: number
// }) {
//   let host = APP_API_URL
//   return axios({
//     url: host + `/dapps/${dapp.id}/models/${modelId}/bindings`,
//     method: 'POST',
//     headers: {
//       'did-session': did,
//     },
//   })
// }

export function updateDappModels() {}

export function deleteDappModels({
  modelId,
  dapp,
  did,
}: {
  modelId: number
  dapp: ClientDApp
  did: string
}) {
  let host = APP_API_URL
  return axios({
    url: host + `/dapps/${dapp.id}/models/${modelId}`,
    method: 'DELETE',
    headers: {
      'did-session': did,
    },
  })
}

/*******************************************************/

export function getModelStreamList({
  name,
  did,
  pageSize = PAGE_SIZE,
  pageNumber = 1,
  network,
}: {
  name?: string
  did?: string
  pageSize?: number
  pageNumber?: number
  network?: Network
}): AxiosPromise<ApiResp<Array<ModelStream>>> {
  let host = APP_API_URL
  let net = network === Network.MAINNET ? Network.MAINNET : Network.TESTNET
  return axios.get(`${host}/models`, {
    params: {
      name,
      did,
      pageSize,
      pageNumber,
      useCounting: true,
      network: net.toUpperCase(),
    },
  })
}

export function createModel(
  graphql: string,
  network: Network
): AxiosPromise<ApiResp<ModeCreateResult>> {
  let host = APP_API_URL
  return axios.post(`${host}/models`, {
    graphql: graphql,
    network: network.toUpperCase(),
  })
}

export function getModelsInfoByIds({
  network,
  ids,
}: {
  network: Network
  ids: string[]
}): AxiosPromise<ApiResp<Array<ModelStream>>> {
  let host = APP_API_URL
  return axios.post(`${host}/models/ids`, {
    network: network.toUpperCase(),
    ids,
  })
}

export function queryModelGraphql(
  streamId: string | string[],
  network: Network
): AxiosPromise<ApiResp<ModeQueryResult>> {
  let host = APP_API_URL
  return axios.post(`${host}/models/graphql`, {
    models: Array.isArray(streamId) ? streamId : [streamId],
    network: network.toUpperCase(),
  })
}

export function getModelMid({
  network,
  modelId,
  pageSize = 50,
  pageNumber = 1,
}: {
  network: Network
  modelId: string
  pageSize?: number
  pageNumber?: number
}): AxiosPromise<ApiResp<ModelMid[]>> {
  let host = APP_API_URL
  return axios.get(`${host}/models/${modelId}/mids`, {
    params: {
      network: network.toUpperCase(),
      pageSize,
      pageNumber,
    },
  })
}

// export function getModelInfo({
//   network,
//   id,
// }: {
//   network: Network
//   id: string
// }): AxiosPromise<ApiResp<ModelStream>> {
//   let host = APP_API_URL
//   return axios.get(`${host}/models/${id}`, {
//     params: {
//       network: network.toUpperCase(),
//     },
//   })
// }

export function getModelSDK({
  network,
  modelId,
  type,
}: {
  network: Network
  modelId: string
  type: GraphqlGenType
}): AxiosPromise<ApiResp<any>> {
  let host = APP_API_URL
  const serverType = GraphqlGenTypeServer[type]
  return axios({
    url: host + `/models/${modelId}/sdk?network=${network}&type=${serverType}`,
    method: 'GET',
  })
}

// export function startIndexModel({
//   network,
//   modelId,
//   didSession,
// }: {
//   network: Network
//   modelId: string
//   didSession?: string
// }): AxiosPromise<ApiResp<null>> {
//   return axios({
//     url: `${APP_API_URL}/models/indexing?network=${network.toUpperCase()}&model=${modelId}`,
//     method: 'post',
//     headers: {
//       'did-session': didSession || '',
//     },
//   })
// }

// export function startIndexModels({
//   modelIds,
//   network,
//   didSession,
// }:{
//   didSession: string,
//   modelIds: string[],
//   network: Network }) {
//   if (!modelIds || modelIds.length===0) return Promise.reject()
//   const resp = Promise.all(modelIds.map((modelId: string) => {
//     return startIndexModel({
//       modelId,
//       network,
//       didSession
//     })
//   }))
//   return resp
// }

export function getStreamsCountWithModels({
  network,
  modelStreamIds,
}: {
  network: Network
  modelStreamIds: string
}): AxiosPromise<ApiResp<number>> {
  let host = APP_API_URL
  let net = network === Network.MAINNET ? Network.MAINNET : Network.TESTNET
  return axios({
    url:
      host +
      `/${net.toUpperCase()}/streams/count?modelStreamIds=${modelStreamIds}`,
    method: 'GET',
  })
}
