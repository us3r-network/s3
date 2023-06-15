import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAppCtx } from '../context/AppCtx'
import { useCallback, useState } from 'react'
import useSelectedDapp from '../hooks/useSelectedDapp'
import { delDapp } from '../api'

export default function DelConfirmModal({
  closeModal,
}: {
  closeModal: (withDel: boolean) => void
}) {
  const { selectedDapp } = useSelectedDapp()
  const session = useSession()

  const { loadDapps } = useAppCtx()
  const [delting, setDelting] = useState(false)
  const delDappAction = useCallback(async () => {
    if (!selectedDapp || !session) return
    try {
      setDelting(true)
      await delDapp(selectedDapp, session.serialize())
      await loadDapps()
      closeModal(true)
    } catch (error) {
      console.error(error)
    } finally {
      setDelting(false)
    }
  }, [selectedDapp, session, loadDapps, closeModal])

  return (
    <DelConfirmBox>
      <div>
        <p>
          Delete the Dapp will also remove your data, please make sure you have
          made a backup.
        </p>
        <p>
          <b>This action cannot be undone.</b>
        </p>
      </div>
      <div className="btns">
        <button onClick={() => closeModal(false)}>Cancel</button>
        {delting ? (
          <button className="del">
            <img src="/loading.gif" alt="" />
          </button>
        ) : (
          <button className="del" onClick={delDappAction}>
            Understand, delete this Dapp
          </button>
        )}
      </div>
    </DelConfirmBox>
  )
}

const DelConfirmBox = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;

  position: relative;
  width: 400px;
  margin: 0 auto;

  background: #1b1e23;
  border-radius: 20px;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #fff;

  > .btns {
    display: flex;
    align-items: center;
    justify-content: end;
    gap: 20px;

    button {
      color: #fff;
      padding: 12px 24px;

      height: 48px;

      background: #14171a;
      border-radius: 24px;
      cursor: pointer;
      color: #ffffff;
      font-weight: 500;
      font-size: 16px;
      line-height: 24px;
      &.del {
        cursor: pointer;
        background: #aa4f4f;

        > img {
          width: 24px;
        }
      }
    }
  }
`
