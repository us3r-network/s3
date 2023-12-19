import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { CeramicDto } from '../types'
import { getCeramicNode, getCeramicNodes } from '../api/ceramicNode'

export interface CeramicNodeContextData {
  loadingCeramicNodes: boolean
  ceramicNodes: CeramicDto[]
  // currCeramicNode: CeramicDto | undefined
  // currCeramicNodeId: number | undefined
  // setCurrCeramicNodeId: React.Dispatch<React.SetStateAction<number>>
  loadCeramicNodes: () => Promise<void>
  // loadCeramicNode: (id:number) => Promise<CeramicDto | undefined>
}

const CeramicNodeContext = createContext<CeramicNodeContextData | null>(null)

export default function CeramicNodeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // const [currCeramicNodeId, setCurrCeramicNodeId] = useState<number>()
  // const [currCeramicNode, setCurrCeramicNode] = useState<CeramicDto>()
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

  // const loadCurrNode = useCallback(async () => {
  //   setCurrCeramicNode(undefined)
  //   if (!currCeramicNodeId) return
  //   const resp = await getCeramicNode(currCeramicNodeId)
  //   setCurrCeramicNode(resp.data.data)
  // }, [currCeramicNodeId])

  // useEffect(() => {
  //   setLoadingCeramicNode(true)
  //   loadCurrNode()
  //     .catch(console.error)
  //     .finally(() => {
  //       setLoadingCeramicNode(false)
  //     })
  // }, [loadCurrNode])

  // const loadCeramicNode = useCallback(async (id:number) => {
  //   if (!id) return
  //   const resp = await getCeramicNode(id)
  //   return resp.data.data
  // }, [])
  
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
        // currCeramicNode,
        // currCeramicNodeId,
        // setCurrCeramicNodeId,
        loadCeramicNodes,
        // loadCeramicNode,
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
