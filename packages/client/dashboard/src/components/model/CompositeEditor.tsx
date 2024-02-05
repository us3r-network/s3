import { RuntimeCompositeDefinition } from '@composedb/types'
import { GraphQLEditor, PassedSchema } from 'graphql-editor'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useCeramicNodeCtx } from '../../context/CeramicNodeCtx'
import { getRuntimeDefinitionFromEncodedComposite } from '../../utils/composeDBUtils'
import CodeDownload from './CodeDownload'

export default function CompositeEditor ({
  schema,
  library,
  encodedDefinition
}: {
  schema?: string
  library?: string
  encodedDefinition: string
}) {
  const { currCeramicNode } = useCeramicNodeCtx()
  const [gqlSchema, setGqlSchema] = useState<PassedSchema>({
    code: schema || '',
    libraries: library || ''
  })

  const [runtimeDefinition, setRuntimeDefinition] = useState<RuntimeCompositeDefinition|null>(null)

  useEffect(() => {
    if (!encodedDefinition) return
    if (!currCeramicNode?.serviceUrl) return
    getRuntimeDefinitionFromEncodedComposite(
      encodedDefinition,
      currCeramicNode?.serviceUrl
    ).then(
      (result)=>{
        setRuntimeDefinition(result)
      }
    )
  }, [currCeramicNode?.serviceUrl, encodedDefinition])


  useEffect(() => {
    setGqlSchema({
      code: schema || '',
      libraries: library || ''
    })
  }, [library, schema])

  return (
    <Box>
      <EditorBox>
        <GraphQLEditor
          setSchema={props => {
            setGqlSchema(props)
          }}
          schema={gqlSchema}
        />
      </EditorBox>
      <ResultBox>
        {encodedDefinition && (
          <CodeDownload
            title='Composite Encoded Definition'
            downloadContent={JSON.stringify(encodedDefinition)}
            downloadFileName='composite.json'
            content={JSON.stringify(encodedDefinition,null,2)}
          />
        )}
        {runtimeDefinition && (
          <CodeDownload
            title='Composite Runtime Definition'
            downloadContent={`// This is an auto-generated file, do not edit manually
export const definition = ${JSON.stringify(runtimeDefinition)}`}
            downloadFileName='runtime-composite.js'
            content={JSON.stringify(runtimeDefinition,null,2)}
          />
        )}
      </ResultBox>
    </Box>
  )
}

const Box = styled.div`
  height: 100%;
  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #14171a;
    margin-bottom: 20px;
    height: 100%;
    > div {
      display: flex;
      align-items: center;
    }

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
  height: 100%;
  background: #14171a;
  border: 1px solid #39424c;
  border-radius: 20px;
  overflow: hidden;
  width: inherit;
  * {
    box-sizing: border-box;
  }
  flex: 1;
`

const ResultBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
  flex: 0 0 100px;
  > div {
    background: #1b1e23;
    border: 1px solid #39424c;
    border-radius: 20px;
    overflow: hidden;
  }
  div {
    box-sizing: border-box;
    background-color: #1a1a1c;
    .title {
      padding: 10px;
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
        background: inherit;
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

    > div {
      width: fit-content;
    }
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
