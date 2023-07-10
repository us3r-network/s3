import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import Prism from 'prismjs'
import FileSaver from 'file-saver'
import { GraphQLEditor, PassedSchema } from 'graphql-editor'
import { getModelInfo, queryModelGraphql } from '../../api'
import { ModeQueryResult, ModelStream } from '../../types'
import { schemas } from '../../utils/composedb-types/schemas'
import { AxiosError } from 'axios'
import { useCeramicCtx } from '../../context/CeramicCtx'

import 'prismjs/components/prism-typescript'
import 'prismjs/plugins/line-numbers/prism-line-numbers.js'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'

export default function Definition() {
  const { streamId } = useParams()
  const { network } = useCeramicCtx()
  const [modelData, setModelData] = useState<ModeQueryResult>()
  const [gqlSchema, setGqlSchema] = useState<PassedSchema>({
    code: schemas.code,
    libraries: schemas.library,
  })
  const [errMsg, setErrMsg] = useState('')
  const [modelStream, setModelStream] = useState<ModelStream>()

  const [loading, setLoading] = useState(false)

  const fetchModelInfo = useCallback(
    async (streamId: string) => {
      const resp = await getModelInfo({ network, id: streamId })
      setModelStream(resp.data.data)
    },
    [network]
  )

  const fetchModelGraphql = useCallback(
    async (streamId: string) => {
      try {
        setLoading(true)
        setErrMsg('')
        const resp = await queryModelGraphql(streamId, network)
        const { data } = resp.data
        setModelData(data)
        if (data.graphqlSchemaDefinition) {
          setGqlSchema({
            code: data.graphqlSchemaDefinition,
            libraries: schemas.library,
          })
        } else {
          setGqlSchema({
            code: data.graphqlSchema,
          })
        }
      } catch (error) {
        const err = error as AxiosError
        setErrMsg((err.response?.data as any).message || err.message)
      } finally {
        setLoading(false)
      }
    },
    [network]
  )

  const download = (text: string, filename: string) => {
    const blob = new Blob([text], {
      type: 'text/plain;charset=utf-8',
    })

    FileSaver.saveAs(blob, filename)
  }

  useEffect(() => {
    if (!streamId) return
    fetchModelGraphql(streamId)
    fetchModelInfo(streamId)
  }, [fetchModelGraphql, streamId, fetchModelInfo])

  if (loading) {
    return (
      <div>
        <Loading>Loading...</Loading>
      </div>
    )
  }

  if (errMsg) {
    return (
      <div>
        <div className="title-box" />
        <Loading>{errMsg}</Loading>
      </div>
    )
  }

  return (
    <div>
      <EditorBox>
        <GraphQLEditor
          setSchema={(props) => {
            setGqlSchema(props)
          }}
          schema={gqlSchema}
        />
      </EditorBox>
      <ResultBox>
        {modelData?.composite && (
          <div>
            <div className="title">
              <h3>Model's composite</h3>
              <button
                onClick={() => {
                  download(
                    JSON.stringify(modelData.composite),
                    'composite.json'
                  )
                }}
              >
                Download
              </button>
            </div>
            <div className="result-text">
              <Code
                name="composite"
                content={JSON.stringify(modelData.composite, null, 2)}
              />
            </div>
          </div>
        )}
        {modelData?.runtimeDefinition && (
          <div>
            <div className="title">
              <h3>Model's runtime definition</h3>
              <button
                onClick={() => {
                  download(
                    `// This is an auto-generated file, do not edit manually
  export const definition = ${JSON.stringify(modelData.runtimeDefinition)}`,
                    'runtime-composite.js'
                  )
                }}
              >
                Download
              </button>
            </div>
            <div className="result-text">
              <Code
                name="runtimeDefinition"
                content={JSON.stringify(modelData.runtimeDefinition, null, 2)}
              />
            </div>
          </div>
        )}
      </ResultBox>
    </div>
  )
}

export function Code({ name, content }: { name: string; content: string }) {
  useEffect(() => {
    Prism.highlightAll()
  }, [content])

  const preCode = `<pre class="line-numbers"><code class="language-typescript">${content}</code></pre>`
  return (
    <CodeBox>
      <div
        className="line-numbers"
        dangerouslySetInnerHTML={{ __html: preCode }}
      ></div>
    </CodeBox>
  )
}

const CodeBox = styled.div`
  > .name {
    border-bottom: none;
    display: inline-block;
    padding: 10px 20px;
  }
  > .line-numbers {
    overflow: scroll;
    /* margin-bottom: 20px; */
  }
`

const EditorBox = styled.div`
  height: calc(100vh - 300px);
  max-height: 800px;
  background: #14171a;
  border: 1px solid #39424c;
  border-radius: 20px;
  overflow: hidden;

  * {
    box-sizing: border-box;
  }
`

const ResultBox = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  width: 100%;
  > div {
    background: #1b1e23;
    border: 1px solid #39424c;
    border-radius: 20px;
  }
  > div {
    width: calc(50% - 10px);
    margin: 20px 0px;
    /* padding: 10px; */
    box-sizing: border-box;
    background-color: #1a1a1c;
    .title {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 0;
      font-weight: 700;
      font-size: 24px;
      line-height: 28px;
      font-style: italic;
      color: #ffffff;
      padding: 10px;
      box-sizing: border-box;
      button {
        background: #ffffff;
      }

      h3 {
        margin: 0;
        padding: 0;
      }
    }
  }
  .result-text {
    word-wrap: break-word;
    color: #718096;
    overflow: scroll;
    width: 100%;
    margin-top: 0;
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

const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: gray;
`
