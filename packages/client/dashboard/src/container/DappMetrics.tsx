import { useOutletContext } from 'react-router-dom'
import ModelInstance from '../components/model/ModelInstance'
import useSelectedDapp from '../hooks/useSelectedDapp'
import { ModelStream, Network } from '../types.d'
import { BuildContentBox } from './DappEditor'

export default function DappMetrics () {
  const { selectModel } = useOutletContext<{
    selectModel: ModelStream
  }>()
  const { selectedDapp } = useSelectedDapp()

  if (selectModel) {
    const name = selectModel.stream_content.name
    return (
      <BuildContentBox>
        <div className='title-bar'>
          <span>{name} Streams</span>
        </div>
        <div className='content-box'>
          <ModelInstance
            streamId={selectModel.stream_id}
            network={(selectedDapp?.network as Network) || Network.TESTNET}
            schema={selectModel?.stream_content?.schema || {}}
            name={selectModel?.stream_content?.name}
          />
        </div>
      </BuildContentBox>
    )
  }
  return null
}
