import axios, { AxiosPromise } from 'axios';
import { API_BASE_URL } from '../constants';
import { Network, Stream } from '../types';

enum ApiRespCode {
  SUCCESS = 0,
  ERROR = 1,
}

type ApiResp<T> = {
  code: ApiRespCode;
  msg: string;
  data: T;
};

export const PageSize = 50;

export function getList({
  network,
  pageSize = PageSize,
  pageNumber = 1,
  did,
  familyOrApp,
}: {
  network: Network;
  pageSize?: number;
  pageNumber?: number;
  did?: string;
  familyOrApp?: string;
}): AxiosPromise<
  ApiResp<{
    didCount: number;
    streamCount: number;
    streams: Array<Stream>;
  }>
> {
  return axios.get(`${API_BASE_URL}/streams`, {
    params: {
      network: network.toUpperCase(),
      pageSize,
      pageNumber,
      did,
      familyOrApp,
    },
  });
}

export function getStreamInfo(
  network: Network,
  streamId: string
): AxiosPromise<ApiResp<Stream>> {
  return axios.get(
    `${API_BASE_URL}/${network.toUpperCase()}/streams/${streamId}`
  );
}
