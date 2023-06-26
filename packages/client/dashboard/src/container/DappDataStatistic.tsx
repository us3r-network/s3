import Instance from '../components/ModelInstance'
import useSelectedDapp from '../hooks/useSelectedDapp'
import { Network } from '../components/Selector/EnumSelect'
import { useOutletContext } from 'react-router-dom'
import { DappComposite, ModelStream } from '../types'
import CompositeDefinition from '../components/CompositeDefinition'

export default function DappDataStatistic() {
  const { selectModel, selectComposite } = useOutletContext<{
    selectModel: ModelStream
    selectComposite: DappComposite
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
  if (selectComposite) {
    return (
      <div className="list">
        <CompositeDefinition composite={selectComposite} />
      </div>
    )
  }
  return null
}
