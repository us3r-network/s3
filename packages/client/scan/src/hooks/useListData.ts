import { useCallback, useRef, useState } from 'react'

import { getList, PageSize } from '../api'
import { Network, Stream } from '../types'

export default function useListData({
  network,
  did,
}: {
  network: Network
  did?: string
}) {
  const pageNum = useRef(1)
  const [data, setData] = useState<Array<Stream>>([])
  const [hasMore, setHasMore] = useState(true)

  const loadData = async ({
    network,
    familyOrApp,
    did,
    types,
  }: {
    network: Network
    familyOrApp?: string[]
    types?: string[]
    did?: string
  }) => {
    const resp = await getList({ network, familyOrApp, did, types })
    const { streams } = resp.data.data
    setHasMore(streams.length >= PageSize)
    setData(streams)
    pageNum.current = 1
  }

  const fetchMoreData = useCallback(
    async (pageNumber: number, types?: string[], familyOrApp?: string[]) => {
      const resp = await getList({
        network,
        pageNumber,
        familyOrApp,
        did,
        types,
      })
      const { streams } = resp.data.data
      setHasMore(streams.length >= PageSize)
      setData([...data, ...streams])
    },
    [data, network, did]
  )

  return {
    pageNum,
    data,
    setData,
    hasMore,
    setHasMore,
    loadData,
    fetchMoreData,
  }
}
