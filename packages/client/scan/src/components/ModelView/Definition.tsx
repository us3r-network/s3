import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import FileSaver from 'file-saver'
import { GraphQLEditor, PassedSchema } from 'graphql-editor'
import { getModelInfo, queryModelGraphql } from '../../api'
import { ModeQueryResult, ModelStream } from '../../types'
import { schemas } from '../../utils/composedb-types/schemas'
import { AxiosError } from 'axios'
import { useCeramicCtx } from '../../context/CeramicCtx'
import CodeDownload from '../CodeDownload'
import { UserAvatar } from '@us3r-network/profile'
import dayjs from 'dayjs'
import { shortPubKey } from '../../utils/shortPubKey'
import { ImgOrName } from '../ImgOrName'

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
        <Info modelStream={modelStream} />
        {modelData?.composite && (
          <CodeDownload
            title="Composite"
            downloadContent={JSON.stringify(modelData.composite)}
            downloadFileName={'composite.json'}
            content={JSON.stringify(modelData.composite, null, 2)}
          />
        )}
        {modelData?.runtimeDefinition && (
          <CodeDownload
            title={'Runtime Definition'}
            downloadFileName={'runtime-composite.js'}
            downloadContent={`// This is an auto-generated file, do not edit manually
export const definition = ${JSON.stringify(modelData.runtimeDefinition)}`}
            content={JSON.stringify(modelData.runtimeDefinition, null, 2)}
          />
        )}
      </ResultBox>
    </div>
  )
}

function Info({ modelStream }: { modelStream: ModelStream | undefined }) {
  return (
    <InfoBox>
      <div className="title">
        <div>
          <h3>Model‘s Information</h3>
        </div>
        <button></button>
      </div>
      {modelStream && (
        <div className="info">
          <div>
            <span>Model name:</span>
            {modelStream.streamContent.name}
          </div>
          <div>
            <span>Description:</span>
            {modelStream.streamContent.description || ''}
          </div>
          <div>
            <span>Model ID:</span>
            {shortPubKey(modelStream.streamId, { len: 10 })}
          </div>
          <div>
            <span>Usage count:</span>
            {modelStream.useCount || 0}
          </div>
          <div>
            <span>Creator:</span>
            <div className="avatar">
              <UserAvatar did={modelStream.controllerDid} />
              <span>{shortPubKey(modelStream.controllerDid, { len: 10 })}</span>
            </div>
          </div>
          <div>
            <span>Release date:</span>
            {dayjs(modelStream.createdAt).format('YYYY-MM-DD')}
          </div>
          <div>
            <span>Dapps:</span>
            {modelStream.dapps && <Dapps dapps={modelStream.dapps} />}
          </div>
        </div>
      )}
    </InfoBox>
  )
}

function Dapps({
  dapps,
}: {
  dapps: Array<{ name: string; description: string; icon: string }>
}) {
  return (
    <>
      {[...dapps].map((item, idx) => {
        return (
          <div key={item.name} className="dapp">
            <ImgOrName name={item.name} imgUrl={item.icon} />
            {item.name}
          </div>
        )
      })}
    </>
  )
}

const InfoBox = styled.div`
  box-sizing: border-box;
  background-color: #1a1a1c;
  height: fit-content;
  overflow: hidden;
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

    h3 {
      margin: 0;
      padding: 0;
      font-weight: 700;
      font-size: 20px;
      line-height: 24px;
    }
  }

  .info {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    > div {
      word-wrap: break-word;
      > span {
        margin-right: 5px;
        color: #718096;
      }
    }

    .avatar {
      display: flex;
      margin-top: 5px;
      align-items: center;
      gap: 5px;
    }
  }

  .dapp {
    margin-top: 10px;
    display: flex;
    gap: 10px;
    align-items: center;
    > span {
      color: #fff;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid #718096;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      &.name {
        font-size: 20px;
        font-weight: 500;
      }
      &.left {
        border: none;
        color: #fff;
        justify-content: start;
        font-family: Rubik;
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
      }
      > img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        flex-shrink: 0;
        border-radius: 50%;
      }
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
    flex-shrink: 0;
  }
  > div {
    width: calc(33% - 8px);
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
        background: inherit;
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
