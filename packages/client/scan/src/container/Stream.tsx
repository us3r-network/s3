import { AxiosError, isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'

import { getStreamInfo } from '../api'
import StreamTable from '../components/StreamTable'
import { Network, Stream } from '../types'
import { useCeramicCtx } from '../context/CeramicCtx'

export default function StreamPage() {
  const { streamId } = useParams()
  const { network } = useCeramicCtx()
  const [stream, setStream] = useState<Stream>()
  const [serverErrMsg, setServerErrMsg] = useState<{
    status: number
    msg: string
  }>()
  const [unknownErr, setUnknownErr] = useState<string>()

  const loadStreamInfo = async (network: Network, streamId: string) => {
    try {
      setServerErrMsg(undefined)
      setUnknownErr(undefined)
      const resp = await getStreamInfo(network, streamId)
      setStream(resp.data.data)
    } catch (error) {
      const err = error as Error | AxiosError
      if (isAxiosError(err) && err.response) {
        setServerErrMsg({
          status: err.response.status,
          msg: err.response.data.msg,
        })
      } else {
        setUnknownErr(err.message)
      }
    }
  }

  useEffect(() => {
    if (!streamId || !network) return
    loadStreamInfo(network as Network, streamId)
  }, [streamId, network])

  if (unknownErr) {
    return (
      <PageBox>
        <div className="err">
          <p>{unknownErr}</p>
          <p>
            <Link to={`/?network=${network}`}>Go to the home page</Link>
          </p>
        </div>
      </PageBox>
    )
  }

  if (serverErrMsg) {
    return (
      <PageBox>
        <div className="err">
          <h3>{serverErrMsg.status}</h3>

          <p className="msg">{serverErrMsg.msg}</p>
          <p>
            <Link to={`/?network=${network}`}>Go to the home page</Link>
          </p>
        </div>
      </PageBox>
    )
  }

  return (
    <PageBox isMobile={isMobile}>
      {stream && <StreamTable data={stream} network={network as Network} />}
    </PageBox>
  )
}

const PageBox = styled.div<{ isMobile?: boolean }>`
  margin-bottom: 50px;
  ${({ isMobile }) => (isMobile ? `padding: 0 10px;` : 'padding: 24px 0')};

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
`
