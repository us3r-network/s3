import styled from 'styled-components'
import useSelectedDapp from '../hooks/useSelectedDapp'
import { ChevronRightDoubleWhite } from '../components/Icons/ChevronRightDouble'
import { Link } from 'react-router-dom'
import LightbulbIcon from '../components/Icons/LightbulbIcon'

export default function DappHome() {
  const { selectedDapp } = useSelectedDapp()
  return (
    <DappHomeContainer>
      <h1>{selectedDapp?.name}, welcome to S3 Dashboard</h1>
      <div className="steps">
        <div className="title">
          <div>
            <h3>
              <span>Step 1</span>
              Start configuring models
            </h3>
            <p>create your own model or composite</p>
          </div>
          <div className="btns">
            <Link to={`/dapp/${selectedDapp?.id}/model-editor?create-new=true`}>
              <button>
                Create Model <ChevronRightDoubleWhite />
              </button>
            </Link>
          </div>
        </div>
        <hr />
        <div className="content">
          <img src="/dapp-home/step1-0.png" alt="" />
          <div>
            <LightbulbIcon />
            <div>Submit your code to create</div>
          </div>
        </div>
        <hr />
        <div className="title">
          <div>
            <p>
              Explore the existing models, , and add the model which suits your
              Dapp. When in doubt, you can mark it to your favorite models first
              and choose from the list in Model Editor.
            </p>
          </div>
          <div className="btns">
            <Link to={`/dapp/${selectedDapp?.id}/explore`}>
              <button>
                Explore Models <ChevronRightDoubleWhite />
              </button>
            </Link>
          </div>
        </div>
        <div className="content">
          <img src="/dapp-home/step1-1.png" alt="" />
        </div>
        <div className="content">
          <img src="/dapp-home/step1-2.png" alt="" />
        </div>
      </div>

      <div className="steps">
        <div className="title">
          <div>
            <h3>
              <span>Step 2</span>
              Download or merge the Model's runtime definition
            </h3>
            <p>
              Downloading the Model's runtime definition will help you code
              faster.
            </p>
          </div>
          <div className="btns">
            <Link to={`/dapp/${selectedDapp?.id}/model-editor`}>
              <button>
                Model Editor <ChevronRightDoubleWhite />
              </button>
            </Link>
          </div>
        </div>
        <hr />
        <div className="content">
          <img src="/dapp-home/step2.png" alt="" />
          <div>
            <LightbulbIcon />
            <div>
              Click the "Download" button.Please refer to the website for coding
              guides:
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
      </div>
      <div className="steps">
        <div>
          <h3>
            <span>Step 3</span>
            Release to Mainnet
          </h3>
        </div>
        <hr />
        <div className="content">
          <img src="/dapp-home/step3.png" alt="" />
          <div>After testing, release your Dapp to Mainnet</div>
        </div>
      </div>
      <div className="steps">
        <div>
          <h3>
            <span>Step 4</span>
            Monitor your data and more operation management
          </h3>
        </div>
        <hr />
        <img src="/dapp-home/step4.png" alt="" />
      </div>
    </DappHomeContainer>
  )
}

const DappHomeContainer = styled.div`
  margin-top: 25px;
  margin-bottom: 25px;
  display: flex;
  flex-direction: column;
  gap: 40px;

  > .steps {
    background: #1b1e23;
    border: 1px solid #39424c;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
    box-sizing: border-box;
    gap: 20px;

    .title {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;

      > div {
        max-width: 900px;
      }
    }

    .content {
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

    .btns {
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
    }

    hr {
      width: 100%;
      height: 1px;
      background: #39424c;
      border: none;
    }

    h3 {
      font-family: Rubik;
      font-size: 24px;
      font-style: italic;
      font-weight: 700;
      line-height: 28px;
      letter-spacing: 0px;
      text-align: left;
      margin: 0;

      span {
        background: linear-gradient(52.42deg, #cd62ff 35.31%, #62aaff 89.64%),
          linear-gradient(0deg, #ffffff, #ffffff);
        -webkit-background-clip: text;
        color: transparent;
        width: 80px;
        display: inline-block;
        margin-right: 20px;
      }
    }

    p {
      font-family: Rubik;
      font-size: 16px;
      font-weight: 400;
      line-height: 19px;
      letter-spacing: 0px;
      text-align: left;
      margin: 0;
      margin-top: 5px;
      color: #718096;
    }
  }

  > h1 {
    font-style: italic;
    font-weight: 700;
    font-size: 40px;
    line-height: 47px;
    margin: 0;
    color: #ffffff;
  }

  > div {
    width: 100%;
    > img {
      width: inherit;
    }
    &:last-child {
      width: auto;
    }
  }
`
