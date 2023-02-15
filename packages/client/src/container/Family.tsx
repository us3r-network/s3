import { useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { Network } from '../types';
import ListTable from '../components/ListTable';
import useListData from '../hooks/useListData';
import BackBtn from '../components/BackBtn';

export default function Family() {
  const { network, familyOrApp } = useParams();
  const navigate = useNavigate();
  const { pageNum, data, hasMore, loadData, fetchMoreData } = useListData({
    network: network as Network,
    familyOrApp,
  });

  useEffect(() => {
    if (!network || !familyOrApp) return;
    loadData({ network: network as Network, familyOrApp });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, familyOrApp]);

  return (
    <div>
      <Title>
        <div>
          <BackBtn
            backAction={() => {
              navigate(-1);
            }}
          />
        </div>
        <h3>
          Activity for the family: <span>{familyOrApp}</span> on{' '}
          <span>{network}</span>
        </h3>
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
        <ListTable data={data} network={network?.toLowerCase()} showDid />
      </InfiniteScroll>
      {!hasMore && <Loading>no more data</Loading>}
    </div>
  );
}

const Title = styled.div`
  position: sticky;
  background-color: #14171a;
  padding: 20px 0;
  top: 0;
  height: 80px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 100;

  > h3 {
    margin: 0;
    font-weight: 500;
    > span {
      text-transform: capitalize;
      border: 1px solid #6c8fc1;
      border-radius: 10px;
      padding: 2px 5px;
      color: #6c8fc1;
    }
  }
`;

const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: gray;
`;
