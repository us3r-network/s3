import axios, { AxiosPromise } from 'axios'
import { API_BASE_URL, UPLOAD_API_URL } from '../constants'
import {
  ModeCreateResult,
  ModelMid,
  ModelStream,
  ModelStreamInfo,
  ModeQueryResult,
  Network,
  Stats,
  Stream,
  Dapp,
} from '../types'

enum ApiRespCode {
  SUCCESS = 0,
  ERROR = 1,
}

type ApiResp<T> = {
  code: ApiRespCode
  msg: string
  data: T
}

export const PageSize = 50

export function getList({
  network,
  pageSize = PageSize,
  pageNumber = 1,
  did,
  familyOrApp,
  types,
}: {
  network: Network
  pageSize?: number
  pageNumber?: number
  did?: string
  familyOrApp?: string[]
  types?: string[]
}): AxiosPromise<
  ApiResp<{
    didCount: number
    streamCount: number
    streams: Array<Stream>
  }>
> {
  return axios.get(`${API_BASE_URL}/streams`, {
    params: {
      network: network.toUpperCase(),
      pageSize,
      pageNumber,
      did,
      familyOrApp,
      type: types,
    },
  })
}

export function getStreamTopics(network: Network) {
  return axios.get(
    `${API_BASE_URL}/${network.toUpperCase()}/streams/topics`,
    {}
  )
}

export function getStreamInfo(
  network: Network,
  streamId: string
): AxiosPromise<ApiResp<Stream>> {
  console.log(network, streamId)
  return axios.get(
    `${API_BASE_URL}/${network.toUpperCase()}/streams/${streamId}`
  )
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
  network: Network
}): AxiosPromise<ApiResp<Array<ModelStream>>> {
  return axios.get(`${API_BASE_URL}/models`, {
    params: {
      name,
      did,
      pageSize,
      pageNumber,
      useCounting: true,
      network: network.toUpperCase(),
    },
  })
}

export function getModelStreamInfo(
  streamId: string,
  network: Network
): AxiosPromise<ApiResp<ModelStreamInfo>> {
  return axios.get(
    `${API_BASE_URL}/${network.toUpperCase()}/streams/${streamId}/info`,
    {
      params: {},
    }
  )
}

export function createModel(
  graphql: string,
  network: Network
): AxiosPromise<ApiResp<ModeCreateResult>> {
  return axios.post(`${API_BASE_URL}/models`, {
    graphql: graphql,
    network: network.toUpperCase(),
  })
}

export function queryModelGraphql(
  streamId: string,
  network: Network
): AxiosPromise<ApiResp<ModeQueryResult>> {
  return axios.post(`${API_BASE_URL}/models/graphql`, {
    models: [streamId],
    network: network.toUpperCase(),
  })
}

export function getHomeStats({
  network,
}: {
  network: Network
}): AxiosPromise<ApiResp<Stats>> {
  return axios.get(`${API_BASE_URL}/${network.toUpperCase()}/stats`)
}

export function getModelMid({
  network,
  modelId,
  pageSize = PageSize,
  pageNumber = 1,
}: {
  network: Network
  modelId: string
  pageSize?: number
  pageNumber?: number
}): AxiosPromise<ApiResp<ModelMid[]>> {
  return axios.get(`${API_BASE_URL}/models/${modelId}/mids`, {
    params: {
      network: network.toUpperCase(),
      pageSize,
      pageNumber,
    },
  })
}

export function getModelMidItem({
  network,
  modelId,
  midId,
}: {
  network: Network
  modelId: string
  midId: string
}) {
  return axios.get(`${API_BASE_URL}/models/${modelId}/mids/${midId}`, {
    params: {
      network: network.toUpperCase(),
    },
  })
}

export function getStarModels({
  network,
  ids,
}: {
  network: Network
  ids: string[]
}): AxiosPromise<ApiResp<Array<ModelStream>>> {
  return axios.post(`${API_BASE_URL}/models/ids`, {
    network: network.toUpperCase(),
    ids,
  })
}

export function getModelInfo({
  network,
  id,
}: {
  network: Network
  id: string
}): AxiosPromise<ApiResp<ModelStream>> {
  return axios.get(`${API_BASE_URL}/models/${id}`, {
    params: {
      network: network.toUpperCase(),
    },
  })
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
    url: `${API_BASE_URL}/models/indexing?network=${network.toUpperCase()}&model=${modelId}`,
    method: 'post',
    headers: {
      'did-session': didSession || '',
    },
  })
}

export function getModelStreams({
  network,
  ids,
}: {
  network: Network
  ids: string[]
}): AxiosPromise<ApiResp<Array<ModelStream>>> {
  return axios.post(`${API_BASE_URL}/models/ids`, {
    network: network.toUpperCase(),
    ids,
  })
}

export function getDapps({
  pageNumber,
  network,
  name,
}: {
  pageNumber?: number
  network: Network
  name?: string
}): AxiosPromise<ApiResp<Dapp[]>> {
  const net = network.toLowerCase()
  const n = net.charAt(0).toUpperCase() + net.slice(1)
  return axios({
    url: `${API_BASE_URL}/dapps`,
    method: 'get',
    params: {
      network: n,
      pageSize: PageSize,
      pageNumber: pageNumber || 1,
      name,
    },
  })
}

export function getDappInfo({
  network,
  appId,
}: {
  network: Network
  appId: string
}): AxiosPromise<ApiResp<Dapp>> {
  const net = network.toLowerCase()
  const n = net.charAt(0).toUpperCase() + net.slice(1)
  return axios({
    url: `${API_BASE_URL}/dapps/${appId}`,
    method: 'get',
    params: {
      network: n,
    },
  })
}
