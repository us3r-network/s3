import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'
import InfiniteScroll from 'react-infinite-scroll-component'
import { TableBox } from '../components/TableBox'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  useAuthentication,
  useSession,
} from '@us3r-network/auth-with-rainbowkit'
import { getModelStreamList, getStarModels, PageSize } from '../api'
import { ModelStream, Network } from '../types'
import { shortPubKey } from '../utils/shortPubKey'
import dayjs from 'dayjs'
import Search from '../components/Search'
import Star from '../components/icons/Star'
import StarEmpty from '../components/icons/StarEmpty'
import { useCeramicCtx } from '../context/CeramicCtx'
import { debounce } from 'lodash'

export default function ModelsPage() {
  const [searchParams] = useSearchParams()
  const { signIn } = useAuthentication()
  const {
    network,
    fetchPersonalCollections,
    personalCollections,
    personalCollectionsWithoutFilter,
  } = useCeramicCtx()
  const session = useSession()
  const sessId = session?.id
  const [models, setModels] = useState<Array<ModelStream>>([])
  const [starModels, setStarModels] = useState<Array<ModelStream>>([])
  const navigate = useNavigate()
  const searchText = useRef(searchParams.get('searchText') || '')
  const [hasMore, setHasMore] = useState(true)
  const pageNum = useRef(1)
  const [filterStar, setFilterStar] = useState(false)

  const fetchStarModels = useCallback(async () => {
    const ids = personalCollections.map((item) => {
      return item.modelId
    })

    const resp = await getStarModels({ network, ids })

    const list = resp.data.data
    setHasMore(false)
    setStarModels([...list])
  }, [personalCollections, network])

  const fetchModelWithDebounce = async (network: Network) => {
    setModels([])
    setHasMore(true)
    setFilterStar(false)
    const resp = await getModelStreamList({
      name: searchText.current,
      network,
    })
    const list = resp.data.data
    setModels(list)
    setHasMore(list.length >= PageSize)
    pageNum.current = 1
  }

  const fetchModel = useCallback(debounce(fetchModelWithDebounce, 200), [
    network,
  ])

  const fetchMoreModel = useCallback(
    async (pageNumber: number) => {
      const resp = await getModelStreamList({
        pageNumber,
        name: searchText.current,
        network,
      })
      const list = resp.data.data
      setHasMore(list.length >= PageSize)
      setModels([...models, ...list])
    },
    [models, network]
  )

  const navToStream = useCallback(
    (streamId: string) => {
      navigate(`/streams/stream/${streamId}`)
    },
    [navigate]
  )

  useEffect(() => {
    fetchModel(network)
  }, [network, fetchModel])

  useEffect(() => {
    fetchPersonalCollections()
  }, [fetchPersonalCollections])

  const lists = useMemo(() => {
    if (!filterStar) return models
    return starModels
  }, [filterStar, models, starModels])

  return (
    <PageBox isMobile={isMobile}>
      <div className={isMobile ? 'title-box mobile-models-box' : 'title-box'}>
        {!isMobile && <div className="title">ComposeDB Models</div>}

        <div className="tools">
          {!isMobile && (
            <>
              <Search
                text={searchText.current}
                searchAction={(text) => {
                  searchText.current = text
                  setModels([])
                  fetchModel(network)
                }}
                placeholder={'Search by model name'}
              />
              <button
                className="star-btn"
                onClick={() => {
                  if (!sessId) {
                    signIn()
                    return
                  }
                  setFilterStar(!filterStar)
                  setHasMore(filterStar)
                  if (!filterStar) {
                    fetchStarModels()
                  }
                }}
              >
                {filterStar ? <Star /> : <StarEmpty />}
              </button>
              <button
                onClick={() => {
                  navigate('/models/model/create')
                }}
              >
                + New Model
              </button>
            </>
          )}
        </div>
      </div>
      <InfiniteScroll
        dataLength={lists.length}
        next={() => {
          pageNum.current += 1
          fetchMoreModel(pageNum.current)
          console.log('fetch more')
        }}
        hasMore={filterStar ? false : hasMore}
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
                <th>7 Days Usage</th>
                <th>Release Date</th>
                <th>Dapps</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lists.map((item, idx) => {
                const dapps = item.dapps || []
                const hasStarItem = personalCollectionsWithoutFilter.find(
                  (starItem) => starItem.modelId === item.stream_id
                )
                return (
                  <tr key={item.stream_id + idx}>
                    <td>
                      {!isMobile ? (
                        <Link
                          to={`/models/modelview/${item.stream_id}?network=${network}`}
                        >
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
                      {(!item.isIndexed && (
                        <div
                          className="usage-count"
                          title={`from ${dayjs(item.created_at).format(
                            'YYYY-MM-DD'
                          )}`}
                        >
                          {item.useCount}
                        </div>
                      )) || (
                        <div
                          title={
                            item.firstRecordTime
                              ? `from ${dayjs(item.firstRecordTime).format(
                                  'YYYY-MM-DD'
                                )}`
                              : ''
                          }
                        >
                          <Link
                            to={`/models/model/${item.stream_id}/mids?network=${network}`}
                          >
                            {item.useCount}
                          </Link>
                        </div>
                      )}
                    </td>
                    <td>{item.recentlyUseCount || '-'}</td>
                    <td>
                      <div className="release-date">
                        {(item.last_anchored_at &&
                          dayjs(item.created_at).format('YYYY-MM-DD')) ||
                          '-'}
                      </div>
                    </td>
                    <td>
                      <Dapps dapps={dapps} />
                    </td>
                    <td>
                      <ModelStarItem
                        stream_id={item.stream_id}
                        hasStarItem={hasStarItem}
                        fetchPersonal={fetchPersonalCollections}
                        signIn={signIn}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </TableContainer>
        </TableBox>
      </InfiniteScroll>
      {!filterStar && !hasMore && <Loading>no more data</Loading>}
    </PageBox>
  )
}

function Dapps({
  dapps,
}: {
  dapps: Array<{ name: string; description: string; icon: string }>
}) {
  const apps = useMemo(() => {
    const data = [...dapps]
    if (data.length > 3)
      return { data: data.slice(0, 3), left: data.length - 3 }
    return { data, left: 0 }
  }, [dapps])

  return (
    <DappBox className="cc">
      {apps.data.length > 0
        ? apps.data.map((item, idx) => {
            return (
              <ImgOrName key={item.name} name={item.name} imgUrl={item.icon} />
            )
          })
        : 'None'}
      {apps.left > 0 && <span className="left">{apps.left}+</span>}
    </DappBox>
  )
}

function ImgOrName({ imgUrl, name }: { imgUrl: string; name: string }) {
  const [showName, setShowName] = useState(true)
  if (showName) {
    return (
      <>
        <span title={name} className="name">
          {name.slice(0, 1).toUpperCase()}
        </span>
        <img
          style={{ display: 'none' }}
          src={imgUrl}
          alt=""
          onLoad={() => {
            setShowName(false)
          }}
          onError={() => {
            setShowName(true)
          }}
        />
      </>
    )
  }
  return (
    <span title={name}>
      <img src={imgUrl} alt="" />
    </span>
  )
}

const DappBox = styled.div`
  display: flex;
  gap: 5px;
  overflow: hidden;
  color: #fff;
  font-family: Rubik;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
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
      border-radius: 50%;
    }
  }
`

function ModelStarItem({
  signIn,
  hasStarItem,
  fetchPersonal,
  stream_id,
}: {
  stream_id: string
  signIn: () => void
  hasStarItem:
    | {
        modelId: string
        id: string
        revoke: boolean
      }
    | undefined
  fetchPersonal: () => void
}) {
  const session = useSession()
  const { s3ModelCollection } = useCeramicCtx()
  const [staring, setStaring] = useState(false)

  const sessId = session?.id

  const starModelAction = useCallback(
    async (modelId: string, id?: string, revoke?: boolean) => {
      if (staring) return
      try {
        if (!session) return
        s3ModelCollection.authComposeClient(session)
        setStaring(true)
        if (id) {
          await s3ModelCollection.updateCollection(id, {
            revoke: !revoke,
          })
        } else {
          await s3ModelCollection.createCollection({
            modelID: modelId,
            revoke: false,
          })
        }
        await fetchPersonal()
      } catch (error) {
        console.error(error)
      } finally {
        setStaring(false)
      }
    },
    [session, s3ModelCollection, fetchPersonal, staring]
  )
  if (staring) {
    return (
      <div className="staring">
        <img src="/loading.gif" title="loading" alt="" />{' '}
      </div>
    )
  }
  return (
    <div
      className={'star'}
      onClick={async () => {
        if (!sessId) {
          signIn()
          return
        }

        await starModelAction(stream_id, hasStarItem?.id, !!hasStarItem?.revoke)
      }}
    >
      {hasStarItem && hasStarItem.revoke === false ? <Star /> : <StarEmpty />}
    </div>
  )
}

const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: gray;
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

    width: calc((100% - 70px) / 7) !important;
    overflow: hidden;
    ${({ isMobile }) => (isMobile ? `padding: 0 20px !important;` : '')};

    &:first-child {
      padding-left: 20px;
    }

    &:last-child {
      padding-left: 20px;
      padding-right: 0px;
      width: 70px !important;
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

  .star,
  .staring {
    > img {
      width: 23px;
    }
  }
  .star {
    cursor: pointer;
  }
  .staring {
    cursor: not-allowed;
  }
`
