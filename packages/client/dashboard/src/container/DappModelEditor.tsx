import { useOutletContext } from 'react-router-dom'
import styled from 'styled-components'
import CompositeDefinition from '../components/model/CompositeDefinition'
import Definition from '../components/model/Definition'
import { DappCompositeDto, ModelStream } from '../types.d'

export default function DappModelEditor() {
  const { selectModel, selectComposite } = useOutletContext<{
    selectModel: ModelStream
    selectComposite: DappCompositeDto
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
