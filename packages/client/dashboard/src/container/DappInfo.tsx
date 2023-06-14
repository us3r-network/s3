import styled from 'styled-components'
import { Button, Dialog, DialogTrigger, Modal } from 'react-aria-components'

import useSelectedDapp from '../hooks/useSelectedDapp'

import DappTitleEditor from '../components/DappTitleEditor'
import DappSocialEditor from '../components/DappSocialEditor'
import { useCallback, useState } from 'react'
import CopyIcon from '../components/Icons/CopyIcon'

import DelConfirmModal from '../components/DelDappConfirmModal'
import { useNavigate } from 'react-router-dom'

export default function DappInfo() {
  const { selectedDapp } = useSelectedDapp()
  const navigate = useNavigate()
  const [showCopyTint, setShowCopyTint] = useState(false)

  const copyAppId = useCallback(async (appId: string) => {
    try {
      await navigator.clipboard.writeText(appId)
      setShowCopyTint(true)
      setTimeout(() => {
        setShowCopyTint(false)
      }, 2000)
    } catch (error) {
      console.error(error)
    }
  }, [])

  if (!selectedDapp) {
    return null
  }

  return (
    <DappInfoContainer>
      <div className="info items">
        <img src={selectedDapp.icon || '/logo512.png'} alt="icon" />
        <div>
          <DappTitleEditor selectedDapp={selectedDapp} />
          <div className="appid">
            APP ID: {selectedDapp.id}
            <div>
              <button
                onClick={() => {
                  if (!selectedDapp?.id) return
                  copyAppId(selectedDapp?.id + '')
                }}
              >
                <CopyIcon />
              </button>
              {showCopyTint && <span>Copied</span>}
            </div>
          </div>
          <p>{selectedDapp.description}</p>
        </div>
      </div>
      <div className="links">
        <DappSocialEditor selectedDapp={selectedDapp} />
        <div className="ops">
          <div className="items">
            <h3>Release to Mainnet</h3>
            <p>Create the same Dapp at Mainnet.</p>
            <div className="btns">
              <button className="soon">Coming Soon</button>
            </div>
          </div>
          <div className="items">
            <h3>Sync to U3</h3>
            <p>Sync the information of the Dapp to U3.xyz.</p>
            <div className="btns">
              <button className="soon">Coming Soon</button>
            </div>
          </div>
          <div className="items">
            <h3>Delete</h3>
            <p>Delete the Dapp will also remove your data.</p>
            <div className="btns">
              <DialogTrigger>
                <Button className="del">Delete</Button>
                <Modal className={'confirm-modal'}>
                  <Dialog>
                    {({ close }) => (
                      <DelConfirmModal
                        closeModal={() => {
                          close()
                          setTimeout(() => {
                            navigate('/')
                          }, 1)
                        }}
                      />
                    )}
                  </Dialog>
                </Modal>
              </DialogTrigger>
            </div>
          </div>
        </div>
      </div>
    </DappInfoContainer>
  )
}

const DappInfoContainer = styled.div`
  margin-top: 25px;
  margin-bottom: 25px;
  div.items {
    background: #1b1e23;
    border: 1px solid #39424c;
    padding: 20px;
    border-radius: 20px;

    > p {
      font-weight: 400;
      font-size: 16px;
      line-height: 19px;

      color: #718096;
    }
  }

  h3 {
    margin: 0;
    font-style: italic;
    font-weight: 700;
    font-size: 24px;
    line-height: 28px;
  }
  > div.info {
    display: flex;
    gap: 20px;
    > img {
      width: 100px;
      height: 100px;
      border-radius: 20px;
    }
    > div {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
      > .appid {
        font-weight: 400;
        font-size: 16px;
        line-height: 24px;

        color: #718096;
        display: flex;
        align-items: center;
        > div {
          position: relative;
          > button {
            padding-top: 3px;
          }
          > span {
            position: absolute;
            top: 20px;
            left: 0;
            z-index: 200;
          }
        }
      }
      > p {
        margin: 0;
        padding: 0;
        font-weight: 400;
        font-size: 16px;
        line-height: 19px;

        color: #718096;
      }
    }
  }

  > div.links {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    margin-top: 20px;
    gap: 20px;
    > div.ops {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    & .items > div.btns {
      display: flex;
      justify-content: end;

      > button {
        padding: 12px 24px;

        height: 48px;

        background: #14171a;
        border-radius: 24px;
        cursor: not-allowed;
        color: #ffffff;
        font-weight: 500;
        font-size: 16px;
        line-height: 24px;
        &.del {
          cursor: pointer;
          background: #aa4f4f;
          width: 120px;

          > img {
            width: 24px;
          }
        }
      }
    }
  }
`
