import styled from 'styled-components'
import { createImageFromInitials } from '../../utils/createImage'
import { getRandomColor } from '../../utils/randomColor'
import { useRef } from 'react'
import { useSession } from '@us3r-network/auth-with-rainbowkit'
import useIsOwner from '../../hooks/useIsOwner'

export default function Header({
  icon,
  name,
}: {
  icon?: string
  name: string
}) {
  const imgColor = useRef(getRandomColor())
  const session = useSession()
  const { isOwner } = useIsOwner()
  return (
    <HeaderWrap>
      <DappImg
        src={
          icon ||
          createImageFromInitials(60, name.slice(0, 1), imgColor.current)
        }
      />

      {session?.id && isOwner && (
        <DappName>
          {name}, <Welcome>Welcome back!</Welcome>
        </DappName>
      )}
    </HeaderWrap>
  )
}

const HeaderWrap = styled.div`
  width: 100%;
  height: 320px;
  border-radius: 20px;
  overflow: hidden;

  background-image: url('/dapp-home/header-bg.png');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  padding-left: 40px;
  box-sizing: border-box;
`
const DappImg = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 20px;
  overflow: hidden;
`
const DappName = styled.span`
  color: #fff;
  font-size: 48px;
  font-style: italic;
  font-weight: 700;
  line-height: normal;
`
const Welcome = styled.span`
  color: var(--ffffff, #fff);
  font-size: 48px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`
