import styled from 'styled-components'
import EnumSelect, { Network } from '../components/Selector/EnumSelect'
import { useNavigate } from 'react-router-dom'
import { useCallback, useState } from 'react'
import {
  useAuthentication,
  useSession,
} from '@us3r-network/auth-with-rainbowkit'
import { createDapp } from '../api/dapp'
import { useAppCtx } from '../context/AppCtx'

export default function DappCreate() {
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
    <DappCreateContainer className="container">
      <div>
        <h1>Create Application</h1>
        <div>
          <div className="app-name">
            <span>* App Name:</span>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
            />
          </div>

          <EnumSelect
            {...{ value: network, setValue: setNetwork }}
            labelText="* Network:"
            values={Network}
          />

          <div className="btns">
            <button className="cancel" onClick={() => navigate(-1)}>
              Cancel
            </button>
            {creating ? (
              <button>
                <img src="/loading.gif" alt="" />
              </button>
            ) : (
              <button className="create" onClick={createAction}>
                Create
              </button>
            )}
          </div>
        </div>
      </div>
    </DappCreateContainer>
  )
}

const DappCreateContainer = styled.main`
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
