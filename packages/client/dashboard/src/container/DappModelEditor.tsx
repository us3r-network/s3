import ModelTabs from '../components/ModelTabs'
import { useOutletContext } from 'react-router-dom'
import { DappComposite, ModelStream } from '../types'
import CompositeDefinition from '../components/CompositeDefinition'
import styled from 'styled-components'
import ModelSDK from '../components/ModelSDK'
import Definition from '../components/Definition'

export default function DappModelEditor() {
  const { selectModel, selectComposite } = useOutletContext<{
    selectModel: ModelStream
    selectComposite: DappComposite
  }>()

  if (selectModel) {
    const name = selectModel.stream_content.name
    const modelId = selectModel.stream_id

    return (
      <div className="ops">
        <EditorContainer>
          <div className="dapp-title-bar">
            <span>{name}</span>
          </div>
          <Definition streamId={modelId} />
        </EditorContainer>
      </div>
    )
  }
  if (selectComposite) {
    return (
      <div className="ops">
        <CompositeDefinition composite={selectComposite} />
      </div>
    )
  }
  return null
}

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`
