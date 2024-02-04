import { AxiosError } from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import styled from 'styled-components'
import { queryModelGraphql } from '../api/model'
import CompositeEditor from '../components/model/CompositeEditor'
import CompositePublish from '../components/model/CompositePublish'
import useSelectedDapp from '../hooks/useSelectedDapp'
import {
  DappCompositeDto,
  ModeQueryResult,
  ModelStream,
  Network
} from '../types.d'
import { schemas } from '../utils/composedb-types/schemas'

export default function DappEditor () {
  const { selectedDapp } = useSelectedDapp()
  const { selectModel, selectComposite } = useOutletContext<{
    selectModel: ModelStream
    selectComposite: DappCompositeDto
  }>()

  if (selectModel) {
    return (
      <BuildContentBox>
        <div className='title-bar'>
          <span>{selectModel.stream_content?.name}</span>
        </div>
        <div className='content-box'>
          <ModelEditor
            streamId={selectModel.stream_id}
            network={selectedDapp?.network}
          />
        </div>
      </BuildContentBox>
    )
  }
  if (selectComposite) {
    return (
      <BuildContentBox>
        <div className='title-bar'>
          <span>{selectComposite.name}</span>
          <CompositePublish composite={selectComposite} />
        </div>
        <div className='content-box'>
          <CompositeEditor
            schema={selectComposite.graphql}
            encodedDefinition={JSON.parse(selectComposite.composite)}
          />
        </div>
      </BuildContentBox>
    )
  }
  return null
}

function ModelEditor ({
  streamId,
  network
}: {
  streamId: string
  network: Network | undefined
}) {
  const [modelData, setModelData] = useState<ModeQueryResult>()
  const [gqlSchema, setGqlSchema] = useState<string>(schemas.code)
  const [errMsg, setErrMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchModelGraphql = useCallback(
    async (streamId: string, network: Network) => {
      try {
        setLoading(true)
        setErrMsg('')
        const resp = await queryModelGraphql(
          streamId,
          network || Network.TESTNET
        )
        const { data } = resp.data
        setModelData(data)
        if (data.graphqlSchema) {
          setGqlSchema(data.graphqlSchema)
        } else {
          setGqlSchema(schemas.code)
        }
      } catch (error) {
        const err = error as AxiosError
        setErrMsg((err.response?.data as any).message || err.message)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    if (!streamId || !network) return
    fetchModelGraphql(streamId, network)
  }, [fetchModelGraphql, streamId, network])

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
        <div className='title-box' />
        <Loading>{errMsg}</Loading>
      </div>
    )
  }
  return (
    <CompositeEditor
      schema={gqlSchema}
      encodedDefinition={modelData?.composite}
    />
  )
}

const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: gray;
`

export const BuildContentBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 10px;

  .title-bar {
    border-bottom: none;
    position: relative;
    top: 0;
    display: flex;
    align-items: center;
    gap: 20px;
    height: 30px;
    > span {
      font-weight: 700;
      font-size: 24px;
    }
  }
  .content-box {
    height: calc(100vh - 160px);
  }
`
