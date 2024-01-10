import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import InfiniteScroll from 'react-infinite-scroll-component'

import { CeramicStatus, ClientDApp, ModelStream } from '../types.d'
import { PageSize } from '../api'
import { updateDapp } from '../api/dapp'
import {
  getModelStreamList,
  getStarModels,
  startIndexModel
} from '../api/model'
import { TableBox, TableContainer } from '../components/TableBox'
import dayjs from 'dayjs'
import { shortPubKey } from '../utils/shortPubKey'
import Search from '../components/Search'
import useSelectedDapp from '../hooks/useSelectedDapp'
import { PersonalCollection, useAppCtx } from '../context/AppCtx'
import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { Network } from '../components/Selector/EnumSelect'
import StarIcon from '../components/Icons/StarIcon'
import StarGoldIcon from '../components/Icons/StarGoldIcon'
import { S3_SCAN_URL } from '../constants'
import CheckCircleIcon from '../components/Icons/CheckCircleIcon'
import PlusCircleIcon from '../components/Icons/PlusCircleIcon'
import { useCeramicNodeCtx } from '../context/CeramicNodeCtx'
import {
  Button,
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay
} from 'react-aria-components'
import NoCeramicNodeModal from '../components/NoCeramicNodeModal'
import { ImgOrName } from '../components/ImgOrName'

export default function ExploreModel () {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams()
  const { s3ModelCollection, selectedDapp } = useSelectedDapp()
  const { currCeramicNode } = useCeramicNodeCtx()
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
        first: 500
      })
      if (personal.errors) throw new Error(personal.errors[0].message)
      const collected = personal.data?.viewer.modelCollectionList

      if (collected) {
        setPersonalCollections(
          collected?.edges
            .filter(item => item.node && item.node.revoke === false)
            .map(item => {
              return {
                modelId: item.node.modelID,
                id: item.node.id!,
                revoke: !!item.node.revoke
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
      .filter(item => item.revoke === false)
      .map(item => {
        return item.modelId
      })
    if (ids.length === 0) {
      setStarModels([])
      return
    }

    try {
      const resp = await getStarModels({
        network: (selectedDapp?.network as Network) || Network.TESTNET,
        ids
      })
      if (resp.data.code !== 0) {
        throw new Error(resp.data.msg)
      }

      const list = resp.data.data
      setStarModels([...list])
    } catch (error) {
      console.error(error)
    }
  }, [personalCollections, selectedDapp?.network])

  const fetchModel = useCallback(async () => {
    setModels([])
    setHasMore(true)
    const resp = await getModelStreamList({
      name: searchText.current,
      network: (selectedDapp?.network as Network) || Network.TESTNET
    })
    const list = resp.data.data
    setModels(list)
    setHasMore(list.length >= PageSize)
    pageNum.current = 1
  }, [selectedDapp?.network])

  const fetchMoreModel = useCallback(
    async (pageNumber: number) => {
      const resp = await getModelStreamList({
        pageNumber
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
    fetchStarModels().catch(err => {
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
        <div className='title'>ComposeDB Models</div>

        <div className='tools'>
          <Search
            text={searchText.current}
            searchAction={text => {
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
                <th>7 Days Usage</th>
                <th>Release Date</th>
                <th>Dapps</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {lists.map((item, idx) => {
                const hasStarItem = personalCollections.find(
                  starItem => starItem.modelId === item.stream_id
                )
                return (
                  <tr key={item.stream_id + idx}>
                    <td>
                      <div>
                        <a
                          href={`${S3_SCAN_URL}/models/modelview/${
                            item.stream_id
                          }?network=${selectedDapp?.network.toUpperCase()}`}
                          target='_blank'
                          rel='noreferrer'
                        >
                          {item.stream_content.name}
                        </a>
                      </div>
                    </td>
                    <td className='description'>
                      <div>{item.stream_content.description}</div>
                    </td>
                    <td>
                      <div>
                        <a
                          href={`${S3_SCAN_URL}/streams/stream/${
                            item.stream_id
                          }?network=${selectedDapp?.network.toUpperCase()}`}
                          target='_blank'
                          rel='noreferrer'
                        >
                          {shortPubKey(item.stream_id, { len: 8, split: '-' })}
                        </a>
                      </div>
                    </td>
                    <td>
                      <div
                        title={
                          item.isIndexed
                            ? item.firstRecordTime
                              ? `from ${dayjs(item.firstRecordTime).format(
                                  'YYYY-MM-DD'
                                )}`
                              : ''
                            : `from ${dayjs(item.created_at).format(
                                'YYYY-MM-DD'
                              )}`
                        }
                      >
                        <a
                          href={`${S3_SCAN_URL}/models/model/${
                            item.stream_id
                          }/mids?network=${selectedDapp?.network.toUpperCase()}`}
                          target='_blank'
                          rel='noreferrer'
                        >
                          {item.useCount}
                        </a>
                      </div>
                    </td>
                    <td>{item.recentlyUseCount || '-'}</td>
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
                      <Dapps dapps={item.dapps || []} />
                    </td>
                    <td>
                      {/* <OpsBtns modelId={item.stream_id} /> */}
                      <ModelStarItem
                        stream_id={item.stream_id}
                        hasIndexed={!!item.isIndexed}
                        hasStarItem={hasStarItem}
                        fetchPersonal={fetchPersonalCollections}
                        ceramicNodeId={
                          currCeramicNode &&
                          currCeramicNode.status === CeramicStatus.RUNNING
                            ? currCeramicNode?.id
                            : undefined
                        }
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

function Dapps ({ dapps }: { dapps: ClientDApp[] }) {
  const apps = useMemo(() => {
    const data = [...dapps]
    if (data.length > 3)
      return { data: data.slice(0, 3), left: data.length - 3 }
    return { data, left: 0 }
  }, [dapps])

  return (
    <DappBox className='cc'>
      {apps.data.length > 0
        ? apps.data.map((item, idx) => {
            return (
              <a
                target='_blank'
                href={`${S3_SCAN_URL}/dapps/${item.id}?network=${item.network}`}
                key={item.name}
                rel='noreferrer'
              >
                <ImgOrName name={item.name} imgUrl={item.icon} />
              </a>
            )
          })
        : 'None'}
      {apps.left > 0 && <span className='left'>{apps.left}+</span>}
    </DappBox>
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
  a {
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
`

function ModelStarItem ({
  hasStarItem,
  fetchPersonal,
  stream_id,
  hasIndexed,
  ceramicNodeId
}: {
  hasIndexed: boolean
  stream_id: string
  hasStarItem:
    | {
        modelId: string
        id: string
        revoke: boolean
      }
    | undefined
  fetchPersonal: () => void
  ceramicNodeId?: number
}) {
  const session = useSession()
  const { s3ModelCollection } = useSelectedDapp()
  const [staring, setStaring] = useState(false)

  const { loadDapps } = useAppCtx()
  const { selectedDapp } = useSelectedDapp()
  const [adding, setAdding] = useState(false)
  const addToModelList = useCallback(
    async (modelId: string) => {
      if (!session || !selectedDapp) return
      if (!ceramicNodeId) return
      if (!hasIndexed) {
        startIndexModel({
          modelId,
          network: selectedDapp.network as Network,
          didSession: session.serialize()
        }).catch(console.error)
      }
      try {
        setAdding(true)
        const models = selectedDapp.models || []
        models.push(modelId)
        await updateDapp(
          { ...selectedDapp, models },
          session.serialize(),
          ceramicNodeId
        )
        await loadDapps()
      } catch (err) {
        console.error(err)
      } finally {
        setAdding(false)
      }
    },
    [loadDapps, selectedDapp, session, setAdding, hasIndexed, ceramicNodeId]
  )

  const starModelAction = useCallback(
    async (modelId: string, id?: string, revoke?: boolean) => {
      if (staring) return
      try {
        if (!session) return
        s3ModelCollection.authComposeClient(session)
        setStaring(true)
        if (id) {
          const resp = await s3ModelCollection.updateCollection(id, {
            revoke: !revoke
          })
          if (resp.errors) {
            throw new Error(resp.errors[0].message)
          }
        } else {
          const resp = await s3ModelCollection.createCollection({
            modelID: modelId,
            revoke: false
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

  const modelId = stream_id

  return (
    <OpsBox className={''}>
      {(staring && (
        <button>
          <img src='/loading.gif' title='loading' alt='' />
        </button>
      )) || (
        <button
          onClick={async () => {
            await starModelAction(
              stream_id,
              hasStarItem?.id,
              !!hasStarItem?.revoke
            )
          }}
        >
          {hasStarItem && hasStarItem.revoke === false ? (
            <StarGoldIcon />
          ) : (
            <StarIcon />
          )}
        </button>
      )}

      {adding ? (
        <button>
          <img className='loading' src='/loading.gif' alt='loading' />
        </button>
      ) : (
        <>
          {selectedDapp?.models?.includes(modelId) ? (
            <button disabled>
              <CheckCircleIcon />
            </button>
          ) : ceramicNodeId ? (
            <button
              disabled={!ceramicNodeId}
              title={
                ceramicNodeId
                  ? 'Add this model to Dapp'
                  : 'There is no available node now, Deploy a private node first!'
              }
              onClick={() => {
                addToModelList(modelId)
              }}
            >
              <PlusCircleIcon />
            </button>
          ) : (
            <DialogTrigger>
              <Button>
                <PlusCircleIcon />
              </Button>
              <ModalOverlay>
                <Modal>
                  <Dialog>
                    {({ close }) => <NoCeramicNodeModal closeModal={close} />}
                  </Dialog>
                </Modal>
              </ModalOverlay>
            </DialogTrigger>
          )}
        </>
      )}
    </OpsBox>
  )
}

const OpsBox = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;

  img {
    width: 17px;
  }
`

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
