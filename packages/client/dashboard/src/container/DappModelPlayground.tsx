import PlaygroundGraphiQL from '../components/Playground'
import { useOutletContext } from 'react-router-dom'
import { DappComposite, ModelStream } from '../types'
import CompositeDefinition from '../components/CompositeDefinition'

export default function DappModelPlayground() {
  const { selectModel, selectComposite } = useOutletContext<{
    selectModel: ModelStream
    selectComposite: DappComposite
  }>()
  if (selectModel) {
    return (
      <div className="playground-ops">
        <PlaygroundGraphiQL streamId={selectModel.stream_id} />
      </div>
    )
  }
  if (selectComposite) {
    return (
      <div className="playground-ops">
        <CompositeDefinition composite={selectComposite} />
      </div>
    )
  }
  return null
}
