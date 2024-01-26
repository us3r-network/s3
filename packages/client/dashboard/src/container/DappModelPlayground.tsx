import { AxiosError } from 'axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import styled from 'styled-components'
import { queryModelGraphql } from '../api/model'
import CompositePlaygroundGraphiQL from '../components/model/CompositePlaygroundGraphiQL'
import { useCeramicNodeCtx } from '../context/CeramicNodeCtx'
import {
  DappCompositeDto,
  ModeQueryResult,
  ModelStream,
  Network
} from '../types.d'
import useSelectedDapp from '../hooks/useSelectedDapp'

export default function DappModelPlayground () {
  const { selectModel, selectComposite } = useOutletContext<{
    selectModel: ModelStream
    selectComposite: DappCompositeDto
  }>()
  const { currCeramicNode } = useCeramicNodeCtx()
  const { selectedDapp } = useSelectedDapp()
  if (selectModel) {
    return (
      <div className='playground-ops'>
        <ModelPlayground
          streamId={selectModel.stream_id}
          ceramicNodeURL={currCeramicNode?.serviceUrl + '/'}
          network={selectedDapp?.network}
        />
      </div>
    )
  }
  if (selectComposite) {
    return (
      <div className='playground-ops'>
        <CompositePlayground
          composite={selectComposite}
          ceramicNodeURL={currCeramicNode?.serviceUrl + '/'}
        />
      </div>
    )
  }
  return null
}

function ModelPlayground ({
  streamId,
  network,
  ceramicNodeURL
}: {
  streamId: string
  network: Network | undefined
  ceramicNodeURL: string | undefined
}) {
  const [modelData, setModelData] = useState<ModeQueryResult>()
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
        console.log('data', resp)
        setModelData(resp.data.data)
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

  if (modelData?.runtimeDefinition && ceramicNodeURL)
    return (
      <CompositePlaygroundGraphiQL
        definition={modelData?.runtimeDefinition}
        ceramicNodeURL={ceramicNodeURL}
      />
    )
  return null
}
const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: gray;
`
function CompositePlayground ({
  composite,
  ceramicNodeURL
}: {
  composite: DappCompositeDto
  ceramicNodeURL: string | undefined
}) {
  const runtimeDefinition = useMemo(() => {
    return JSON.parse(composite.runtimeDefinition)
  }, [composite.runtimeDefinition])
  return (
    <CompositePlaygroundGraphiQL
      definition={runtimeDefinition}
      ceramicNodeURL={ceramicNodeURL}
    />
  )
}
