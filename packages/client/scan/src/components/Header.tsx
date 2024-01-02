import styled from 'styled-components'
import { useCeramicCtx } from '../context/CeramicCtx'
import ChevronDown from './icons/ChevronDown'
import { Network } from '../types'
import BackBtn from './BackBtn'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import {
  Button,
  ListBoxItem,
  Label,
  ListBox,
  Popover,
  Select,
  SelectValue,
} from 'react-aria-components'
import { isMobile } from 'react-device-detect'

export default function Header() {
  const navigate = useNavigate()
  let location = useLocation()

  const showBack = useMemo(() => {
    const show =
      location.pathname === '/' ||
      location.pathname === '/models' ||
      location.pathname === '/streams' ||
      location.pathname === '/dapps'
    return !show
  }, [location])

  if (isMobile) {
    return null
  }

  return (
    <Box>
      <div>
        {(showBack && window.history.length > 1 && (
          <BackBtn
            backAction={() => {
              navigate(-1)
              // if (location.pathname.startsWith('/models/modelview')) {
              //   navigate('/models')
              // } else {
              //   navigate(-1)
              // }
            }}
          />
        )) || <div></div>}
        <NetworkSwitch />
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
          <ListBoxItem id={Network.MAINNET}>{Network.MAINNET}</ListBoxItem>
          <ListBoxItem id={Network.TESTNET}>{Network.TESTNET}</ListBoxItem>
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
