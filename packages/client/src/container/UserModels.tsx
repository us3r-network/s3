import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ModelStream, ModelStreamInfo } from "../types";
import InfiniteScroll from "react-infinite-scroll-component";
import { getModelStreamList, PageSize } from "../api";
import styled from "styled-components";
import { TableBox } from "../components/TableBox";
import { shortPubKey } from "../utils/shortPubKey";
import dayjs from "dayjs";
import { useCeramicCtx } from "../context/CeramicCtx";
import UserAvatarStyled from "../components/common/UserAvatarStyled";

export default function UserModels() {
  const { did } = useParams();
  const { network } = useCeramicCtx();
  const [models, setModels] = useState<Array<ModelStream>>([]);
  const [hasMore, setHasMore] = useState(true);
  const pageNum = useRef(1);

  const fetchModel = useCallback(async () => {
    if (!did) return;
    const resp = await getModelStreamList({ did: did, network });
    const list = resp.data.data;
    setModels(list);
    setHasMore(list.length >= PageSize);
    pageNum.current = 1;
  }, [did, network]);

  const fetchMoreModel = useCallback(
    async (pageNumber: number) => {
      const resp = await getModelStreamList({
        pageNumber,
        did,
        network,
      });
      const list = resp.data.data;
      setHasMore(list.length >= PageSize);
      setModels([...models, ...list]);
    },
    [did, models, network]
  );

  useEffect(() => {
    fetchModel();
  }, [fetchModel]);

  return (
    <PageBox>
      <div className="title-box">
        <div className="title">
          <UserAvatarStyled did={did} title={did} />
          <span>Models</span>
        </div>
      </div>
      <InfiniteScroll
        dataLength={models.length}
        next={() => {
          pageNum.current += 1;
          fetchMoreModel(pageNum.current);
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
                <th>Usage Count</th>
                <th>Release Date</th>
              </tr>
            </thead>
            <tbody>
              {models.map((item, idx) => {
                return (
                  <tr key={item.stream_id}>
                    <td>{item.stream_content.name}</td>
                    <td>
                      <div className="description">
                        {item.stream_content.description}
                      </div>
                    </td>
                    <td>
                      <Link to={`/model/${item.stream_id}`}>
                        {shortPubKey(item.stream_id, { len: 8, split: "-" })}
                      </Link>
                    </td>
                    <td>
                      <div className="usage-count">{item.useCount}</div>
                    </td>
                    <td>
                      <div className="release-date">
                        {(item.last_anchored_at &&
                          dayjs(item.created_at).format(
                            "YYYY-MM-DD HH:mm:ss"
                          )) ||
                          "-"}
                      </div>
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

const TableContainer = styled.table`
  width: 100%;
  table-layout: fixed;
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
    color: #ffffff;

    &:first-child {
      padding-left: 20px;
    }

    &:last-child {
      padding-left: 20px;
      padding-right: 0px;
    }

    > div {
      padding-right: 20px;
      text-overflow: ellipsis;
      overflow: hidden;
      padding-right: 5px;
    }
  }

  tbody tr {
    border-top: 1px solid #39424c;
  }

  tbody td {
    height: 88px;
  }

  .release-date,
  .usage-count,
  .description {
    font-weight: 400;
    font-size: 16px;
    line-height: 19px;
    color: #718096;
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

  .title-box {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .tools {
      display: flex;
      align-items: center;
      gap: 15px;

      > button {
        border-radius: 100px;
        background: #14171a;
        font-size: 14px;
        line-height: 20px;
        text-align: center;
        font-weight: 400;
        color: #a0aec0;
        text-transform: capitalize;
        background: #ffffff;
        font-weight: 500;
        color: #14171a;
        cursor: pointer;
        border: none;
        outline: none;
        /* width: 100px; */
        padding: 0 15px;
        height: 36px;
      }
    }
  }

  .title {
    gap: 10px;
    padding: 20px 0;
    position: sticky;
    background-color: #14171a;
    top: 0;
    z-index: 100;

    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 700;
    font-size: 24px;
    line-height: 28px;
    font-style: italic;

    color: #ffffff;
  }
`;
