import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { ImgOrName } from '../components/ImgOrName'
import { useCallback, useEffect, useState } from 'react'
import { getDappInfo } from '../api'
import { useCeramicCtx } from '../context/CeramicCtx'
import { Dapp } from '../types'
import SocialLinks from '../components/SocialLinks'
import DappModels from '../components/DappModels'

export default function DappsInfo() {
  const { dappId } = useParams()
  const { network } = useCeramicCtx()
  const [loading, setLoading] = useState(false)
  const [dapp, setDapp] = useState<Dapp>()

  const loadDappInfo = useCallback(async () => {
    if (!dappId) return
    try {
      setLoading(true)
      const resp = await getDappInfo({ appId: dappId, network })
      setDapp(resp.data.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [dappId, network])

  useEffect(() => {
    loadDappInfo()
  }, [loadDappInfo])

  if (loading) return <Loading>Loading...</Loading>

  return (
    <DappInfoContainer>
      <div className="info">
        <div>
          <div className="basic">
            <ImgOrName imgUrl={dapp?.icon || ''} name={dapp?.name || ''} />
            <div>
              <div className="name">{dapp?.name}</div>
              <div className="appid">
                <span>APP ID:</span>
                {dapp?.id}
              </div>
            </div>
          </div>
          <SocialLinks socialLinks={dapp?.socialLinks || []} />
        </div>
        <p>{dapp?.description}</p>
      </div>

      <DappModels
        models={dapp?.models || []}
        modelsDetail={dapp?.modelDetails || []}
        schemas={dapp?.schemas || []}
        schemasDetail={dapp?.schemaDetails || []}
      />
    </DappInfoContainer>
  )
}

const DappInfoContainer = styled.div`
  margin-top: 25px;
  margin-bottom: 25px;
  div.items {
    background: #1b1e23;
    border: 1px solid #39424c;
    padding: 20px;
    border-radius: 20px;

    > p {
      font-weight: 400;
      font-size: 16px;
      line-height: 19px;

      color: #718096;
    }
  }

  h3 {
    margin: 0;
    font-style: italic;
    font-weight: 700;
    font-size: 24px;
    line-height: 28px;
  }

  .info {
    padding: 20px;

    border-radius: 20px;
    border: 1px solid #39424c;
    background: var(--1-b-1-e-23, #1b1e23);
    .basic {
      display: flex;
      gap: 20px;
      align-items: center;
      > span {
        color: #fff;
        width: 100px;
        height: 100px;
        border-radius: 10px;
        border: 1px solid #718096;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        &.name {
          font-size: 50px;
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
        }
      }
    }

    > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    > p,
    .appid {
      margin-top: 20px;
      margin-bottom: 0;
      color: var(--718096, #718096);

      font-family: Rubik;
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      line-height: 24px; /* 150% */
    }
    .appid {
      margin-top: 10px;
    }
    > p {
      text-overflow: ellipsis;
      overflow: hidden;
      padding-right: 5px;
      white-space: nowrap;
    }
  }

  .name {
    color: #fff;
    font-family: Rubik;
    font-size: 24px;
    font-style: italic;
    font-weight: 700;
    line-height: normal;
  }
`

const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: gray;
`
