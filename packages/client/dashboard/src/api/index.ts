import axios, { AxiosPromise } from 'axios'
import { APP_API_URL, UPLOAD_API_URL } from '../constants'
import {
  ClientDApp,
  ModeCreateResult,
  ModeQueryResult,
  ModelMid,
  ModelStream,
} from '../types'
import { Network } from '../components/Selector/EnumSelect'

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