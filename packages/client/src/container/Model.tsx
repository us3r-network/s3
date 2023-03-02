import { CeramicClient } from "@ceramicnetwork/http-client";
import { Model } from "@ceramicnetwork/stream-model";
import { useCallback, useEffect, useState } from "react";
import { Edge, PageInfo } from "@ceramicnetwork/common";
import styled from "styled-components";
import InfiniteScroll from "react-infinite-scroll-component";
import { TableBox } from "../components/TableBox";
import { Link } from "react-router-dom";
import { CERAMIC_PROXY } from "../constants";
import { StreamID } from '@ceramicnetwork/streamid';

const ceramicIndexer = new CeramicClient(
  CERAMIC_PROXY || "http://13.215.254.225:3000"
);
const FirstNum = 50;

export default function ModelPage() {
  //   const [models, setModels] = useState<Page<any>>();
  const [models, setModels] = useState<Array<Edge<any>>>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo>();
  const fetchModel = useCallback(async () => {
    const page = await ceramicIndexer.index.query({
      first: FirstNum,
      model: Model.MODEL as unknown as string | StreamID,
    });
    console.log(page);
    setModels(page.edges);
    setPageInfo(page.pageInfo);
  }, []);

  const fetchMoreModel = useCallback(
    async (after?: string) => {
      const page = await ceramicIndexer.index.query({
        first: FirstNum,
        model: Model.MODEL as unknown as string | StreamID,
        after,
      });
      setModels([...models, ...page.edges]);
      setPageInfo(page.pageInfo);
    },
    [models]
  );

  useEffect(() => {
    fetchModel();
  }, [fetchModel]);

  const hasMore = pageInfo?.hasNextPage || true;

  return (
    <PageBox>
      <div className='title-box'>
        <div className="title">ComposeDB Models</div>
        <Link to={"/model/create"}>[ + ]</Link>
      </div>
      <InfiniteScroll
        dataLength={models.length}
        next={() => {
          fetchMoreModel(pageInfo?.endCursor);
          console.log("fetch more");
        }}
        hasMore={hasMore}
        loader={<Loading>Loading...</Loading>}
      >
        <TableBox>
          <TableContainer>
            <thead>
              <tr>
                <th>Model Name</th>
                <th>Description</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {models.map((item, idx) => {
                const stream = ceramicIndexer.buildStreamFromState(item.node);
                const streamId = stream.id.toString();
                return (
                  <tr key={item.cursor}>
                    <td>{item.node.content.name}</td>
                    <td>{item.node.content.description}</td>
                    <td>
                      <Link to={`/model/${streamId}`}>{streamId}</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </TableContainer>
        </TableBox>
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
  margin-bottom: 20px;
  .no-more {
    padding: 20px;
    text-align: center;
    color: gray;
  }

  .title-box{
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .title {
    font-size: 22px;
    font-weight: 700;
    padding: 20px 0;
    position: sticky;
    background-color: #14171a;
    top: 0;
    z-index: 100;
    line-height: 40px;
  }
`;

const TableContainer = styled.table`
  width: 100%;

  border-collapse: collapse;

  tbody tr,
  thead tr {
    font-size: 15px;
    /* text-align: center; */
    height: 60px;
  }

  thead tr th {
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    color: #718096;
    opacity: 0.8;
    text-align: start;

    width: calc(100% / 7) !important;
    overflow: hidden;

    &:first-child {
      padding-left: 20px;
    }

    &:last-child {
      padding-left: 20px;
      padding-right: 0px;
    }
  }

  tbody tr td {
    font-weight: 400;
    font-size: 16px;
    line-height: 19px;
    overflow: hidden;
    color: #71aaff;

    &:first-child {
      padding-left: 20px;
    }

    &:last-child {
      padding-left: 20px;
      padding-right: 0px;
    }
  }

  tbody tr {
    border-top: 1px solid #39424c;
  }

  tbody td {
    height: 88px;
  }

  .did-container {
    display: flex;
    gap: 10px;

    & div {
      text-align: start;
    }

    .badge {
      background-color: #718096;
      border-radius: 20px;
      padding: 4px 10px;
      font-size: 13px;
      font-weight: 500;
      align-items: center;
      flex-direction: row;
      display: flex;
    }
    .grey {
      color: #14171a;
    }
  }

  & .family-container {
    overflow: hidden;
    box-sizing: border-box;
    .family {
      font-weight: 400;
      font-size: 12px;
      line-height: 14px;

      color: #6c8fc1;

      padding: 2px 4px;
      width: fit-content;

      border: 1px solid #6c8fc1;
      border-radius: 4px;
    }
  }

  & .xxxx {
    font-weight: 400;
    font-size: 16px;
    line-height: 19px;

    color: #ffffff;
  }

  & time {
    font-weight: 400;
    font-size: 16px;
    line-height: 19px;

    color: #ffffff;
  }
`;
