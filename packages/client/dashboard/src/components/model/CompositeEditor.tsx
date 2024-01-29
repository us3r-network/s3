import { Composite } from '@composedb/devtools'
import { GraphQLEditor, PassedSchema } from 'graphql-editor'
import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { schemas } from '../../utils/composedb-types/schemas'
import CodeDownload from './CodeDownload'

export default function CompositeEditor({
  schema,
  encodedDefinition,
}: {
  schema?: string
  encodedDefinition: string
}) {
  const [gqlSchema, setGqlSchema] = useState<PassedSchema>({
    code: schema || '',
    libraries: schemas.library,
  })

  const runtimeDefinition = useMemo(() => {
    if (!encodedDefinition) {
      return null
    }
    try {
      const composite = Composite.from(JSON.parse(encodedDefinition))
      return composite.toRuntime()
    } catch (error) {
      return null
    }
  }, [encodedDefinition])

  useEffect(() => {
    setGqlSchema({
      code: schema || '',
      libraries: schemas.library,
    })
  }, [schema])

  return (
    <Box>
      <EditorBox>
        <GraphQLEditor
          setSchema={(props) => {
            setGqlSchema(props)
          }}
          schema={gqlSchema}
        />
      </EditorBox>
      <ResultBox>
        {encodedDefinition && (
          <CodeDownload
            title="Composite"
            downloadContent={encodedDefinition}
            downloadFileName="composite.json"
            content={encodedDefinition}
          />
        )}
        {runtimeDefinition && (
          <CodeDownload
            title="Runtime Definition"
            downloadContent={`// This is an auto-generated file, do not edit manually
export const definition = ${runtimeDefinition}`}
            downloadFileName="runtime-composite.js"
            content={JSON.stringify(runtimeDefinition)}
          />
        )}
      </ResultBox>
    </Box>
  )
}

const Box = styled.div`
  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #14171a;
    margin-bottom: 20px;

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
  margin-top: 20px;
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
