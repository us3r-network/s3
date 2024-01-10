import axios from 'axios'
import { UPLOAD_API_URL } from '../constants'

export const PageSize = 50

enum ApiRespCode {
  SUCCESS = 0,
  ERROR = 1,
}

export type ApiResp<T> = {
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
