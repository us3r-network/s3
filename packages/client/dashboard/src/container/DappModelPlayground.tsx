import PlaygroundGraphiQL from '../components/Playground'
import { useOutletContext } from 'react-router-dom'

export default function DappModelPlayground() {
  const { selectModelId } = useOutletContext<{
    selectModelId: string
    selectModelName: string
  }>()
  return (
    <>
      {selectModelId && (
        <div className="playground-ops">
          <PlaygroundGraphiQL streamId={selectModelId} />
        </div>
      )}
    </>
  )
}
