import { useCallback, useState } from 'react'

import styled from 'styled-components'
import FileSaver from 'file-saver'
import { GraphQLGqlEditor, PassedSchema } from 'graphql-editor'
import { schemas } from '../utils/composedb-types/schemas'
import { createModel } from '../api'
import { AxiosError } from 'axios'
import { useCeramicCtx } from '../context/CeramicCtx'
import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { useSearchParams } from 'react-router-dom'

export default function ModelCreate() {
  const { network, s3ModelCollection, dapps, s3Dapp, loadDapps } =
    useCeramicCtx()
  const session = useSession()
  const [searchParams] = useSearchParams()
  const [composite, setComposite] = useState('')
  const [runtimeDefinition, setRuntimeDefinition] = useState('')
  const [gqlSchema, setGqlSchema] = useState<PassedSchema>({
    code: schemas.code,
    libraries: schemas.library,
  })
  const [gql, setGql] = useState(schemas.code)

  const [submitting, setSubmitting] = useState(false)
  const [createNew, setCreateNew] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  const resetState = () => {
    setErrMsg('')
    setCreateNew(false)
    setRuntimeDefinition('')
    setComposite('')
    setGqlSchema({
      code: schemas.code,
      libraries: schemas.library,
    })
    setGql(schemas.code)
  }

  const actionAfterCreate = useCallback(
    async (modelId: string) => {
      try {
        // add to collection
        if (modelId && session) {
          s3ModelCollection.authComposeClient(session)
          await s3ModelCollection.createCollection({
            modelID: modelId,
            revoke: false,
          })
        }

        // add to dappModels
        const dappId = searchParams.get('dappId')
        if (dappId && session) {
          s3Dapp.authComposeClient(session)
          const dapp = dapps
            ?.filter((item) => item.node)
            .find((item) => item.node.id === dappId)

          const models = dapp?.node?.models || []
          console.log({ dappId, dapp })
          if (dapp && models.indexOf(modelId) === -1) {
            models.push(modelId)
            await s3Dapp.updateDapp(dappId, {
              models,
            })
            await loadDapps()
          }
        }
      } catch (error) {
        console.error(error)
      }
    },
    [dapps, loadDapps, s3Dapp, s3ModelCollection, searchParams, session]
  )

  const submit = useCallback(async () => {
    setErrMsg('')
    if (!gql) return
    console.log({gql})
    try {
      setSubmitting(true)
      const resp = await createModel(gql, network)
      const { composite, runtimeDefinition } = resp.data.data
      const modelsId = Object.keys(composite.models)
      const modelId = modelsId[0]
      modelId && actionAfterCreate(modelId)

      setComposite(JSON.stringify(composite))
      setRuntimeDefinition(JSON.stringify(runtimeDefinition))
      setCreateNew(true)
    } catch (error) {
      const err = error as AxiosError
      setErrMsg((err.response?.data as any).message || err.message)
    } finally {
      setSubmitting(false)
    }
  }, [gql, network, actionAfterCreate])

  const download = (text: string, filename: string) => {
    console.log(text)
    const blob = new Blob([text], {
      type: 'text/plain;charset=utf-8',
    })

    FileSaver.saveAs(blob, filename)
  }

  let status = (
    <button
      onClick={() => {
        submit()
      }}
    >
      submit
    </button>
  )
  if (submitting) {
    status = (
      <div className="loading">
        <img src="/loading.gif" title="loading" alt="" />{' '}
        <span>submitting</span>
      </div>
    )
  }

  if (createNew) {
    status = (
      <button
        onClick={() => {
          resetState()
        }}
      >
        New Model
      </button>
    )
  }

  return (
    <PageBox>
      <div className="title-box">
        <div className="tools">{status}</div>
      </div>
      {errMsg && <div className="err-msg">{errMsg}</div>}
      <EditorBox>
        <GraphQLGqlEditor
          schema={gqlSchema}
          gql={gql}
          setGql={(gqlString) => setGql(gqlString)}
        />
      </EditorBox>
      <div className="result-box">
        {composite && (
          <div>
            <div className="title">
              <h3>Model's composite</h3>
              <button
                onClick={() => {
                  download(composite, 'my-composite.json')
                }}
              >
                Download
              </button>
            </div>
            <div className="result-text">
              <pre>
                <code>{JSON.stringify(JSON.parse(composite), null, 2)}</code>
              </pre>
            </div>
          </div>
        )}
        {runtimeDefinition && (
          <div>
            <div className="title">
              <h3>Model's runtime definition</h3>
              <button
                onClick={() => {
                  download(
                    `// This is an auto-generated file, do not edit manually
export const definition = ${runtimeDefinition}`,
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
                  {JSON.stringify(JSON.parse(runtimeDefinition), null, 2)}
                </code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </PageBox>
  )
}

const EditorBox = styled.div`
  height: calc(100vh - 300px);
  max-height: 800px;
  background: #14171a;
  border: 1px solid #39424c;
  border-radius: 20px;
  overflow: hidden;
`

const PageBox = styled.div`
  > .err {
    display: flex;
    height: 100vh;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    & .msg {
      color: darkgray;
    }
  }

  .title-box {
    display: flex;
    align-items: center;
    justify-content: end;
    padding: 10px 0px;
    box-sizing: border-box;

    .tools {
      display: flex;
      align-items: center;

      gap: 15px;

      > button {
        background: #ffffff;
      }
    }
  }
  .node-input {
    width: 50%;
  }
  .model-code {
    width: 100%;
    height: 300px;
    font-size: 14px;
    line-height: 24px;
  }

  .result-box {
    display: flex;
    flex-direction: row;
    gap: 20px;
    width: 100%;
    > div {
      background: #1b1e23;
      border: 1px solid #39424c;
      border-radius: 20px;
    }
    div {
      width: calc(50% - 10px);
      margin: 20px 0px;
      padding: 10px;
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
      width: 100%;
      word-wrap: break-word;
      color: #718096;
      overflow: scroll;
    }
  }

  .err-msg {
    padding: 15px 0 25px 0;
    color: #ef1d1d;
    font-weight: 700;
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

  .loading {
    display: flex;
    align-items: center;
    gap: 5px;
    img {
      width: 25px;
      height: 25px;
    }
  }
`
