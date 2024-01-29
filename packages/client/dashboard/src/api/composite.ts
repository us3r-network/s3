import axios, { AxiosPromise } from 'axios'
import { ApiResp } from '.'
import { APP_API_URL } from '../constants'
import {
  ClientDApp,
  CompositeInput,
  DappCompositeDto,
  Network,
} from '../types.d'
import { PAGE_SIZE } from '../constants'

export function getDappComposites({
  dapp: { id },
  did,
}: {
  dapp: ClientDApp
  did?: string
}): AxiosPromise<ApiResp<DappCompositeDto[]>> {
  let host = APP_API_URL

  return axios({
    url: host + `/dapps/${id}/composites`,
    method: 'GET',
    headers: {
      'did-session': did || '',
    },
  })
}

export function createDappComposites({
  did,
  dapp,
  data,
}: {
  did: string
  dapp: ClientDApp
  data: CompositeInput
}) {
  let host = APP_API_URL
  return axios({
    url: host + `/dapps/${dapp.id}/composites`,
    method: 'POST',
    headers: {
      'did-session': did,
    },
    data,
  })
}

export function bindingDappComposites({
  did,
  dapp,
  compositeId,
}: {
  did: string
  dapp: ClientDApp
  compositeId: number
}) {
  let host = APP_API_URL
  return axios({
    url: host + `/dapps/${dapp.id}/composites/${compositeId}/bindings`,
    method: 'POST',
    headers: {
      'did-session': did,
    },
  })
}

export function updateDappComposites() { }

export function deleteDappComposites({
  compositeId,
  dapp,
  did,
}: {
  compositeId: number
  dapp: ClientDApp
  did: string
}) {
  let host = APP_API_URL
  return axios({
    url: host + `/dapps/${dapp.id}/composites/${compositeId}`,
    method: 'DELETE',
    headers: {
      'did-session': did,
    },
  })
}

/*******************************************************/

export function getComposites({
  name,
  did,
  pageSize = PAGE_SIZE,
  pageNumber = 1,
  network,
  published = true,
}: {
  name?: string
  did?: string
  pageSize?: number
  pageNumber?: number
  network?: Network
  published?:boolean
}): AxiosPromise<ApiResp<DappCompositeDto[]>> {
  let host = APP_API_URL

  return axios({
    url: host + `/dapps/composites`,
    method: 'GET',
    params: {
      pageSize,
      pageNumber,
      published,
    },
    headers: {
      'did-session': did || '',
    },
  })
}

export function getComposite({
  id,
  did,
}: {
  id: string
  did?: string
}): AxiosPromise<ApiResp<DappCompositeDto[]>> {
  let host = APP_API_URL

  return axios({
    url: host + `/dapps/composites/${id}`,
    method: 'GET',
    headers: {
      'did-session': did || '',
    },
  })
}

export function postComposite({
  did,
  id,
  data,
}: {
  did: string
  id: number
  data: CompositeInput
}) {
  let host = APP_API_URL
  return axios({
    url: host + `/dapps/composites/${id}`,
    method: 'POST',
    headers: {
      'did-session': did,
    },
    data,
  })
}

export function deleteComposite({
  id,
  did,
}: {
  id: number
  did: string
}) {
  let host = APP_API_URL
  return axios({
    url: host + `/dapps/composites/${id}`,
    method: 'DELETE',
    headers: {
      'did-session': did,
    },
  })
}
