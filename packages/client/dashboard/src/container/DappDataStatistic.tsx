import { useLocation, useOutletContext } from 'react-router-dom'
import CompositeDefinition from '../components/model/CompositeDefinition'
import Instance from '../components/model/ModelInstance'
import useSelectedDapp from '../hooks/useSelectedDapp'
import { DappCompositeDto, ModelStream, Network } from '../types.d'

export default function DappDataStatistic() {
  const { selectModel, selectComposite } = useOutletContext<{
    selectModel: ModelStream
    selectComposite: DappCompositeDto
  }>()
  const { selectedDapp } = useSelectedDapp()
  const location = useLocation()
  const isMetrics = location.pathname.endsWith('statistic')

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
  if (selectComposite && !isMetrics) {
    return (
      <div className="list">
        <CompositeDefinition composite={selectComposite} />
      </div>
    )
  }
  return null
}
