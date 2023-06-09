import { useState } from 'react'
import styled from 'styled-components'

import ModelList from '../components/ModelList'
import ModelTabs from '../components/ModelTabs'

export default function DappModelEditor() {
  const [selectModelId, setSelectModelId] = useState<string>('')
  const [selectModelName, setSelectModelName] = useState<string>('')
  // const { appId, selectedDapp } = useSelectedDapp()

  return (
    <ModelEditorContainer>
      <ModelList
        setSelectModelId={setSelectModelId}
        setSelectModelName={setSelectModelName}
      />
      <div className="ops">
        {selectModelId && (
          <ModelTabs name={selectModelName} modelId={selectModelId} />
        )}
      </div>
    </ModelEditorContainer>
  )
}

const ModelEditorContainer = styled.div`
  margin-top: 25px;
  margin-bottom: 25px;
  display: flex;
  gap: 20px;

  .ops {
    flex-grow: 1;
    overflow: hidden;
  }
`
