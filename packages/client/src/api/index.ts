import axios, { AxiosPromise } from "axios";
import { API_BASE_URL } from "../constants";
import {
  ModeCreateResult,
  ModelStream,
  ModelStreamInfo,
  Network,
  Stream,
} from "../types";

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

export function getModelStreamList({
  name,
  did,
  pageSize = PageSize,
  pageNumber = 1,
}: {
  name?: string;
  did?: string;
  pageSize?: number;
  pageNumber?: number;
}): AxiosPromise<ApiResp<Array<ModelStream>>> {
  return axios.get(`${API_BASE_URL}/models`, {
    params: {
      name,
      did,
      pageSize,
      pageNumber,
      useCounting: true,
    },
  });
}

export function getModelStreamInfo(
  streamId: string
): AxiosPromise<ApiResp<ModelStreamInfo>> {
  return axios.get(`${API_BASE_URL}/TESTNET/streams/${streamId}/info`, {
    params: {},
  });
}

export function createModel(
  graphql: string
): AxiosPromise<ApiResp<ModeCreateResult>> {
  return axios.post(`${API_BASE_URL}/models`, {
    graphql: graphql,
  });
}
