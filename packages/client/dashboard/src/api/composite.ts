import axios, { AxiosPromise } from 'axios'
import { APP_API_URL } from '../constants'
import {
  ClientDApp,
  DappComposite,
} from '../types.d'
import { ApiResp } from '.'

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
