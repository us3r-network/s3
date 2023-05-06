import { useCallback, useEffect, useRef, useState } from "react";
import { ModelMid } from "../../types";
import { PageSize, getModelMid } from "../../api";
import styled from "styled-components";
import InfiniteScroll from "react-infinite-scroll-component";
import ModelStreamList from "../../components/ModelStreamList";
import { useParams } from "react-router-dom";
import { useCeramicCtx } from "../../context/CeramicCtx";
import { AxiosError } from "axios";

export default function Instance() {
  const pageNum = useRef(1);
  const { network } = useCeramicCtx();
  const [hasMore, setHasMore] = useState(true);
  const [streams, setStreams] = useState<Array<ModelMid>>([]);
  const { streamId  } = useParams();
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const fetchMoreStreams = useCallback(
    async (pageNumber: number) => {
      if (!streamId) return;
      const resp = await getModelMid({
        network,
        modelId: streamId,
        pageNumber,
      });
      const list = resp.data.data;
      setHasMore(list.length >= PageSize);
      setStreams([...streams, ...list]);
    },
    [streams, streamId, network]
  );
  const fetchModelMid = useCallback(async () => {
    if (!streamId) return;
    try {
      setLoading(true);
      setErrMsg("");
      const resp = await getModelMid({ network, modelId: streamId });
      const list = resp.data.data;
      setHasMore(list.length >= PageSize);
      setStreams(list);
    } catch (error) {
      const err = error as AxiosError;
      setErrMsg((err.response?.data as any).message || err.message);
    } finally {
      setLoading(false);
    }
  }, [streamId, network]);

  useEffect(() => {
    fetchModelMid();
  }, [fetchModelMid]);

  if (loading) {
    return (
      <PageBox>
        <Loading>Loading...</Loading>
      </PageBox>
    );
  }

  if (errMsg) {
    return (
      <PageBox>
        <div className="title-box" />
        <Loading>{errMsg}</Loading>
      </PageBox>
    );
  }

  return (
    <PageBox>
      <InfiniteScroll
        dataLength={streams.length}
        next={() => {
          pageNum.current += 1;
          fetchMoreStreams(pageNum.current);
        }}
        hasMore={hasMore}
        loader={<Loading>Loading...</Loading>}
      >
        {streamId && <ModelStreamList data={streams} modelId={streamId} />}
      </InfiniteScroll>
      {!hasMore && <Loading>no more data</Loading>}
    </PageBox>
  );
}

const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: gray;
`;

const PageBox = styled.div`
  .title-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 20px 0;
    box-sizing: border-box;

    .title {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 0;
      font-weight: 700;
      font-size: 24px;
      line-height: 28px;
      font-style: italic;
      color: #ffffff;

      button {
        background: #ffffff;
      }

      h3 {
        margin: 0;
        padding: 0;
      }
    }
  }
`;
