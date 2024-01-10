import { useSession } from '@us3r-network/auth-with-rainbowkit'
import styled from 'styled-components'
import { useAppCtx } from '../context/AppCtx'
import { useCallback, useState } from 'react'
import useSelectedDapp from '../hooks/useSelectedDapp'
import { delDapp } from '../api/dapp'
import CloseIcon from './Icons/CloseIcon'
import InfoCircleIcon from './Icons/InfoCircleIcon'

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
      <div className="title">
        <h3>Delete Dapp</h3>
        <button onClick={() => closeModal(false)}>
          <CloseIcon />
        </button>
      </div>
      <div>
        <p>
          Delete the Dapp will also remove your data, please make sure you have
          made a backup.
        </p>
      </div>
      <div className="warn">
        <InfoCircleIcon />
        <p>This action cannot be undone.</p>
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
  box-sizing: border-box;
  position: relative;
  width: 500px;
  margin: 0 auto;

  background: #1b1e23;
  border-radius: 20px;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #fff;

  > .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    h3 {
      font-style: italic;
      font-weight: 700;
      font-size: 24px;
      line-height: 28px;
      margin: 0;
    }
  }

  p {
    margin: 0;
    padding: 0;
  }

  .warn {
    display: flex;
    align-items: center;
    gap: 10px;

    font-weight: 400;
    font-size: 16px;
    line-height: 24px;

    color: #ff6666;
  }
  > .btns {
    display: flex;
    align-items: center;
    justify-content: end;
    gap: 20px;

    button {
      color: #fff;
      padding: 12px 24px;

      width: 160px;
      height: 48px;
      background: #1a1e23;
      border-radius: 12px;
      cursor: pointer;
      color: #ffffff;
      font-weight: 600;
      font-size: 16px;
      line-height: 24px;
      border: 1px solid #39424c;
      color: #718096;
      &.del {
        cursor: pointer;
        background: #ffffff;

        width: 281px;
        font-weight: 600;
        font-size: 16px;
        line-height: 24px;
        text-align: center;
        color: #14171a;

        > img {
          width: 24px;
        }
      }
    }
  }
`
