import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { useMemo } from 'react'
import { useAppCtx } from '../context/AppCtx'

export default function useIsOwner() {
  const session = useSession()
  const { dapps, currAppId } = useAppCtx()
  const isOwner = useMemo(() => {
    if (!session?.id) return false
    return dapps.some((dapp) => `${dapp.id}` === currAppId)
  }, [dapps, session?.id, currAppId])
  return { isOwner }
}
