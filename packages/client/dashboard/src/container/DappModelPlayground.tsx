import PlaygroundGraphiQL from '../components/Playground'
import { useOutletContext } from 'react-router-dom'
import { DappComposite, ModelStream } from '../types'
import CompositePlaygroundGraphiQL from '../components/CompositePlaygroundGraphiQL'

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
        <CompositePlaygroundGraphiQL
          definition={selectComposite.runtimeDefinition}
        />
      </div>
    )
  }
  return null
}
