import ModelTabs from '../components/ModelTabs'
import { useOutletContext } from 'react-router-dom'

export default function DappModelEditor() {
  const { selectModelId, selectModelName } = useOutletContext<{
    selectModelId: string
    selectModelName: string
  }>()

  return (
    <div className="ops">
      {selectModelId && (
        <ModelTabs name={selectModelName} modelId={selectModelId} />
      )}
    </div>
  )
}
