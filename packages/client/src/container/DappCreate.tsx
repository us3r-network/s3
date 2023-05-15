import styled from 'styled-components'
import AddIcon from '../components/icons/Add'
import { useCallback, useRef, useState } from 'react'
import { uploadImage } from '../api'
import { useCeramicCtx } from '../context/CeramicCtx'
import {
  useAuthentication,
  useSession,
} from '@us3r-network/auth-with-rainbowkit'
import { Dapp } from '@us3r-network/dapp'
import { useNavigate } from 'react-router-dom'

export default function DappCreate() {
  const [icon, setIcon] = useState('')
  const [appName, setAppName] = useState('')
  const [redirectUrl, setRedirectUrl] = useState('')
  const [description, setDescription] = useState('')
  const [twitter, setTwitter] = useState('')
  const [discord, setDiscord] = useState('')
  const [medium, setMedium] = useState('')
  const [mirror, setMirror] = useState('')
  const [github, setGithub] = useState('')

  const navigate = useNavigate()
  const { signIn } = useAuthentication()
  const { s3Dapp } = useCeramicCtx()

  const session = useSession()
  const sessId = session?.id

  const createAppAction = useCallback(async () => {
    if (!session) return
    if (!appName) return
    const socialLink = []
    if (twitter) {
      socialLink.push({
        platform: 'twitter',
        url: twitter,
      })
    }
    if (discord) {
      socialLink.push({
        platform: 'discord',
        url: discord,
      })
    }
    if (medium) {
      socialLink.push({
        platform: 'medium',
        url: medium,
      })
    }
    if (github) {
      socialLink.push({
        platform: 'github',
        url: github,
      })
    }
    if (mirror) {
      socialLink.push({
        platform: 'mirror',
        url: mirror,
      })
    }
    console.log(socialLink)
    s3Dapp.authComposeClient(session)
    const dapp: Dapp = {
      name: appName,
      icon,
    }
    if (redirectUrl) {
      dapp.url = redirectUrl
    }
    if (description) {
      dapp.description = description
    }
    const resp = await s3Dapp.createDapp({
      name: appName,
      icon,
      socialLink: socialLink,
    })

    if (resp.data?.createDapp.document.id) {
      navigate(`/dapp/${resp.data?.createDapp.document.id}`)
    }
  }, [
    navigate,
    session,
    s3Dapp,
    icon,
    appName,
    redirectUrl,
    description,
    twitter,
    discord,
    medium,
    github,
    mirror,
  ])

  return (
    <PageBox>
      <InfoBox>
        <div>
          <h3>Information</h3>
          <div className="app-basic">
            <AppIconInput icon={icon} setIcon={setIcon} />
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
            <h4>Description</h4>
            <textarea
              name=""
              id=""
              rows={9}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
        </div>
        <div>
          <h3> Social Links</h3>
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
        </div>
      </InfoBox>
      <BtnsBox>
        <button onClick={() => navigate(-1)}>Cancel</button>
        <button
          className="create"
          onClick={() => {
            if (!sessId) {
              signIn()
              return
            }
            createAppAction()
          }}
        >
          Create Application
        </button>
      </BtnsBox>
    </PageBox>
  )
}

function AppIconInput({
  icon,
  setIcon,
}: {
  icon?: string
  setIcon: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <AppIconBox>
      <h4>App Icon:</h4>
      <div
        className="add-place"
        onClick={() => {
          inputRef.current!.click()
        }}
      >
        {(icon && <img src={icon} alt="icon" />) || (
          <>
            <AddIcon />
            <input
              type="file"
              accept="image/*"
              ref={inputRef}
              onChange={async (e) => {
                const files = e.target.files
                if (!files) return
                const file = files[0]
                const resp = await uploadImage({ file })
                const iconUrl = resp.data.url
                setIcon(iconUrl)
              }}
            />
          </>
        )}
      </div>
    </AppIconBox>
  )
}

function InputItem({
  label,
  placeHolder,
  value,
  setValue,
}: {
  label: string
  value: string
  setValue: (v: string) => void
  placeHolder?: string
}) {
  return (
    <InputItemBox>
      <h4>{label}</h4>
      <input
        type="text"
        placeholder={placeHolder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
        }}
      />
    </InputItemBox>
  )
}

const InputItemBox = styled.div``

const AppIconBox = styled.div`
  width: 150px;
  flex-grow: 0 !important;
  .add-place {
    cursor: pointer;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    isolation: isolate;
    box-sizing: border-box;
    width: 150px;
    height: 150px;
    background: #1a1e23;
    border: 1px solid #39424c;
    border-radius: 12px;

    img {
      width: 100%;
    }
    input {
      display: none;
    }
  }
`

const PageBox = styled.div`
  background-color: #1b1e23;
  margin-top: 24px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  border-radius: 20px;

  .app-basic {
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
  }
`

const InfoBox = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;

  > div {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .items {
    gap: 20px;
    display: flex;
    flex-direction: column;
  }
  h3 {
    margin: 0;
    font-style: italic;
    font-weight: 700;
    font-size: 18px;
    line-height: 21px;
    color: #ffffff;
  }

  h4 {
    margin: 0 0 5px 0;
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: #ffffff;
  }
`

const BtnsBox = styled.div`
  display: flex;
  justify-content: end;
  gap: 20px;
  margin-top: 40px;
  button {
    width: 180px;
    height: 48px;

    background: #1b1e23;
    border: 1px solid #39424c;
    border-radius: 24px;
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: #ffffff;
    cursor: pointer;

    &.create {
      background: #ffffff;
      color: #14171a;
    }
  }
`
