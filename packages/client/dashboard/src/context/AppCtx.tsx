import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { ClientDApp } from '../types.d'
import { getDapp, getDappWithDid } from '../api/dapp'
import { useGuideStepsState } from '../hooks/useGuideSteps'

export type PersonalCollection = {
  modelId: string
  id: string
  revoke: boolean
}
export interface AppContextData {
  loadingDApps: boolean
  dapps: ClientDApp[]
  currDapp: ClientDApp | undefined
  currAppId: string
  setCurrAppId: React.Dispatch<React.SetStateAction<string>>
  loadDapps: () => Promise<void>
  guideSteps: ReturnType<typeof useGuideStepsState>
}

const AppContext = createContext<AppContextData | null>(null)

export default function AppProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [currDapp, setCurrDapp] = useState<ClientDApp>()
  const [dapps, setDapps] = useState<ClientDApp[]>([])
  const [loadingDApps, setLoadingDApps] = useState(false)
  const [loadingDApp, setLoadingDApp] = useState(false)
  const [currAppId, setCurrAppId] = useState('')

  const session = useSession()

  const loadDapps = useCallback(async () => {
    if (!session?.id) {
      setDapps([])
      return
    }
    const resp = await getDappWithDid(session.serialize())
    if (resp.data.code !== 0) {
      throw new Error(resp.data.msg)
    }
    setDapps(resp.data.data)
  }, [session])

  const loadCurrDapp = useCallback(async () => {
    setCurrDapp(undefined)
    if (!currAppId) return
    const resp = await getDapp(currAppId)
    setCurrDapp(resp.data.data)
  }, [currAppId])

  useEffect(() => {
    setLoadingDApp(true)
    loadCurrDapp()
      .catch(console.error)
      .finally(() => {
        setLoadingDApp(false)
      })
  }, [loadCurrDapp])

  useEffect(() => {
    setLoadingDApps(true)
    loadDapps()
      .catch(console.error)
      .finally(() => {
        setLoadingDApps(false)
      })
  }, [loadDapps])

  useEffect(() => {
    if (!session) {
      setDapps([])
    }
  }, [session])

  const guideSteps = useGuideStepsState(dapps, loadingDApps)

  return (
    <AppContext.Provider
      value={{
        dapps,
        currDapp,
        currAppId,
        setCurrAppId,
        loadDapps,
        loadingDApps: loadingDApps || loadingDApp,
        guideSteps,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppCtx() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('Missing connection context')
  }
  return {
    ...context,
  }
}
