import { useEffect, useState } from 'react'
import styled from 'styled-components'
import FileSaver from 'file-saver'
import { GraphQLEditor, PassedSchema } from 'graphql-editor'
import { DappComposite } from '../types'
import { schemas } from '../utils/composedb-types/schemas'

export default function CompositeDefinition({
  composite,
}: {
  composite: DappComposite
}) {
  const [gqlSchema, setGqlSchema] = useState<PassedSchema>({
    code: composite.graphql,
    libraries: schemas.library,
  })

  useEffect(() => {
    setGqlSchema({
      code: composite.graphql,
      libraries: schemas.library,
    })
  }, [composite])

  const download = (text: string, filename: string) => {
    const blob = new Blob([text], {
      type: 'text/plain;charset=utf-8',
    })

    FileSaver.saveAs(blob, filename)
  }

  return (
    <DefinitionBox>
      <div className="title">
        <span>{composite.name}</span>
      </div>
      <EditorBox>
        <GraphQLEditor
          setSchema={(props) => {
            setGqlSchema(props)
          }}
          schema={gqlSchema}
        />
      </EditorBox>
      <ResultBox>
        {composite.composite && (
          <div>
            <div className="title">
              <h3>Model's composite</h3>
              <button
                onClick={() => {
                  download(composite.composite, 'composite.json')
                }}
              >
                Download
              </button>
            </div>
            <div className="result-text">
              <pre>
                <code>
                  {JSON.stringify(JSON.parse(composite.composite), null, 2)}
                </code>
              </pre>
            </div>
          </div>
        )}
        {composite.runtimeDefinition && (
          <div>
            <div className="title">
              <h3>Model's runtime definition</h3>
              <button
                onClick={() => {
                  download(
                    `// This is an auto-generated file, do not edit manually
  export const definition = ${composite.runtimeDefinition}`,
                    'runtime-composite.js'
                  )
                }}
              >
                Download
              </button>
            </div>
            <div className="result-text">
              <pre>
                <code>
                  {JSON.stringify(
                    JSON.parse(composite.runtimeDefinition),
                    null,
                    2
                  )}
                </code>
              </pre>
            </div>
          </div>
        )}
      </ResultBox>
    </DefinitionBox>
  )
}

const DefinitionBox = styled.div`
  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #14171a;
    margin-bottom: 20px;

    > span {
      font-style: italic;
      font-weight: 700;
      font-size: 24px;
      line-height: 28px;
      color: #ffffff;
    }
  }
`

const EditorBox = styled.div`
  height: calc(100vh - 300px);
  max-height: 800px;
  background: #14171a;
  border: 1px solid #39424c;
  border-radius: 20px;
  overflow: hidden;
  width: inherit;
  * {
    box-sizing: border-box;
  }
`

const ResultBox = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  > div {
    background: #1b1e23;
    border: 1px solid #39424c;
    border-radius: 20px;
    overflow: hidden;
  }
  div {
    margin: 20px 0px;
    padding: 10px;
    box-sizing: border-box;
    background-color: #1a1a1c;
    .title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 0;
      font-weight: 700;
      font-size: 24px;
      line-height: 28px;
      font-style: italic;
      color: #ffffff;

      button {
        background: #ffffff;
      }

      h3 {
        margin: 0;
        padding: 0;
        font-weight: 700;
        font-size: 20px;
        line-height: 24px;
      }
    }
  }
  .result-text {
    word-wrap: break-word;
    color: #718096;
    overflow: scroll;
    width: 100%;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    /* width: 100px; */
    padding: 0 15px;
    height: 36px;

    border-radius: 100px;
    background: #14171a;
    font-size: 14px;
    line-height: 20px;
    text-align: center;
    font-weight: 400;
    color: #a0aec0;
    text-transform: capitalize;
    background: #718096;
    font-weight: 500;
    color: #14171a;
  }
`
