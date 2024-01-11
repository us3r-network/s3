import axios, { AxiosPromise } from 'axios'
import { APP_API_URL } from '../constants'
import {
  ClientDApp,
  Network,
} from '../types.d'
import { ApiResp } from '.'

export const PageSize = 50

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
  didSession: string,
  ceramicId?:number,
): AxiosPromise<ApiResp<ClientDApp>> {
  if (!dapp.id) throw new Error('dapp id is required')

  let host = APP_API_URL

  return axios({
    url: host + '/dapps',
    method: 'POST',
    headers: {
      'did-session': didSession,
    },
    data: { ...dapp, ceramicId, id: Number(dapp.id) },
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
