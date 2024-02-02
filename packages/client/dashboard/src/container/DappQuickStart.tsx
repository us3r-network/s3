import {
  useAuthentication,
  useSession
} from '@us3r-network/auth-with-rainbowkit'
import { useCallback, useEffect, useState } from 'react'
import { Button, Radio, RadioGroup } from 'react-aria-components'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { createDapp } from '../api/dapp'
import EnumSelect from '../components/common/EnumSelect'
import { useAppCtx } from '../context/AppCtx'
import { CeramicNetwork, CeramicStatus, Network } from '../types.d'

import Step_1_Icon from '../components/icons/guideSteps/1.png'
import Step_2_Icon from '../components/icons/guideSteps/2.png'
import Step_3_Icon from '../components/icons/guideSteps/3.png'
import Step_4_Icon from '../components/icons/guideSteps/4.png'
// import Step_5_Icon from '../components/icons/guideSteps/5.png'
// import { CompositeList } from '../components/model/ExploreCompositeList'
import CreateCeramicNodeModal from '../components/node/CreateCeramicNodeModal'
import ModelSDK from '../components/model/ModelSDK'
import { useCeramicNodeCtx } from '../context/CeramicNodeCtx'
import { CeramicNodeInfo } from './CeramicNodes'
import { uniq } from 'lodash'
import ModelList from '../components/model/ExploreModelList'
import React from 'react'

const CreateDapp = () => {
  const [network, setNetwork] = useState(Network.TESTNET)
  const { signIn } = useAuthentication()
  const session = useSession()
  const { loadDapps, currDapp, setCurrAppId } = useAppCtx()

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
      setCurrAppId(String(resp.data.data.id))
      await loadDapps()
    } catch (error) {
      console.error(error)
    } finally {
      setCreating(false)
    }
  }, [session, signIn, appName, network, setCurrAppId, loadDapps])

  return (
    <DappCreateContainer className='container'>
      {currDapp ? (
        <div>
          <div>
            <h1>App Name: {currDapp.name}</h1>
            <p>Network: {currDapp.network}</p>
            <p>App ID: {currDapp.id}</p>
            <p>Created At: {currDapp.createdAt}</p>
          </div>
          <p>
            Your dapp has been created; proceed to the next step to continue.
          </p>
        </div>
      ) : (
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
          <p>
            Fill in the required information to create a dapp, and testnet
            network is recommended during the development.
          </p>
        </div>
      )}
    </DappCreateContainer>
  )
}

const DeployNode = () => {
  const { ceramicNodes, currCeramicNode, loadCeramicNodes } =
    useCeramicNodeCtx()
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined
    // console.log('ceramicNodes changes: ', ceramicNodes)
    if (ceramicNodes.length > 0) {
      if (ceramicNodes[0].status !== CeramicStatus.RUNNING) {
        timer = setTimeout(() => {
          loadCeramicNodes()
        }, 5000)
      }
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [ceramicNodes, loadCeramicNodes])
  if (currCeramicNode) {
    return (
      <>
        <CeramicNodeInfo node={currCeramicNode} />
        <p>
          Since you already have a Ceramic node set up, you can proceed to the
          next step.
        </p>
      </>
    )
  }
  return (
    <>
      <CreateCeramicNodeModal
        onSussess={loadCeramicNodes}
        fixedNetwork={CeramicNetwork.TESTNET}
      />
      <p>
        You must create a Ceramic node, as all data operations will be executed
        on this node.
      </p>
    </>
  )
}

const Explore = () => {
  return (
    <>
      <ModelList />
      <p>
        Browse through the current collection of models and choose a model that
        you wish to incorporate into your dapp.
      </p>
    </>
  )
}

const StartBuilding = () => {
  const { currDapp } = useAppCtx()
  const firstModel = currDapp?.modelDetails?.[0]
  if (firstModel) {
    return (
      <>
        <ModelSDK
          modelId={firstModel.stream_id}
          modelName={firstModel.stream_content.name}
          network={currDapp.network}
        />
        <p>
          Using the automatically generated SDK, you can now directly perform
          CRUD operations on data; let's begin coding.
        </p>
      </>
    )
  } else {
    return <div>No Model in this Dapp!</div>
  }
}

const STEPS = [
  {
    id: 1,
    title: 'Create Application',
    icon: Step_1_Icon,
    guideText:
      'Fill in some simple information to start developing your App or DApp.',
    component: CreateDapp,
    enable: true,
    done: false
  },
  {
    id: 2,
    title: 'Deploy Node',
    icon: Step_2_Icon,
    guideText: 'Before you start, you also need to deploy a node for your App.',
    component: DeployNode,
    enable: true,
    done: false
  },
  {
    id: 3,
    title: 'Explore Models, Composites and Components',
    icon: Step_3_Icon,
    guideText:
      'You can view the models, composites or components that others have created and add them to your App. Now try adding a model.',
    component: Explore,
    enable: false,
    done: false
  },
  {
    id: 4,
    title: 'Start Building',
    icon: Step_4_Icon,
    guideText:
      'You can check the components and SDKs for each model for future development.',
    component: StartBuilding,
    enable: false,
    done: false
  }
]

export default function DappQuickStart () {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [disabledSteps, setDisabledSteps] = useState(['3', '4'])
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const { currCeramicNode } = useCeramicNodeCtx()
  const { currDapp } = useAppCtx()

  useEffect(() => {
    if (currCeramicNode) {
      setCompletedSteps(uniq([...completedSteps, 1]))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currCeramicNode])

  useEffect(() => {
    if (currDapp) {
      setCompletedSteps(uniq([...completedSteps, 0]))
      if (currDapp?.models?.length) {
        setCompletedSteps(uniq([...completedSteps, 2]))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currDapp])

  useEffect(() => {
    if (completedSteps.includes(0) && completedSteps.includes(1)) {
      if (completedSteps.includes(2)) {
        setDisabledSteps([])
      } else {
        setDisabledSteps(['4'])
      }
    } else {
      setDisabledSteps(['3', '4'])
    }
  }, [completedSteps])

  const step = STEPS[currentStep - 1]
  return (
    <Box>
      <div className='step-action'>
        {<step.component />}
        <div>
          {currentStep < STEPS.length &&
            !disabledSteps.includes(String(currentStep + 1)) && (
              <Button
                onPress={() => {
                  setCurrentStep(currentStep + 1)
                }}
              >
                Next Step
              </Button>
            )}
          {currDapp &&
            completedSteps.includes(0) &&
            completedSteps.includes(1) && (
              <Button
                onPress={() => {
                  navigate(`/dapp/${currDapp.id}/index`)
                }}
              >
                Start Build
              </Button>
            )}
        </div>
      </div>
      <div className='step-info'>
        <RadioGroup
          className='step-tabs'
          aria-label='Quick Start Guide'
          defaultValue='1'
          value={String(currentStep)}
          onChange={value => setCurrentStep(Number(value))}
        >
          {STEPS.map(item => (
            <Radio
              key={item.id}
              value={String(item.id)}
              className='step'
              isDisabled={disabledSteps.includes(String(item.id))}
            >
              {item.id}
            </Radio>
          ))}
        </RadioGroup>
        <div>
          <img src={STEPS[currentStep - 1]?.icon} alt='' />
          <h3>{STEPS[currentStep - 1]?.title}</h3>
          <p>{STEPS[currentStep - 1]?.guideText}</p>
        </div>
      </div>
    </Box>
  )
}

const Box = styled.main`
  margin-top: 20px;
  margin-bottom: 20px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: start;
  justify-content: center;
  gap: 20px;

  .steps-container {
    display: flex;
    flex-direction: row;
    /* align-items: center; */
    justify-content: center;
    gap: 20px;
  }
  .step-info {
    width: 300px;
    margin-top: 100px;
    /* height: 600px; */
    display: flex;
    flex-direction: row;
    /* align-items: center; */
    /* justify-content: end; */
    gap: 20px;
  }
  .step-tabs {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;

    .step {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #1b1e23;
      border: 2px solid transparent;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-weight: 500;
      font-size: 16px;
      line-height: 24px;
      color: #ffffff;
      cursor: pointer;

      &[data-disabled] {
        color: grey;
        cursor: not-allowed;
      }
      &[data-hovered] {
        border-color: white;
      }
      &[data-selected] {
        background: #ffffff;
        color: #14171a;
      }
    }
  }
  .step-action {
    width: 800px;
    height: 600px;
    display: flex;
    flex-direction: column;
    align-items: center;
    /* justify-content: center; */
    gap: 20px;
  }
`

const DappCreateContainer = styled.div`
  width: 100%;
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
