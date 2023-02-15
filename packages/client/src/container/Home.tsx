import { useEffect } from 'react';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useNavigate } from 'react-router-dom';

import { Network } from '../types';
import ListTable from '../components/ListTable';
import Search from '../components/Search';
import NetworkSwitch from '../components/NetworkSwitch';
import useListData from '../hooks/useListData';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function Home() {
  const [network, setNetwork] = useLocalStorage(
    'network-select',
    Network.MAINNET
  );
  const navigate = useNavigate();
  const {
    pageNum,
    data,
    setData,
    hasMore,
    setHasMore,
    loadData,
    fetchMoreData,
  } = useListData({ network });

  useEffect(() => {
    loadData({ network });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  return (
    <PageBox>
      <FilterBox>
        <Search
          searchAction={(text) => {
            if (text.startsWith('did')) {
              navigate(`/${network.toLowerCase()}/profile/${text}`);
            } else if (text.length < 62) {
              navigate(`/${network.toLowerCase()}/family/${text}`);
            } else {
              navigate(`/${network.toLowerCase()}/stream/${text}`);
            }
          }}
        />
        <NetworkSwitch
          network={network}
          networks={Object.values(Network)}
          networkChangeAction={(n) => {
            window.scrollTo({ top: 0 });
            setHasMore(true);
            setData([]);
            setNetwork(n as Network);
          }}
        />
      </FilterBox>
      <InfiniteScroll
        dataLength={data.length}
        next={() => {
          pageNum.current += 1;
          fetchMoreData(pageNum.current);
        }}
        hasMore={hasMore}
        loader={<Loading>Loading...</Loading>}
      >
        <ListTable data={data} network={network.toLowerCase()} showDid />
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
`;

const FilterBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 20px;
  padding: 20px 0;
  position: sticky;
  background-color: #14171a;
  top: 0;
  z-index: 100;
`;
