import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { CeramicDto } from '../types'
import { getCeramicNode, getCeramicNodes } from '../api/ceramicNode'

export interface CeramicNodeContextData {
  loadingCeramicNodes: boolean
  ceramicNodes: CeramicDto[]
  currCeramicNode: CeramicDto | undefined
  loadCeramicNodes: () => Promise<void>
}

const CeramicNodeContext = createContext<CeramicNodeContextData | null>(null)

export default function CeramicNodeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [ceramicNodes, setCeramicNodes] = useState<CeramicDto[]>([])
  const [loadingCeramicNodes, setLoadingCeramicNodes] = useState(false)

  const session = useSession()

  const loadCeramicNodes = useCallback(async () => {
    if (!session?.id) {
      setCeramicNodes([])
      return
    }
    const resp = await getCeramicNodes(session.serialize())
    if (resp.data.code !== 0) {
      throw new Error(resp.data.msg)
    }
    setCeramicNodes(resp.data.data)
  }, [session])

  const currCeramicNode = useMemo(()=>ceramicNodes[0], [ceramicNodes])
  
  useEffect(() => {
    setLoadingCeramicNodes(true)
    loadCeramicNodes()
      .catch(console.error)
      .finally(() => {
        setLoadingCeramicNodes(false)
      })
  }, [loadCeramicNodes])


  useEffect(() => {
    if (!session) {
      setCeramicNodes([])
    }
  }, [session])

  return (
    <CeramicNodeContext.Provider
      value={{
        ceramicNodes,
        currCeramicNode,
        loadCeramicNodes,
        loadingCeramicNodes,
      }}
    >
      {children}
    </CeramicNodeContext.Provider>
  )
}

export function useCeramicNodeCtx() {
  const context = useContext(CeramicNodeContext)
  if (!context) {
    throw new Error('Missing connection context')
  }
  return {
    ...context,
  }
}
