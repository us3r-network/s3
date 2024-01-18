import { useOutletContext } from 'react-router-dom'
import styled from 'styled-components'
import ModelSDK from '../components/model/ModelSDK'
import { DappCompositeDto, ModelStream } from '../types.d'

export default function DappModelSdk() {
  const { selectModel } = useOutletContext<{
    selectModel: ModelStream
    selectComposite: DappCompositeDto
  }>()

  if (selectModel) {
    const name = selectModel.stream_content.name
    const modelId = selectModel.stream_id

    return (
      <div className="ops">
        <SDKContainer>
          <div className="dapp-title-bar">
            <span>{name}SDK</span>
          </div>
          <ModelSDK modelId={modelId} modelName={name} />
        </SDKContainer>
      </div>
    )
  }

  return null
}

const SDKContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`
