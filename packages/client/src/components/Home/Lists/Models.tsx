import styled from "styled-components";
import Title from "./Title";
import { useCallback, useEffect, useState } from "react";
import { getModelStreamList } from "../../../api";
import { ModelStream } from "../../../types";
import { shortPubKey } from "../../../utils/shortPubKey";
import { useCeramicCtx } from "../../../context/CeramicCtx";
import { Link } from "react-router-dom";

export default function Models() {
  const [list, setList] = useState<Array<ModelStream>>([]);
  const { network } = useCeramicCtx();
  const fetchModel = useCallback(async () => {
    const resp = await getModelStreamList({ network });
    const list = resp.data.data;
    setList(list);
  }, [network]);

  useEffect(() => {
    fetchModel();
  }, [fetchModel]);
  return (
    <Box>
      <Title title="Total Models" viewAll="/models" />
      <div>
        {list.slice(0, 10).map((item) => {
          return (
            <ListCard
              key={item.stream_id}
              stream_id={item.stream_id}
              count={item.useCount}
              isIndexed={item.isIndexed}
              description={item.stream_content.description || ""}
              name={item.stream_content.name}
            />
          );
        })}
      </div>
    </Box>
  );
}

function ListCard({
  stream_id,
  name,
  description,
  count,
  isIndexed,
}: {
  stream_id: string;
  name: string;
  description: string;
  count: number;
  isIndexed?: boolean;
}) {
  return (
    <CardBox>
      <div className="name">
        {(isIndexed && (
          <Link to={`/models/modelview/${stream_id}`}>
            <h4>{name}</h4>
            <span>{shortPubKey(stream_id, { len: 8, split: "-" })}</span>
          </Link>
        )) || (
          <>
            <h4>{name}</h4>
            <span>{shortPubKey(stream_id, { len: 8, split: "-" })}</span>
          </>
        )}
      </div>
      <div className="desc">{description}</div>
      <div className="count">
        {(isIndexed && (
          <Link to={`/models/model/${stream_id}/mids`}>{count}</Link>
        )) ||
          count}
      </div>
    </CardBox>
  );
}

const CardBox = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr 100px;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid rgba(57, 66, 76, 0.5);
  &:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }
  .name {
    color: #718096;
    > a {
      color: #ffffff;
    }
    h4 {
      margin: 5px 0;
      font-weight: 500;
      font-size: 16px;
      line-height: 19px;
    }
    span {
      font-weight: 400;
      font-size: 12px;
      line-height: 14px;
      color: #718096;
    }
  }

  .desc {
    width: 100%;
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    color: #718096;
  }

  .count {
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    color: #718096;
    text-align: end;
    > a {
      color: #ffffff;
    }
  }
`;

const Box = styled.div`
  padding: 20px;
`;
