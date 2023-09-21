import axios, { AxiosPromise } from 'axios'
import { APP_API_URL, UPLOAD_API_URL } from '../constants'
import {
  ClientDApp,
  DappComposite,
  ModeCreateResult,
  ModeQueryResult,
  ModelMid,
  ModelStream,
} from '../types'
import {
  GraphqlGenType,
  GraphqlGenTypeServer,
  Network,
} from '../components/Selector/EnumSelect'

export const PageSize = 50

enum ApiRespCode {
  SUCCESS = 0,
  ERROR = 1,
}

type ApiResp<T> = {
  code: ApiRespCode
  msg: string
  data: T
}

export function uploadImage({ file }: { file: File }) {
  const form = new FormData()
  form.append('file', file)
  return axios({
    url: UPLOAD_API_URL + '/medium/upload',
    method: 'post',
    data: form,
  })
}

export function getDapp(appId: string) {
  let host = APP_API_URL
  return axios({
    url: host + `/dapps/${appId}`,
    method: 'GET',
  })
}

export function createDapp(
  dapp: ClientDApp,
  didSession: string
): AxiosPromise<ApiResp<ClientDApp>> {
  let host = APP_API_URL
  return axios({
    url: host + '/dapps',
    method: 'POST',
    headers: {
      'did-session': didSession,
    },
    data: { ...dapp },
  })
}

export function updateDapp(
  dapp: ClientDApp,
  didSession: string
): AxiosPromise<ApiResp<ClientDApp>> {
  if (!dapp.id) throw new Error('dapp id is required')

  let host = APP_API_URL

  return axios({
    url: host + '/dapps',
    method: 'POST',
    headers: {
      'did-session': didSession,
    },
    data: { ...dapp, id: Number(dapp.id) },
  })
}

export function delDapp(
  dapp: ClientDApp,
  didSession: string
): AxiosPromise<ApiResp<undefined>> {
  if (!dapp.id) throw new Error('dapp id is required')

  let host = APP_API_URL

  return axios({
    url: host + '/dapps/' + dapp.id,
    method: 'DELETE',
    headers: {
      'did-session': didSession,
    },
  })
}

export function getDappWithDid(
  didSession: string,
  network?: Network
): AxiosPromise<ApiResp<ClientDApp[]>> {
  let host = APP_API_URL

  return axios({
    url: host + '/dapps',
    method: 'GET',
    headers: {
      'did-session': didSession,
    },
  })
}

export function getModelStreamList({
  name,
  did,
  pageSize = PageSize,
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

export function getStarModels({
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

export function getModelInfo({
  network,
  id,
}: {
  network: Network
  id: string
}): AxiosPromise<ApiResp<ModelStream>> {
  let host = APP_API_URL
  return axios.get(`${host}/models/${id}`, {
    params: {
      network: network.toUpperCase(),
    },
  })
}

export function getDappComposites({
  dapp: { id },
  didSession,
}: {
  dapp: ClientDApp
  didSession?: string
}): AxiosPromise<ApiResp<DappComposite[]>> {
  let host = APP_API_URL

  return axios({
    url: host + `/dapps/${id}/composites`,
    method: 'GET',
    headers: {
      'did-session': didSession || '',
    },
  })
}

export function createDappComposites({
  didSession,
  dapp,
  data,
  name,
}: {
  didSession: string
  dapp: ClientDApp
  data: string
  name: string
}) {
  let host = APP_API_URL
  return axios({
    url: host + `/dapps/${dapp.id}/composites`,
    method: 'POST',
    headers: {
      'did-session': didSession,
    },
    data: { graphql: data, name },
  })
}

export function updateDappComposites() {}

export function deleteDappComposites({
  compositeId,
  dapp,
  didSession,
}: {
  compositeId: number
  dapp: ClientDApp
  didSession: string
}) {
  let host = APP_API_URL
  return axios({
    url: host + `/dapps/${dapp.id}/composites/${compositeId}`,
    method: 'DELETE',
    headers: {
      'did-session': didSession,
    },
  })
}

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

export function startIndexModel({
  network,
  modelId,
  didSession,
}: {
  network: Network
  modelId: string
  didSession?: string
}): AxiosPromise<ApiResp<null>> {
  return axios({
    url: `${APP_API_URL}/models/indexing?network=${network.toUpperCase()}&model=${modelId}`,
    method: 'post',
    headers: {
      'did-session': didSession || '',
    },
  })
}

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
