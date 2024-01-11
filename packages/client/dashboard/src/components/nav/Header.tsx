import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Item } from 'react-stately'
import styled from 'styled-components'
import useSelectedDapp from '../../hooks/useSelectedDapp'
import { Label } from '../common/ListBox'
import { Select } from '../common/Select'
import LoginButton from './LoginButton'
import { LogoWhite } from './Logo'


export default function Header() {
  const { appId, selectDapps } = useSelectedDapp()
  const session = useSession()

  return (
    <HeaderContainer>
      <div className="left">
        <Link to={'/'}>
          <LogoWhite />
          <h2>CONSOLE</h2>
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

function DappSelector({
  dapps,
  selected,
}: {
  dapps: { id: number; name: string }[]
  selected: string
}) {
  const navigate = useNavigate()
  const location = useLocation()

  const dappItems = useMemo(() => {
    return [...dapps, { id: 0, name: '+ Create Dapp' }]
  }, [dapps])

  return (
    <Select
      label="Reviewer"
      items={dappItems}
      selectedKey={Number(selected)}
      onSelectionChange={(k) => {
        if (k === 0) {
          navigate('/dapp/create')
          return
        }
        const { pathname } = location
        const data = pathname.split('/')
        data[2] = `${k}`
        navigate(data.join('/'))
      }}
    >
      {(item) => (
        <Item textValue={item.name}>
          <div>
            <Label>{item.name}</Label>
          </div>
        </Item>
      )}
    </Select>
  )
}