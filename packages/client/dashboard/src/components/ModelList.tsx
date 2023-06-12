import styled from 'styled-components'
import { Button, Dialog, DialogTrigger, Popover } from 'react-aria-components'
import { Modal, ModalOverlay } from 'react-aria-components'

import PlusIcon from './Icons/PlusIcon'
import { Link } from 'react-router-dom'
import useSelectedDapp from '../hooks/useSelectedDapp'
import CreateNewModel from './CreateNewModel'
import { useCallback, useEffect, useState } from 'react'
import { ModelStream } from '../types'
import { getStarModels } from '../api'
import { Network } from './Selector/EnumSelect'
import TrashIcon from './Icons/TrashIcon'
import FavoriteModel from './FavoriteModal'
import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { useAppCtx } from '../context/AppCtx'
import { updateDapp } from '../api'

export default function ModelList({
  setSelectModelId,
  setSelectModelName,
}: {
  setSelectModelId: (id: string) => void
  setSelectModelName?: (name: string) => void
}) {
  const session = useSession()
  const { loadDapps } = useAppCtx()
  const { appId, selectedDapp } = useSelectedDapp()

  const [loading, setLoading] = useState(false)
  const [dappModels, setDappModels] = useState<ModelStream[]>()
  const [selected, setSelected] = useState<ModelStream>()
  const [selectModel, setSelectModel] = useState<ModelStream>()

  const loadModelsInfo = useCallback(async () => {
    if (selectedDapp?.models?.length === 0 || !selectedDapp) {
      setDappModels([])
      return
    }

    const resp = await getStarModels({
      network: selectedDapp.network as Network,
      ids: selectedDapp.models || [],
    })

    const list = resp.data.data
    setDappModels(list)
  }, [selectedDapp])

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

  useEffect(() => {
    setLoading(true)
    loadModelsInfo().finally(() => setLoading(false))
  }, [loadModelsInfo])

  useEffect(() => {
    if (selected) {
      setSelectModelId(selected.stream_id)
      setSelectModelName && setSelectModelName(selected.stream_content.name)
    } else {
      setSelectModelId('')
    }
  }, [selected, setSelectModelId, setSelectModelName])

  useEffect(() => {
    setSelected(undefined)
    setSelectModel(undefined)
    setSelectModelId('')
    setSelectModelName && setSelectModelName('')
    setDappModels(undefined)
  }, [appId, setSelectModelId, setSelectModelName])

  return (
    <ListBox>
      <div className="title">
        <h3>ModelList</h3>
        <DialogTrigger>
          <Button>
            <PlusIcon />
          </Button>
          <Popover>
            <Dialog>
              <div>
                <Link to={`/dapp/${appId}/explore`}>
                  <div className="popover-item">
                    <button>Explore Models</button>
                  </div>
                </Link>
                <div className="popover-item">
                  <Favorite />
                </div>
                <div className="popover-item">
                  <CreateNew />
                </div>
              </div>
            </Dialog>
          </Popover>
        </DialogTrigger>
      </div>
      {(loading && (
        <div className="loading">
          <img src="/loading.gif" alt="" />
        </div>
      )) || (
        <DappModelList
          selected={selected}
          setSelected={setSelected}
          dappModels={dappModels || []}
          selectAction={(model: ModelStream) => {
            setSelectModel(model)
          }}
          removeModelAction={async (id: string) => {
            if (id === selectModel?.stream_id) {
              setSelectModel(undefined)
            }
            await removeModelFromDapp(id)
          }}
        />
      )}
    </ListBox>
  )
}

function DappModelList({
  selected,
  setSelected,
  dappModels,
  selectAction,
  removeModelAction,
}: {
  selected?: ModelStream
  setSelected: (ms: ModelStream) => void
  dappModels: ModelStream[]
  selectAction: (model: ModelStream) => void
  removeModelAction: (modelId: string) => Promise<void>
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
              <ModelListItemTrash
                removeModelAction={removeModelAction}
                streamId={item.stream_id}
              />
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
      <Button>Add From Favorite</Button>
      <ModalOverlay>
        <Modal>
          <Dialog>{({ close }) => <FavoriteModel closeModal={close} />}</Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  )
}

function CreateNew() {
  return (
    <DialogTrigger>
      <Button>Create New</Button>
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
