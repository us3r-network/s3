import styled from 'styled-components'
import { useCeramicCtx } from '../context/CeramicCtx'
import ChevronDown from './icons/ChevronDown'
import { Network } from '../types'
import BackBtn from './BackBtn'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import {
  Button,
  Item,
  Label,
  ListBox,
  Popover,
  Select,
  SelectValue,
} from 'react-aria-components'
import { isMobile } from 'react-device-detect'
import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { LogoutButton } from '@us3r-network/profile'

export default function Header() {
  const navigate = useNavigate()
  let location = useLocation()

  const showBack = useMemo(() => {
    const show =
      location.pathname === '/' ||
      location.pathname === '/models' ||
      location.pathname === '/streams'
    return !show
  }, [location])

  const params = useParams()
  const session = useSession()
  const showLogoutButton = useMemo(() => {
    return (
      location.pathname.startsWith('/streams/profile') &&
      session &&
      session.id &&
      session.id === params?.did
    )
  }, [location, session, params?.did])

  if (isMobile) {
    return null
  }

  return (
    <Box>
      <div>
        {(showBack && (
          <BackBtn
            backAction={() => {
              if (location.pathname.startsWith('/models/modelview')) {
                navigate('/models')
              } else {
                navigate(-1)
              }
            }}
          />
        )) || <div></div>}
        {(showBack && <div></div>) || <NetworkSwitch />}
        {showLogoutButton && <LogoutButton />}
      </div>
    </Box>
  )
}

function NetworkSwitch() {
  const { network, setNetwork } = useCeramicCtx()

  return (
    <Select
      selectedKey={network}
      onSelectionChange={(k) => {
        setNetwork(k as Network)
      }}
    >
      <Label></Label>
      <Button>
        <SelectValue />
        <span aria-hidden="true">
          <ChevronDown />
        </span>
      </Button>
      <Popover>
        <ListBox>
          <Item id={Network.MAINNET}>{Network.MAINNET}</Item>
          <Item id={Network.TESTNET}>{Network.TESTNET}</Item>
        </ListBox>
      </Popover>
    </Select>
  )
}

const Box = styled.div`
  position: sticky;
  top: 0;
  background-color: #1b1e23;
  z-index: 100;
  align-items: center;
  > div {
    justify-content: space-between;
    display: flex;
    height: 60px;
    gap: 20px;
    align-items: center;
    padding: 10px 0;
    max-width: 1300px;
    margin: 0 auto;
    box-sizing: border-box;
  }
  button[data-us3r-logoutbutton] {
    overflow: hidden;
    cursor: pointer;
    width: 54px;
    height: 32px;
    border-radius: 10px;
    color: #fff;
    background: none;
    outline: none;
    border: 1px solid gray;
  }
`
