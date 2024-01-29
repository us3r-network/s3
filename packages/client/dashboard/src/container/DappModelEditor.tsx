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

export default function DappModelEditor () {
  const { selectedDapp } = useSelectedDapp()
  const { selectModel, selectComposite } = useOutletContext<{
    selectModel: ModelStream
    selectComposite: DappCompositeDto
  }>()

  if (selectModel) {
    return (
      <Box className='ops'>
          <div className='dapp-title-bar'>
            <span>{selectModel.stream_content?.name}</span>
          </div>
          <ModelEditor streamId={selectModel.stream_id} network={selectedDapp?.network} />
      </Box>
    )
  }
  if (selectComposite) {
    return (
      <Box className='ops'>
        <div className='dapp-title-bar'>
          <span>{selectComposite.name}</span>
          <CompositePublish composite={selectComposite} />
        </div>
        <CompositeEditor
          schema={selectComposite.graphql}
          encodedDefinition={selectComposite.composite}
        />
      </Box>
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
        if (data.graphqlSchemaDefinition) {
          setGqlSchema(data.graphqlSchemaDefinition)
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

const Box = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`
