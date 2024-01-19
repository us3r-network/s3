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
import { useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import { updateDapp } from '../api/dapp'
import { PAGE_SIZE } from '../constants'
import { ImgOrName } from '../components/common/ImgOrName'
import Search from '../components/common/Search'
import { TableBox, TableContainer } from '../components/common/TableBox'
import CheckCircleIcon from '../components/icons/CheckCircleIcon'
import PlusCircleIcon from '../components/icons/PlusCircleIcon'
import NoCeramicNodeModal from '../components/node/NoCeramicNodeModal'
import { S3_SCAN_URL } from '../constants'
import { useAppCtx } from '../context/AppCtx'
import { useCeramicNodeCtx } from '../context/CeramicNodeCtx'
import useSelectedDapp from '../hooks/useSelectedDapp'
import { CeramicStatus, DappCompositeDto, Network } from '../types.d'
import { shortPubKey } from '../utils/shortPubKey'
import { bindingDappComposites, getComposites } from '../api/composite'
import { Dapps } from './ExploreModel'
import CreateCompositeModal from '../components/model/CreateCompositeModal'
import LayoutIcon from '../components/icons/LayoutIcon'

export default function ExploreComposite () {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams()
  const { s3ModelCollection, selectedDapp } = useSelectedDapp()
  const { currCeramicNode } = useCeramicNodeCtx()
  const session = useSession()
  const [composites, setComposites] = useState<Array<DappCompositeDto>>([])
  // const [starModels, setStarModels] = useState<Array<DappComposite>>([])
  const [hasMore, setHasMore] = useState(true)
  const searchText = useRef('')
  const pageNum = useRef(1)
  // const [personalCollections, setPersonalCollections] = useState<
  //   PersonalCollection[]
  // >([])
  // const fetchPersonalCollections = useCallback(async () => {
  //   if (!session) return
  //   s3ModelCollection.authComposeClient(session)
  //   try {
  //     const personal = await s3ModelCollection.queryPersonalCollections({
  //       first: 500
  //     })
  //     if (personal.errors) throw new Error(personal.errors[0].message)
  //     const collected = personal.data?.viewer.modelCollectionList

  //     if (collected) {
  //       setPersonalCollections(
  //         collected?.edges
  //           .filter(item => item.node && item.node.revoke === false)
  //           .map(item => {
  //             return {
  //               modelId: item.node.modelID,
  //               id: item.node.id!,
  //               revoke: !!item.node.revoke
  //             }
  //           })
  //       )
  //     }
  //   } catch (error) {
  //     console.error('error -----', error)
  //   }
  // }, [s3ModelCollection, session])

  // const fetchStarModels = useCallback(async () => {
  //   const ids = personalCollections
  //     .filter(item => item.revoke === false)
  //     .map(item => {
  //       return item.modelId
  //     })
  //   if (ids.length === 0) {
  //     setStarModels([])
  //     return
  //   }

  //   try {
  //     const resp = await getStarModels({
  //       network: (selectedDapp?.network as Network) || Network.TESTNET,
  //       ids
  //     })
  //     if (resp.data.code !== 0) {
  //       throw new Error(resp.data.msg)
  //     }

  //     const list = resp.data.data
  //     setStarModels([...list])
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }, [personalCollections, selectedDapp?.network])

  const fetchComposites = useCallback(async () => {
    setComposites([])
    setHasMore(true)
    const resp = await getComposites({
      name: searchText.current,
      network: (selectedDapp?.network as Network) || Network.TESTNET
    })
    const list = resp.data.data
    setComposites(list)
    setHasMore(list.length >= PAGE_SIZE)
    pageNum.current = 1
  }, [selectedDapp?.network])

  const fetchMoreComposites = useCallback(
    async (pageNumber: number) => {
      const resp = await getComposites({
        name: searchText.current,
        pageNumber,
        network: (selectedDapp?.network as Network) || Network.TESTNET
      })
      const list = resp.data.data
      setHasMore(list.length >= PAGE_SIZE)
      setComposites([...composites, ...list])
    },
    [composites, selectedDapp?.network]
  )

  useEffect(() => {
    fetchComposites()
    // fetchPersonalCollections()
  }, [fetchComposites])

  // useEffect(() => {
  //   fetchStarModels().catch(err => {
  //     setStarModels([])
  //     console.error(err)
  //   })
  // }, [fetchStarModels])

  // const filterStar = useMemo(() => {
  //   return searchParams.get('filterStar') || ''
  // }, [searchParams])

  // const lists = useMemo(() => {
  //   if (!filterStar) return models
  //   return starModels
  // }, [filterStar, models, starModels])
  const lists = composites
  return (
    <ExploreModelContainer>
      <div className={'title-box'}>
        {/* <div className='title'>ComposeDB Models</div> */}

        <div className='tools'>
          <Search
            text={searchText.current}
            searchAction={text => {
              searchText.current = text
              setComposites([])
              fetchComposites()
            }}
            placeholder={'Search by model name'}
          />
        </div>
      </div>
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
                      <div>{item.streamId || '-'}</div>
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
    </ExploreModelContainer>
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
      }).catch(console.error)
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
        <Button> <LayoutIcon isActive/> </Button>
        <ModalOverlay>
          <Modal>
            <Dialog>
              {({ close }) => (
                <CreateCompositeModal
                  closeModal={close}
                  defaultSchema={composite.graphql}
                  readonly = {true}
                  defaultName = {composite.name}
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
    justify-content: end;
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
