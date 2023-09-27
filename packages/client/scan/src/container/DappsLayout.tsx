import { useCallback, useEffect, useRef, useState } from 'react'
import { Outlet, useSearchParams } from 'react-router-dom'
import { PageSize, getDapps } from '../api'
import { useCeramicCtx } from '../context/CeramicCtx'
import { Dapp } from '../types'

export default function DappsLayout() {
  const [dapps, setDapps] = useState<Dapp[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [searchParams] = useSearchParams()
  const [searchText, setSearchText] = useState(
    searchParams.get('searchText') || ''
  )
  const { network } = useCeramicCtx()
  const pageNumber = useRef(1)
  const loadDapps = useCallback(async () => {
    try {
      pageNumber.current = 1
      const resp = await getDapps({ network, name: searchText })
      setDapps(resp.data.data)
      setHasMore(resp.data.data.length >= PageSize)
    } catch (error) {
      console.error(error)
    }
  }, [network, searchText])

  const loadMoreDapps = useCallback(async () => {
    pageNumber.current += 1
    try {
      setHasMore(true)
      const resp = await getDapps({
        pageNumber: pageNumber.current,
        network,
        name: searchText,
      })
      setHasMore(resp.data.data.length >= PageSize)
      setDapps((prev) => {
        return [...prev, ...resp.data.data]
      })
    } catch (error) {
      pageNumber.current -= 1
      console.error(error)
    }
  }, [network, searchText])

  useEffect(() => {
    loadDapps()
  }, [loadDapps])

  return (
    <div>
      <Outlet
        context={{ dapps, loadMoreDapps, hasMore, setSearchText, searchText }}
      />
    </div>
  )
}
