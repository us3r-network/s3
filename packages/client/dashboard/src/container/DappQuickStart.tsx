import {
  useAuthentication,
  useSession
} from '@us3r-network/auth-with-rainbowkit'
import { useCallback, useState } from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { createDapp } from '../api/dapp'
import EnumSelect from '../components/common/EnumSelect'
import { useAppCtx } from '../context/AppCtx'
import { CeramicNetwork, Network } from '../types.d'

import Step_1_Icon from '../components/icons/guideSteps/1.png'
import Step_2_Icon from '../components/icons/guideSteps/2.png'
import Step_3_Icon from '../components/icons/guideSteps/3.png'
import Step_4_Icon from '../components/icons/guideSteps/4.png'
import Step_5_Icon from '../components/icons/guideSteps/5.png'
import { CompositeList } from '../components/model/ExploreCompositeList'
import CreateCeramicNodeModal from '../components/node/CreateCeramicNodeModal'
import ModelSDK from '../components/model/ModelSDK'
import { useCeramicNodeCtx } from '../context/CeramicNodeCtx'
import { CeramicNodeInfo } from './CeramicNodes'
import useSelectedDapp from '../hooks/useSelectedDapp'
import { getModelsInfoByIds } from '../api/model'

const steps = [
  {
    id: 1,
    title: 'Create Application',
    icon: Step_1_Icon,
    content:
      'Fill in some simple information to start developing your App or DApp.',
    component: CreateDapp
  },
  {
    id: 2,
    title: 'Deploy Node',
    icon: Step_2_Icon,
    content: 'Before you start, you also need to deploy a node for your App.',
    component: DeployNode
  },
  {
    id: 3,
    title: 'Explore Models, Composites and Components',
    icon: Step_3_Icon,
    content:
      'You can view the models, composites or components that others have created and add them to your App. Now try adding a model.',
    component: Explore
  },
  {
    id: 4,
    title: 'Start Building',
    icon: Step_4_Icon,
    content:
      'You can check the components and SDKs for each model for future development.',
    component: StartBuilding
  },
  {
    id: 5,
    title: 'Congratulations',
    icon: Step_5_Icon,
    content:
      'Okay, you should have learned how to use s3. Now, you are on your own!',
    component: Congratulations
  }
]

export default function DappQuickStart () {
  const [currentStep, setCurrentStep] = useState(1)
  return (
    <Box>
      <Tabs
        className='steps-container'
        onSelectionChange={key => setCurrentStep(Number(key))}
        disabledKeys={[3, 4]}
      >
        {steps.map(item => (
          <TabPanel id={String(item.id)} key={item.id} className='step-action'>
            {item.component && <item.component />}
          </TabPanel>
        ))}
        <div className='step-info'>
          <div>
            <img src={steps[currentStep - 1].icon} alt='' />
            <h3>{steps[currentStep - 1].title}</h3>
            <p>{steps[currentStep - 1].content}</p>
          </div>
          <TabList
            className='step-tabs'
            aria-label='Quick Start Guide'
            items={steps}
          >
            {item => (
              <Tab id={String(item.id)}>
                <div className='step' title={item.title}>
                  {item.id}
                </div>
              </Tab>
            )}
          </TabList>
        </div>
      </Tabs>
    </Box>
  )
}

const Box = styled.main`
  margin-top: 20px;
  margin-bottom: 20px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .steps-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }
  .step-info {
    width: 300px;
    height: 600px;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: end;
    gap: 20px;
  }
  .step-tabs {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;

    .step {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #1b1e23;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-weight: 500;
      font-size: 16px;
      line-height: 24px;
      color: #ffffff;
      cursor: pointer;
    }
  }
  .step-action {
    width: 1000px;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
`

function CreateDapp () {
  const navigate = useNavigate()
  const [network, setNetwork] = useState(Network.TESTNET)
  const { signIn } = useAuthentication()
  const session = useSession()
  const { loadDapps } = useAppCtx()

  const [appName, setAppName] = useState('')
  const [creating, setCreating] = useState(false)

  const createAction = useCallback(async () => {
    if (!session?.id) {
      signIn()
      return
    }

    try {
      setCreating(true)
      const resp = await createDapp(
        { name: appName, network },
        session.serialize()
      )
      if (resp.data.code !== 0) {
        throw new Error(resp.data.msg)
      }
      await loadDapps()
      navigate(`/dapp/${resp.data.data.id}/index`)
    } catch (error) {
      console.error(error)
    } finally {
      setCreating(false)
    }
  }, [appName, navigate, network, session, signIn, loadDapps])

  return (
    <DappCreateContainer className='container'>
      <div>
        <div>
          <div className='app-name'>
            <span>* App Name:</span>
            <input
              type='text'
              value={appName}
              onChange={e => setAppName(e.target.value)}
            />
          </div>

          <EnumSelect
            {...{ value: network, setValue: setNetwork }}
            labelText='* Network:'
            values={Network}
          />

          <div className='btns'>
            <button className='cancel' onClick={() => navigate(-1)}>
              Cancel
            </button>
            {creating ? (
              <button>
                <img src='/loading.gif' alt='' />
              </button>
            ) : (
              <button className='create' onClick={createAction}>
                Create
              </button>
            )}
          </div>
        </div>
      </div>
    </DappCreateContainer>
  )
}

const DappCreateContainer = styled.div`
  > div {
    display: flex;
    flex-direction: column;
    gap: 20px;

    h1 {
      font-style: italic;
      font-weight: 700;
      font-size: 24px;
      line-height: 28px;
      margin: 0;
      margin-top: 20px;
      color: #ffffff;
    }

    > div {
      background: #1b1e23;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 40px;
      gap: 40px;

      .app-name {
        display: flex;
        flex-direction: column;

        > span {
          font-weight: 500;
          font-size: 16px;
          line-height: 24px;
          margin-bottom: 8px;
        }

        > input {
          background: #1a1e23;
          outline: none;
          border: 1px solid #39424c;
          border-radius: 12px;
          height: 48px;
          padding: 0px 16px;
          color: #ffffff;
          font-weight: 400;
          font-size: 16px;
          line-height: 24px;
        }
      }

      .btns {
        display: flex;
        align-items: center;
        justify-content: end;
        gap: 20px;

        button {
          font-weight: 500;
          font-size: 16px;
          line-height: 24px;

          text-align: center;

          width: 120px;
          background: none;
          outline: none;
          border: none;
          cursor: pointer;
          border: 1px solid #39424c;
          border-radius: 24px;
          height: 48px;
          &.cancel {
            background: #1b1e23;

            color: #ffffff;
          }

          &.create {
            color: #14171a;
            background: #ffffff;
            border-radius: 24px;
          }

          > img {
            height: 27px;
          }
        }
      }
    }
  }
`

function DeployNode () {
  const { currCeramicNode } = useCeramicNodeCtx()
  if (currCeramicNode) {
    return <CeramicNodeInfo node={currCeramicNode} />
  }
  return (
    <div>
      <CreateCeramicNodeModal
        // onSussess={loadCeramicNodes}
        fixedNetwork={CeramicNetwork.TESTNET}
      />
    </div>
  )
}

function Explore () {
  return (
    <div>
      <CompositeList />
    </div>
  )
}

function StartBuilding () {
  const { currDapp } = useAppCtx()
  const firstModelId = currDapp?.models?.[0]
  if (firstModelId) {
    return (
      <div>
        <ModelSDK modelId={firstModelId} network={currDapp.network} />
      </div>
    )
  }else{
    return <div>No Model in this Dapp!</div>
  }
}

function Congratulations () {
  return <div>Congratulations</div>
}
