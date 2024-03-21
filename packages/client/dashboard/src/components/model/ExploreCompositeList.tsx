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
import { PAGE_SIZE, S3_SCAN_URL } from '../../constants'
import { useAppCtx } from '../../context/AppCtx'
import { useCeramicNodeCtx } from '../../context/CeramicNodeCtx'
import useSelectedDapp from '../../hooks/useSelectedDapp'
import { DappCompositeDto, Network } from '../../types.d'
import { shortPubKey } from '../../utils/shortPubKey'
import { TableBox, TableContainer } from '../common/TableBox'
import CheckCircleIcon from '../icons/CheckCircleIcon'
import LayoutIcon from '../icons/LayoutIcon'
import PlusCircleIcon from '../icons/PlusCircleIcon'
import CreateCompositeModal from './CreateNewComposite'
import { Dapps } from '../model/ExploreModelList'
import NoCeramicNodeModal from '../node/NoCeramicNodeModal'
import { startIndexModelsFromBrowser } from '../../utils/composeDBUtils'
import { updateDapp } from '../../api/dapp'
import { difference, uniq } from 'lodash'

export function CompositeList ({ searchText }: { searchText?: string }) {
  const { selectedDapp } = useSelectedDapp()
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
                      <Actions composite={item} />
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

function Actions ({ composite }: { composite: DappCompositeDto }) {
  const session = useSession()
  const { currCeramicNode } = useCeramicNodeCtx()
  const { loadDapps, loadCurrDapp } = useAppCtx()
  const { selectedDapp } = useSelectedDapp()
  const [adding, setAdding] = useState(false)

  const bindComposite = useCallback(async () => {
    if (!session || !selectedDapp) return
    if (!currCeramicNode) return
    try {
      setAdding(true)
      const compsiteModels = JSON.parse(composite.composite).models
      const modelIds = Object.keys(compsiteModels)
      const dappModels = selectedDapp.models || []
      const newModels = difference(modelIds,dappModels)
      if (newModels.length > 0) {
        console.log('start indexing new models in composite on private node')
        startIndexModelsFromBrowser(
          modelIds,
          selectedDapp.network,
          currCeramicNode.serviceUrl + '/',
          currCeramicNode.privateKey
        ).then((result) => {
          console.log('indexd models on private node:', result)
        })
        .catch(err => {
          console.error(err)
        })
        console.log('store new models in composite of dapp to server')
        const models = uniq([...dappModels, ...newModels])
        await updateDapp(
          { ...selectedDapp, models },
          session.serialize()
          // ceramicNodeId
        )
      }
      console.log('store composite of dapp to server')
      await bindingDappComposites({
        compositeId: composite.id,
        dapp: selectedDapp,
        did: session.serialize()
      })
      console.log('reload dapps')
      await loadDapps()
      await loadCurrDapp()
    } catch (err) {
      console.error(err)
    } finally {
      setAdding(false)
    }
  }, [
    session,
    selectedDapp,
    currCeramicNode,
    composite.id,
    composite.composite,
    loadDapps,
    loadCurrDapp
  ])
  return (
    <OpsBox>
      <DialogTrigger>
        <Button>
          <LayoutIcon isActive />
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
          {selectedDapp?.composites?.map(c=>c.id).includes(composite.id) ? (
            <button disabled title='This composite has been added to Dapp'>
              <CheckCircleIcon />
            </button>
          ) : currCeramicNode ? (
            <button
              disabled={!currCeramicNode}
              title='Add this model to Dapp'
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
