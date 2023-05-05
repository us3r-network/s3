import { useEffect, useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import multiavatar from "@multiavatar/multiavatar";

import { Network } from "../types";
import ListTable from "../components/ListTable";
import useListData from "../hooks/useListData";
import { shortPubKeyHash } from "../utils/shortPubKey";
import { useCeramicCtx } from "../context/CeramicCtx";

export default function Profile() {
  const { did } = useParams();
  const { network } = useCeramicCtx();
  const { pageNum, data, hasMore, loadData, fetchMoreData } = useListData({
    network: network as Network,
    did,
  });

  useEffect(() => {
    if (!network || !did) return;
    loadData({ network: network as Network, did });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, did]);

  const pubkey = useMemo(() => {
    if (!did) return "";
    return did;
  }, [did]);

  return (
    <div>
      <Title>
        <div
          className="avatar"
          dangerouslySetInnerHTML={{
            __html: multiavatar(pubkey),
          }}
        />
        <div>
          <h3>{shortPubKeyHash(pubkey)}</h3>
        </div>
      </Title>
      <InfiniteScroll
        dataLength={data.length}
        next={() => {
          pageNum.current += 1;
          fetchMoreData(pageNum.current);
        }}
        hasMore={hasMore}
        loader={<Loading>Loading...</Loading>}
      >
        <ListTable data={data} />
      </InfiniteScroll>
      {!hasMore && <Loading>no more data</Loading>}
    </div>
  );
}

const Title = styled.div`
  z-index: 100;
  background-color: #14171a;
  padding: 20px 0;
  top: 0;
  display: flex;
  align-items: center;
  gap: 10px;

  & .avatar {
    width: 60px;
    height: 60px;
  }

  > h2 {
    margin: 0;
  }
`;

const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: gray;
`;
