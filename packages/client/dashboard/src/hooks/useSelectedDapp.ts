import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useAppCtx } from '../context/AppCtx'

// todo: this hook is NOT simimalr to useAppCtx, can be removed later
export default function useSelectedDapp() {
  const { dapps, currAppId } = useAppCtx()
  const { appId } = useParams()

  const selectedDapp = useMemo(() => {
    return dapps?.find((item) => item.id === Number(currAppId || appId))
  }, [dapps, currAppId, appId])

  return {
    appId,
    selectedDapp,
  }
}
