import { Link } from 'react-router-dom'
import styled from 'styled-components'

import DappTwitter from '../components/icons/DappTwitter'
import DappDiscord from '../components/icons/DappDiscord'
import DappMirror from '../components/icons/DappMirror'
import DappMedium from '../components/icons/DappMedium'
import DappGithub from '../components/icons/DappGithub'
import { Dapp } from '../types'

export default function SocialLinks({
  socialLinks,
}: {
  socialLinks: Dapp['socialLinks']
}) {
  const socialTwitter = socialLinks.find((item) => item.platform === 'twitter')
  const socialDiscord = socialLinks.find((item) => item.platform === 'discord')
  const socialMirror = socialLinks.find((item) => item.platform === 'mirror')
  const socialGithub = socialLinks.find((item) => item.platform === 'github')
  const socialMedium = socialLinks.find((item) => item.platform === 'medium')

  return (
    <SocialLinksBox>
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
    </SocialLinksBox>
  )
}

const SocialLinksBox = styled.div`
  button {
    cursor: pointer;
    background-color: inherit;
    border: none;
  }
`
