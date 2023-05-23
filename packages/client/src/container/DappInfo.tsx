import { Link, useParams } from 'react-router-dom'
import { useCeramicCtx } from '../context/CeramicCtx'
import { useCallback, useEffect, useState } from 'react'
import { Dapp } from '@us3r-network/dapp'
import styled from 'styled-components'
import BasicInfo from '../components/Dapp/BasicInfo'
import Add from '../components/icons/Add'
import ExploreAdd from '../components/icons/ExploreAdd'
import useStarModels from '../hooks/useStarModels'
import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { getStarModels } from '../api'
import { ModelStream } from '../types'
import Trash from '../components/icons/Trash'

import ModelTabs from '../components/Dapp/Tabs'
import Left from '../components/icons/Left'
import { divide } from 'lodash'
import Right from '../components/icons/Right'

export default function DappInfo() {
  const { appId } = useParams()
  const { s3Dapp } = useCeramicCtx()
  const [dapp, setDapp] = useState<Dapp>()
  const session = useSession()

  const loadDapp = useCallback(async () => {
    if (!appId) return
    const resp = await s3Dapp.queryDappWithId(appId)
    setDapp(resp.data?.node)
  }, [appId, s3Dapp])

  const addModelToDapp = useCallback(
    async (modelId: string) => {
      if (!session) return
      if (!appId) return
      const models = dapp?.models || []
      if (models.includes(modelId)) return
      models.push(modelId)
      await s3Dapp.updateDapp(appId, {
        models,
      })
      await loadDapp()
    },
    [appId, dapp, loadDapp, s3Dapp, session]
  )

  const removeModelFromDapp = useCallback(
    async (modelId: string) => {
      if (!session) return
      if (!appId) return
      const models = dapp?.models || []
      const idx = models.indexOf(modelId)

      if (idx === -1) return
      await s3Dapp.updateDapp(appId, {
        models: [...models.slice(0, idx), ...models.slice(idx + 1)],
      })
      await loadDapp()
    },
    [appId, dapp, loadDapp, s3Dapp, session]
  )

  useEffect(() => {
    loadDapp()
  }, [loadDapp])

  return (
    <div>
      <BasicInfo dapp={dapp} />
      <DappModels
        models={dapp?.models || []}
        addModelToDapp={addModelToDapp}
        removeModelFromDapp={removeModelFromDapp}
      />
    </div>
  )
}

function DappModels({
  removeModelFromDapp,
  addModelToDapp,
  models,
}: {
  removeModelFromDapp: (modelId: string) => Promise<void>
  addModelToDapp: (modelId: string) => Promise<void>
  models: string[]
}) {
  const { network } = useCeramicCtx()
  const { starModels } = useStarModels()
  const [selectModel, setSelectModel] = useState<ModelStream>()
  const [scale, setScale] = useState(false)
  const [dappModels, setDappModels] = useState<ModelStream[]>()

  const loadModelsInfo = useCallback(async () => {
    if (models.length === 0) {
      setDappModels([])
      return
    }
    const resp = await getStarModels({ network, ids: models })

    const list = resp.data.data
    setDappModels(list)
  }, [network, models])

  useEffect(() => {
    loadModelsInfo()
  }, [loadModelsInfo])

  const leftWidth = scale ? 60 : 260

  return (
    <ModelsBox>
      <ModelsListBox width={leftWidth} scale={scale}>
        {(scale && (
          <div className="scaled">
            <p>Models List</p>
            <button onClick={() => setScale(false)}>
              <Right />
            </button>
          </div>
        )) || (
          <>
            <div>
              <div className="title">
                <h3> ModelList</h3>
                {selectModel && <button
                  onClick={() => {
                    setScale(true)
                  }}
                >
                  <Left />
                </button>}
              </div>
              <Link to={'/models/model/create'}>
                <div className="create">
                  <Add stroke="#fff" /> Create
                </div>
              </Link>
              <DappModelList
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
            </div>
            <Link to={'/models'}>
              <div className="explore">
                <ExploreAdd /> Explore More
              </div>
            </Link>
            <div>
              <h3>My Favorite Models({starModels.length})</h3>
              <div className="fav-list">
                {starModels.map((item) => {
                  const hasInclude = models.includes(item.stream_id)
                  return (
                    <div key={item.stream_id}>
                      {item.stream_content.name}
                      {!hasInclude && (
                        <ModelListItemAdd
                          streamId={item.stream_id}
                          addModelToDapp={addModelToDapp}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </ModelsListBox>

      <Tabs leftWidth={leftWidth}>
        {selectModel && (
          <ModelTabs
            name={selectModel?.stream_content.name || ''}
            modelId={selectModel?.stream_id || ''}
          />
        )}
      </Tabs>
    </ModelsBox>
  )
}

function DappModelList({
  dappModels,
  selectAction,
  removeModelAction,
}: {
  dappModels: ModelStream[]
  selectAction: (model: ModelStream) => void
  removeModelAction: (modelId: string) => Promise<void>
}) {
  const [selected, setSelected] = useState<ModelStream>()

  return (
    <DappModelsListBox>
      {dappModels?.map((item) => {
        const active = selected?.stream_id === item.stream_id
        return (
          <div key={item.stream_id} className={active ? 'active' : ''}>
            <div className="title">
              <div
                onClick={() => {
                  selectAction(item)
                  setSelected(item)
                }}
              >
                {item.stream_content.name}
              </div>
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
      onClick={async () => {
        setRemoving(true)
        await removeModelAction(streamId)
        setRemoving(false)
      }}
    >
      <Trash />
    </button>
  )
}

function ModelListItemAdd({
  streamId,
  addModelToDapp,
}: {
  streamId: string
  addModelToDapp: (streamId: string) => Promise<void>
}) {
  const [adding, setAdding] = useState(false)
  if (adding) {
    return (
      <div className="removing">
        <img src="/loading.gif" title="loading" alt="" />{' '}
      </div>
    )
  }
  return (
    <button
      onClick={async () => {
        setAdding(true)
        await addModelToDapp(streamId)
        setAdding(false)
      }}
    >
      <Add />
    </button>
  )
}

const DappModelsListBox = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  > div {
    padding: 10px 16px;
    box-sizing: border-box;
    border: 1px solid #39424c;
    border-radius: 12px;
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
`

const ModelsBox = styled.div`
  display: flex;
  gap: 20px;
`

const Tabs = styled.div<{ leftWidth: number }>`
  width: ${({ leftWidth }) => ` calc(1300px - ${leftWidth}px - 20px)`};
`

const ModelsListBox = styled.div<{ width: number; scale: boolean }>`
  padding: ${({ scale }) => (scale ? `5px` : '20px')};
  box-sizing: border-box;
  width: ${({ width }) => `${width}px`};
  background: #1b1e23;
  border: 1px solid #39424c;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: ${({ scale }) => (scale ? 'calc(100vh - 260px)' : `fit-content`)};

  .scaled {
    font-size: 12px;
    line-height: 14px;
    display: flex;
    align-items: center;
    flex-direction: column;
    color: #718096;
    height: 100%;
    justify-content: center;
    p {
      text-align: center;
    }
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
  }

  h3 {
    margin: 0;
    font-style: italic;
    font-weight: 700;
    font-size: 20px;
    line-height: 24px;
    color: #ffffff;
  }

  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .create {
    border: 1px solid #39424c;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    margin-top: 20px;
  }

  .explore {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 12px 24px;
    box-sizing: border-box;
    height: 48px;
    gap: 10px;

    border: 1px solid #39424c;
    border-radius: 12px;

    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: #fff;
  }

  .fav-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 20px;
    > div {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      box-sizing: border-box;

      background: #1a1e23;

      border: 1px solid #39424c;
      border-radius: 12px;
    }
  }

  .removing {
    width: 25px;
    height: 25px;
    > img {
      width: 100%;
    }
  }
`
