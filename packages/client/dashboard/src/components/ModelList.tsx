import styled from 'styled-components'
import { Button, Dialog, DialogTrigger, Popover } from 'react-aria-components'
import { MenuTrigger, Menu, Item } from 'react-aria-components'

import { Modal, ModalOverlay } from 'react-aria-components'

import PlusIcon from './Icons/PlusIcon'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import useSelectedDapp from '../hooks/useSelectedDapp'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DappComposite, ModelStream } from '../types'
import { getStarModels, getDappComposites, deleteDappComposites } from '../api'
import { Network } from './Selector/EnumSelect'
import TrashIcon from './Icons/TrashIcon'
import FavoriteModel from './FavoriteModal'
import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { useAppCtx } from '../context/AppCtx'
import { updateDapp } from '../api'
import MergeModal from './MergeModal'
import CreateNewModel from './CreateNewModel'
import CreateCompositeModal from './CreateCompositeModal'
import MergeIcon from './Icons/MergeIcon'

export default function ModelList({
  editable,
  selectComposite,
  setSelectComposite,
  selectModel,
  setSelectModel,
}: {
  selectModel: ModelStream | undefined
  setSelectModel: (m: ModelStream | undefined) => void
  selectComposite: DappComposite | undefined
  setSelectComposite: (composite: DappComposite | undefined) => void

  editable?: boolean
}) {
  const session = useSession()
  const { loadDapps } = useAppCtx()
  const { appId, selectedDapp } = useSelectedDapp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [dappModels, setDappModels] = useState<ModelStream[]>()
  const [composites, setComposites] = useState<DappComposite[]>([])
  const location = useLocation()

  const loadModelsInfo = useCallback(async () => {
    if (selectedDapp?.models?.length === 0 || !selectedDapp) {
      setDappModels([])
      return
    }

    try {
      const resp = await getStarModels({
        network: selectedDapp.network as Network,
        ids: selectedDapp.models || [],
      })

      const list = resp.data.data
      setDappModels(list)
      if (list.length > 0 && !selectModel) {
        setSelectModel(list[0])
      }
    } catch (error) {
      console.error(error)
    }
  }, [selectModel, selectedDapp, setSelectModel])

  const loadDappComposites = useCallback(async () => {
    if (!session) return
    if (!selectedDapp) return
    try {
      const resp = await getDappComposites({
        dapp: selectedDapp,
        didSession: session.serialize(),
      })
      if (resp.data.code !== 0) throw new Error(resp.data.msg)
      setComposites(resp.data.data)
    } catch (error) {
      console.error(error)
    }
  }, [selectedDapp, session])

  const removeModelFromDapp = useCallback(
    async (modelId: string) => {
      if (!session) return
      if (!selectedDapp) return

      try {
        const newModels =
          selectedDapp?.models?.filter((id) => id !== modelId) || []

        await updateDapp(
          { ...selectedDapp, models: newModels },
          session.serialize()
        )
        await loadDapps()
      } catch (error) {
        console.error(error)
      }
    },
    [loadDapps, selectedDapp, session]
  )

  const delDappComposite = useCallback(
    async (id: number) => {
      if (!session) return
      if (!selectedDapp) return
      try {
        await deleteDappComposites({
          compositeId: id,
          didSession: session.serialize(),
          dapp: selectedDapp,
        })
        await loadDappComposites()
      } catch (error) {
        console.error(error)
      }
    },
    [selectedDapp, session, loadDappComposites]
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

  const isMetrics = location.pathname.endsWith('statistic')

  if (loading) {
    return (
      <ListBox>
        <div className="loading">
          <img src="/loading.gif" alt="" />
        </div>
      </ListBox>
    )
  }

  return (
    <ListBox>
      <div className="title">
        <h3>Models</h3>
        <Favorite />
        <CreateNew />
        {editable && (
          <MenuTrigger>
            <Button aria-label="Menu">
              <PlusIcon />
            </Button>
            <Popover>
              <Menu
                onAction={(id) => {
                  if (id === 'explore') {
                    navigate(`/dapp/${appId}/explore`)
                    return
                  }
                  if (id === 'favorite') {
                    document.getElementById('add-from-favorite')?.click()
                    return
                  }
                  if (id === 'create') {
                    document.getElementById('create-new')?.click()
                    return
                  }
                }}
              >
                <Item id="explore">Explore Models</Item>
                <Item id="favorite">Add From Favorite</Item>
                <Item id="create">Create New Model</Item>
              </Menu>
            </Popover>
          </MenuTrigger>
        )}
      </div>

      <DappModelList
        editable={editable}
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

      {!isMetrics && (
        <>
          <div className="title">
            <h3>Composites</h3>
            {editable && (
              <CreateComposite loadDappComposites={loadDappComposites} />
            )}
          </div>

          <DappCompositeList
            composites={composites}
            editable={editable}
            selectComposite={selectComposite}
            setSelectedComposite={setSelectComposite}
            removeAction={delDappComposite}
          />
        </>
      )}
      {editable && (
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
                      composites={composites}
                      dappModels={dappModels || []}
                    />
                  )}
                </Dialog>
              </Modal>
            </ModalOverlay>
          </DialogTrigger>
        </MergeBox>
      )}
    </ListBox>
  )
}

function DappCompositeList({
  composites,
  removeAction,
  editable,
  selectComposite,
  setSelectedComposite,
}: {
  composites: DappComposite[]
  selectComposite: DappComposite | undefined
  setSelectedComposite: (composite: DappComposite) => void
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
      {composites?.map((item) => {
        const active = selectComposite?.id === item.id
        return (
          <div key={item.id} className={active ? 'active' : ''}>
            <div
              className="title"
              onClick={() => {
                setSelectedComposite(item)
              }}
            >
              <div>{item.name}</div>
              {editable && (
                <ModelListItemTrash
                  removeModelAction={async () => {
                    await removeAction(item.id)
                  }}
                  streamId={item.id + ''}
                />
              )}
            </div>
          </div>
        )
      })}
    </DappModelsListBox>
  )
}

function DappModelList({
  selected,
  setSelected,
  dappModels,
  selectAction,
  removeModelAction,
  editable,
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
      {dappModels?.map((item) => {
        const active = selected?.stream_id === item.stream_id
        return (
          <div key={item.stream_id} className={active ? 'active' : ''}>
            <div
              className="title"
              onClick={() => {
                selectAction(item)
                setSelected(item)
              }}
            >
              <div>{item.stream_content.name}</div>
              {editable && (
                <ModelListItemTrash
                  removeModelAction={removeModelAction}
                  streamId={item.stream_id}
                />
              )}
            </div>
            {active && (
              <>
                <hr />
                <p>{selected.stream_content.description}</p>
                <p>Streams:{selected.useCount}</p>
              </>
            )}
          </div>
        )
      })}
    </DappModelsListBox>
  )
}

function ModelListItemTrash({
  streamId,
  removeModelAction,
}: {
  streamId: string
  removeModelAction: (modelId: string) => Promise<void>
}) {
  const [removing, setRemoving] = useState(false)
  if (removing) {
    return (
      <div className="removing">
        <img src="/loading.gif" title="loading" alt="" />{' '}
      </div>
    )
  }
  return (
    <button
      onClick={async (e) => {
        e.stopPropagation()
        setRemoving(true)
        await removeModelAction(streamId)
        setRemoving(false)
      }}
    >
      <TrashIcon />
    </button>
  )
}

function Favorite() {
  return (
    <DialogTrigger>
      <Button
        style={{
          display: 'none',
        }}
        id="add-from-favorite"
      >
        Add From Favorite
      </Button>
      <ModalOverlay>
        <Modal>
          <Dialog>{({ close }) => <FavoriteModel closeModal={close} />}</Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  )
}

function CreateNew() {
  const [searchParams] = useSearchParams()
  useEffect(() => {
    if (searchParams.get('create-new') === 'true') {
      document.getElementById('create-new')?.click()
    }
  }, [searchParams])
  return (
    <DialogTrigger>
      <Button
        style={{
          display: 'none',
        }}
        id="create-new"
      >
        Create New
      </Button>
      <ModalOverlay>
        <Modal>
          <Dialog>
            {({ close }) => <CreateNewModel closeModal={close} />}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  )
}

function CreateComposite({
  loadDappComposites,
}: {
  loadDappComposites: () => Promise<void>
}) {
  return (
    <DialogTrigger>
      <Button>
        <PlusIcon />
      </Button>
      <ModalOverlay>
        <Modal>
          <Dialog>
            {({ close }) => (
              <CreateCompositeModal
                closeModal={close}
                loadDappComposites={loadDappComposites}
              />
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  )
}

const ListBox = styled.div`
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
  }

  hr {
    border-color: rgba(255, 255, 255, 0.2);
    margin-top: 10px;
  }

  p {
    color: #718096;
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
