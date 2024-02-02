import { Us3rAuthWithRainbowkitProvider } from '@us3r-network/auth-with-rainbowkit'
import { ProfileStateProvider } from '@us3r-network/profile'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useEffect, useState } from 'react'
import { Radio, RadioGroup } from 'react-aria-components'
import {
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useParams
} from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
import styled from 'styled-components'
import DappModelAndComposites from './components/model/DappModelAndComposites'
import Header from './components/nav/Header'
import Nav from './components/nav/Nav'
import { CERAMIC_TESTNET_HOST, WALLET_CONNECT_PROJECT_ID } from './constants'
import CeramicNodes from './container/CeramicNodes'
import Components from './container/Components'
import DappEditor from './container/DappEditor'
import DappHome from './container/DappHome'
import DappInfo from './container/DappInfo'
import DappMetrics from './container/DappMetrics'
import DappPlayground from './container/DappPlayground'
import DappCreate from './container/DappQuickStart'
import DappSdk from './container/DappSdk'
import ExploreComposite from './container/ExploreComposite'
import ExploreModel from './container/ExploreModel'
import MyDapps from './container/MyDapps'
import NoMatch from './container/NoMatch'
import AppProvider, { useAppCtx } from './context/AppCtx'
import CeramicNodeProvider from './context/CeramicNodeCtx'
import { DappCompositeDto, ModelStream } from './types.d'

dayjs.extend(relativeTime)

function Routers () {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<MyDapps />} />
        <Route path='dapp/create' element={<DappCreate />} />
        <Route path='dapp/:appId' element={<DappLayout />}>
          <Route path='index' element={<DappHome />} />
          <Route path='explore' element={<ExploreLayout />}>
            <Route path='model' element={<ExploreModel />} />
            <Route path='composite' element={<ExploreComposite />} />
            <Route path='components' element={<Components />} />
          </Route>
          <Route path='build' element={<BuildLayout />}>
            <Route path='editor' element={<DappEditor />} />
            <Route path='playground' element={<DappPlayground />} />
            <Route path='sdk' element={<DappSdk />} />
            <Route path='metrics' element={<DappMetrics />} />
          </Route>
          <Route path='info' element={<DappInfo />} />
          <Route path='node' element={<CeramicNodes />} />
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

function BuildLayout () {
  const [selectModel, setSelectModel] = useState<ModelStream>()
  const [selectComposite, setSelectComposite] = useState<DappCompositeDto>()
  const { pathname } = useLocation()
  const defaultKey = pathname.split('/build/')[1]
  const PAGES = [
    {
      id: 'editor',
      label: 'Editor'
    },
    {
      id: 'playground',
      label: 'Playground'
    },
    {
      id: 'sdk',
      label: 'SDK'
    },
    {
      id: 'metrics',
      label: 'Metrics'
    }
  ]
  return (
    <LayoutContainer>
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
        editable={pathname.includes('editor')}
      />
      <div className='build-content'>
        <Outlet
          context={{
            selectModel,
            selectComposite
          }}
        />
        <RadioGroup
          className='tabs'
          aria-label='Build'
          defaultValue={defaultKey}
        >
          {PAGES.map(page => (
            <Radio className='tab' value={page.id} key={page.id}>
              <NavLink to={page.id}>{page.label}</NavLink>
            </Radio>
          ))}
        </RadioGroup>
      </div>
    </LayoutContainer>
  )
}

function ExploreLayout () {
  const { pathname } = useLocation()
  const defaultKey = pathname.split('/explore/')[1]
  const PAGES = [
    {
      id: 'model',
      label: 'Models'
    },
    {
      id: 'composite',
      label: 'Composites'
    },
    {
      id: 'components',
      label: 'Components'
    }
  ]
  return (
    <LayoutContainer>
      <Outlet />
      <RadioGroup
        className='tabs'
        aria-label='Explore'
        defaultValue={defaultKey}
      >
        {PAGES.map(page => (
          <Radio className='tab' value={page.id} key={page.id}>
            <NavLink to={page.id}>{page.label}</NavLink>
          </Radio>
        ))}
      </RadioGroup>
    </LayoutContainer>
  )
}

const LayoutContainer = styled.div`
  width: 100%;
  margin-top: 20px;
  margin-bottom: 20px;
  position: relative;
  display: flex;
  flex-direction: row;
  gap: 20px;
  .tabs {
    position: absolute;
    top: 0px;
    right: 0px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    border: 1px solid white;
    border-radius: 999px;
  }

  .tab {
    --text-color-base: black;
    --text-color-disabled: var(--text-color-base);
    --highlight-background: white;
    --border-color: transparent;

    padding: 10px 20px;
    cursor: pointer;
    outline: none;
    position: relative;
    color: white;
    transition: color 200ms;
    forced-color-adjust: none;
    border-radius: 999px;
    a {
      color: var(--text-color);
    }

    &[data-hovered],
    &[data-focused] {
      color: white;
    }

    &[data-selected] {
      background-color: var(--highlight-background);
      color: var(--text-color-base);
      a {
        color: var(--text-color-base);
      }
    }

    &[data-disabled] {
      color: var(--text-color-disabled);
      &[data-selected] {
        --border-color: var(--text-color-disabled);
      }
    }

    &[data-focus-visible]:after {
      content: '';
      position: absolute;
      inset: 4px;
      border-radius: 4px;
      border: 2px solid var(--focus-ring-color);
    }
  }
  .build-content {
    flex-grow: 1;
    width: 0;
  }
`
