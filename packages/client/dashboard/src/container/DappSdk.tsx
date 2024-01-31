import { useOutletContext } from 'react-router-dom'
import ModelSDK from '../components/model/ModelSDK'
import { DappCompositeDto, ModelStream } from '../types'
import { BuildContentBox } from './DappEditor'

export default function DappSdk () {
  const { selectModel } = useOutletContext<{
    selectModel: ModelStream
    selectComposite: DappCompositeDto
  }>()

  if (selectModel) {
    const name = selectModel.stream_content.name
    const modelId = selectModel.stream_id

    return (
      <BuildContentBox>
        <div className='title-bar'>
          <span>{name} SDK</span>
        </div>
        <div className='content-box'>
          <ModelSDK modelId={modelId} modelName={name} />
        </div>
      </BuildContentBox>
    )
  }

  return null
}
