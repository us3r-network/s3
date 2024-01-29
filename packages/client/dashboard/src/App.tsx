import { useEffect, useState } from 'react'
import {
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useParams
} from 'react-router-dom'
import styled from 'styled-components'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Us3rAuthWithRainbowkitProvider } from '@us3r-network/auth-with-rainbowkit'
import { ProfileStateProvider } from '@us3r-network/profile'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'

import { DappCompositeDto, ModelStream } from './types.d'
import { CERAMIC_TESTNET_HOST, WALLET_CONNECT_PROJECT_ID } from './constants'

import AppProvider, { useAppCtx } from './context/AppCtx'
import CeramicNodeProvider from './context/CeramicNodeCtx'

import MyDapps from './container/MyDapps'
import DappCreate from './container/DappCreate'
import DappHome from './container/DappHome'
import DappInfo from './container/DappInfo'
import DappModelEditor from './container/DappModelEditor'
import DappModelPlayground from './container/DappModelPlayground'
import DappModelSdk from './container/DappModelSdk'
import DappDataStatistic from './container/DappDataStatistic'
import Components from './container/Components'
import CeramicNodes from './container/CeramicNodes'
import ExploreModel from './container/ExploreModel'
import NoMatch from './container/NoMatch'

import Header from './components/nav/Header'
import Nav from './components/nav/Nav'
import DappModelAndComposites from './components/model/DappModelAndComposites'
import ExploreComposite from './container/ExploreComposite'

dayjs.extend(relativeTime)

function Routers () {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<MyDapps />} />
        <Route path='dapp/create' element={<DappCreate />} />
        <Route path='dapp/:appId' element={<DappLayout />}>
          <Route path='index' element={<DappHome />} />
          <Route path='node' element={<CeramicNodes />} />
          <Route element={<ModelEditorLayout />}>
            <Route path='model-editor' element={<DappModelEditor />} />
            <Route path='model-playground' element={<DappModelPlayground />} />
            <Route path='model-sdk' element={<DappModelSdk />} />
            <Route path='statistic' element={<DappDataStatistic />} />
          </Route>
          <Route path='info' element={<DappInfo />} />
          <Route path='explore' element={<ExploreLayout />}>
            <Route path='model' element={<ExploreModel />} />
            <Route path='composite' element={<ExploreComposite />} />
          </Route>
          <Route path='favorite' element={<ExploreLayout />}>
            <Route path='model' element={<ExploreModel />} />
            <Route path='composite' element={<ExploreComposite />} />
          </Route>
          <Route path='components' element={<Components />} />
        </Route>
      </Route>
      <Route path='*' element={<NoMatch />} />
    </Routes>
  )
}

export default function App () {
  return (
    <Us3rAuthWithRainbowkitProvider
      projectId={WALLET_CONNECT_PROJECT_ID}
      appName='S3 Console'
      authOpts={{
        resources: [
          'ceramic://*',
          'ceramic://*?model=kh4q0ozorrgaq2mezktnrmdwleo1d'
        ],
        expirationTime: ''
      }}
    >
      <ProfileStateProvider ceramicHost={CERAMIC_TESTNET_HOST}>
        <CeramicNodeProvider>
          <AppProvider>
            <Routers />
          </AppProvider>
        </CeramicNodeProvider>
      </ProfileStateProvider>
    </Us3rAuthWithRainbowkitProvider>
  )
}

function Layout () {
  return (
    <div>
      <Header />
      <AppContainer>
        <Outlet />
      </AppContainer>
      <ToastContainer
        position='top-right'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='dark'
      />
    </div>
  )
}

function DappLayout () {
  const { loadingDApps, setCurrAppId } = useAppCtx()
  const { appId } = useParams()

  useEffect(() => {
    if (appId) setCurrAppId(appId)
  }, [appId, setCurrAppId])

  if (!appId || loadingDApps) {
    return (
      <main className='container'>
        <div className='login-first'>
          <img src='/loading.gif' alt='' />
        </div>
      </main>
    )
  }

  return (
    <main className='container'>
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

function ModelEditorLayout () {
  const [selectModel, setSelectModel] = useState<ModelStream>()
  const [selectComposite, setSelectComposite] = useState<DappCompositeDto>()

  const { pathname } = useLocation()

  return (
    <EditorLayoutContainer>
      <DappModelAndComposites
        selectModel={selectModel}
        setSelectModel={data => {
          setSelectModel(data)
          setSelectComposite(undefined)
        }}
        setSelectComposite={data => {
          setSelectModel(undefined)
          setSelectComposite(data)
        }}
        selectComposite={selectComposite}
        editable={pathname.includes('model-editor')}
      />
      <Outlet
        context={{
          selectModel,
          selectComposite
        }}
      />
    </EditorLayoutContainer>
  )
}

const EditorLayoutContainer = styled.div`
  margin-top: 25px;
  margin-bottom: 25px;
  display: flex;
  gap: 20px;

  > .list {
    flex-grow: 1;
  }

  .ops {
    flex-grow: 1;
    overflow: hidden;
  }

  .playground-ops {
    flex-grow: 1;
    overflow: hidden;

    > div {
      height: calc(100vh - 100px);
    }
    .graphiql-container {
      height: 100%;
    }
  }
`

function ExploreLayout () {
  const { pathname } = useLocation()
  return (
    <ExploreLayoutContainer>
      <div className='explore-catalog'>
        <NavLink to='model' key='model'>
          {({ isActive }) => (
            <div className={`item ${isActive ? 'active' : ''}`}>
              <span>Models</span>
            </div>
          )}
        </NavLink>

        {!pathname.includes('favorite') && (
          <NavLink to='composite' key='model'>
            {({ isActive }) => (
              <div className={`item ${isActive ? 'active' : ''}`}>
                <span>Composites</span>
              </div>
            )}
          </NavLink>
        )}
      </div>
      <div>
        <Outlet />
      </div>
    </ExploreLayoutContainer>
  )
}

const ExploreLayoutContainer = styled.div`
  margin-top: 25px;
  margin-bottom: 25px;

  .explore-catalog {
    position: absolute;
    display: flex;
    gap: 20px;
    .item {
      font-size: 24px;
      font-weight: 700;
      color: #718096;
      > span {
        transition: opacity 0.09s ease-in-out;
      }
      &.active {
        background: #14171a;
        color: #fff;
      }
    }
  }
`
