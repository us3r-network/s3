import React from 'react'
import {
  Button,
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from 'react-aria-components'
import styled from 'styled-components'
import { ClientDApp } from '../../types'
import DiscordIcon from '../icons/DiscordIcon'
import EditIcon from '../icons/EditIcon'
import GithubIcon from '../icons/GithubIcon'
import MediumIcon from '../icons/MediumIcon'
import MirrorIcon from '../icons/MirrorIcon'
import TwitterIcon from '../icons/TwitterIcon'
import EditDappSocial from './EditDappSocial'

const IconMap: { [key: string]: () => JSX.Element } = {
  twitter: TwitterIcon,
  discord: DiscordIcon,
  mirror: MirrorIcon,
  medium: MediumIcon,
  github: GithubIcon,
}

export default function DappSocialEditor({
  selectedDapp,
  isOwner,
}: {
  selectedDapp: ClientDApp
  isOwner: boolean
}) {
  return (
    <DappSocialEditorBox className="items">
      <div className="title">
        <h3>Social Links</h3>
        {isOwner && (
          <DialogTrigger>
            <Button>
              <EditIcon />
            </Button>
            <ModalOverlay>
              <Modal>
                <Dialog>
                  {({ close }) => (
                    <EditDappSocial
                      closeModal={close}
                      selectedDapp={selectedDapp}
                    />
                  )}
                </Dialog>
              </Modal>
            </ModalOverlay>
          </DialogTrigger>
        )}
      </div>
      <div>
        {selectedDapp.socialLinks?.map((item) => {
          return (
            <div key={item.platform} className="social-item">
              <div>
                {IconMap[item.platform] &&
                  React.createElement(IconMap[item.platform])}
                <span>{item.platform}</span>
              </div>
              <a href={item.url} target="_blank" rel="noreferrer">
                {item.url}
              </a>
            </div>
          )
        })}
      </div>
    </DappSocialEditorBox>
  )
}

const DappSocialEditorBox = styled.div`
  > .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .social-item {
    margin-bottom: 20px;
    > div {
      display: flex;
      align-items: center;
      gap: 7px;
      margin-bottom: 12px;
      > span {
        text-transform: capitalize;
        font-weight: 400;
        font-size: 16px;
        line-height: 19px;

        color: #718096;
      }
    }
    a {
      text-decoration: none;
      color: #fff;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
    }
  }
`
