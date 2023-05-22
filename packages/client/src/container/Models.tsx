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
import { ModelStream } from '../types'
import { shortPubKey } from '../utils/shortPubKey'
import dayjs from 'dayjs'
import Search from '../components/Search'
import Star from '../components/icons/Star'
import StarEmpty from '../components/icons/StarEmpty'
import getCurrNetwork from '../utils/getCurrNetwork'
import { useCeramicCtx } from '../context/CeramicCtx'

export default function ModelsPage() {
  const [searchParams] = useSearchParams()
  const { signIn } = useAuthentication()
  const { network } = useCeramicCtx()
  const session = useSession()
  const sessId = session?.id
  const [models, setModels] = useState<Array<ModelStream>>([])
  const [starModels, setStarModels] = useState<Array<ModelStream>>([])
  const navigate = useNavigate()
  const searchText = useRef(searchParams.get('searchText') || '')
  const [hasMore, setHasMore] = useState(true)
  const pageNum = useRef(1)
  const [filterStar, setFilterStar] = useState(false)
  const [personalCollections, setPersonalCollections] = useState<
    { modelId: string; id: string; revoke: boolean }[]
  >([])
  const { s3ModelCollection } = useCeramicCtx()

  const fetchStarModels = useCallback(async () => {
    const ids = personalCollections.map((item) => {
      return item.modelId
    })

    const resp = await getStarModels({ network, ids })

    const list = resp.data.data
    setHasMore(false)
    setStarModels([...list])
  }, [personalCollections, network])

  const fetchPersonal = useCallback(async () => {
    if (!session) return
    s3ModelCollection.authComposeClient(session)
    const personal = await s3ModelCollection.queryPersonalCollections({
      first: 500,
    })
    const collected = personal.data?.viewer.modelCollectionList

    if (collected) {
      setPersonalCollections(
        collected?.edges
          .filter((item) => item.node.revoke !== true)
          .map((item) => {
            return {
              modelId: item.node.modelID,
              id: item.node.id!,
              revoke: !!item.node.revoke,
            }
          })
      )
    }
  }, [s3ModelCollection, session])

  const starModelAction = useCallback(
    async (modelId: string, id?: string, revoke?: boolean) => {
      if (!session) return
      s3ModelCollection.authComposeClient(session)

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
    },
    [session, s3ModelCollection, fetchPersonal]
  )

  const fetchModel = useCallback(async () => {
    setModels([])
    setHasMore(true)
    const resp = await getModelStreamList({
      name: searchText.current,
      network,
    })
    const list = resp.data.data
    setModels(list)
    setHasMore(list.length >= PageSize)
    pageNum.current = 1
  }, [network])

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
    if (!session) {
      setPersonalCollections([])
    }
  }, [session])

  useEffect(() => {
    fetchModel()
    fetchPersonal()
  }, [fetchModel, fetchPersonal])

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
                  fetchModel()
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
                <th>Release Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lists.map((item, idx) => {
                const hasStarItem = personalCollections.find(
                  (starItem) => starItem.modelId === item.stream_id
                )
                return (
                  <tr key={item.stream_id + idx}>
                    <td>
                      {!isMobile ? (
                        <>
                          {(item.isIndexed && (
                            <Link to={`/models/modelview/${item.stream_id}`}>
                              {item.stream_content.name}
                            </Link>
                          )) || (
                            <div className="usage-count">
                              {item.stream_content.name}
                            </div>
                          )}
                        </>
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
                        <div className="usage-count">{item.useCount}</div>
                      )) || (
                        <div>
                          <Link to={`/models/model/${item.stream_id}/mids`}>
                            {item.useCount}
                          </Link>
                        </div>
                      )}
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
                    <td>
                      <ModelStarItem
                        stream_id={item.stream_id}
                        hasStarItem={hasStarItem}
                        fetchPersonal={fetchPersonal}
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
      } catch (error) {
      } finally {
        setStaring(false)
      }

      await fetchPersonal()
    },
    [session, s3ModelCollection, fetchPersonal]
  )
  if (staring) {
    return (
      <div className="star">
        <img src="/loading.gif" title="loading" alt="" />{' '}
      </div>
    )
  }
  return (
    <div
      className="star"
      onClick={() => {
        if (!sessId) {
          signIn()
          return
        }

        starModelAction(stream_id, hasStarItem?.id, !!hasStarItem?.revoke)
      }}
    >
      {hasStarItem ? <Star /> : <StarEmpty />}
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

  .star {
    cursor: pointer;

    > img {
      width: 23px;
    }
  }
`
