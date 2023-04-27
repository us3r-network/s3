import axios, { AxiosPromise } from "axios";
import { API_BASE_URL } from "../constants";
import {
  ModeCreateResult,
  ModelMid,
  ModelStream,
  ModelStreamInfo,
  ModeQueryResult,
  Network,
  Stats,
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
  types,
}: {
  network: Network;
  pageSize?: number;
  pageNumber?: number;
  did?: string;
  familyOrApp?: string[];
  types?: string[];
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
      type: types,
    },
  });
}

export function getStreamTopics(network: Network) {
  return axios.get(
    `${API_BASE_URL}/${network.toUpperCase()}/streams/topics`,
    {}
  );
}

export function getStreamInfo(
  network: Network,
  streamId: string
): AxiosPromise<ApiResp<Stream>> {
  console.log(network, streamId);
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

export function queryModelGraphql(
  streamId: string
): AxiosPromise<ApiResp<ModeQueryResult>> {
  return axios.post(`${API_BASE_URL}/models/graphql`, {
    models: [streamId],
  });
}

export function getHomeStats({
  network,
}: {
  network: Network;
}): AxiosPromise<ApiResp<Stats>> {
  return axios.get(`${API_BASE_URL}/${network.toUpperCase()}/stats`);
}

export function getModelMid({
  network,
  modelId,
  pageSize = 50,
  pageNumber = 1,
}: {
  network: Network;
  modelId: string;
  pageSize?: number;
  pageNumber?: number;
}): AxiosPromise<ApiResp<ModelMid[]>> {
  return axios.get(`${API_BASE_URL}/models/${modelId}/mids`, {
    params: {
      network: network.toUpperCase(),
      pageSize,
      pageNumber,
    },
  });
}

export function getModelMidItem({
  network,
  modelId,
  midId,
}: {
  network: Network;
  modelId: string;
  midId: string;
}) {
  return axios.get(`${API_BASE_URL}/models/${modelId}/mids/${midId}`, {
    params: {
      network: network.toUpperCase(),
    },
  });
}

export function getStarModels({
  network,
  ids,
}: {
  network: Network;
  ids: string[];
}): AxiosPromise<ApiResp<Array<ModelStream>>> {
  return axios.post(`${API_BASE_URL}/models/ids`, {
    network: network.toUpperCase(),
    ids,
  });
}
