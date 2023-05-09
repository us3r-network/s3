import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate } from "react-router-dom";
import { isMobile } from "react-device-detect";

import ListTable from "../components/ListTable";
import Search from "../components/Search";
import useListData from "../hooks/useListData";
import SelectIcon from "../components/icons/Select";
import FeedsFilterBox from "../components/FeedsFilterBox";
import { getStreamTopics } from "../api";
import Filter from "../components/Filter";
import { useCeramicCtx } from "../context/CeramicCtx";

export default function Streams() {
  const { network } = useCeramicCtx();
  const navigate = useNavigate();
  const { pageNum, data, hasMore, loadData, fetchMoreData } = useListData({
    network,
  });
  const [showSelect, setShowSelect] = useState(false);
  const [domains, setDomains] = useState<Array<{ name: string; num: number }>>(
    []
  );
  const [families, setFamilies] = useState<
    Array<{ name: string; num: number }>
  >([]);
  const filterRef = useRef<{
    domains: string[];
    families: string[];
    types: string[];
  }>({
    domains: [],
    families: [],
    types: [],
  });

  const loadTopics = useCallback(async () => {
    const resp = await getStreamTopics(network);
    setDomains(resp.data.data.domains);
    setFamilies(resp.data.data.familys);
  }, [network]);

  useEffect(() => {
    loadData({ network });
    loadTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  return (
    <PageBox isMobile={isMobile}>
      <FilterBox>
        {!isMobile && <div className="title">Streams</div>}
        <div className={isMobile ? "mobileBox" : ""}>
          {!isMobile && (
            <>
              <SelectBox
                isActive={showSelect}
                onClick={() => {
                  setShowSelect(!showSelect);
                }}
              >
                <SelectIcon />
              </SelectBox>
              <Search
                text=""
                searchAction={(text) => {
                  if (text.startsWith("did")) {
                    navigate(`/streams/profile/${text}`);
                  } else if (text.length < 62) {
                    navigate(`/streams/family/${text}`);
                  } else {
                    navigate(`/streams/stream/${text}`);
                  }
                }}
              />
            </>
          )}
        </div>
      </FilterBox>
      <FeedsFilterBox open={showSelect}>
        <Filter
          domains={domains}
          families={families}
          filterAction={(data) => {
            filterRef.current = data;
            loadData({
              network,
              familyOrApp: [...data.families, ...data.domains],
              types: data.types,
            });
          }}
        />
      </FeedsFilterBox>
      <InfiniteScroll
        dataLength={data.length}
        next={() => {
          pageNum.current += 1;
          fetchMoreData(pageNum.current, filterRef.current.types, [
            ...filterRef.current.domains,
            ...filterRef.current.families,
          ]);
        }}
        hasMore={hasMore}
        loader={<Loading>Loading...</Loading>}
      >
        <ListTable data={data} showDid />
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

const SelectBox = styled.div<{ isActive?: boolean }>`
  width: 52px;
  height: 40px;
  border-radius: 100px;
  padding: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #39424c;
  ${({ isActive }) =>
    isActive &&
    `
    background: #718096;
    transition: all 0.3s ease-out;
    path {
      stroke: #14171A;
      transition: all 0.3s ease-out;
    }
  `}
  &:not(:disabled):hover {
    ${({ isActive }) =>
      isActive &&
      `
        background: #718096;
      `}
  }
`;


const PageBox = styled.div<{ isMobile: boolean }>`
  margin-bottom: 20px;
  .no-more {
    padding: 20px;
    text-align: center;
    color: gray;
  }
  padding: ${({ isMobile }) => (isMobile ? "0 10px" : "0")};
`;

const FilterBox = styled.div`
  position: sticky;
  top: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 0;
  background-color: #14171a;
  z-index: 100;
  > div {
    display: flex;
    gap: 20px;
  }

  .title {
    font-weight: 700;
    font-weight: 700;
    font-size: 24px;
    line-height: 28px;
    font-style: italic;
  }

  .mobileBox {
    /* flex-direction: column; */
    flex-grow: 1;
    button {
      flex-grow: 1;
    }
    > div {
      flex-grow: 1;
    }
  }
`;
