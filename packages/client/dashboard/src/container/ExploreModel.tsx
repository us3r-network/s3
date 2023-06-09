import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import InfiniteScroll from 'react-infinite-scroll-component'

import { ModelStream } from '../types'
import { PageSize, getModelStreamList, getStarModels } from '../api'
import { TableBox, TableContainer } from '../components/TableBox'
import dayjs from 'dayjs'
import { shortPubKey } from '../utils/shortPubKey'
import Search from '../components/Search'
import useSelectedDapp from '../hooks/useSelectedDapp'
import { PersonalCollection } from '../context/AppCtx'
import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { Network } from '../components/Selector/EnumSelect'
import StarIcon from '../components/Icons/StarIcon'
import StarGoldIcon from '../components/Icons/StarGoldIcon'

export default function ExploreModel() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams()
  const { s3ModelCollection, selectedDapp } = useSelectedDapp()
  const session = useSession()
  const [models, setModels] = useState<Array<ModelStream>>([])
  const [starModels, setStarModels] = useState<Array<ModelStream>>([])
  const [hasMore, setHasMore] = useState(true)
  const searchText = useRef('')
  const pageNum = useRef(1)

  const [personalCollections, setPersonalCollections] = useState<
    PersonalCollection[]
  >([])

  const fetchPersonalCollections = useCallback(async () => {
    if (!session) return
    s3ModelCollection.authComposeClient(session)
    try {
      const personal = await s3ModelCollection.queryPersonalCollections({
        first: 500,
      })
      if (personal.errors) throw new Error(personal.errors[0].message)
      const collected = personal.data?.viewer.modelCollectionList

      if (collected) {
        setPersonalCollections(
          collected?.edges
            .filter((item) => item.node && item.node.revoke === false)
            .map((item) => {
              return {
                modelId: item.node.modelID,
                id: item.node.id!,
                revoke: !!item.node.revoke,
              }
            })
        )
      }
    } catch (error) {
      console.error('error -----', error)
    }
  }, [s3ModelCollection, session])

  const fetchStarModels = useCallback(async () => {
    const ids = personalCollections
      .filter((item) => item.revoke === false)
      .map((item) => {
        return item.modelId
      })
    if (ids.length === 0) {
      setStarModels([])
      return
    }

    const resp = await getStarModels({
      network: (selectedDapp?.network as Network) || Network.TESTNET,
      ids,
    })
    if (resp.data.code !== 0) {
      throw new Error(resp.data.msg)
    }

    const list = resp.data.data
    setStarModels([...list])
  }, [personalCollections, selectedDapp?.network])

  const fetchModel = useCallback(async () => {
    setModels([])
    setHasMore(true)
    const resp = await getModelStreamList({
      name: searchText.current,
      network: (selectedDapp?.network as Network) || Network.TESTNET,
    })
    const list = resp.data.data
    setModels(list)
    setHasMore(list.length >= PageSize)
    pageNum.current = 1
  }, [selectedDapp?.network])

  const fetchMoreModel = useCallback(
    async (pageNumber: number) => {
      const resp = await getModelStreamList({
        pageNumber,
      })
      const list = resp.data.data
      setHasMore(list.length >= PageSize)
      setModels([...models, ...list])
    },
    [models]
  )

  useEffect(() => {
    fetchModel()
    fetchPersonalCollections()
  }, [fetchModel, fetchPersonalCollections])

  useEffect(() => {
    fetchStarModels().catch((err) => {
      setStarModels([])
      console.error(err)
    })
  }, [fetchStarModels])

  const filterStar = useMemo(() => {
    return searchParams.get('filterStar') || ''
  }, [searchParams])

  const lists = useMemo(() => {
    if (!filterStar) return models
    return starModels
  }, [filterStar, models, starModels])

  return (
    <ExploreModelContainer>
      <div className={'title-box'}>
        <div className="title">ComposeDB Models</div>

        <div className="tools">
          <Search
            text={searchText.current}
            searchAction={(text) => {
              searchText.current = text
              setModels([])
              fetchModel()
            }}
            placeholder={'Search by model name'}
          />
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
        <TableBox>
          <TableContainer>
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
                      <div>{item.stream_content.name}</div>
                    </td>
                    <td className="description">
                      <div>{item.stream_content.description}</div>
                    </td>
                    <td>
                      <div>
                        {shortPubKey(item.stream_id, { len: 8, split: '-' })}
                      </div>
                    </td>
                    <td>
                      <div>{item.useCount}</div>
                    </td>
                    <td>
                      <div>
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
                        fetchPersonal={fetchPersonalCollections}
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
    </ExploreModelContainer>
  )
}

function ModelStarItem({
  hasStarItem,
  fetchPersonal,
  stream_id,
}: {
  stream_id: string
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
  const { s3ModelCollection } = useSelectedDapp()
  const [staring, setStaring] = useState(false)

  const starModelAction = useCallback(
    async (modelId: string, id?: string, revoke?: boolean) => {
      if (staring) return
      try {
        if (!session) return
        s3ModelCollection.authComposeClient(session)
        setStaring(true)
        if (id) {
          const resp = await s3ModelCollection.updateCollection(id, {
            revoke: !revoke,
          })
          if (resp.errors) {
            throw new Error(resp.errors[0].message)
          }
        } else {
          const resp = await s3ModelCollection.createCollection({
            modelID: modelId,
            revoke: false,
          })
          if (resp.errors) {
            throw new Error(resp.errors[0].message)
          }
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
        await starModelAction(stream_id, hasStarItem?.id, !!hasStarItem?.revoke)
      }}
    >
      {hasStarItem && hasStarItem.revoke === false ? (
        <StarGoldIcon />
      ) : (
        <StarIcon />
      )}
    </div>
  )
}

const ExploreModelContainer = styled.div`
  margin-top: 25px;
  margin-bottom: 25px;
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
    margin-bottom: 20px;
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

    /* padding: 0 0 20px 0; */
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

  .react-aria-Button {
    font-size: 18px;
  }
`

const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: gray;
`
