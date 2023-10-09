import { Link, useOutletContext } from 'react-router-dom'
import styled from 'styled-components'

import { isMobile } from 'react-device-detect'
import Search from '../components/Search'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useCeramicCtx } from '../context/CeramicCtx'
import { ImgOrName } from '../components/ImgOrName'
import { Dapp } from '../types'
import { shortPubKey } from '../utils/shortPubKey'

export default function DappsList() {
  const { dapps, loadMoreDapps, hasMore, searchText, setSearchText } =
    useOutletContext<{
      dapps: Dapp[]
      hasMore: boolean
      loadMoreDapps: () => void
      searchText: string
      setSearchText: React.Dispatch<React.SetStateAction<string>>
    }>()
  const { network } = useCeramicCtx()

  return (
    <PageBox isMobile={isMobile}>
      <div className={isMobile ? 'title-box mobile-models-box' : 'title-box'}>
        <div className="title">Dapps</div>
        <div className="tools">
          <Search
            text={searchText}
            searchAction={(text) => {
              setSearchText(text)
            }}
            placeholder={'Search by Dapp name'}
          />
        </div>
      </div>
      <InfiniteScroll
        dataLength={dapps.length}
        next={() => {
          loadMoreDapps()
        }}
        hasMore={hasMore}
        loader={<Loading>Loading...</Loading>}
      >
        <TableBox isMobile={isMobile}>
          <TableContainer isMobile={isMobile}>
            <thead>
              <tr>
                <th>Dapp Name</th>
                <th>Description</th>
                <th>Model/Schema</th>
              </tr>
            </thead>
            <tbody>
              {dapps.map((item) => {
                return (
                  <tr key={item.id}>
                    <td>
                      <Link to={`/dapps/${item.id}?network=${network}`}>
                        <div className="name">
                          <ImgOrName imgUrl={item.icon} name={item.name} />
                          {item.name}
                        </div>
                      </Link>
                    </td>
                    <td>
                      <div className="desc"> {item.description || '-'}</div>
                    </td>
                    <td>
                      <div className="model">
                        {item.modelDetails.length > 0 &&
                          item.modelDetails.map((item, idx) => {
                            return (
                              <span key={idx}>
                                <Link
                                  to={`/models/modelview/${item.stream_id}?network=${network}`}
                                >
                                  {item.stream_content.name}
                                </Link>
                              </span>
                            )
                          })}
                        {item.schemaDetails.length > 0 &&
                          item.schemaDetails.map((item, idx) => {
                            return (
                              <span>
                                <Link
                                  to={`/streams/stream/${item.streamId}?network=${network}`}
                                >
                                  {item.content.title}
                                </Link>
                              </span>
                            )
                          })}
                        {item.modelDetails.length === 0 &&
                          item.schemas.length === 0 &&
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
    </PageBox>
  )
}

const TableContainer = styled.table<{ isMobile: boolean }>`
  ${({ isMobile }) => (isMobile ? `` : 'width: 100%;')}
  border-collapse: collapse;

  tbody tr,
  thead tr {
    font-size: 15px;
    /* text-align: center; */
    height: 60px;
  }

  thead tr,
  tbody tr {
    > :nth-child(1) {
      width: 200px;
    }
    > :nth-child(2) {
      width: 500px;
    }
    > :nth-child(3) {
      width: calc(100% - 650px);
      max-width: 600px;
      overflow: hidden;
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

  .name {
    display: flex;
    gap: 10px;
    align-items: center;
    > span {
      color: #fff;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid #718096;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      &.name {
        font-size: 20px;
        font-weight: 500;
      }
      &.left {
        border: none;
        color: #fff;
        justify-content: start;
        font-family: Rubik;
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
      }
      > img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        flex-shrink: 0;
      }
    }
  }

  .desc {
    width: 420px;
    text-overflow: ellipsis;
    overflow: hidden;
    padding-right: 5px;
    white-space: nowrap;
  }

  .model {
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 550px;
    text-overflow: ellipsis;
    overflow: scroll;
    padding-right: 5px;
    white-space: nowrap;
  }
`

export const TableBox = styled.div<{ isMobile?: boolean }>`
  border-radius: 20px;
  border: 1px solid #39424c;
  background: #1b1e23;

  ${({ isMobile }) => (isMobile ? `display: inline-block;` : '')}
`

const PageBox = styled.div<{ isMobile: boolean }>`
  margin-bottom: 20px;
  ${({ isMobile }) => (isMobile ? `padding: 0 10px;` : '')};

  .no-more {
    padding: 20px;
    text-align: center;
    color: gray;
  }

  .mobile-models-box {
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

        &.star-btn {
          width: 52px;
          height: 40px;

          background: #1a1e23;
          border: 1px solid #39424c;
          border-radius: 100px;
          display: inline-flex;
          align-items: center;
          justify-items: center;
        }
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

  a {
    word-break: break-word;
  }
`

const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: gray;
`
