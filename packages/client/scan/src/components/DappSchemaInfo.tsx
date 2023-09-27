import { useCallback, useEffect, useState } from 'react'
import { Network, Stream } from '../types'
import { useCeramicCtx } from '../context/CeramicCtx'
import { getStreamInfo } from '../api'
import StreamTable from './StreamTable'
import styled from 'styled-components'

export default function DappSchemaInfo({ schema }: { schema: string }) {
  const [stream, setStream] = useState<Stream>()
  const { network } = useCeramicCtx()
  const [loading, setLoading] = useState(true)
  const loadSchemaInfo = useCallback(async () => {
    try {
      setLoading(true)
      const resp = await getStreamInfo(network, schema)
      setStream(resp.data.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }, [schema, network])
  useEffect(() => {
    loadSchemaInfo()
  }, [loadSchemaInfo])

  if (loading) return <LoadingBox>Loading...</LoadingBox>

  return (
    <SchemaInfoContainer>
      {stream && <StreamTable data={stream} network={network as Network} />}
    </SchemaInfoContainer>
  )
}

const LoadingBox = styled.div`
  padding: 20px;
  text-align: center;
  color: gray;
`

const SchemaInfoContainer = styled.div`
  .name {
    font-size: initial !important;
    font-weight: initial !important;
    font-style: normal !important;
  }
`
