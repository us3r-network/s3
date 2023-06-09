import { useCallback, useState } from 'react'
import styled from 'styled-components'
import CloseIcon from './Icons/CloseIcon'
import InputItem from './InputItem'
import { updateDapp } from '../api'
import { DISCORD, GITHUB, MEDIUM, MIRROR, TWITTER } from '../constants'
import { ClientDApp } from '../types'
import {
  useAuthentication,
  useSession,
} from '@us3r-network/auth-with-rainbowkit'
import { useAppCtx } from '../context/AppCtx'

export default function EditDappSocial({
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
  const socialLinks = selectedDapp.socialLinks

  const [twitter, setTwitter] = useState(
    socialLinks?.find((item) => item.platform === TWITTER)?.url || ''
  )
  const [discord, setDiscord] = useState(
    socialLinks?.find((item) => item.platform === DISCORD)?.url || ''
  )
  const [medium, setMedium] = useState(
    socialLinks?.find((item) => item.platform === MEDIUM)?.url || ''
  )
  const [mirror, setMirror] = useState(
    socialLinks?.find((item) => item.platform === MIRROR)?.url || ''
  )
  const [github, setGithub] = useState(
    socialLinks?.find((item) => item.platform === GITHUB)?.url || ''
  )

  const confirmAction = useCallback(async () => {
    if (!session?.id) {
      signIn()
      return
    }
    const socialLinks = []
    if (twitter) {
      socialLinks.push({
        platform: TWITTER,
        url: twitter,
      })
    }
    if (discord) {
      socialLinks.push({
        platform: DISCORD,
        url: discord,
      })
    }
    if (medium) {
      socialLinks.push({
        platform: MEDIUM,
        url: medium,
      })
    }
    if (github) {
      socialLinks.push({
        platform: GITHUB,
        url: github,
      })
    }
    if (mirror) {
      socialLinks.push({
        platform: MIRROR,
        url: mirror,
      })
    }
    try {
      setUpdating(true)
      const resp = await updateDapp(
        {
          ...selectedDapp,
          socialLinks: socialLinks,
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
    twitter,
    discord,
    medium,
    github,
    mirror,
    signIn,
    selectedDapp,
    loadDapps,
    closeModal,
  ])

  return (
    <ContentBox>
      <div className="title">
        <h2>Social Links</h2>
        <span onClick={closeModal}>
          <CloseIcon />
        </span>
      </div>

      <div className="items">
        <InputItem
          label="Twitter:"
          placeHolder="https://ceramic.s3.xyz/"
          value={twitter}
          setValue={setTwitter}
        />
        <InputItem
          label="Discord:"
          placeHolder="https://ceramic.s3.xyz/"
          value={discord}
          setValue={setDiscord}
        />
        <InputItem
          label="Medium:"
          placeHolder="https://ceramic.s3.xyz/"
          value={medium}
          setValue={setMedium}
        />
        <InputItem
          label="Mirror:"
          placeHolder="https://ceramic.s3.xyz/"
          value={mirror}
          setValue={setMirror}
        />
        <InputItem
          label="Github:"
          placeHolder="https://ceramic.s3.xyz/"
          value={github}
          setValue={setGithub}
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
