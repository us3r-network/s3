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

export default function DappInfo() {
  const { appId } = useParams()
  const { s3Dapp, loadDapps } = useCeramicCtx()
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
      await loadDapps()
    },
    [appId, dapp, loadDapps, s3Dapp, session]
  )

  const removeModelFromDapp = useCallback(
    async (modelId: string) => {
      if (!session) return
      if (!appId) return
      const models = dapp?.models || []
      const idx = models.indexOf(modelId)
      console.log({ idx })
      if (idx === -1) return
      await s3Dapp.updateDapp(appId, {
        models: [...models.slice(0, idx), ...models.slice(idx + 1)],
      })
      await loadDapps()
    },
    [appId, dapp, loadDapps, s3Dapp, session]
  )

  useEffect(() => {
    loadDapp()
  }, [loadDapp])

  console.log(dapp)

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
  removeModelFromDapp: (modelId: string) => void
  addModelToDapp: (modelId: string) => void
  models: string[]
}) {
  const { starModels } = useStarModels()
  const [selectModel, setSelectModel] = useState<ModelStream>()
  return (
    <ModelsBox>
      <ModelsListBox>
        <div>
          <div className="title">
            <h3> ModelList</h3>
            <Link to={'/models/model/create'}>
              <button>
                <Add />
              </button>
            </Link>
          </div>
          <DappModelList
            ids={models}
            selectAction={(model: ModelStream) => {
              setSelectModel(model)
            }}
            removeModelAction={(id: string) => {
              if (id === selectModel?.stream_id) {
                setSelectModel(undefined)
              }
              removeModelFromDapp(id)
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
              return (
                <div key={item.stream_id}>
                  {item.stream_content.name}
                  <button onClick={() => addModelToDapp(item.stream_id)}>
                    <Add />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </ModelsListBox>
      <div className="tabs">
        {selectModel && (
          <ModelTabs
            name={selectModel?.stream_content.name || ''}
            modelId={selectModel?.stream_id || ''}
          />
        )}
      </div>
    </ModelsBox>
  )
}

function DappModelList({
  ids,
  selectAction,
  removeModelAction,
}: {
  ids: string[]
  selectAction: (model: ModelStream) => void
  removeModelAction: (modelId: string) => void
}) {
  const [dappModels, setDappModels] = useState<ModelStream[]>()
  const { network } = useCeramicCtx()
  const [selected, setSelected] = useState<ModelStream>()

  const loadModelsInfo = useCallback(
    async (models: string[]) => {
      if (models.length === 0) {
        setDappModels([])
        return
      }
      const resp = await getStarModels({ network, ids: models })

      const list = resp.data.data
      setDappModels(list)
    },
    [network]
  )
  useEffect(() => {
    loadModelsInfo(ids)
  }, [loadModelsInfo, ids])

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
              <button
                onClick={() => {
                  removeModelAction(item.stream_id)
                }}
              >
                <Trash />
              </button>
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

  > .tabs {
    width: calc(1300px - 261px - 20px);
  }
`

const ModelsListBox = styled.div`
  padding: 20px;
  box-sizing: border-box;
  width: 261px;
  background: #1b1e23;
  border: 1px solid #39424c;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: fit-content;

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
`
