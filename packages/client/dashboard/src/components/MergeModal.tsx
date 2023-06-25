import { useCallback, useState } from 'react'
import { CheckboxGroup, Checkbox, Label } from 'react-aria-components'
import { Composite } from '@composedb/devtools'
import { CERAMIC_MAINNET_HOST, CERAMIC_TESTNET_HOST } from '../constants'
import { queryModelGraphql } from '../api'
import useSelectedDapp from '../hooks/useSelectedDapp'
import { Network } from './Selector/EnumSelect'
import { ClientDApp, DappComposite, ModelStream } from '../types'
import styled from 'styled-components'
import FileSaver from 'file-saver'
import { CeramicClient } from '@ceramicnetwork/http-client'
import type { EncodedCompositeDefinition } from '@composedb/types'

export default function MergeModal({
  closeModal,
  dappModels,
  composites,
}: {
  closeModal: () => void
  dappModels: ModelStream[]
  composites: DappComposite[]
}) {
  const [loading, setLoading] = useState(false)
  const { selectedDapp } = useSelectedDapp()
  const [models, setModels] = useState<string[]>([])
  const [selectComposites, setSelectComposites] = useState<string[]>([])

  const download = (text: string, filename: string) => {
    const blob = new Blob([text], {
      type: 'text/plain;charset=utf-8',
    })

    FileSaver.saveAs(blob, filename)
  }

  const mergeModelAction = useCallback(
    async (selectedDapp: ClientDApp, models: string[]) => {
      try {
        setLoading(true)
        const ceramicHost =
          selectedDapp.network === Network.MAINNET
            ? CERAMIC_MAINNET_HOST
            : CERAMIC_TESTNET_HOST

        const respData = models.map(async (modelId) => {
          const resp = await queryModelGraphql(
            [modelId],
            selectedDapp.network as Network
          )
          return resp
        })

        const data = await Promise.all(respData)
        const composites = data.map(async (resp) => {
          return await Composite.fromJSON({
            ceramic: new CeramicClient(ceramicHost) as any,
            definition: resp.data.data.composite as EncodedCompositeDefinition,
          })
        })
        const sourceComposites = await Promise.all(composites)
        const mergedComposite = Composite.from(sourceComposites)
        download(JSON.stringify(mergedComposite.toRuntime()), 'merged.json')
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const mergeAction = useCallback(async () => {
    if (!selectedDapp || !selectedDapp.models) return
    const ceramicHost =
      selectedDapp.network === Network.MAINNET
        ? CERAMIC_MAINNET_HOST
        : CERAMIC_TESTNET_HOST
    if (models.length > 0) {
      mergeModelAction(selectedDapp, models)
    } else if (selectComposites.length > 0) {
      const data = selectComposites
        .map((compositeId) => {
          return composites.find((item) => item.id + '' === compositeId)
        })
        .filter((item): item is DappComposite => !!item)

      const compositeData = data.map(async (item) => {
        return await Composite.fromJSON({
          ceramic: new CeramicClient(ceramicHost) as any,
          definition: JSON.parse(item.composite) as EncodedCompositeDefinition,
        })
      })
      const sourceComposites = await Promise.all(compositeData)
      const mergedComposite = Composite.from(sourceComposites)
      download(JSON.stringify(mergedComposite.toRuntime()), 'merged.json')
    }
  }, [models, composites, selectedDapp, selectComposites, mergeModelAction])

  return (
    <MergeModalBox>
      <div className="title">
        <h3>Download and merge multiple models or composites in one file</h3>
      </div>
      <div>
        <CheckboxGroup
          value={models}
          onChange={(v) => {
            setSelectComposites([])
            setModels(v)
          }}
        >
          {(dappModels.length === 0 && (
            <p>This Dapp has no model available to be merged.</p>
          )) || (
            <>
              <Label>Models:</Label>
              <div className="merge-items">
                {dappModels.map((item) => {
                  return (
                    <Checkbox value={item.stream_id} key={item.stream_id}>
                      <div className="checkbox" aria-hidden="true">
                        <svg viewBox="0 0 18 18">
                          <polyline points="1 9 7 14 15 4" />
                        </svg>
                      </div>
                      {item.stream_content.name}
                    </Checkbox>
                  )
                })}
              </div>
            </>
          )}
        </CheckboxGroup>
      </div>

      <div>
        <CheckboxGroup
          value={selectComposites}
          onChange={(v) => {
            setModels([])
            setSelectComposites(v)
          }}
        >
          {(composites.length === 0 && (
            <p>This Dapp has no composite available to be merged.</p>
          )) || (
            <>
              <Label>Composites:</Label>
              <div className="merge-items">
                {composites.map((item) => {
                  return (
                    <Checkbox value={item.id + ''} key={item.id}>
                      <div className="checkbox" aria-hidden="true">
                        <svg viewBox="0 0 18 18">
                          <polyline points="1 9 7 14 15 4" />
                        </svg>
                      </div>
                      {item.name}
                    </Checkbox>
                  )
                })}
              </div>
            </>
          )}
        </CheckboxGroup>
      </div>

      <div className="btns">
        <button onClick={closeModal}>Cancel</button>
        {dappModels.length !== 0 && (
          <>
            {loading ? (
              <button className="merge">
                <img src="/loading.gif" alt="loading" />
              </button>
            ) : (
              <button onClick={mergeAction} className="merge">
                Merge
              </button>
            )}
          </>
        )}
      </div>
    </MergeModalBox>
  )
}

const MergeModalBox = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 40px;

  position: relative;
  width: 532px;
  box-sizing: border-box;
  margin: 0 auto;

  background: #1b1e23;
  border-radius: 20px;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #fff;

  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 {
      margin: 0;
      font-weight: 500;
      font-size: 16px;
      line-height: 19px;
    }
  }

  > .btns {
    display: flex;
    align-items: center;
    justify-content: end;
    gap: 20px;

    button {
      color: #fff;
      padding: 12px 24px;

      height: 48px;
      width: 160px;

      background: #1a1e23;
      border: 1px solid #39424c;
      border-radius: 12px;
      cursor: pointer;
      color: #718096;
      font-weight: 600;
      font-size: 16px;
      line-height: 24px;

      &.merge {
        background: #ffffff;
        color: #14171a;
      }

      > img {
        width: 24px;
      }
    }
  }
`
