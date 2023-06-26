import ModelTabs from '../components/ModelTabs'
import { useOutletContext } from 'react-router-dom'
import { DappComposite, ModelStream } from '../types'
import CompositeDefinition from '../components/CompositeDefinition'

export default function DappModelEditor() {
  const { selectModel, selectComposite } = useOutletContext<{
    selectModel: ModelStream
    selectComposite: DappComposite
  }>()

  if (selectModel) {
    return (
      <div className="ops">
        <ModelTabs
          name={selectModel.stream_content.name}
          modelId={selectModel.stream_id}
        />
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
