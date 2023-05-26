
import { useCallback, useEffect, useState } from 'react'
import { useCeramicCtx } from '../context/CeramicCtx'
import {
  useAuthentication,
  useSession,
} from '@us3r-network/auth-with-rainbowkit'
import { Dapp } from '@us3r-network/dapp'
import { useNavigate, useParams } from 'react-router-dom'
import InputItem from '../components/Dapp/InputItem'
import AppIconInput from '../components/Dapp/AppIconInput'
import { EditBtnsBox, EditInfoBox, EditPageBox } from '../components/Dapp/EditPageBox'

export default function DappEdit() {
  const { appId } = useParams()

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
  const { s3Dapp, loadDapps } = useCeramicCtx()

  const session = useSession()
  const sessId = session?.id

  const updateInfo = (dapp: Dapp) => {
    setAppName(dapp.name)
    setIcon(dapp.icon || '')
    setRedirectUrl(dapp.url || '')
    setDescription(dapp.description || '')
    const socialLink = dapp.socialLink || []

    const twitter = socialLink.find(item => item.platform === 'twitter')
    if (twitter) setTwitter(twitter.url)

    const discord = socialLink.find(item => item.platform === 'discord')
    if (discord) setDiscord(discord.url)

    const medium = socialLink.find(item => item.platform === 'medium')
    if (medium) setMedium(medium.url)

    const mirror = socialLink.find(item => item.platform === 'mirror')
    if (mirror) setMirror(mirror.url)

    const github = socialLink.find(item => item.platform === 'github')
    if (github) setGithub(github.url)
  }

  const loadDapp = useCallback(async () => {
    if (!appId) return
    const resp = await s3Dapp.queryDappWithId(appId)
    const dapp = resp.data?.node
    if (!dapp) return
    updateInfo(dapp)
  }, [appId, s3Dapp])

  useEffect(() => {
    loadDapp()
  }, [loadDapp])

  const updateAppAction = useCallback(async () => {
    if (!appId) return
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
    s3Dapp.authComposeClient(session)
    const dapp: Dapp = {
      name: appName,
      icon,
      socialLink
    }
    if (redirectUrl) {
      dapp.url = redirectUrl
    }
    if (description) {
      dapp.description = description
    }
    const resp = await s3Dapp.updateDapp(appId, {
      ...dapp,
    })
    await loadDapps()
    if (resp.data?.updateDapp.document.id) {
      navigate(`/dapp/${resp.data?.updateDapp.document.id}`)
    }
  }, [
    loadDapps,
    appId,
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
    <EditPageBox>
      <EditInfoBox>
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
      </EditInfoBox>
      <EditBtnsBox>
        <button onClick={() => navigate(-1)}>Cancel</button>
        <button
          className="create"
          onClick={() => {
            if (!sessId) {
              signIn()
              return
            }
            updateAppAction()
          }}
        >
          Save
        </button>
      </EditBtnsBox>
    </EditPageBox>
  )
}




