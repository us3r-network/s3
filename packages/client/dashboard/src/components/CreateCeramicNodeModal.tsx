import styled from 'styled-components'
import { useCallback, useState } from 'react'

import CloseIcon from './Icons/CloseIcon'
import EnumSelect from './Selector/EnumSelect'
import {
  useAuthentication,
  useSession
} from '@us3r-network/auth-with-rainbowkit'
import { createCeramicNode } from '../api/ceramicNode'
import { CeramicNetwork } from '../types.d'

export default function CreateCeramicNodeModal ({
  fixedNetwork,
  closeModal,
  onSussess
}: {
  fixedNetwork?: CeramicNetwork
  closeModal: () => void
  onSussess: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [network, setNetwork] = useState<CeramicNetwork>(
    fixedNetwork || CeramicNetwork.TESTNET
  )
  const { signIn } = useAuthentication()
  const session = useSession()

  const [nodeName, setNodeName] = useState('')

  const submit = useCallback(async () => {
    if (submitting) return
    if (!session?.id) {
      signIn()
      return
    }

    try {
      setSubmitting(true)
      const resp = await createCeramicNode(
        { name: nodeName, network },
        session.serialize()
      )
      if (resp.data.code !== 0) {
        throw new Error(resp.data.msg)
      }
      onSussess()
      closeModal()
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }, [submitting, session, signIn, nodeName, network, onSussess, closeModal])

  return (
    <CreateBox>
      <div className='title'>
        <h1>Create Ceramic Node</h1>
        <button onClick={closeModal}>
          <CloseIcon />
        </button>
      </div>
      <EditorBox>
        <div className='node-name'>
          <span>* App Name:</span>
          <input
            type='text'
            value={nodeName}
            onChange={e => setNodeName(e.target.value)}
          />
        </div>
        {!fixedNetwork && (
          <EnumSelect
            {...{ value: network, setValue: setNetwork }}
            labelText='* Network:'
            values={[CeramicNetwork.TESTNET, CeramicNetwork.MAINNET]}
          />
        )}
      </EditorBox>
      <div className='btns'>
        <button onClick={closeModal}>Cancel</button>
        {(submitting && (
          <button className='submit'>
            <img src='/loading.gif' alt='' />
          </button>
        )) || (
          <button className='submit' onClick={submit}>
            Submit
          </button>
        )}
      </div>
    </CreateBox>
  )
}
const EditorBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  div {
    /* height: calc(100v - 88px); */
    box-sizing: border-box;
  }

  input {
    width: auto;
  }

  .node-name {
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
`

const CreateBox = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;

  position: relative;
  width: 600px;
  margin: 0 auto;

  /* #1B1E23 */

  background: #1b1e23;
  border-radius: 20px;
  > div.title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    color: #ffffff;
    > h1 {
      margin: 0;
      font-style: italic;
      font-weight: 700;
      font-size: 24px;
      line-height: 28px;
    }
  }

  .btns {
    display: flex;
    align-items: center;
    gap: 20px;
    justify-content: end;
    > button {
      background: #1a1e23;
      border: 1px solid #39424c;
      border-radius: 12px;
      padding: 12px 24px;
      font-weight: 500;
      font-size: 16px;
      line-height: 24px;
      color: #718096;
      width: 160px;
      &.submit {
        color: #14171a;
        background: #ffffff;
      }

      > img {
        height: 18px;
      }
    }
  }
`
