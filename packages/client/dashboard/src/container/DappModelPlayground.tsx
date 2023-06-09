import styled from 'styled-components'
import ModelList from '../components/ModelList'
import PlaygroundGraphiQL from '../components/Playground'
import { useState } from 'react'

export default function DappModelPlayground() {
  const [selectModelId, setSelectModelId] = useState<string>('')
  return (
    <ModelPlaygroundContainer>
      <ModelList setSelectModelId={setSelectModelId} />
      {selectModelId && (
        <div className="ops">
          <PlaygroundGraphiQL streamId={selectModelId} />
        </div>
      )}
    </ModelPlaygroundContainer>
  )
}

const ModelPlaygroundContainer = styled.div`
  margin-top: 25px;
  margin-bottom: 25px;
  display: flex;
  gap: 20px;
  height: calc(100% - 50px);

  .ops {
    flex-grow: 1;
    overflow: hidden;

    > div {
      height: calc(100vh - 100px);
    }
    .graphiql-container {
      height: 100%;
    }
  }
`
