import PlaygroundGraphiQL from '../components/Playground'
import { useOutletContext } from 'react-router-dom'
import { DappComposite, ModelStream } from '../types'
import CompositePlaygroundGraphiQL from '../components/CompositePlaygroundGraphiQL'
import { useCeramicNodeCtx } from '../context/CeramicNodeCtx'

export default function DappModelPlayground () {
  const { selectModel, selectComposite } = useOutletContext<{
    selectModel: ModelStream
    selectComposite: DappComposite
  }>()
  const { currCeramicNode } = useCeramicNodeCtx()
  if (selectModel) {
    return (
      <div className='playground-ops'>
        <PlaygroundGraphiQL
          streamId={selectModel.stream_id}
          ceramicNodeURL={currCeramicNode?.serviceUrl+'/'}
        />
      </div>
    )
  }
  if (selectComposite) {
    return (
      <div className='playground-ops'>
        <CompositePlaygroundGraphiQL
          definition={selectComposite.runtimeDefinition}
          ceramicNodeURL={currCeramicNode?.serviceUrl+'/'}
        />
      </div>
    )
  }
  return null
}
