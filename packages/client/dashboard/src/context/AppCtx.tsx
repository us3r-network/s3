import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { ClientDApp } from '../types'
import { getDappWithDid } from '../api'
import { GuideStepsState, useGuideStepsState } from '../hooks/useGuideSteps'

export type PersonalCollection = {
  modelId: string
  id: string
  revoke: boolean
}
export interface AppContextData {
  loadingDApps: boolean
  dapps: ClientDApp[]
  loadDapps: () => Promise<void>
  guideSteps: GuideStepsState
}

const AppContext = createContext<AppContextData | null>(null)

export default function AppProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [dapps, setDapps] = useState<ClientDApp[]>([])
  const [loadingDApps, setLoadingDApps] = useState(false)

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
        loadDapps,
        loadingDApps,
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
