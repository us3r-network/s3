import { useCallback, useState } from 'react'
import styled from 'styled-components'
import CloseIcon from './Icons/CloseIcon'
import AppIconInput from './AppIconInput'
import InputItem from './InputItem'
import EnumSelect, { AppType, Network, Stage } from './Selector/EnumSelect'
import { ClientDApp } from '../types'
import { updateDapp } from '../api'
import {
  useAuthentication,
  useSession,
} from '@us3r-network/auth-with-rainbowkit'
import { useAppCtx } from '../context/AppCtx'

export default function EditDappInfo({
  closeModal,
  selectedDapp,
}: {
  closeModal: () => void
  selectedDapp: ClientDApp
}) {
  const { signIn } = useAuthentication()
  const session = useSession()
  const { loadDapps } = useAppCtx()
  const [updating, setUpdating] = useState(false)
  const [icon, setIcon] = useState(selectedDapp.icon)
  const [appName, setAppName] = useState(selectedDapp.name)
  const [redirectUrl, setRedirectUrl] = useState(selectedDapp.url || '')
  const [description, setDescription] = useState(selectedDapp.description || '')
  const [network, setNetwork] = useState(
    (selectedDapp.network as Network) || Network.TESTNET
  )
  const [stage, setStage] = useState(
    (selectedDapp.stage as Stage) || Stage.DEVELOPMENT
  )
  const [appType, setAppType] = useState(
    (selectedDapp.type as AppType) || AppType.SOCIAL
  )

  const confirmAction = useCallback(async () => {
    if (!session?.id) {
      signIn()
      return
    }
    try {
      setUpdating(true)
      const resp = await updateDapp(
        {
          ...selectedDapp,
          icon,
          name: appName,
          url: redirectUrl,
          description,
          network,
          stage,
          type: appType,
        },
        session.serialize()
      )
      if (resp.data.code !== 0) {
        throw new Error(resp.data.msg)
      }
      await loadDapps()
      closeModal()
    } catch (error) {
      console.error(error)
    } finally {
      setUpdating(false)
    }
  }, [
    session,
    signIn,
    selectedDapp,
    icon,
    appName,
    redirectUrl,
    description,
    network,
    stage,
    appType,
    loadDapps,
    closeModal,
  ])

  return (
    <ContentBox>
      <div className="title">
        <h2>Project Information</h2>
        <span onClick={closeModal}>
          <CloseIcon />
        </span>
      </div>

      <div className="app-basic">
        <AppIconInput icon={icon} setIcon={setIcon} name={appName} />
        <div className="items">
          <InputItem
            label="App Name:"
            placeHolder="App Name"
            value={appName}
            setValue={setAppName}
          />
          <InputItem
            label="Redirect URL:"
            placeHolder="https://ceramic.s3.xyz/"
            value={redirectUrl}
            setValue={setRedirectUrl}
          />
        </div>
      </div>

      <div>
        <h4>Description:</h4>
        <textarea
          name=""
          id=""
          rows={9}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
      </div>

      <div>
        <EnumSelect
          value={network}
          setValue={setNetwork}
          labelText="Network:"
          values={Network}
          isDisabled={true}
        />
      </div>

      <div>
        <EnumSelect
          value={stage}
          setValue={setStage}
          labelText="Stage:"
          values={Stage}
        />
      </div>

      <div>
        <EnumSelect
          value={appType}
          setValue={setAppType}
          labelText="App Type:"
          values={AppType}
        />
      </div>

      <div className="btns">
        <button type="button" onClick={closeModal}>
          Cancel
        </button>
        {(updating && (
          <button className="loading">
            <img src="/loading.gif" alt="" />
          </button>
        )) || (
          <button className="confirm" type="button" onClick={confirmAction}>
            Confirm
          </button>
        )}
      </div>
    </ContentBox>
  )
}

const ContentBox = styled.div`
  margin: 0 auto;
  text-align: start;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 650px;
  background: #1b1e23;
  border-radius: 20px;
  padding: 20px;
  box-sizing: border-box;
  overflow: scroll;

  & .title {
    display: flex;
    justify-content: space-between;
    align-items: center;

    & span {
      cursor: pointer;
    }
  }

  & div.app-basic {
    display: flex;
    gap: 20px;

    > div {
      flex-grow: 1;
    }
  }

  input,
  textarea {
    color: #fff;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;

    background: #1a1e23;
    border: 1px solid #39424c;
    border-radius: 12px;
    padding: 16px;
    outline: none;
    width: 100%;
    box-sizing: border-box;
  }

  input {
    height: 48px;
  }

  textarea {
    padding: 10px 16px;
    resize: none;
    height: 120px;
  }

  & h2 {
    margin: 0;
    font-weight: 700;
    font-size: 24px;
    line-height: 28px;
    font-style: italic;
    color: #ffffff;
  }
  & h4 {
    margin: 0 0 5px 0;
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: #ffffff;
  }

  & .items {
    gap: 20px;
    display: flex;
    flex-direction: column;
  }

  & p {
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    margin: 0;
    color: #ffffff;
  }

  & .text {
    & input {
      outline: none;
      background: inherit;
      height: 48px;
      padding: 12px 16px;
      background: #1a1e23;
      border: 1px solid #39424c;
      border-radius: 12px;
      box-sizing: border-box;
      width: calc(100% - 2px);
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      color: #fff;
      &::placeholder {
        color: #4e5a6e;
      }
    }
  }

  & .btns {
    display: flex;
    align-items: center;
    justify-content: end;
    gap: 20px;
    & button {
      cursor: pointer;
      width: 160px;
      height: 48px;

      background: #1a1e23;
      border: 1px solid #39424c;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      line-height: 24px;

      text-align: center;

      color: #718096;
    }

    & button.loading {
      > img {
        width: 26px;
      }
    }

    & button.confirm {
      background: #ffffff;
      color: #14171a;
    }
  }
`
