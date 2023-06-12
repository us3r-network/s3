import styled from 'styled-components'
import { useAppCtx } from '../context/AppCtx'
import ChevronLeft from '../components/Icons/ChevronLeft'
import PlusIcon from '../components/Icons/PlusIcon'
import { Link, useNavigate } from 'react-router-dom'
import { shortPubKey } from '../utils/shortPubKey'
import {
  useAuthentication,
  useSession,
} from '@us3r-network/auth-with-rainbowkit'
import { ClientDApp } from '../types'
import { Network } from '../components/Selector/EnumSelect'

export default function MyDapps() {
  const { dapps } = useAppCtx()
  return (
    <MyDappsContainer className="container">
      <div className="list">
        <h1>My Dapps</h1>
        <div className="dapps-list">
          <CreateCard />
          {dapps?.map((item) => {
            return <ItemCard key={item.id!} dapp={item} />
          })}
        </div>
      </div>

      <div className="more">
        <div className="description">
          <h1>
            S3 Dashboard helps developers manage your Dapp's models, monitor
            real-time data
          </h1>
          <ul>
            <li>Create Dapp</li>
            <li>Select existing models</li>
            <li>Create your own models</li>
            <li>Data analysis</li>
          </ul>

          <a href="https://s3.xyz">
            Learn more <ChevronLeft />
          </a>
        </div>
        <img src="/moregp.png" alt="" />
      </div>
    </MyDappsContainer>
  )
}

function CreateCard() {
  const navigate = useNavigate()
  const { signIn } = useAuthentication()
  const session = useSession()
  const sessId = session?.id
  return (
    <CreateCardBox
      onClick={() => {
        if (!sessId) {
          signIn()
          return
        }
        navigate('/dapp/create')
      }}
    >
      <PlusIcon />
      <div>Create Application</div>
    </CreateCardBox>
  )
}

function ItemCard({ dapp }: { dapp: ClientDApp }) {
  return (
    <Link to={`/dapp/${dapp.id}/index`}>
      <ItemCardBox>
        <div>
          <div>
            <img src={dapp.icon || '/logo512.png'} alt="" />
            <h3>{dapp.name}</h3>
          </div>
          <div className="net">{dapp.network}</div>
        </div>
        {/* {dapp.modelId && ( */}
        <div className="appid">
          APP ID: {dapp.id}
          {/* <span> {shortPubKey(`${dapp.modelId}` || '', { len: 16 })}</span> */}
        </div>
        {/* )} */}
        <p>{dapp.description}</p>
      </ItemCardBox>
    </Link>
  )
}

const CreateCardBox = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: 400;
  font-size: 16px;
  line-height: 19px;

  color: #748094;
`

const ItemCardBox = styled.div`
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
  > div:first-child {
    display: flex;
    align-items: center;
    justify-content: space-between;
    > div {
      display: flex;
      gap: 10px;
      align-items: center;
      img {
        width: 48px;
        height: 48px;
        border: 4px solid #1b1e23;
        border-radius: 10px;
      }

      h3 {
        margin: 0;
        font-weight: 700;
        font-size: 18px;
        line-height: 21px;

        color: #ffffff;
      }
    }
    .net {
      background: #718096;
      border-radius: 10px;
      font-weight: 400;
      font-size: 10px;
      line-height: 12px;
      padding: 2px 4px;
      color: #ffffff;
    }
  }

  > .appid {
    font-weight: 400;
    font-size: 12px;
    line-height: 14px;
    white-space: nowrap;
    overflow: hidden;
    color: #ffffff;
  }

  > p {
    font-weight: 400;
    font-size: 12px;
    line-height: 14px;
    margin: 0;
    padding: 0;
    color: #718096;
  }
`

const MyDappsContainer = styled.main`
  display: flex;
  flex-direction: column;
  gap: 20px;

  .list {
    h1 {
      font-style: italic;
      font-weight: 700;
      font-size: 24px;
      line-height: 28px;
    }

    .dapps-list {
      display: grid;
      grid-template-columns: repeat(4, minmax(300px, 1fr));
      gap: 20px;

      > a > div,
      > div {
        background: #1b1e23;
        border: 1px solid #39424c;
        border-radius: 20px;
        min-height: 178px;
      }
      a {
        text-decoration: none;
        color: #fff;
      }
    }
  }

  .more {
    width: 100%;
    min-height: 100px;
    background: linear-gradient(90deg, #1a2638 0%, #324765 100.92%);
    mix-blend-mode: normal;
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    padding: 60px;
    padding-right: 90px;
    box-sizing: border-box;
    display: flex;
    gap: 60px;
    h1 {
      font-style: italic;
      font-weight: 700;
      font-size: 34px;
      line-height: 40px;

      color: #ffffff;
    }

    ul {
      padding-inline-start: 25px;
      font-weight: 500;
      font-size: 18px;
      line-height: 21px;

      color: #ffffff;
    }

    a {
      font-style: normal;
      font-weight: 500;
      font-size: 18px;
      line-height: 21px;
      color: #3e7fff;
      display: flex;
      align-items: center;
      text-decoration: none;
      gap: 10px;
    }

    &::before {
      content: ' ';
      width: 100%;
      height: 100%;
      overflow: hidden;
      position: absolute;
      left: 0;
      top: 0;
      background-image: url('/morebg.png');
      background-repeat: no-repeat;
      background-clip: border-box;
      mix-blend-mode: color-dodge;
      /* opacity: 0.2; */
      z-index: -1;
    }
  }
`
