import { useParams } from 'react-router-dom'
import { useAppCtx } from '../context/AppCtx'
import { useMemo } from 'react'
import { Network } from '../types.d'
import { CERAMIC_MAINNET_HOST, CERAMIC_TESTNET_HOST } from '../constants'
import { S3ModelCollectionModel } from '@us3r-network/data-model'

export default function useSelectedDapp() {
  const { dapps } = useAppCtx()
  const { appId } = useParams()
  const selectDapps = useMemo(() => {
    return (
      dapps?.map((item) => ({
        ...item,
        id: item.id!,
        name: item.name,
      })) || []
    )
  }, [dapps])

  const selectedDapp = useMemo(() => {
    return selectDapps?.find((item) => item.id === Number(appId))
  }, [selectDapps, appId])

  const s3ModelCollection = useMemo(() => {
    if (selectedDapp?.network === Network.MAINNET) {
      return new S3ModelCollectionModel(CERAMIC_MAINNET_HOST, 'mainnet')
    }
    return new S3ModelCollectionModel(CERAMIC_TESTNET_HOST, 'testnet')
  }, [selectedDapp?.network])

  return {
    appId,
    selectedDapp,
    selectDapps,

    s3ModelCollection,
  }
}
