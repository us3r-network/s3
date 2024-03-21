import axios, { AxiosPromise } from 'axios'
import { ApiResp } from '.'
import { APP_API_URL } from '../constants'
import { AccountType } from '../types.d'

export function getUserEmail(
  didSession: string
): AxiosPromise<ApiResp<{ email: string }>> {
  let host = APP_API_URL
  return axios({
    url: host + `/users/email`,
    method: 'GET',
    headers: {
      'did-session': didSession,
    },
  })
}

export function postUserEmail(
  didSession: string,
  email: string,
): AxiosPromise<ApiResp<undefined>> {
  if (!email) throw new Error('email id is required')

  let host = APP_API_URL

  return axios({
    url: host + '/users/email',
    method: 'POST',
    headers: {
      'did-session': didSession,
    },
    data: { email },
  })
}

export function linkUserEmail(
  didSession: string,
  email: string,
  code: string,
): AxiosPromise<ApiResp<undefined>> {
  if (!email) throw new Error('email is required')
  if (!code) throw new Error('code is required')

  let host = APP_API_URL

  return axios({
    url: host + '/users/link',
    method: 'POST',
    headers: {
      'did-session': didSession,
    },
    data: {
      thirdpartyId: email,
      code,
      type: AccountType.EMAIL
    },
  })
}