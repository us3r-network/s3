import { useCallback, useEffect, useMemo } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import { Network } from '../types'
import ListTable from '../components/ListTable'
import useListData from '../hooks/useListData'
import { shortPubKeyHash } from '../utils/shortPubKey'
import { useCeramicCtx } from '../context/CeramicCtx'
import UserAvatarStyled from '../components/common/UserAvatarStyled'
import { UserName } from '@us3r-network/profile'
import {
  useAuthentication,
  useIsAuthenticated,
} from '@us3r-network/auth-with-rainbowkit'

export default function Profile() {
  const { did } = useParams()
  const { network } = useCeramicCtx()
  const { pageNum, data, hasMore, loadData, fetchMoreData } = useListData({
    network: network as Network,
    did,
  })

  const { ready, signOut } = useAuthentication()
  const isAuthenticated = useIsAuthenticated()
  const isDisabled = !ready || !isAuthenticated
  const logoutAction = useCallback(() => {
    if (!isDisabled && isAuthenticated) {
      signOut()
      window.location.href = '/'
    }
  }, [isDisabled, isAuthenticated, signOut])

  useEffect(() => {
    if (!network || !did) return
    loadData({ network: network as Network, did })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, did])

  const pubkey = useMemo(() => {
    if (!did) return ''
    return did
  }, [did])

  return (
    <div>
      <Title>
        <UserAvatarStyled className="avatar" did={did} />
        <div className="names">
          <h3>
            <UserName did={did} />
          </h3>
          <span>{shortPubKeyHash(pubkey)}</span>
        </div>
        <button onClick={logoutAction}>Logout</button>
      </Title>
      <InfiniteScroll
        dataLength={data.length}
        next={() => {
          pageNum.current += 1
          fetchMoreData(pageNum.current)
        }}
        hasMore={hasMore}
        loader={<Loading>Loading...</Loading>}
      >
        <ListTable data={data} />
      </InfiniteScroll>
      {!hasMore && <Loading>no more data</Loading>}
    </div>
  )
}

const Title = styled.div`
  z-index: 100;
  background-color: #14171a;
  padding: 20px 0;
  top: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  .names {
    > h3 {
      margin: 0;
    }
    > span {
      color: #718096;
    }
  }

  & .avatar {
    width: 60px;
    height: 60px;
  }

  > h2 {
    margin: 0;
  }

  button {
    overflow: hidden;
    cursor: pointer;
    width: 54px;
    height: 32px;
    border-radius: 10px;
    color: #fff;
    background: none;
    outline: none;
    border: 1px solid gray;
  }
`

const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: gray;
`
