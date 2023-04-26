import { useCallback, useEffect, useRef, useState } from "react";
import { ModelMid, Network } from "../types";
import { PageSize, getModelMid } from "../api";
import styled from "styled-components";
import InfiniteScroll from "react-infinite-scroll-component";
import ModelStreamList from "../components/ModelStreamList";
import getCurrNetwork from "../utils/getCurrNetwork";
import { useNavigate, useParams } from "react-router-dom";
import BackBtn from "../components/BackBtn";

export default function ModelStreams() {
  const pageNum = useRef(1);
  const [hasMore, setHasMore] = useState(true);
  const [streams, setStreams] = useState<Array<ModelMid>>([]);
  const { modelId } = useParams();
  const navigate = useNavigate();

  const fetchMoreStreams = useCallback(
    async (pageNumber: number) => {
      if (!modelId) return;
      const resp = await getModelMid({
        network: getCurrNetwork(),
        modelId,
        pageNumber,
      });
      const list = resp.data.data;
      setHasMore(list.length >= PageSize);
      setStreams([...streams, ...list]);
    },
    [streams, modelId]
  );
  const fetchModelMid = useCallback(async () => {
    if (!modelId) return;
    const resp = await getModelMid({ network: getCurrNetwork(), modelId });
    setStreams(resp.data.data);
  }, [modelId]);

  useEffect(() => {
    fetchModelMid();
  }, [fetchModelMid]);

  return (
    <PageBox>
      <div className="title-box">
        <BackBtn
          backAction={() => {
            navigate(-1);
          }}
        />
        <div className="title">
          <span>Model Streams</span>
        </div>
      </div>
      <InfiniteScroll
        dataLength={streams.length}
        next={() => {
          pageNum.current += 1;
          fetchMoreStreams(pageNum.current);
        }}
        hasMore={hasMore}
        loader={<Loading>Loading...</Loading>}
      >
        <ModelStreamList data={streams} />
      </InfiniteScroll>
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
