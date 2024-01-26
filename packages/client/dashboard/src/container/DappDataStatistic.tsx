import { useOutletContext } from 'react-router-dom'
import Instance from '../components/model/ModelInstance'
import useSelectedDapp from '../hooks/useSelectedDapp'
import { ModelStream, Network } from '../types.d'

export default function DappDataStatistic() {
  const { selectModel } = useOutletContext<{
    selectModel: ModelStream
  }>()
  const { selectedDapp } = useSelectedDapp()

  if (selectModel) {
    return (
      <div className="list">
        <Instance
          streamId={selectModel.stream_id}
          network={(selectedDapp?.network as Network) || Network.TESTNET}
          schema={selectModel?.stream_content?.schema || {}}
          name={selectModel?.stream_content?.name}
        />
      </div>
    )
  }
  return null
}
