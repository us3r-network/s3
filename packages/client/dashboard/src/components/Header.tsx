import styled from 'styled-components'
import { useSession } from '@us3r-network/auth-with-rainbowkit'

import { LogoWhite } from './Logo'
import { Link } from 'react-router-dom'
import DappSelector from './Selector/DappSelector'
import LoginButton from './LoginButton'
import useSelectedDapp from '../hooks/useSelectedDapp'

export default function Header() {
  const { appId, selectDapps } = useSelectedDapp()
  const session = useSession()

  return (
    <HeaderContainer>
      <div className="left">
        <Link to={'/'}>
          <LogoWhite />
          <h2>Dashboard</h2>
        </Link>
        {session?.id && appId && (
          <DappSelector selected={appId} dapps={selectDapps} />
        )}
      </div>
      <div>
        <div>
          <LoginButton />
        </div>
      </div>
    </HeaderContainer>
  )
}

const HeaderContainer = styled.header`
  box-sizing: border-box;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  gap: 40px;
  z-index: 100;
  position: fixed;
  /* width: 1440px; */
  height: 60px;
  left: 0px;
  right: 0px;
  top: 0px;

  background: #1b1e23;
  border-bottom: 1px solid #39424c;

  .left {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;

    a {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }

    h2 {
      font-style: italic;
      font-weight: 700;
      font-size: 24px;
      line-height: 28px;
      text-align: center;
      color: #ffffff;
    }
  }
`
