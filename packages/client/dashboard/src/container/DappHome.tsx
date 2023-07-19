import styled from 'styled-components'
import useSelectedDapp from '../hooks/useSelectedDapp'
import { ChevronRightDoubleWhite } from '../components/Icons/ChevronRightDouble'
import { Link } from 'react-router-dom'
import LightbulbIcon from '../components/Icons/LightbulbIcon'
import { useState } from 'react'
import ChevronDown from '../components/Icons/CheckronDown'
import { Checkbox, ToggleButton } from 'react-aria-components'
import CheckCircleIcon from '../components/Icons/CheckCircleIcon'

export default function DappHome() {
  const { selectedDapp } = useSelectedDapp()
  const [openSteps, setOpenSteps] = useState({
    s1: false,
    s2: false,
    s3: false,
    s4: false,
    s5: false,
  })

  const completeSteps = {
    s1: false,
    s2: false,
    s3: false,
    s4: false,
    s5: false,
  }
  return (
    <DappHomeContainer>
      <h1>{selectedDapp?.name}, welcome to S3 Dashboard</h1>
      <StepAccordionItem
        stepNum={1}
        title={'Data model design'}
        isCompleted={completeSteps.s1}
        isOpen={openSteps.s1}
        onChangeOpen={(isOpen) => setOpenSteps({ ...openSteps, s1: isOpen })}
      >
        <hr />
        <StepSubitem>
          <div className="header">
            <span>1a. create your own model or composite</span>
            <Link to={`/dapp/${selectedDapp?.id}/model-editor?create-new=true`}>
              <button>
                Create Model <ChevronRightDoubleWhite />
              </button>
            </Link>
          </div>
          <div className="content">
            <img src="/dapp-home/step1-0.png" alt="" />
            <div>
              <LightbulbIcon />
              <div>Submit your model schema to create new model</div>
            </div>
            <a
              href="https://composedb.js.org/docs/0.4.x/guides/composedb-client"
              target="_blank"
              rel="noreferrer"
            >
              https://composedb.js.org/docs/0.4.x/guides/composedb-client
            </a>
          </div>
        </StepSubitem>

        <hr />
        <StepSubitem>
          <div className="header">
            <span>
              1b. Explore the existing models, , and add the model which suits
              your Dapp.
              <br />
              When in doubt, you can mark it to your favorite models first and
              choose from the list in Model Editor.
            </span>
            <Link to={`/dapp/${selectedDapp?.id}/explore`}>
              <button>
                Explore Models <ChevronRightDoubleWhite />
              </button>
            </Link>
          </div>
          <div className="content">
            <img src="/dapp-home/step1-0.png" alt="" />
            <div>
              <LightbulbIcon />
              <div>
                Click the "Add" button,It will be added to your model list, or
                add to "My Favorite Model" first.
              </div>
            </div>
          </div>
        </StepSubitem>
      </StepAccordionItem>

      <StepAccordionItem
        stepNum={2}
        title={'Coding with models'}
        isCompleted={completeSteps.s2}
        isOpen={openSteps.s2}
        onChangeOpen={(isOpen) => setOpenSteps({ ...openSteps, s2: isOpen })}
      >
        <hr />
        <StepSubitem>
          <div className="header">
            <span>
              2a. Download runtime definitions of models or composites
            </span>
            <Link to={`/dapp/${selectedDapp?.id}/model-editor`}>
              <button>
                Model Editor <ChevronRightDoubleWhite />
              </button>
            </Link>
          </div>
          <div className="content">
            <img src="/dapp-home/step1-0.png" alt="" />
            <div>
              <LightbulbIcon />
              <div>
                Click the "Download" button.Please refer to the website for
                coding guides:
              </div>
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
            <Link to={`/dapp/${selectedDapp?.id}/model-editor`}>
              <button>
                Explore models <ChevronRightDoubleWhite />
              </button>
            </Link>
          </div>
          <div className="content">
            <img src="/dapp-home/step1-0.png" alt="" />
          </div>
        </StepSubitem>

        <hr />
        <StepSubitem>
          <div className="header">
            <span>2c. Viewing and adding data to the model</span>
            <Link to={`/dapp/${selectedDapp?.id}/model-editor`}>
              <button>
                Model Metrics <ChevronRightDoubleWhite />
              </button>
            </Link>
          </div>
          <div className="content">
            <img src="/dapp-home/step1-0.png" alt="" />
            <div>
              <LightbulbIcon />
              <div>Fill in the corresponding form to add data</div>
            </div>
          </div>
        </StepSubitem>

        <hr />
        <StepSubitem>
          <div className="header">
            <span>2d. Download the SDK of the model</span>
            <Link to={`/dapp/${selectedDapp?.id}/model-editor`}>
              <button>
                Model SDK <ChevronRightDoubleWhite />
              </button>
            </Link>
          </div>
          <div className="content">
            <img src="/dapp-home/step1-0.png" alt="" />
          </div>
        </StepSubitem>
      </StepAccordionItem>

      <StepAccordionItem
        stepNum={3}
        title={'S3 Component'}
        isCompleted={completeSteps.s3}
        isOpen={openSteps.s3}
        onChangeOpen={(isOpen) => setOpenSteps({ ...openSteps, s3: isOpen })}
      >
        <hr />
        <StepSubitem>
          <div className="header">
            <span>
              We also provide two components (profile and link) to help
              developers quickly and easily build decentralised user systems and
              social systems
            </span>
            <Link to={`/dapp/${selectedDapp?.id}/model-editor?create-new=true`}>
              <button>
                Components <ChevronRightDoubleWhite />
              </button>
            </Link>
          </div>
          <div className="content">
            <img src="/dapp-home/step1-0.png" alt="" />
          </div>
        </StepSubitem>
      </StepAccordionItem>

      <StepAccordionItem
        stepNum={4}
        title={'Release App'}
        isCompleted={completeSteps.s4}
        isOpen={openSteps.s4}
        onChangeOpen={(isOpen) => setOpenSteps({ ...openSteps, s4: isOpen })}
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
        isCompleted={completeSteps.s5}
        isOpen={openSteps.s5}
        onChangeOpen={(isOpen) => setOpenSteps({ ...openSteps, s5: isOpen })}
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
    </DappHomeContainer>
  )
}

const DappHomeContainer = styled.div`
  margin-top: 25px;
  margin-bottom: 25px;
  display: flex;
  flex-direction: column;
  gap: 40px;

  > h1 {
    font-style: italic;
    font-weight: 700;
    font-size: 40px;
    line-height: 47px;
    margin: 0;
    color: #ffffff;
    word-break: break-all;
  }

  hr {
    width: 100%;
    height: 1px;
    background: #39424c;
    border: none;
    margin: 20px 0;
  }
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
      width: 200px;
      height: 48px;
      padding: 12px 24px 12px 24px;
      border-radius: 24px;

      //styleName: Text/Medium 16pt · 1rem;
      font-family: Rubik;
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
      letter-spacing: 0em;
      text-align: center;
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

    > div {
      width: 340px;
      display: flex;
      padding: 20px;
      box-sizing: border-box;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
      border-radius: 20px;
      background: var(--718096, #718096);
    }

    a {
      color: var(--1-b-1-e-23, #1b1e23);
      word-break: break-all;
    }

    img {
      max-width: 100%;
    }
  }
`

const StepAccordionItem = ({
  stepNum,
  title,
  isCompleted,
  isOpen,
  onChangeOpen,
  children,
}: {
  stepNum: number
  title: string
  isCompleted: boolean
  isOpen: boolean
  onChangeOpen: (isOpen: boolean) => void
  children?: React.ReactNode
}) => {
  return (
    <AccordionItem>
      <AccordionHeader>
        <StepTitle>
          <StepCompleteCheckbox isSelected={isCompleted}>
            <CheckCircleIcon bgc="#2173DF" />
          </StepCompleteCheckbox>
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
    }
  }
`
const AccordionBody = styled.div<{ isOpen: boolean }>`
  width: 100%;
  transition: all 0.3s ease-in-out;
  overflow: hidden;
  max-height: ${(props) => (props.isOpen ? '1000px' : '0px')};
  padding-left: 44px;
  box-sizing: border-box;
`
const StepTitle = styled.h3`
  font-family: Rubik;
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
  }
`
