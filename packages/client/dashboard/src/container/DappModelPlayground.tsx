import { useOutletContext } from 'react-router-dom'
import CompositePlaygroundGraphiQL from '../components/model/CompositePlaygroundGraphiQL'
import PlaygroundGraphiQL from '../components/model/Playground'
import { useCeramicNodeCtx } from '../context/CeramicNodeCtx'
import { DappComposite, ModelStream } from '../types.d'

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
