import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Network } from '../types'
import { CERAMIC_MAINNET_HOST, CERAMIC_TESTNET_HOST } from '../constants'
import { S3ModelCollectionModel } from '@us3r-network/model-collection'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { Dapp, S3DappModel } from '@us3r-network/dapp'
import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { Edge } from '@ceramicnetwork/common'

export type PersonalCollection = {
  modelId: string
  id: string
  revoke: boolean
}
export interface CeramicContextData {
  ceramic: CeramicClient
  network: Network
  setNetwork: (arg0: Network) => void
  s3ModelCollection: S3ModelCollectionModel
  s3Dapp: S3DappModel
  dapps: Edge<Dapp>[] | undefined
  loadDapps: () => void
  personalCollections: Array<PersonalCollection>
  personalCollectionsWithoutFilter: Array<PersonalCollection>
  fetchPersonalCollections: () => void
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
  const [dapps, setDapps] = useState<Edge<Dapp>[]>()
  const [personalCollections, setPersonalCollections] = useState<
    PersonalCollection[]
  >([])
  const [
    personalCollectionsWithoutFilter,
    setPersonalCollectionsWithoutFilter,
  ] = useState<PersonalCollection[]>([])
  const session = useSession()

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

  const loadDapps = useCallback(async () => {
    if (!session) return
    s3Dapp.authComposeClient(session)
    const data = await s3Dapp.queryPersonalDapps({ first: 100 })
    setDapps(data.data?.viewer.dappList.edges)
  }, [session, s3Dapp])

  const fetchPersonalCollections = useCallback(async () => {
    if (!session) return
    s3ModelCollection.authComposeClient(session)
    const personal = await s3ModelCollection.queryPersonalCollections({
      first: 500,
    })
    const collected = personal.data?.viewer.modelCollectionList

    if (collected) {
      setPersonalCollections(
        collected?.edges
          .filter((item) => item.node.revoke !== true)
          .map((item) => {
            return {
              modelId: item.node.modelID,
              id: item.node.id!,
              revoke: !!item.node.revoke,
            }
          })
      )
      setPersonalCollectionsWithoutFilter(
        collected?.edges.map((item) => {
          return {
            modelId: item.node.modelID,
            id: item.node.id!,
            revoke: !!item.node.revoke,
          }
        })
      )
    }
  }, [s3ModelCollection, session])

  useEffect(() => {
    loadDapps()
    fetchPersonalCollections()
  }, [loadDapps, fetchPersonalCollections])

  useEffect(() => {
    if (!session) {
      setPersonalCollections([])
    }
  }, [session])

  return (
    <CeramicContext.Provider
      value={{
        personalCollectionsWithoutFilter,
        personalCollections,
        fetchPersonalCollections,
        dapps,
        ceramic,
        network,
        setNetwork,
        s3ModelCollection,
        s3Dapp,
        loadDapps,
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
