import styled from 'styled-components'
import ModelList from '../components/ModelList'
import { useState } from 'react'
import Instance from '../components/ModelInstance'
import useSelectedDapp from '../hooks/useSelectedDapp'
import { Network } from '../components/Selector/EnumSelect'

export default function DappDataStatistic() {
  const [selectModelId, setSelectModelId] = useState<string>('')
  const { selectedDapp } = useSelectedDapp()
  return (
    <StatisticContainer>
      <ModelList setSelectModelId={setSelectModelId} />
      {selectModelId && (
        <div className="list">
          <Instance
            streamId={selectModelId}
            network={(selectedDapp?.network as Network) || Network.TESTNET}
          />
        </div>
      )}
    </StatisticContainer>
  )
}

const StatisticContainer = styled.div`
  margin-top: 25px;
  margin-bottom: 25px;
  display: flex;
  gap: 20px;

  > .list {
    flex-grow: 1;
  }
`
