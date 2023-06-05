import { Dapp } from '@us3r-network/data-model'
import { useCallback, useState } from 'react'

import DappEdit from '../icons/DappEdit'
import DappTwitter from '../icons/DappTwitter'
import DappDiscord from '../icons/DappDiscord'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import DappMirror from '../icons/DappMirror'
import DappMedium from '../icons/DappMedium'
import DappGithub from '../icons/DappGithub'
import Copy from '../icons/Copy'


export default function BasicInfo({ dapp }: { dapp?: Dapp }) {
  const socialLink = dapp?.socialLink || []
  const socialTwitter = socialLink.find((item) => item.platform === 'twitter')
  const socialDiscord = socialLink.find((item) => item.platform === 'discord')
  const socialMirror = socialLink.find((item) => item.platform === 'mirror')
  const socialGithub = socialLink.find((item) => item.platform === 'github')
  const socialMedium = socialLink.find((item) => item.platform === 'medium')

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

  return (
    <BasicBox>
      <div>
        <img src={dapp?.icon} alt="" />
        <div className="app-id">
          <h3>{dapp?.name}</h3>
          <div>
            <p>APP ID: {dapp?.id} </p>
            <div className="copy">
              <button
                onClick={() => {
                  if (!dapp?.id) return
                  copyAppId(dapp?.id)
                }}
              >
                <Copy />
              </button>
              {showCopyTint && <span>Copied</span>}
            </div>
          </div>
        </div>
        <div className="edit">
          <Link to={`/dapp/${dapp?.id}/edit`}>
            <button>
              <DappEdit />
            </button>
          </Link>
          <div className="social">
            {socialTwitter && (
              <Link to={socialTwitter.url} target="_blank">
                <button>
                  <DappTwitter />
                </button>
              </Link>
            )}
            {socialDiscord && (
              <Link to={socialDiscord.url} target="_blank">
                <button>
                  <DappDiscord />
                </button>
              </Link>
            )}
            {socialMirror && (
              <Link to={socialMirror.url} target="_blank">
                <button>
                  <DappMirror />
                </button>
              </Link>
            )}
            {socialMedium && (
              <Link to={socialMedium.url} target="_blank">
                <button>
                  <DappMedium />
                </button>
              </Link>
            )}
            {socialGithub && (
              <Link to={socialGithub.url} target="_blank">
                <button>
                  <DappGithub />
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
      {dapp?.description && <p>{dapp?.description}</p>}
    </BasicBox>
  )
}

const BasicBox = styled.div`
  margin: 24px 0;
  padding: 20px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
  gap: 20px;

  /* height: 184px; */
  background: #1b1e23;
  border: 1px solid #39424c;
  border-radius: 20px;

  > div {
    width: 100%;
    display: flex;
    gap: 20px;

    > img {
      width: 100px;
      height: 100px;
      border-radius: 20px;
    }

    .app-id {
      padding-top: 20px;
      h3 {
        font-style: italic;
        font-weight: 700;
        font-size: 24px;
        line-height: 28px;
        margin: 0;
      }

      > div {
        display: flex;
        align-items: center;

        .copy {
          position: relative;

          span {
            position: absolute;
            top: 20px;
            left: 0;
            color: #718096;
          }
        }

        button {
          background: none;
          border: none;
          cursor: pointer;
        }
      }
    }

    .edit {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      justify-content: space-between;
      align-items: end;
      button {
        cursor: pointer;
        background-color: inherit;
        border: none;
      }

      .social {
        /* align-self: end; */
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
      }
    }
  }

  p {
    padding: 0;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: #718096;
  }
  > p {
    margin: 0;
  }
`
