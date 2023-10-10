import { useCallback, useEffect, useRef, useState } from 'react'
import { useCeramicCtx } from '../context/CeramicCtx'
import { PageSize, getModelMid } from '../api'
import styled from 'styled-components'
import InfiniteScroll from 'react-infinite-scroll-component'
import { ModelMid } from '../types'
import { shortPubKey } from '../utils/shortPubKey'
import { UserAvatar } from '@us3r-network/profile'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'

export default function DappModelInstance({ modelId }: { modelId: string }) {
  const { network } = useCeramicCtx()
  const [modelMids, setModelMids] = useState<ModelMid[]>([])
  const [hasMore, setHasMore] = useState(true)
  const pageNum = useRef(1)
  const loadMids = useCallback(async () => {
    if (!modelId) return
    try {
      pageNum.current = 1
      const resp = await getModelMid({ modelId, network })
      setHasMore(resp.data.data.length >= PageSize)
      setModelMids(resp.data.data)
    } catch (error) {}
  }, [modelId, network])

  const loadMoreMids = useCallback(async () => {
    try {
      setHasMore(true)
      pageNum.current += 1
      const resp = await getModelMid({
        modelId,
        network,
        pageNumber: pageNum.current,
      })
      setHasMore(resp.data.data.length >= PageSize)
      setModelMids((prev) => {
        return [...prev, ...resp.data.data]
      })
    } catch (error) {
      pageNum.current -= 1
    }
  }, [modelId, network])

  useEffect(() => {
    loadMids()
  }, [loadMids])

  return (
    <InfiniteScroll
      dataLength={modelMids.length}
      next={() => {
        loadMoreMids()
      }}
      hasMore={hasMore}
      loader={<Loading>Loading...</Loading>}
    >
      <TableBox>
        <TableContainer>
          <thead>
            <tr>
              <th>Stream ID</th>
              <th>DiD</th>
              <th>Type</th>
              <th>Indexing Time</th>
            </tr>
          </thead>
          <tbody>
            {modelMids.map((item) => {
              console.log(item)
              return (
                <tr key={item.streamId}>
                  <td>
                    <Link
                      to={`/streams/stream/${item.streamId}?network=${network}`}
                    >
                      {shortPubKey(item.streamId, { len: 8 })}
                    </Link>
                  </td>
                  <td>
                    <ControllerBox>
                      <UserAvatar did={item.controllerDid} />
                      {shortPubKey(item.controllerDid, { len: 8 })}
                    </ControllerBox>
                  </td>
                  <td>{item.streamContent.type || '-'}</td>
                  <td>
                    <time>{dayjs(item.createdAt).fromNow()}</time>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </TableContainer>
      </TableBox>
    </InfiniteScroll>
  )
}

const ControllerBox = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`

const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: gray;
`

export const TableBox = styled.div`
  border-radius: 20px;
  border: 1px solid #39424c;
  background: #1b1e23;
`

const TableContainer = styled.table`
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
  tbody tr,
  thead tr {
    font-size: 15px;
    /* text-align: center; */
    height: 60px;
  }

  thead tr,
  tbody tr {
    > :nth-child(1) {
      width: 200px;
    }
    > :nth-child(2) {
      width: 500px;
    }
    > :nth-child(3) {
      width: calc(100% - 650px);
    }
  }

  thead tr th {
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    color: #718096;
    opacity: 0.8;
    text-align: start;

    overflow: hidden;

    &:first-child {
      padding-left: 20px;
    }

    &:last-child {
      padding-left: 20px;
      padding-right: 0px;
    }
  }

  tbody tr td {
    font-weight: 400;
    font-size: 16px;
    line-height: 19px;
    overflow: hidden;
    color: #ffffff;

    &:first-child {
      padding-left: 20px;
    }

    &:last-child {
      padding-left: 20px;
      padding-right: 0px;
    }

    > div {
      padding-right: 20px;
      text-overflow: ellipsis;
      overflow: hidden;
      padding-right: 5px;
    }
  }

  tbody tr {
    border-top: 1px solid #39424c;
  }

  tbody td {
    height: 88px;
  }

  .name {
    display: flex;
    gap: 10px;
    align-items: center;
    > span {
      color: #fff;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid #718096;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      &.name {
        font-size: 20px;
        font-weight: 500;
      }
      &.left {
        border: none;
        color: #fff;
        justify-content: start;
        font-family: Rubik;
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
      }
      > img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        flex-shrink: 0;
      }
    }
  }

  .desc {
    width: 420px;
    text-overflow: ellipsis;
    overflow: hidden;
    padding-right: 5px;
    white-space: nowrap;
  }

  .model {
    display: flex;
    align-items: center;
    gap: 10px;
    overflow: hidden;
  }
`
