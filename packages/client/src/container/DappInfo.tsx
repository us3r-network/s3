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

  useEffect(() => {
    loadDapp()
  }, [loadDapp])

  return (
    <div>
      <BasicInfo dapp={dapp} />
      <DappModels
        models={dapp?.models || []}
        addModelToDapp={(modelId) => {
          addModelToDapp(modelId)
        }}
      />
    </div>
  )
}

function DappModels({
  addModelToDapp,
  models,
}: {
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
            {/* TODO */}
            <button>
              <Add />
            </button>
          </div>
          <DappModelList ids={models} selectAction={(model: ModelStream) => {
            setSelectModel(model)
          }}/>
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
      <div>model name {selectModel?.stream_content.name}</div>
    </ModelsBox>
  )
}

function DappModelList({ ids, selectAction }: { ids: string[], selectAction: (model: ModelStream) => void }) {
  const [dappModels, setDappModels] = useState<ModelStream[]>()
  const { network } = useCeramicCtx()

  const loadModelsInfo = useCallback(
    async (models: string[]) => {
      if (models.length === 0) return
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
        return (
          <div key={item.stream_id} >
            <div onClick={() => {
              selectAction(item)
            }}>
            {item.stream_content.name}
            </div>
            <button>
              <Trash />
            </button>
          </div>
        )
      })}
    </DappModelsListBox>
  )
}

const DappModelsListBox = styled.div`
  margin-top: 20px;
  > div {
    > div {
      cursor: pointer;
    }
    
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
`

const ModelsBox = styled.div`
  display: flex;
  gap: 20px;
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

    background: #718096;
    border-radius: 12px;

    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: #14171a;
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
