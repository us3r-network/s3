import { useOutletContext } from 'react-router-dom'
import ModelSDK from '../components/model/ModelSDK'
import { DappCompositeDto, ModelStream } from '../types'
import { BuildContentBox } from './DappEditor'
import { useAppCtx } from '../context/AppCtx'

export default function DappSdk () {
  const { currDapp } = useAppCtx()
  const { selectModel } = useOutletContext<{
    selectModel: ModelStream
    selectComposite: DappCompositeDto
  }>()

  if (selectModel && currDapp) {
    const name = selectModel.stream_content.name
    const modelId = selectModel.stream_id

    return (
      <BuildContentBox>
        <div className='title-bar'>
          <span>{name} SDK</span>
        </div>
        <div className='content-box'>
          <ModelSDK modelId={modelId} network={currDapp?.network} modelName={name} />
        </div>
      </BuildContentBox>
    )
  }

  return null
}
