import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Button,
  Dialog,
  DialogTrigger,
  Menu,
  MenuItem,
  MenuTrigger,
  Modal,
  ModalOverlay,
  Popover
} from 'react-aria-components'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { deleteDappComposites, getDappComposites } from '../../api/composite'
import { updateDapp } from '../../api/dapp'
import { getModelsInfoByIds } from '../../api/model'
import { useAppCtx } from '../../context/AppCtx'
import { useCeramicNodeCtx } from '../../context/CeramicNodeCtx'
import useIsOwner from '../../hooks/useIsOwner'
import useSelectedDapp from '../../hooks/useSelectedDapp'
import {
  CeramicStatus,
  DappCompositeDto,
  ModelStream,
  Network
} from '../../types.d'
import { getCompositeDefaultSchema } from '../../utils/composedb-types/schemas'
import { shortPubKey } from '../../utils/shortPubKey'
import CopyTint from '../common/CopyTint'
import MergeIcon from '../icons/MergeIcon'
import PlusIcon from '../icons/PlusIcon'
import TrashIcon from '../icons/TrashIcon'
import NoCeramicNodeModal from '../node/NoCeramicNodeModal'
import CreateNewComposite from './CreateNewComposite'
import CreateNewModel from './CreateNewModel'
import MergeModal from './MergeModal'
import CloseIcon from '../icons/CloseIcon'
import ModelList from './ExploreModelList'
import { CompositeList } from './ExploreCompositeList'

enum OPEN_MODAL {
  NONE,
  CREATE_NEW_MODEL,
  ADD_FROM_ALL_MODELS,
  ADD_FROM_FAVORITE_MODELS,
  CREATE_NEW_COMPOSITE,
  ADD_FROM_ALL_COMPOSITES
  // ADD_FROM_FAVORITE_COMPOSITES
}

export default function DappModelAndComposites ({
  editable,
  selectComposite,
  setSelectComposite,
  selectModel,
  setSelectModel
}: {
  selectModel: ModelStream | undefined
  setSelectModel: (m: ModelStream | undefined) => void
  selectComposite: DappCompositeDto | undefined
  setSelectComposite: (composite: DappCompositeDto | undefined) => void

  editable?: boolean
}) {
  const session = useSession()
  const { loadDapps, currDapp } = useAppCtx()
  const { appId, selectedDapp } = useSelectedDapp()
  const { currCeramicNode } = useCeramicNodeCtx()
  const [loading, setLoading] = useState(false)
  const [dappModels, setDappModels] = useState<ModelStream[]>()
  const [dappComposites, setDappComposites] = useState<DappCompositeDto[]>([])
  const location = useLocation()

  const dapp = useMemo(() => {
    return selectedDapp || currDapp
  }, [selectedDapp, currDapp])

  const { isOwner } = useIsOwner()

  const loadModelsInfo = useCallback(async () => {
    if (dapp?.models?.length === 0 || !dapp) {
      setDappModels([])
      return
    }

    try {
      const resp = await getModelsInfoByIds({
        network: dapp.network as Network,
        ids: dapp.models || []
      })

      const list = resp.data.data
      setDappModels(list)
      if (list.length > 0) {
        setSelectModel(list[0])
      }
    } catch (error) {
      console.error(error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dapp])

  // const loadDappModels = useCallback(async () => {
  //   if (!dapp) return
  //   try {
  //     const resp = await getDappModels({
  //       dapp
  //     })
  //     if (resp.data.code !== 0) throw new Error(resp.data.msg)
  //     setDappModels(resp.data.data)
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }, [dapp])

  const loadDappComposites = useCallback(async () => {
    if (!dapp) return
    try {
      const resp = await getDappComposites({
        dapp
      })
      if (resp.data.code !== 0) throw new Error(resp.data.msg)
      setDappComposites(resp.data.data)
    } catch (error) {
      console.error(error)
    }
  }, [dapp])

  const removeModelFromDapp = useCallback(
    async (modelId: string) => {
      if (!session) return
      if (!selectedDapp) return

      try {
        const newModels =
          selectedDapp?.models?.filter(id => id !== modelId) || []

        await updateDapp(
          { ...selectedDapp, models: newModels },
          session.serialize()
        )
        await loadDapps()
        setSelectModel(undefined)
      } catch (error) {
        console.error(error)
      }
    },
    [loadDapps, selectedDapp, session, setSelectModel]
  )

  const delDappComposite = useCallback(
    async (id: number) => {
      if (!session) return
      if (!selectedDapp) return
      try {
        await deleteDappComposites({
          compositeId: id,
          did: session.serialize(),
          dapp: selectedDapp
        })
        await loadDappComposites()
        setSelectComposite(undefined)
      } catch (error) {
        console.error(error)
      }
    },
    [session, selectedDapp, loadDappComposites, setSelectComposite]
  )

  const isFirstRenderRef = useRef(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      setLoading(true)
    }

    Promise.all([loadDappComposites(), loadModelsInfo()]).finally(() =>
      setLoading(false)
    )
  }, [loadModelsInfo, loadDappComposites, mounted])

  useEffect(() => {
    setSelectModel(undefined)
    setDappModels(undefined)
    setSelectComposite(undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId])

  const isMetrics = location.pathname.endsWith('metrics')
  const isSdk = location.pathname.endsWith('sdk')

  const [openModal, setOpenModal] = useState(OPEN_MODAL.NONE)
  if (loading) {
    return (
      <Box>
        <div className='loading'>
          <img src='/loading.gif' alt='' />
        </div>
      </Box>
    )
  }

  return (
    <Box>
      <div className='title'>
        <h3>Models</h3>
        {editable &&
          isOwner &&
          (!currCeramicNode ||
          currCeramicNode.status !== CeramicStatus.RUNNING ? (
            <DialogTrigger>
              <Button>
                <PlusIcon />
              </Button>
              <ModalOverlay>
                <Modal>
                  <Dialog>
                    {({ close }) => <NoCeramicNodeModal closeModal={close} />}
                  </Dialog>
                </Modal>
              </ModalOverlay>
            </DialogTrigger>
          ) : (
            <MenuTrigger>
              <Button aria-label='Menu'>
                <PlusIcon />
              </Button>
              <Popover>
                <Menu
                  onAction={id => {
                    if (id === 'explore') {
                      setOpenModal(OPEN_MODAL.ADD_FROM_ALL_MODELS)
                      return
                    }
                    if (id === 'favorite') {
                      setOpenModal(OPEN_MODAL.ADD_FROM_FAVORITE_MODELS)
                      return
                    }
                    if (id === 'create') {
                      setOpenModal(OPEN_MODAL.CREATE_NEW_MODEL)
                      return
                    }
                  }}
                >
                  <MenuItem id='explore'>Add From Popular Models</MenuItem>
                  <MenuItem id='favorite'>Add From Favorite</MenuItem>
                  <MenuItem id='create'>Create New Model</MenuItem>
                </Menu>
              </Popover>
            </MenuTrigger>
          ))}
      </div>

      <DappModelList
        editable={editable && isOwner}
        selected={selectModel}
        setSelected={setSelectModel}
        dappModels={dappModels || []}
        selectAction={(model: ModelStream) => {
          setSelectModel(model)
        }}
        removeModelAction={async (id: string) => {
          await removeModelFromDapp(id)
          if (id === selectModel?.stream_id) {
            setSelectModel(undefined)
            setDappModels(undefined)
            setSelectModel(undefined)
          }
        }}
      />

      {!(isMetrics || isSdk) && (
        <>
          <div className='title'>
            <h3>Composites</h3>
            {editable &&
              isOwner &&
              (!currCeramicNode ||
              currCeramicNode.status !== CeramicStatus.RUNNING ? (
                <DialogTrigger>
                  <Button>
                    <PlusIcon />
                  </Button>
                  <ModalOverlay>
                    <Modal>
                      <Dialog>
                        {({ close }) => (
                          <NoCeramicNodeModal closeModal={close} />
                        )}
                      </Dialog>
                    </Modal>
                  </ModalOverlay>
                </DialogTrigger>
              ) : (
                <MenuTrigger>
                  <Button aria-label='Menu'>
                    <PlusIcon />
                  </Button>
                  <Popover>
                    <Menu
                      onAction={id => {
                        if (id === 'explore') {
                          setOpenModal(OPEN_MODAL.ADD_FROM_ALL_COMPOSITES)
                          return
                        }
                        if (id === 'create') {
                          setOpenModal(OPEN_MODAL.CREATE_NEW_COMPOSITE)
                          return
                        }
                      }}
                    >
                      <MenuItem id='explore'>
                        Add From Popular Composites
                      </MenuItem>
                      <MenuItem id='create'>Create New Composites</MenuItem>
                    </Menu>
                  </Popover>
                </MenuTrigger>
              ))}
          </div>

          <DappCompositeList
            composites={dappComposites}
            editable={editable && isOwner}
            selectComposite={selectComposite}
            setSelectedComposite={setSelectComposite}
            removeAction={delDappComposite}
          />
        </>
      )}
      {/* CREATE_NEW_MODEL modal */}
      <Modal
        isOpen={openModal === OPEN_MODAL.CREATE_NEW_MODEL}
        onOpenChange={() => setOpenModal(OPEN_MODAL.NONE)}
      >
        <Dialog>{({ close }) => <CreateNewModel closeModal={close} />}</Dialog>
      </Modal>
      {/* CREATE_NEW_COMPOSITE modal */}
      <Modal
        isOpen={openModal === OPEN_MODAL.CREATE_NEW_COMPOSITE}
        onOpenChange={() => setOpenModal(OPEN_MODAL.NONE)}
      >
        <Dialog>
          {({ close }) => (
            <CreateNewComposite
              closeModal={close}
              loadDappComposites={loadDappComposites}
              defaultSchema={getCompositeDefaultSchema(dappModels || [])}
            />
          )}
        </Dialog>
      </Modal>
      {/* ADD_FROM_FAVORITE_MODELS modal */}
      <Modal
        isOpen={openModal === OPEN_MODAL.ADD_FROM_FAVORITE_MODELS}
        onOpenChange={() => setOpenModal(OPEN_MODAL.NONE)}
      >
        <Dialog>
          {({ close }) => (
            <DialogBox>
              <div className='title'>
                <h1>My Favorite Models</h1>
                <button onClick={close}>
                  <CloseIcon />
                </button>
              </div>
              <div className='content'>
                <ModelList filterStar />
              </div>
            </DialogBox>
          )}
        </Dialog>
      </Modal>
      {/* ADD_FROM_ALL_MODELS modal */}
      <Modal
        isOpen={openModal === OPEN_MODAL.ADD_FROM_ALL_MODELS}
        onOpenChange={() => setOpenModal(OPEN_MODAL.NONE)}
      >
        <Dialog>
          {({ close }) => (
            <DialogBox>
              <div className='title'>
                <h1>Popular Models</h1>
                <button onClick={close}>
                  <CloseIcon />
                </button>
              </div>
              <div className='content'>
                <ModelList />
              </div>
            </DialogBox>
          )}
        </Dialog>
      </Modal>
      {/* ADD_FROM_ALL_COMPOSITES modal */}
      <Modal
        isOpen={openModal === OPEN_MODAL.ADD_FROM_ALL_COMPOSITES}
        onOpenChange={() => setOpenModal(OPEN_MODAL.NONE)}
      >
        <Dialog>
          {({ close }) => (
            <DialogBox>
              <div className='title'>
                <h1>Popular Composites</h1>
                <button onClick={close}>
                  <CloseIcon />
                </button>
              </div>
              <div className='content'>
                <CompositeList />
              </div>
            </DialogBox>
          )}
        </Dialog>
      </Modal>
      {editable && isOwner && (
        <MergeBox>
          <DialogTrigger>
            <Button className={'merge-btn'}>
              <MergeIcon />
              Merge
            </Button>
            <ModalOverlay>
              <Modal>
                <Dialog>
                  {({ close }) => (
                    <MergeModal
                      closeModal={close}
                      composites={dappComposites}
                      dappModels={dappModels || []}
                    />
                  )}
                </Dialog>
              </Modal>
            </ModalOverlay>
          </DialogTrigger>
        </MergeBox>
      )}
    </Box>
  )
}

function DappCompositeList ({
  composites,
  removeAction,
  editable,
  selectComposite,
  setSelectedComposite
}: {
  composites: DappCompositeDto[]
  selectComposite: DappCompositeDto | undefined
  setSelectedComposite: (composite: DappCompositeDto) => void
  removeAction: (id: number) => Promise<void>
  editable?: boolean
}) {
  if (composites.length === 0) {
    return (
      <DappModelsListBox>
        <p>This Dapp has no composites available yet.</p>
      </DappModelsListBox>
    )
  }
  return (
    <DappModelsListBox>
      {composites?.map(item => {
        const active = selectComposite?.id === item.id
        return (
          <div key={item.id} className={active ? 'active' : ''}>
            <div
              className='title'
              onClick={() => {
                setSelectedComposite(item)
              }}
            >
              <div>{item.name}</div>
              {editable && (
                <RemoveButton
                  removeAction={async () => {
                    await removeAction(item.id)
                  }}
                  id={item.id + ''}
                />
              )}
            </div>
          </div>
        )
      })}
    </DappModelsListBox>
  )
}

function DappModelList ({
  selected,
  setSelected,
  dappModels,
  selectAction,
  removeModelAction,
  editable
}: {
  selected?: ModelStream
  setSelected: (ms: ModelStream) => void
  dappModels: ModelStream[]
  selectAction: (model: ModelStream) => void
  removeModelAction: (modelId: string) => Promise<void>
  editable?: boolean
}) {
  if (dappModels.length === 0) {
    return (
      <DappModelsListBox>
        <p>There is no model in this dapp.</p>
      </DappModelsListBox>
    )
  }
  return (
    <DappModelsListBox>
      {dappModels?.map(item => {
        const active = selected?.stream_id === item.stream_id
        return (
          <div key={item.stream_id} className={active ? 'active' : ''}>
            <div
              className='title'
              onClick={() => {
                selectAction(item)
                setSelected(item)
              }}
            >
              <div>{item.stream_content.name}</div>
              {editable && (
                <RemoveButton
                  removeAction={removeModelAction}
                  id={item.stream_id}
                />
              )}
            </div>
            {active && (
              <>
                <hr />
                <div className='id-copy'>
                  <p>ID: {shortPubKey(selected.stream_id, { len: 7 })}</p>
                  <div>
                    <CopyTint data={selected.stream_id} />
                  </div>
                </div>
                <p>{selected.stream_content.description}</p>
                <p>
                  Streams: <span>{selected.useCount}</span>
                </p>
              </>
            )}
          </div>
        )
      })}
    </DappModelsListBox>
  )
}

function RemoveButton ({
  id,
  removeAction
}: {
  id: string
  removeAction: (id: string) => Promise<void>
}) {
  const [removing, setRemoving] = useState(false)
  if (removing) {
    return (
      <div className='removing'>
        <img src='/loading.gif' title='loading' alt='' />{' '}
      </div>
    )
  }
  return (
    <button
      onClick={async e => {
        e.stopPropagation()
        setRemoving(true)
        await removeAction(id)
        setRemoving(false)
      }}
    >
      <TrashIcon />
    </button>
  )
}

const Box = styled.div`
  background: #1b1e23;
  border: 1px solid #39424c;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
  gap: 20px;
  width: 261px;
  min-width: 261px;
  box-sizing: border-box;
  height: fit-content;
  > div {
    width: 100%;
  }
  .title {
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    > h3 {
      font-style: italic;
      font-weight: 700;
      font-size: 20px;
      line-height: 24px;
      margin: 0;
      color: #ffffff;
    }
  }
  .loading {
    width: 100%;
    text-align: center;
  }
`

const DappModelsListBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: scroll;
  > div {
    padding: 10px 16px;
    box-sizing: border-box;
    border: 1px solid #39424c;
    border-radius: 12px;
    cursor: pointer;
  }

  div.title {
    > div {
      cursor: pointer;
      max-width: 80%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  div.active {
    background: rgba(113, 128, 150, 0.3);
    border: 1px solid #718096;
    border-radius: 12px;

    .id-copy {
      display: flex;
      align-items: center;
      justify-content: space-between;

      > p {
        margin: 0;
      }
    }
  }

  hr {
    border-color: rgba(255, 255, 255, 0.2);
    margin-top: 10px;
  }

  p {
    color: #718096;
    > span {
      color: #ffffff;
      font-size: 16px;
      font-family: Rubik;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
    }
  }

  .removing {
    > img {
      width: 20px;
    }
  }
`

const MergeBox = styled.div`
  .merge-btn {
    width: 100%;
    background: #718096;
    color: #ffffff;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 16px;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
`
const DialogBox = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;
  height: calc(100vh - 100px);
  position: relative;
  width: 1240px;
  margin: 0 auto;

  background: #1b1e23;
  border-radius: 20px;

  > div.title {
    flex: 0 0 42px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    color: #ffffff;
    > h1 {
      margin: 0;
      font-style: italic;
      font-weight: 700;
      font-size: 24px;
      line-height: 28px;
    }
  }
  > div.content {
    height: 0;
    flex: 1;
  }
`
