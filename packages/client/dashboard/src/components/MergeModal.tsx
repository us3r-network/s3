import { useCallback, useState } from 'react'
import { CheckboxGroup, Checkbox, Label } from 'react-aria-components'
import { Composite } from '@composedb/devtools'
// import { CeramicApi } from '@ceramicnetwork/common'
import { CERAMIC_MAINNET_HOST, CERAMIC_TESTNET_HOST } from '../constants'
import { queryModelGraphql } from '../api'
import useSelectedDapp from '../hooks/useSelectedDapp'
import { Network } from './Selector/EnumSelect'
import CloseIcon from './Icons/CloseIcon'
import { ModelStream } from '../types'
import styled from 'styled-components'
import FileSaver from 'file-saver'
import { CeramicClient } from '@ceramicnetwork/http-client'
import type { EncodedCompositeDefinition, RuntimeCompositeDefinition } from '@composedb/types'

export default function MergeModal({
  closeModal,
  dappModels,
}: {
  closeModal: () => void
  dappModels: ModelStream[]
}) {
  const [loading, setLoading] = useState(false)
  const { selectedDapp } = useSelectedDapp()
  const [models, setModels] = useState<string[]>([])

  const download = (text: string, filename: string) => {
    const blob = new Blob([text], {
      type: 'text/plain;charset=utf-8',
    })

    FileSaver.saveAs(blob, filename)
  }

  const mergeModelAction = useCallback(async () => {
    if (!selectedDapp || !selectedDapp.models) return
    if (models.length === 0) return
    try {
      setLoading(true)
      const ceramicHost =
        selectedDapp.network === Network.MAINNET
          ? CERAMIC_MAINNET_HOST
          : CERAMIC_TESTNET_HOST

      const resps = models.map(async (modelId) => {
        const resp = await queryModelGraphql(
          [modelId],
          selectedDapp.network as Network
        )
        return resp
      })

      const data = await Promise.all(resps)
      const composites = data.map(async (resp) => {
        console.log(resp.data.data.runtimeDefinition)
        return await Composite.fromJSON({
          ceramic: new CeramicClient(ceramicHost) as any,
          definition: resp.data.data.composite as EncodedCompositeDefinition,
        })
      })
      const sourceComposites = await Promise.all(composites)
      console.log(sourceComposites)
      const mergedComposite = Composite.from(sourceComposites)
      console.log('mergedComposite: ',mergedComposite)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
      // closeModal()
    }
  }, [models, selectedDapp])

  return (
    <MergeModalBox>
      <div className="title">
        <h3>Merge</h3>
        <button onClick={closeModal}>
          <CloseIcon />
        </button>
      </div>
      <div>
        <CheckboxGroup
          onChange={(v) => {
            setModels(v)
          }}
        >
          <Label>Models</Label>
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
        </CheckboxGroup>
      </div>

      <div className="btns">
        <button onClick={closeModal}>Cancel</button>
        {loading ? (
          <button>
            <img src="/loading.gif" alt="loading" />
          </button>
        ) : (
          <button onClick={mergeModelAction}>Merge</button>
        )}
      </div>
    </MergeModalBox>
  )
}

const MergeModalBox = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;

  position: relative;
  width: 400px;
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

      background: #14171a;
      border-radius: 24px;
      cursor: pointer;
      color: #ffffff;
      font-weight: 500;
      font-size: 16px;
      line-height: 24px;

      > img {
        width: 24px;
      }
    }
  }
`
