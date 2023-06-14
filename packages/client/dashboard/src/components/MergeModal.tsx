import { useCallback, useState } from 'react'
import { CheckboxGroup, Checkbox, Label } from 'react-aria-components'

import { getStarModels, queryModelGraphql } from '../api'
import useSelectedDapp from '../hooks/useSelectedDapp'
import { Network } from './Selector/EnumSelect'
import CloseIcon from './Icons/CloseIcon'
import { ModelStream } from '../types'
import styled from 'styled-components'

export default function MergeModal({
  closeModal,
  dappModels,
}: {
  closeModal: () => void
  dappModels: ModelStream[]
}) {
  const { selectedDapp } = useSelectedDapp()
  const [models, setModels] = useState<string[]>([])
  const mergeModelAction = useCallback(async () => {
    if (!selectedDapp || !selectedDapp.models) return
    const resp = await queryModelGraphql(
      models,
      selectedDapp.network as Network
    )
    console.log(resp.data.data)
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
        <button onClick={mergeModelAction}>Merge</button>
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
      &.del {
        cursor: pointer;
        background: #aa4f4f;

        > img {
          width: 24px;
        }
      }
    }
  }
`
