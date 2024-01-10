import styled from 'styled-components'
import modelsIconUrl from './imgs/models.svg'
import compositesIconUrl from './imgs/composites.svg'
import streamsIconUrl from './imgs/streams.svg'
import { useEffect, useState, useMemo } from 'react'
import { getStreamsCountWithModels } from '../../api/model'
import { getDappComposites } from '../../api/composite'
import { Network } from '../Selector/EnumSelect'
import { ClientDApp } from '../../types'

export default function Dashboard({ dapp }: { dapp: ClientDApp }) {
  const models = useMemo(() => dapp?.models || [], [dapp])
  const network = useMemo(() => dapp?.network as Network, [dapp])
  const [compositesCount, setCompositesCount] = useState(0)
  const [streamsCount, setStreamsCount] = useState(0)

  useEffect(() => {
    if (!dapp) {
      setCompositesCount(0)
      return
    }
    ;(async () => {
      try {
        const resp = await getDappComposites({
          dapp: dapp,
        })
        if (resp.data.code !== 0) throw new Error(resp.data.msg)
        setCompositesCount(resp.data?.data?.length || 0)
      } catch (error) {
        console.error(error)
        setCompositesCount(0)
      }
    })()
  }, [dapp])

  useEffect(() => {
    if (!network || !models.length) {
      setStreamsCount(0)
      return
    }
    ;(async () => {
      try {
        const resp = await getStreamsCountWithModels({
          network: network,
          modelStreamIds: models.join(','),
        })
        if (resp.data.code !== 0) throw new Error(resp.data.msg)
        setStreamsCount(resp.data?.data || 0)
      } catch (error) {
        console.error(error)
        setStreamsCount(0)
      }
    })()
  }, [network, models])

  return (
    <DashboardWrap>
      <TotalCards>
        <TotalCard
          name="Models"
          number={models.length}
          iconUrl={modelsIconUrl}
        />
        <TotalCard
          name="Composites"
          number={compositesCount}
          iconUrl={compositesIconUrl}
        />
        <TotalCard
          name="Streams"
          number={streamsCount}
          iconUrl={streamsIconUrl}
        />
      </TotalCards>
    </DashboardWrap>
  )
}

const DashboardWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`
const TotalCards = styled.div`
  display: flex;
  gap: 20px;
`

function TotalCard({
  name,
  number,
  iconUrl,
}: {
  name: string
  number: number
  iconUrl: string
}) {
  return (
    <TotalCardWrap>
      <TotalCardName>{name}</TotalCardName>
      <TotalCardNumber>{number.toLocaleString()}</TotalCardNumber>
      <TotalCardIcon src={iconUrl} />
    </TotalCardWrap>
  )
}
const TotalCardWrap = styled.div`
  display: flex;
  padding: 20px;
  box-sizing: border-box;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  flex: 1;
  height: 145px;

  border-radius: 20px;
  background: linear-gradient(133deg, #233754 0%, #324765 100%);

  position: relative;
  overflow: hidden;
`
const TotalCardName = styled.span`
  color: var(--ffffff, #fff);

  font-size: 24px;
  font-style: italic;
  font-weight: 700;
  line-height: normal;

  z-index: 2;
`
const TotalCardNumber = styled.span`
  color: #fff;
  font-size: 48px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  z-index: 2;
`
const TotalCardIcon = styled.img`
  position: absolute;
  right: 0px;
  top: 15px;
  z-index: 1;
`
