import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import InfiniteScroll from "react-infinite-scroll-component";
import { TableBox } from "../components/TableBox";
import { Link } from "react-router-dom";
import { getModelStreamList, PageSize } from "../api";
import { ModelStream } from "../types";
import { sortPubKey } from "../utils/sortPubkey";
import dayjs from "dayjs";
import Search from "../components/Search";

export default function ModelPage() {
  const [models, setModels] = useState<Array<ModelStream>>([]);
  const [searchText, setSearchText] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const pageNum = useRef(1);

  const fetchModel = useCallback(async () => {
    const resp = await getModelStreamList({ name: searchText });
    const list = resp.data.data;
    setModels(list);
    setHasMore(list.length >= PageSize);
    pageNum.current = 1;
  }, [searchText]);

  const fetchMoreModel = useCallback(
    async (pageNumber: number) => {
      const resp = await getModelStreamList({ pageNumber, name: searchText });
      const list = resp.data.data;
      setHasMore(list.length >= PageSize);
      setModels([...models, ...list]);
    },
    [models, searchText]
  );

  useEffect(() => {
    fetchModel();
  }, [fetchModel]);

  return (
    <PageBox>
      <div className='title-box'>
        <div className="title">ComposeDB Models</div>
        <div>
          <Search
            searchAction={(text) => {
              setSearchText(text);
              fetchModel();
            }}
            placeholder={"Search by model name"}
          />
        </div>
        <Link to={"/model/create"}>[ + ]</Link>
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
                      <div>{item.stream_content.description}</div>
                    </td>
                    <td>
                      <Link to={`/model/${item.stream_id}`}>
                        {sortPubKey(item.stream_id, { len: 8, split: "-" })}
                      </Link>
                    </td>
                    <td>{item.useCount}</td>
                    <td>
                      {(item.last_anchored_at &&
                        dayjs(item.created_at).format("YYYY-MM-DD HH:mm:ss")) ||
                        "-"}
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
    > span {
      font-size: 22px;
      font-weight: 700;
      line-height: 40px;
    }

    padding: 20px 0;
    position: sticky;
    background-color: #14171a;
    top: 0;
    z-index: 100;

    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

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
    color: #71aaff;

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
