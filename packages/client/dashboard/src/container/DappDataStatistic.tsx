import Instance from '../components/ModelInstance'
import useSelectedDapp from '../hooks/useSelectedDapp'
import { Network } from '../components/Selector/EnumSelect'
import { useOutletContext } from 'react-router-dom'

export default function DappDataStatistic() {
  const { selectModelId } = useOutletContext<{ selectModelId: string }>()
  const { selectedDapp } = useSelectedDapp()
  return (
    <>
      {selectModelId && (
        <div className="list">
          <Instance
            streamId={selectModelId}
            network={(selectedDapp?.network as Network) || Network.TESTNET}
          />
        </div>
      )}
    </>
  )
}
