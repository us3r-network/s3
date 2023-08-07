import styled from 'styled-components'
import dayjs from 'dayjs'
import { useCallback, useEffect } from 'react'

import Title from './Title'
import useListData from '../../../hooks/useListData'
import { shortPubKey } from '../../../utils/shortPubKey'
import { useCeramicCtx } from '../../../context/CeramicCtx'
import { Link } from 'react-router-dom'
import UserAvatarStyled from '../../common/UserAvatarStyled'
import { UserName } from '@us3r-network/profile'
import { debounce } from 'lodash'

export default function Streams() {
  const { network } = useCeramicCtx()
  const { data, loadData } = useListData({ network })

  const fetchModelWithDebounce = useCallback(debounce(loadData, 200), [])

  useEffect(() => {
    fetchModelWithDebounce({ network })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network])

  return (
    <Box>
      <Title title="Total Streams" viewAll="/streams" />
      {data.slice(0, 10).map((item) => {
        return (
          <ListCard
            key={item.streamId}
            streamId={item.streamId}
            did={item.did}
            indexingTime={item.indexingTime}
          />
        )
      })}
    </Box>
  )
}

function ListCard({
  streamId,
  did,
  indexingTime,
}: {
  streamId: string
  did: string
  indexingTime: number
}) {
  const { network } = useCeramicCtx()
  return (
    <CardBox className="streams-box">
      <div className="short-key">
        <Link to={`/streams/stream/${streamId}?network=${network}`}>
          {shortPubKey(streamId, { len: 8, split: '-' })}
        </Link>{' '}
      </div>
      <div className="avatar">
        <Avatar did={did} />
        <Link to={`/streams/profile/${did}?network=${network}`}>
          <UserName did={did} />
        </Link>
      </div>
      <div className="time">{dayjs(indexingTime).fromNow()}</div>
    </CardBox>
  )
}

const Avatar = styled(UserAvatarStyled)`
  width: 40px;
  height: 40px;
`

const CardBox = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr 110px;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;
  border-bottom: 1px solid rgba(57, 66, 76, 0.5);
  &:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }

  .avatar {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .time {
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    text-align: end;
    color: #718096;
  }
`

const Box = styled.div``
