import { useSession } from '@us3r-network/auth-with-rainbowkit'
import dayjs from 'dayjs'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Button,
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay
} from 'react-aria-components'
import InfiniteScroll from 'react-infinite-scroll-component'
import styled from 'styled-components'
import { bindingDappComposites, getComposites } from '../../api/composite'
import { updateDapp } from '../../api/dapp'
import { startIndexModels } from '../../api/model'
import { PAGE_SIZE, S3_SCAN_URL } from '../../constants'
import { useAppCtx } from '../../context/AppCtx'
import { useCeramicNodeCtx } from '../../context/CeramicNodeCtx'
import useSelectedDapp from '../../hooks/useSelectedDapp'
import { CeramicStatus, DappCompositeDto, Network } from '../../types.d'
import { shortPubKey } from '../../utils/shortPubKey'
import { TableBox, TableContainer } from '../common/TableBox'
import CheckCircleIcon from '../icons/CheckCircleIcon'
import LayoutIcon from '../icons/LayoutIcon'
import PlusCircleIcon from '../icons/PlusCircleIcon'
import CreateCompositeModal from '../model/CreateCompositeModal'
import { Dapps } from '../model/ExploreModelList'
import NoCeramicNodeModal from '../node/NoCeramicNodeModal'

export function CompositeList ({
  searchText
}: {
  searchText?: string
}) {
  const { selectedDapp } = useSelectedDapp()
  const { currCeramicNode } = useCeramicNodeCtx()
  const [composites, setComposites] = useState<Array<DappCompositeDto>>([])
  const [hasMore, setHasMore] = useState(true)
  const pageNum = useRef(1)
  const fetchComposites = useCallback(async () => {
    setComposites([])
    setHasMore(true)
    const resp = await getComposites({
      name: searchText,
      network: (selectedDapp?.network as Network) || Network.TESTNET
    })
    const list = resp.data.data
    setComposites(list)
    setHasMore(list.length >= PAGE_SIZE)
    pageNum.current = 1
  }, [searchText, selectedDapp?.network])

  const fetchMoreComposites = useCallback(
    async (pageNumber: number) => {
      const resp = await getComposites({
        name: searchText,
        pageNumber,
        network: (selectedDapp?.network as Network) || Network.TESTNET
      })
      const list = resp.data.data
      setHasMore(list.length >= PAGE_SIZE)
      setComposites([...composites, ...list])
    },
    [composites, searchText, selectedDapp?.network]
  )

  useEffect(() => {
    fetchComposites()
  }, [fetchComposites])

  const lists = composites
  return (
    <>
      <InfiniteScroll
        dataLength={lists.length}
        next={() => {
          pageNum.current += 1
          fetchMoreComposites(pageNum.current)
          console.log('fetch more')
        }}
        hasMore={hasMore}
        loader={<Loading>Loading...</Loading>}
      >
        <TableBox>
          <TableContainer>
            <thead>
              <tr>
                <th>Composite Name</th>
                <th>Stream ID</th>
                <th>Release Date</th>
                <th>Dapps</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {lists.map((item, idx) => {
                return (
                  <tr key={item.id}>
                    <td>
                      <div>{item.name}</div>
                    </td>
                    <td>
                      <div>
                        {item.streamId ? (
                          <a
                            href={`${S3_SCAN_URL}/streams/stream/${
                              item.streamId
                            }?network=${selectedDapp?.network.toUpperCase()}`}
                            target='_blank'
                            rel='noreferrer'
                          >
                            {shortPubKey(item.streamId, {
                              len: 8,
                              split: '-'
                            })}
                          </a>
                        ) : (
                          '-'
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss') ||
                          '-'}
                      </div>
                    </td>
                    <td>
                      <Dapps dapps={item.dapps || []} />
                    </td>
                    <td>
                      {/* <OpsBtns modelId={item.stream_id} /> */}
                      <Actions
                        composite={item}
                        hasIndexed={
                          item.dapps?.findIndex(
                            dapp => dapp.id === selectedDapp?.id
                          ) !== -1
                        }
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
      {!hasMore && <Loading>no more data</Loading>}
    </>
  )
}

function Actions ({
  composite,
  hasIndexed,
  ceramicNodeId
}: {
  composite: DappCompositeDto
  hasIndexed: boolean
  ceramicNodeId?: number
}) {
  const session = useSession()

  const { loadDapps } = useAppCtx()
  const { selectedDapp } = useSelectedDapp()
  const [adding, setAdding] = useState(false)

  const bindComposite = useCallback(async () => {
    if (!session || !selectedDapp) return
    if (!ceramicNodeId) return
    if (!hasIndexed) {
      bindingDappComposites({
        compositeId: composite.id,
        dapp: selectedDapp,
        did: session.serialize()
      })
      .then(
        () => {
          const models = JSON.parse(composite.composite).models
          console.log(Object.keys(models))
          const modelIds = Object.keys(models)
          startIndexModels({
            modelIds,
            network: selectedDapp.network,
            didSession: session.serialize()
          }).catch(console.error)
        },
        err => {
          console.error(err)
        }
      )
      .catch(console.error)
    }
    try {
      setAdding(true)
      const composites = selectedDapp.composites || []
      composites.push(composite)
      await updateDapp(
        { ...selectedDapp, composites },
        session.serialize(),
        ceramicNodeId
      )
      await loadDapps()
    } catch (err) {
      console.error(err)
    } finally {
      setAdding(false)
    }
  }, [session, selectedDapp, ceramicNodeId, hasIndexed, composite, loadDapps])
  return (
    <OpsBox className={''}>
      <DialogTrigger>
        <Button>
          {' '}
          <LayoutIcon isActive />{' '}
        </Button>
        <ModalOverlay>
          <Modal>
            <Dialog>
              {({ close }) => (
                <CreateCompositeModal
                  closeModal={close}
                  defaultSchema={composite.graphql}
                  readonly={true}
                  defaultName={composite.name}
                />
              )}
            </Dialog>
          </Modal>
        </ModalOverlay>
      </DialogTrigger>
      {adding ? (
        <button>
          <img className='loading' src='/loading.gif' alt='loading' />
        </button>
      ) : (
        <>
          {hasIndexed ? (
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
                bindComposite()
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
  gap: -5px;
  img {
    width: 17px;
  }
`

const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: gray;
`
