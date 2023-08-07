import { useOutletContext } from 'react-router-dom'
import { DappComposite, ModelStream } from '../types'
import styled from 'styled-components'
import ModelSDK from '../components/ModelSDK'

export default function DappModelSdk() {
  const { selectModel } = useOutletContext<{
    selectModel: ModelStream
    selectComposite: DappComposite
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
