import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import FileSaver from 'file-saver'
import { GraphQLEditor, PassedSchema } from 'graphql-editor'
import { getModelInfo, queryModelGraphql } from '../api'
import { ModeQueryResult, ModelStream } from '../types'
import { schemas } from '../utils/composedb-types/schemas'
import { AxiosError } from 'axios'
import { Network } from './Selector/EnumSelect'
import useSelectedDapp from '../hooks/useSelectedDapp'
import { Code } from './ModelSDK'

export default function Definition({ streamId }: { streamId: string }) {
  const [modelData, setModelData] = useState<ModeQueryResult>()
  const [gqlSchema, setGqlSchema] = useState<PassedSchema>({
    code: schemas.code,
  })
  const [errMsg, setErrMsg] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [modelStream, setModelStream] = useState<ModelStream>()
  const { selectedDapp } = useSelectedDapp()
  const [loading, setLoading] = useState(false)

  const fetchModelInfo = useCallback(
    async (streamId: string) => {
      const resp = await getModelInfo({
        network: (selectedDapp?.network as Network) || Network.TESTNET,
        id: streamId,
      })
      setModelStream(resp.data.data)
    },
    [selectedDapp]
  )

  const fetchModelGraphql = useCallback(
    async (streamId: string) => {
      try {
        setLoading(true)
        setErrMsg('')
        const resp = await queryModelGraphql(
          streamId,
          (selectedDapp?.network as Network) || Network.TESTNET
        )
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
    [selectedDapp]
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
