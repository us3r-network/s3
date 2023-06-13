import { Outlet, Route, Routes, useParams } from 'react-router-dom'
import styled from 'styled-components'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Us3rAuthWithRainbowkitProvider } from '@us3r-network/auth-with-rainbowkit'
import { ProfileStateProvider } from '@us3r-network/profile'

import { useAppCtx } from './context/AppCtx'

import MyDapps from './container/MyDapps'
import NoMatch from './container/NoMatch'
import CeramicProvider from './context/AppCtx'
import { CERAMIC_TESTNET_HOST } from './constants'
import DappHome from './container/DappHome'
import DappCreate from './container/DappCreate'
import Header from './components/Header'
import Nav from './components/Nav'
import DappInfo from './container/DappInfo'
import ExploreModel from './container/ExploreModel'

import DappModelEditor from './container/DappModelEditor'
import DappModelPlayground from './container/DappModelPlayground'
import DappDataStatistic from './container/DappDataStatistic'

dayjs.extend(relativeTime)

function Routers() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<MyDapps />} />
        <Route path="dapp/create" element={<DappCreate />} />
        <Route path="dapp/:appId" element={<DappLayout />}>
          <Route path="index" element={<DappHome />} />
          <Route path="model-editor" element={<DappModelEditor />} />
          <Route path="model-playground" element={<DappModelPlayground />} />
          <Route path="statistic" element={<DappDataStatistic />} />
          <Route path="info" element={<DappInfo />} />
          <Route path="explore" element={<ExploreModel />} />
        </Route>
      </Route>
      <Route path="*" element={<NoMatch />} />
    </Routes>
  )
}

export default function App() {
  return (
    <Us3rAuthWithRainbowkitProvider>
      <ProfileStateProvider ceramicHost={CERAMIC_TESTNET_HOST}>
        <CeramicProvider>
          <Routers />
        </CeramicProvider>
      </ProfileStateProvider>
    </Us3rAuthWithRainbowkitProvider>
  )
}

function Layout() {
  return (
    <div>
      <Header />
      <AppContainer>
        <Outlet />
      </AppContainer>
    </div>
  )
}

function DappLayout() {
  const { loadingDApps } = useAppCtx()
  const { appId } = useParams()

  if (!appId || loadingDApps) {
    return (
      <main className="container">
        <div className="login-first">
          <img src="/loading.gif" alt="" />
        </div>
      </main>
    )
  }

  return (
    <main className="container">
      <Nav appId={appId} />
      <div>
        <Outlet />
      </div>
    </main>
  )
}

const AppContainer = styled.div`
  display: flex;
  margin-top: 60px;
  > main.container {
    display: flex;
    width: 100%;

    > div {
      flex-grow: 1;
      margin: 0 auto;
      width: 100%;
      max-width: 1300px;
      z-index: 0;
    }

    .login-first {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 20px;
      justify-content: center;
    }
  }
`
