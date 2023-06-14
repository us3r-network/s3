import { Routes, Route, Outlet } from 'react-router-dom'
import styled from 'styled-components'
import dayjs from 'dayjs'
import { isMobile } from 'react-device-detect'
import relativeTime from 'dayjs/plugin/relativeTime'

import { Us3rAuthWithRainbowkitProvider } from '@us3r-network/auth-with-rainbowkit'
import { ProfileStateProvider } from '@us3r-network/profile'

import Stream from './container/Stream'
import Profile from './container/Profile'
import Family from './container/Family'

import Home from './container/Home'
import Streams from './container/Streams'
import Nav from './components/Nav'
import MobileNav from './components/MobileNav'
import NoMatch from './components/NoMatch'
import { useGAPageView } from './hooks/useGoogleAnalytics'
import { CERAMIC_TESTNET_HOST } from './constants'
import Models from './container/Models'
import ModelStream from './container/ModelStream'
import ModelCreate from './container/ModelCreate'
import UserModels from './container/UserModels'
import ModelView from './container/ModelView'
import ModelMidInfo from './container/ModelMidInfo'
import { useLocalStorage } from './hooks/useLocalStorage'
import { Network } from './types'
import CeramicProvider from './context/CeramicCtx'
import Header from './components/Header'
import ModelStreams from './container/ModelStreams'
import DappCreate from './container/DappCreate'
import DappInfo from './container/DappInfo'
import DappEdit from './container/DappEdit'

dayjs.extend(relativeTime)

function Routers() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />

        <Route path="streams">
          <Route index element={<Streams />} />
          <Route path="stream/:streamId" element={<Stream />} />
          <Route path="profile/:did" element={<Profile />} />
          <Route path="family/:familyOrApp" element={<Family />} />
        </Route>

        <Route path="models">
          <Route index element={<Models />} />
          <Route path="model/:streamId" element={<ModelStream />} />
          <Route path="model/:modelId/mids" element={<ModelStreams />} />
          <Route path="model/:modelId/mids/:mid" element={<ModelMidInfo />} />
          <Route path="model/create" element={<ModelCreate />} />
          <Route path="did/:did" element={<UserModels />} />
          <Route path="modelview/:streamId" element={<ModelView />} />
        </Route>

        <Route path="dapp">
          <Route path="create" element={<DappCreate />} />
          <Route path=":appId/edit" element={<DappEdit />} />
          <Route path=":appId" element={<DappInfo />} />
        </Route>
      </Route>
      <Route path="*" element={<NoMatch />} />
    </Routes>
  )
}

export default function App() {
  const [network, setNetwork] = useLocalStorage(
    'network-select',
    Network.TESTNET
  )

  return (
    <Us3rAuthWithRainbowkitProvider>
      <ProfileStateProvider ceramicHost={CERAMIC_TESTNET_HOST}>
        <CeramicProvider network={network} setNetwork={setNetwork}>
          <Routers />
        </CeramicProvider>
      </ProfileStateProvider>
    </Us3rAuthWithRainbowkitProvider>
  )
}

function Layout() {
  useGAPageView()
  return (
    <AppContainer isMobile={isMobile}>
      {isMobile ? <MobileNav /> : <Nav />}

      <div className="container">
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
    </AppContainer>
  )
}

const AppContainer = styled.div<{ isMobile: boolean }>`
  display: flex;

  .container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  main {
    flex-grow: 1;
    margin: 0 auto;
    width: 100%;
    max-width: 1300px;
    margin-top: ${(props) => (props?.isMobile ? '60px' : '0')};
    z-index: 0;
  }
`