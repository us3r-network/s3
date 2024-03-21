import { useSession } from '@us3r-network/auth-with-rainbowkit'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Button,
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay
} from 'react-aria-components'
import InfiniteScroll from 'react-infinite-scroll-component'
import styled from 'styled-components'
import { updateDapp } from '../../api/dapp'
import {
  CERAMIC_MAINNET_HOST,
  CERAMIC_TESTNET_HOST,
  PAGE_SIZE
} from '../../constants'
import { getModelStreamList, getModelsInfoByIds } from '../../api/model'
import { ImgOrName } from '../common/ImgOrName'
import { TableBox, TableContainer } from '../common/TableBox'
import CheckCircleIcon from '../icons/CheckCircleIcon'
import PlusCircleIcon from '../icons/PlusCircleIcon'
import StarGoldIcon from '../icons/StarGoldIcon'
import StarIcon from '../icons/StarIcon'
import NoCeramicNodeModal from '../node/NoCeramicNodeModal'
import { S3_SCAN_URL } from '../../constants'
import { PersonalCollection, useAppCtx } from '../../context/AppCtx'
import { useCeramicNodeCtx } from '../../context/CeramicNodeCtx'
import useSelectedDapp from '../../hooks/useSelectedDapp'
import { ClientDApp, ModelStream, Network } from '../../types.d'
import { shortPubKey } from '../../utils/shortPubKey'
import { S3ModelCollectionModel } from '@us3r-network/data-model'
import { startIndexModelsFromBrowser } from '../../utils/composeDBUtils'

export default function ModelList ({
  searchText,
  filterStar
}: {
  searchText?: string
  filterStar?: boolean
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { selectedDapp } = useSelectedDapp()
  const session = useSession()
  const [models, setModels] = useState<Array<ModelStream>>([])
  const [starModels, setStarModels] = useState<Array<ModelStream>>([])
  const [hasMore, setHasMore] = useState(true)
  const pageNum = useRef(1)
  const [personalCollections, setPersonalCollections] = useState<
    PersonalCollection[]
  >([])

  const s3ModelCollection = useMemo(() => {
    if (selectedDapp?.network === Network.MAINNET) {
      return new S3ModelCollectionModel(CERAMIC_MAINNET_HOST, 'mainnet')
    }
    return new S3ModelCollectionModel(CERAMIC_TESTNET_HOST, 'testnet')
  }, [selectedDapp])

  const fetchPersonalCollections = useCallback(async () => {
    if (!session || !s3ModelCollection) return
    try {
      s3ModelCollection.authComposeClient(session)
      const personal = await s3ModelCollection.queryPersonalCollections({
        first: 500
      })
      if (personal.errors) throw new Error(personal.errors[0].message)
      const collected = personal.data?.viewer?.modelCollectionList

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
      const resp = await getModelsInfoByIds({
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
      name: searchText || '',
      network: (selectedDapp?.network as Network) || Network.TESTNET
    })
    const list = resp.data.data
    setModels(list)
    setHasMore(list.length >= PAGE_SIZE)
    pageNum.current = 1
  }, [searchText, selectedDapp?.network])

  const fetchMoreModel = useCallback(
    async (pageNumber: number) => {
      const resp = await getModelStreamList({
        name: searchText || '',
        network: (selectedDapp?.network as Network) || Network.TESTNET,
        pageNumber
      })
      const list = resp.data.data
      setHasMore(list.length >= PAGE_SIZE)
      setModels([...models, ...list])
    },
    [models, searchText, selectedDapp?.network]
  )

  useEffect(() => {
    fetchModel()
  }, [fetchModel])

  useEffect(() => {
    fetchPersonalCollections()
  }, [fetchPersonalCollections])

  useEffect(() => {
    fetchStarModels().catch(err => {
      setStarModels([])
      console.error(err)
    })
  }, [fetchStarModels])

  const lists = useMemo(() => {
    if (!filterStar) return models
    return starModels
  }, [filterStar, models, starModels])

  return (
    <Box>
      <InfiniteScroll
        dataLength={lists.length}
        next={() => {
          pageNum.current += 1
          fetchMoreModel(pageNum.current)
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
                      <Actions
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
    </Box>
  )
}

export function Dapps ({ dapps }: { dapps: ClientDApp[] }) {
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

const Box = styled.div`
  height: 100%;
  overflow: auto;
  position: relative;
`

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

function Actions ({
  stream_id,
  hasStarItem,
  fetchPersonal,
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
  const { currCeramicNode } = useCeramicNodeCtx()
  const [staring, setStaring] = useState(false)

  const { loadDapps, loadCurrDapp } = useAppCtx()
  const { selectedDapp } = useSelectedDapp()
  const [adding, setAdding] = useState(false)

  const s3ModelCollection = useMemo(() => {
    if (selectedDapp?.network === Network.MAINNET) {
      return new S3ModelCollectionModel(CERAMIC_MAINNET_HOST, 'mainnet')
    }
    return new S3ModelCollectionModel(CERAMIC_TESTNET_HOST, 'testnet')
  }, [selectedDapp?.network])

  const addModelToDapp = useCallback(
    async (modelId: string) => {
      if (!session || !selectedDapp) return
      if (!currCeramicNode) return
      const models = selectedDapp.models || []
      if (models.includes(modelId)) return
      setAdding(true)
      try {
        console.log('start indexing on private node')
        startIndexModelsFromBrowser(
          [modelId],
          selectedDapp.network as Network,
          currCeramicNode.serviceUrl + '/',
          currCeramicNode.privateKey
        ).then((result) => {
          console.log('indexd models on private node:', result)
        })
        .catch(err => {
          console.error(err)
        })
        console.log('store models of dapp to server')
        models.push(modelId)
        await updateDapp(
          { ...selectedDapp, models },
          session.serialize()
          // ceramicNodeId
        )
        console.log('reload dapps')
        await loadDapps()
        await loadCurrDapp()
      } catch (err) {
        console.error(err)
      } finally {
        setAdding(false)
      }
    },
    [
      session,
      selectedDapp,
      loadDapps,
      loadCurrDapp,
      currCeramicNode
    ]
  )

  const collectModel = useCallback(
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
            await collectModel(
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
            <button disabled  title='This model has been added to Dapp'>
              <CheckCircleIcon />
            </button>
          ) : currCeramicNode ? (
            <button
              title='Add this model to Dapp'
              onClick={() => {
                addModelToDapp(modelId)
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
const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: gray;
`
