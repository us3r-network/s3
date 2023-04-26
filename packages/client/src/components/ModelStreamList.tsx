import styled from "styled-components";
import { TableBox } from "./TableBox";
import { ModelMid } from "../types";
import dayjs from "dayjs";
import { shortPubKey } from "../utils/shortPubKey";
import { Link } from "react-router-dom";

export default function ModelStreamList({ modelId,data }: { modelId: string,data: ModelMid[] }) {
  return (
    <TableBox>
      <TableContainer>
        <thead>
          <tr>
            <th>Stream ID</th>
            <th>DID</th>
            <th>Indexing Time</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            return (
              <tr key={item.streamId}>
                <td>
                  <div className="stream-id">
                  <Link to={`/model/${modelId}/mids/${item.streamId}`}>

                          
                    {shortPubKey(item.streamId, {
                      len: 8,
                      split: "-",
                    })}
                    </Link>
                  </div>
                </td>
                <td>
                  {shortPubKey(item.controllerDid, {
                    len: 8,
                    split: "-",
                  })}
                </td>
                <td className="index-time">
                  <div>
                    <time>{dayjs(item.createdAt).fromNow()}</time>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </TableContainer>
    </TableBox>
  );
}

const TableContainer = styled.table`
  /* table-layout: fixed; */
  width: 100%;
  border-collapse: collapse;
  color: #718096;

  tbody tr,
  thead tr {
    font-size: 15px;
    /* text-align: center; */
    height: 60px;
  }

  tbody tr {
    border-top: 1px solid #39424c;
  }

  tbody td {
    height: 88px;
    &.index-time {
      width: 200px;
    }
  }

  thead tr th {
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    color: #718096;
    opacity: 0.8;
    text-align: start;

    overflow: hidden;

    &:first-child {
      padding-left: 20px;
    }

    &:last-child {
      padding-left: 0px;
      padding-right: 20px;
    }
  }

  tbody tr td {
    font-weight: 400;
    font-size: 16px;
    line-height: 19px;
    overflow: hidden;
    &:first-child {
      padding-left: 20px;
    }

    &:last-child {
      padding-left: 0px;
      padding-right: 20px;
    }

    > div {
      text-overflow: ellipsis;
      overflow: hidden;
      padding-right: 5px;
    }
  }

  & .stream-id {
    color: #fff;
  }

  & time {
    font-weight: 400;
    font-size: 16px;
    line-height: 19px;

    color: #718096;
  }
`;
