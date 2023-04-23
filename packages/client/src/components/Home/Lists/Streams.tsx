import styled from "styled-components";
import dayjs from "dayjs";
import { useEffect } from "react";
import multiavatar from "@multiavatar/multiavatar";

import Title from "./Title";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { Network } from "../../../types";
import useListData from "../../../hooks/useListData";
import { shortPubKey } from "../../../utils/shortPubKey";

export default function Streams() {
  const [network] = useLocalStorage("network-select", Network.MAINNET);
  const { data, loadData } = useListData({ network });
  useEffect(() => {
    loadData({ network });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  return (
    <Box>
      <Title title="Total Streams" viewAll="/streams" />
      {data.slice(0, 10).map((item) => {
        return (
          <ListCard
            key={item.streamId}
            streamId={item.streamId}
            did={item.did}
            indexingTime={item.indexingTime}
          />
        );
      })}
    </Box>
  );
}

function ListCard({
  streamId,
  did,
  indexingTime,
}: {
  streamId: string;
  did: string;
  indexingTime: number;
}) {
  return (
    <CardBox>
      <div>{shortPubKey(streamId, { len: 8, split: "-" })}</div>
      <div className="avatar">
        <Avatar
          dangerouslySetInnerHTML={{
            __html: multiavatar(did),
          }}
        />
        {shortPubKey(did, { len: 10, split: "-" })}
      </div>
      <div>
        <time>{dayjs(indexingTime).fromNow()}</time>
      </div>
    </CardBox>
  );
}

const Avatar = styled.div`
  width: 40px;
  height: 40px;
`;

const CardBox = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr 100px;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;
  border-bottom: 1px solid rgba(57, 66, 76, 0.5);
  &:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }

  .avatar {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  time {
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;

    color: #718096;
  }
`;

const Box = styled.div``;
