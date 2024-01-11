import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Checkbox, ToggleButton } from 'react-aria-components'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import Dashboard from '../components/dapp/home/Dashboard'
import Header from '../components/dapp/home/Header'
import CheckCircleIcon from '../components/icons/CheckCircleIcon'
import ChevronDown from '../components/icons/CheckronDown'
import { ChevronRightDoubleWhite } from '../components/icons/ChevronRightDouble'
import DisabledIcon from '../components/icons/DisabledIcon'
import LightbulbIcon from '../components/icons/LightbulbIcon'
import { useAppCtx } from '../context/AppCtx'
import useIsOwner from '../hooks/useIsOwner'
import useSelectedDapp from '../hooks/useSelectedDapp'

export default function DappHome() {
  const { guideSteps, currDapp } = useAppCtx()
  const { steps } = guideSteps
  const { selectedDapp } = useSelectedDapp()
  const session = useSession()
  const { isOwner } = useIsOwner()

  const isInitOpenSteps = useRef(false)
  const [openSteps, setOpenSteps] = useState({
    s1: false,
    s2: false,
    s3: false,
    s4: false,
    s5: false,
  })
  const completeSteps = useMemo(() => {
    return {
      s1: steps[0],
      s2: steps[1],
      s3: steps[2],
      s4: steps[3],
      s5: steps[4],
    }
  }, [steps])

  useEffect(() => {
    if (isInitOpenSteps.current) return
    isInitOpenSteps.current = true
    for (const key in completeSteps) {
      const isCompleted = (completeSteps as any)[key]
      if (!isCompleted) {
        setOpenSteps((openSteps) => {
          return {
            ...openSteps,
            [key]: true,
          }
        })
        return
      }
    }
  }, [completeSteps])

  const dapp = useMemo(() => {
    return selectedDapp || currDapp
  }, [selectedDapp, currDapp])

  return (
    <DappHomeContainer>
      <Header icon={dapp?.icon} name={dapp?.name || ''} />

      {!!dapp?.models?.length && <Dashboard dapp={dapp} />}

      {session?.id && isOwner && (
        <>
          <StepAccordionItem
            stepNum={1}
            title={'Data model design'}
            isCompleted={completeSteps.s1}
            isOpen={openSteps.s1}
            onChangeOpen={(isOpen) =>
              setOpenSteps({ ...openSteps, s1: isOpen })
            }
          >
            <hr />
            <StepSubitem>
              <div className="header">
                <span>1a. Create your own model or composite</span>
                <Link to={`/dapp/${dapp?.id}/model-editor?create-new=true`}>
                  <button>
                    Create Model <ChevronRightDoubleWhite />
                  </button>
                </Link>
              </div>
              <div className="content">
                <img src="/dapp-home/step1-a.png" alt="" />
                <div className="tip">
                  <LightbulbIcon />
                  <span>Submit your model schema to create new model</span>
                  <a
                    href="https://composedb.js.org/docs/0.4.x/guides/composedb-client"
                    target="_blank"
                    rel="noreferrer"
                  >
                    https://composedb.js.org/docs/0.4.x/guides/composedb-client
                  </a>
                </div>
              </div>
            </StepSubitem>

            <hr />
            <StepSubitem>
              <div className="header">
                <span>
                  1b. Explore the existing models, and add the model which suits
                  your Dapp.
                  <br />
                  When in doubt, you can mark it to your favorite models first
                  and choose from the list in Model Editor.
                </span>
                <Link to={`/dapp/${dapp?.id}/explore`}>
                  <button>
                    Explore Models <ChevronRightDoubleWhite />
                  </button>
                </Link>
              </div>
              <div className="content">
                <img src="/dapp-home/step1-b.png" alt="" />
                <div className="tip">
                  <LightbulbIcon />
                  <span>
                    Click the "Add" button. It will be added to your model list,
                    or add it to "My Favorite Model" first.
                  </span>
                </div>
              </div>
            </StepSubitem>
          </StepAccordionItem>

          <StepAccordionItem
            stepNum={2}
            title={'Coding with models'}
            isCompleted={completeSteps.s2}
            isOpen={openSteps.s2}
            onChangeOpen={(isOpen) =>
              setOpenSteps({ ...openSteps, s2: isOpen })
            }
          >
            <hr />
            <StepSubitem>
              <div className="header">
                <span>
                  2a. Download runtime definitions of models or composites
                </span>
                <Link to={`/dapp/${dapp?.id}/model-editor`}>
                  <button>
                    Model Editor <ChevronRightDoubleWhite />
                  </button>
                </Link>
              </div>
              <div className="content">
                <img src="/dapp-home/step2-a.png" alt="" />
                <div className="tip">
                  <LightbulbIcon />
                  <span>
                    Click the "Download" button.
                    <br />
                    Please refer to the website for coding guides:
                  </span>
                  <a
                    href="https://composedb.js.org/docs/0.4.x/guides/composedb-client"
                    target="_blank"
                    rel="noreferrer"
                  >
                    https://composedb.js.org/docs/0.4.x/guides/composedb-client
                  </a>
                </div>
              </div>
            </StepSubitem>

            <hr />
            <StepSubitem>
              <div className="header">
                <span>2b. Coding and testing query and mutation</span>
                <Link to={`/dapp/${dapp?.id}/model-playground`}>
                  <button>
                    Model Playground <ChevronRightDoubleWhite />
                  </button>
                </Link>
              </div>
              <div className="content">
                <img src="/dapp-home/step2-b.png" alt="" />
              </div>
            </StepSubitem>

            <hr />
            <StepSubitem>
              <div className="header">
                <span>2c. Viewing and adding data to the model</span>
                <Link to={`/dapp/${selectedDapp?.id}/statistic`}>
                  <button>
                    Model Metrics <ChevronRightDoubleWhite />
                  </button>
                </Link>
              </div>
              <div className="content">
                <img src="/dapp-home/step2-c.png" alt="" />
                <div className="tip">
                  <LightbulbIcon />
                  <span>Fill in the corresponding form to add data</span>
                </div>
              </div>
            </StepSubitem>

            <hr />
            <StepSubitem>
              <div className="header">
                <span>2d. Download the SDK of the model</span>
                <Link to={`/dapp/${dapp?.id}/model-sdk`}>
                  <button>
                    Model SDK <ChevronRightDoubleWhite />
                  </button>
                </Link>
              </div>
              <div className="content">
                <img src="/dapp-home/step2-d.png" alt="" />
              </div>
            </StepSubitem>
          </StepAccordionItem>

          <StepAccordionItem
            stepNum={3}
            title={'S3 Components'}
            isCompleted={completeSteps.s3}
            isOpen={openSteps.s3}
            onChangeOpen={(isOpen) =>
              setOpenSteps({ ...openSteps, s3: isOpen })
            }
          >
            <hr />
            <StepSubitem>
              <div className="header">
                <span>
                  We also provide two components (profile and link) to help
                  developers quickly and easily build decentralised user systems
                  and social systems
                </span>
                <Link to={`/dapp/${dapp?.id}/components`}>
                  <button>
                    S3 Components <ChevronRightDoubleWhite />
                  </button>
                </Link>
              </div>
              <div className="content">
                <img src="/dapp-home/step3.png" alt="" />
              </div>
            </StepSubitem>
          </StepAccordionItem>

          <StepAccordionItem
            stepNum={4}
            title={'Release App'}
            isDisabled={true}
            isCompleted={completeSteps.s4}
            isOpen={openSteps.s4}
            onChangeOpen={(isOpen) =>
              setOpenSteps({ ...openSteps, s4: isOpen })
            }
          >
            <hr />
            <StepSubitem>
              <div className="header">
                <span>4a. Release the Dapp's data model to mainnet</span>
                <div className="coming-soon">Coming Soon</div>
              </div>
            </StepSubitem>

            <StepSubitem>
              <div className="header">
                <span>
                  4b. Improve more information about Dapp and publish to U3
                </span>
                <div className="coming-soon">Coming Soon</div>
              </div>
            </StepSubitem>
          </StepAccordionItem>

          <StepAccordionItem
            stepNum={5}
            title={'Monitor data and operation'}
            isDisabled={true}
            isCompleted={completeSteps.s5}
            isOpen={openSteps.s5}
            onChangeOpen={(isOpen) =>
              setOpenSteps({ ...openSteps, s5: isOpen })
            }
          >
            <hr />
            <StepSubitem>
              <div className="header">
                <span>5a. View detailed visual data analysis</span>
                <div className="coming-soon">Coming Soon</div>
              </div>
            </StepSubitem>

            <StepSubitem>
              <div className="header">
                <span>5b. View independent stream</span>
                <div className="coming-soon">Coming Soon</div>
              </div>
            </StepSubitem>
          </StepAccordionItem>
        </>
      )}
    </DappHomeContainer>
  )
}

const DappHomeContainer = styled.div`
  margin-top: 25px;
  margin-bottom: 25px;
  display: flex;
  flex-direction: column;
  gap: 40px;

  hr {
    width: 100%;
    height: 1px;
    background: #39424c;
    border: none;
    margin: 20px 0;
  }
`

const StepAccordionItem = ({
  stepNum,
  title,
  isDisabled,
  isCompleted,
  isOpen,
  onChangeOpen,
  children,
}: {
  stepNum: number
  title: string
  isDisabled?: boolean
  isCompleted: boolean
  isOpen: boolean
  onChangeOpen: (isOpen: boolean) => void
  children?: React.ReactNode
}) => {
  return (
    <AccordionItem>
      <AccordionHeader>
        <StepTitle>
          {isDisabled ? (
            <DisabledIcon />
          ) : (
            <StepCompleteCheckbox isSelected={isCompleted}>
              <CheckCircleIcon bgc="#2173DF" />
            </StepCompleteCheckbox>
          )}

          <span>Step {stepNum}</span>
          {title}
        </StepTitle>
        <AccordionToggleButton isSelected={isOpen} onChange={onChangeOpen}>
          <ChevronDown />
        </AccordionToggleButton>
      </AccordionHeader>
      <AccordionBody isOpen={isOpen}>{children}</AccordionBody>
    </AccordionItem>
  )
}
const AccordionItem = styled.div`
  background: #1b1e23;
  border: 1px solid #39424c;
  border-radius: 20px;
  padding: 20px;
  box-sizing: border-box;
`
const AccordionHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`
const AccordionToggleButton = styled(ToggleButton)`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 20px;
  background: var(--14171-a, #14171a);

  &[aria-pressed='true'] {
    > svg {
      transform: rotate(180deg);
      transition: all 0.3s ease-in-out;
    }
  }
  &[aria-pressed='false'] {
    > svg {
      transform: rotate(0deg);
      transition: all 0.3s ease-in-out;
    }
  }
`
const AccordionBody = styled.div<{ isOpen: boolean }>`
  width: 100%;
  transition: all 0.3s ease-in-out;
  overflow: hidden;
  max-height: ${(props) => (props.isOpen ? '2000px' : '0px')};
  padding-left: 44px;
  box-sizing: border-box;
`

const StepCompleteCheckbox = styled(Checkbox)`
  display: flex;
  align-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #718096;
  svg {
    display: none;
  }

  &[data-selected] {
    border: none;
    svg {
      display: block;
      width: 24px;
      height: 24px;
    }
  }
`
const StepTitle = styled.h3`
  font-size: 24px;
  font-style: italic;
  font-weight: 700;
  line-height: 28px;
  letter-spacing: 0px;
  text-align: left;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 20px;

  span {
    background: linear-gradient(52.42deg, #cd62ff 35.31%, #62aaff 89.64%),
      linear-gradient(0deg, #ffffff, #ffffff);
    -webkit-background-clip: text;
    color: transparent;
    display: inline-block;
    padding-right: 5px;
  }
`

const StepSubitem = styled.div`
  width: 100%;
  .header {
    margin-bottom: 20px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .span {
      color: #fff;
      font-size: 16px;
      font-weight: 400;
    }
    button {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      gap: 10px;
      background: linear-gradient(52.42deg, #cd62ff 35.31%, #62aaff 89.64%);
      padding: 12px 24px 12px 24px;
      border-radius: 24px;

      //styleName: Text/Medium 16pt · 1rem;
      font-family: Rubik;
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
      letter-spacing: 0em;
      text-align: center;
      white-space: nowrap;
    }
    .coming-soon {
      display: flex;
      padding: 12px 24px;
      justify-content: center;
      align-items: center;
      border-radius: 24px;
      background: var(--14171-a, #14171a);

      color: var(--ffffff, #fff);
      text-align: center;

      /* Text/Medium 16pt · 1rem */
      font-family: Rubik;
      font-size: 16px;
      font-style: normal;
      font-weight: 500;
      line-height: 24px; /* 150% */
    }
  }
  .content {
    width: 100%;
    display: flex;
    align-items: flex-start;
    gap: 20px;
    img {
      height: auto;
      width: 0px;
      flex: 1;
      max-width: 854px;
    }
    .tip {
      width: 340px;
      display: flex;
      padding: 20px;
      box-sizing: border-box;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
      border-radius: 20px;
      background: var(--718096, #718096);

      a {
        color: var(--1-b-1-e-23, #1b1e23);
        word-break: break-all;
      }
    }
  }
`
