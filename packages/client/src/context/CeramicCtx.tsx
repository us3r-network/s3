import React, { createContext, useContext, useMemo } from 'react'
import { Network } from '../types'
import { CERAMIC_MAINNET_HOST, CERAMIC_TESTNET_HOST } from '../constants'
import { S3ModelCollectionModel } from '@us3r-network/model-collection'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { S3DappModel } from '@us3r-network/dapp'

export interface CeramicContextData {
  ceramic: CeramicClient
  network: Network
  setNetwork: (arg0: Network) => void
  s3ModelCollection: S3ModelCollectionModel
  s3Dapp: S3DappModel
}

const CeramicContext = createContext<CeramicContextData | null>(null)

export default function CeramicProvider({
  children,
  network,
  setNetwork,
}: {
  children: React.ReactNode
  network: Network
  setNetwork: (arg0: Network) => void
}) {
  const s3ModelCollection = useMemo(() => {
    if (network === Network.MAINNET) {
      return new S3ModelCollectionModel(CERAMIC_MAINNET_HOST, 'mainnet')
    }
    return new S3ModelCollectionModel(CERAMIC_TESTNET_HOST, 'testnet')
  }, [network])

  const s3Dapp = useMemo(() => {
    if (network === Network.MAINNET) {
      return new S3DappModel(CERAMIC_MAINNET_HOST)
    }
    return new S3DappModel(CERAMIC_TESTNET_HOST)
  }, [network])

  const ceramic = useMemo(() => {
    if (network === Network.MAINNET) {
      return new CeramicClient(CERAMIC_MAINNET_HOST)
    }
    return new CeramicClient(CERAMIC_TESTNET_HOST)
  }, [network])

  return (
    <CeramicContext.Provider
      value={{
        ceramic,
        network,
        setNetwork,
        s3ModelCollection,
        s3Dapp,
      }}
    >
      {children}
    </CeramicContext.Provider>
  )
}

export function useCeramicCtx() {
  const context = useContext(CeramicContext)
  if (!context) {
    throw new Error('Missing connection context')
  }
  return {
    ...context,
  }
}
