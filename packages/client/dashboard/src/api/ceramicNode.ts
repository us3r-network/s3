import axios, { AxiosPromise } from 'axios'
import { CERAMIC_NODE_SERVICE_API_URL } from '../constants'
import {
  CeramicRequestDto,
  CeramicDto,
  CeramicNetwork,
} from '../types.d'
import { ApiResp } from '.'

export function getCeramicNode(id: number): AxiosPromise<ApiResp<CeramicDto>> {
  return axios({
    url: CERAMIC_NODE_SERVICE_API_URL + `/ceramics/${id}`,
    method: 'GET',
  })
}

export function createCeramicNode(
  ceramicNodeParams: CeramicRequestDto,
  didSession: string
): AxiosPromise<ApiResp<CeramicDto>> {
  return axios({
    url: CERAMIC_NODE_SERVICE_API_URL + '/ceramics',
    method: 'POST',
    headers: {
      'did-session': didSession,
    },
    data: { ...ceramicNodeParams },
  })
}

// export function updateCeramicNode(
//   id: number,
//   dapp: CeramicRequestDto,
//   didSession: string
// ): AxiosPromise<ApiResp<CeramicDto>> {
//   if (!id) throw new Error('ceramic node id is required')

//   return axios({
//     url: CERAMIC_NODE_SERVICE_API_URL + '/ceramics',
//     method: 'POST',
//     headers: {
//       'did-session': didSession,
//     },
//     data: { ...dapp, id: Number(id) },
//   })
// }

export function delCeramicNode(
  id: number,
  didSession: string
): AxiosPromise<ApiResp<undefined>> {
  if (!id) throw new Error('ceramic node id is required')

  return axios({
    url: CERAMIC_NODE_SERVICE_API_URL + '/ceramics/' + id,
    method: 'DELETE',
    headers: {
      'did-session': didSession,
    },
  })
}

export function getCeramicNodes(
  didSession: string,
  network?: CeramicNetwork
): AxiosPromise<ApiResp<CeramicDto[]>> {

  return axios({
    url: CERAMIC_NODE_SERVICE_API_URL + '/ceramics',
    method: 'GET',
    headers: {
      'did-session': didSession,
    },
    data: { network },
  })
}
