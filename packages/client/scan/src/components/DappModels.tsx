import styled from 'styled-components'
import { Dapp, ModelStream } from '../types'
import { useCallback, useEffect, useState } from 'react'
import { getModelStreams } from '../api'
import { useCeramicCtx } from '../context/CeramicCtx'
import DappModelInstance from './DappModelInstance'

export default function DappModels({
  models,
  modelsDetail,
}: {
  models: Dapp['models']
  modelsDetail: Dapp['modelDetals']
}) {
  const [selected, setSelected] = useState<ModelStream>()
  const [modelStreams, setModelStreams] = useState<ModelStream[]>([])
  const { network } = useCeramicCtx()
  const loadModelStreams = useCallback(async () => {
    try {
      const resp = await getModelStreams({ ids: models, network })
      const modelStreams = resp.data.data
      setModelStreams(modelStreams)
      if (modelStreams.length > 0) setSelected(resp.data.data[0])
    } catch (error) {}
  }, [models, network])

  useEffect(() => {
    loadModelStreams()
  }, [loadModelStreams])
  return (
    <DappInfoContainer>
      <ListBox>
        <div className="title">
          <h3>Models List ({models.length})</h3>
        </div>
        <DappModelList
          modelStreams={modelStreams || []}
          {...{ selected, setSelected }}
        />
      </ListBox>
      <DappModelInstance modelId={selected?.stream_id || ''} />
    </DappInfoContainer>
  )
}

function DappModelList({
  selected,
  setSelected,
  modelStreams,
}: {
  modelStreams: ModelStream[]
  selected?: ModelStream
  setSelected: (ms: ModelStream) => void
}) {
  if (modelStreams.length === 0) {
    return (
      <DappModelsListBox>
        <p>There is no model in this dapp.</p>
      </DappModelsListBox>
    )
  }
  return (
    <DappModelsListBox>
      {modelStreams?.map((item) => {
        const active = selected?.stream_id === item.stream_id
        return (
          <div key={item.stream_id} className={active ? 'active' : ''}>
            <div
              className="title"
              onClick={() => {
                setSelected(item)
              }}
            >
              <div>{item.stream_content.name}</div>
            </div>
            {active && (
              <>
                <hr />
                <div className="id-copy">
                  {/* <p>ID: {shortPubKey(selected.stream_id, { len: 7 })}</p>
                    <div>
                      <CopyTint data={selected.stream_id} />
                    </div> */}
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

const DappInfoContainer = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 20px;
  > div:first-child {
    padding: 20px;
    border-radius: 20px;
    border: 1px solid #39424c;
    background: var(--1-b-1-e-23, #1b1e23);
    &:first-child {
      width: 261px;
    }
    &:last-child {
      flex-grow: 1;
    }
  }
  > div:last-child {
    flex-grow: 1;
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
