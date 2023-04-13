import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'
import InfiniteScroll from 'react-infinite-scroll-component'
import { TableBox } from '../components/TableBox'
import { Link, useNavigate } from 'react-router-dom'
import { getModelStreamList, PageSize } from '../api'
import { ModelStream, Network } from '../types'
import { shortPubKey } from '../utils/shortPubKey'
import dayjs from 'dayjs'
import Search from '../components/Search'

export default function ModelPage() {
  const [models, setModels] = useState<Array<ModelStream>>([])
  const navigate = useNavigate()
  const searchText = useRef('')
  const [hasMore, setHasMore] = useState(true)
  const pageNum = useRef(1)

  const fetchModel = useCallback(async () => {
    const resp = await getModelStreamList({ name: searchText.current })
    const list = resp.data.data
    setModels(list)
    setHasMore(list.length >= PageSize)
    pageNum.current = 1
  }, [])

  const fetchMoreModel = useCallback(
    async (pageNumber: number) => {
      const resp = await getModelStreamList({
        pageNumber,
        name: searchText.current,
      })
      const list = resp.data.data
      setHasMore(list.length >= PageSize)
      setModels([...models, ...list])
    },
    [models]
  )

  const navToStream = useCallback(
    (streamId: string) => {
      let network = Network.MAINNET
      try {
        const localNetwork =
          localStorage.getItem('network-select') || '"MAINNET"'
        network = JSON.parse(localNetwork)
      } catch (error) {
        console.error(error)
      }
      navigate(`/${network.toLowerCase()}/stream/${streamId}`)
    },
    [navigate]
  )

  useEffect(() => {
    fetchModel()
  }, [fetchModel])

  return (
    <PageBox isMobile={isMobile}>
      <div className={isMobile ? 'title-box mobile-models-box' : 'title-box'}>
        {!isMobile && <div className="title">ComposeDB Models</div>}

        <div className="tools">
          {!isMobile && (
            <>
              <Search
                searchAction={(text) => {
                  searchText.current = text
                  setModels([])
                  fetchModel()
                }}
                placeholder={'Search by model name'}
              />
              <button
                onClick={() => {
                  navigate('/model/create')
                }}
              >
                + New Model
              </button>
            </>
          )}
          {/* <button
            onClick={() => {
              if (sessId) {
                navigate(`/models/${sessId}`);
              } else {
                openLoginModal();
              }
            }}
          >
            My Models
          </button> */}
        </div>
      </div>
      <InfiniteScroll
        dataLength={models.length}
        next={() => {
          pageNum.current += 1
          fetchMoreModel(pageNum.current)
          console.log('fetch more')
        }}
        hasMore={hasMore}
        loader={<Loading>Loading...</Loading>}
      >
        <TableBox isMobile={isMobile}>
          <TableContainer isMobile={isMobile}>
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
                    <td>
                      {!isMobile ? (
                        <Link to={`/modelview/${item.stream_id}`}>
                          {item.stream_content.name}
                        </Link>
                      ) : (
                        item.stream_content.name
                      )}
                    </td>
                    <td>
                      <div className="description">
                        {item.stream_content.description}
                      </div>
                    </td>
                    <td>
                      <div
                        className="nav-stream"
                        onClick={() => {
                          navToStream(item.stream_id)
                        }}
                      >
                        {shortPubKey(item.stream_id, { len: 8, split: '-' })}
                      </div>
                    </td>
                    <td>
                      <div className="usage-count">{item.useCount}</div>
                    </td>
                    <td>
                      <div className="release-date">
                        {(item.last_anchored_at &&
                          dayjs(item.created_at).format(
                            'YYYY-MM-DD HH:mm:ss'
                          )) ||
                          '-'}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </TableContainer>
        </TableBox>
      </InfiniteScroll>
      {!hasMore && <Loading>no more data</Loading>}
    </PageBox>
  )
}

const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: gray;
`

const PageBox = styled.div<{isMobile: boolean}>`
  margin-bottom: 20px;
  ${({ isMobile }) => (isMobile ? `padding: 0 10px;` : '')};

  .no-more {
    padding: 20px;
    text-align: center;
    color: gray;
  }

  .mobile-models-box{
    margin-bottom: 20px;
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
    font-weight: 700;
    font-size: 24px;
    line-height: 28px;
    font-style: italic;

    color: #ffffff;
  }
`

const TableContainer = styled.table<{ isMobile: boolean }>`
  ${({ isMobile }) => (isMobile ? `` : 'width: 100%;')}
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
    ${({ isMobile }) => (isMobile ? `padding: 0 20px !important;` : '')};

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
    ${({ isMobile }) => (isMobile ? `padding: 0 20px !important;` : '')};

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

  .nav-stream {
    cursor: pointer;
  }
`
