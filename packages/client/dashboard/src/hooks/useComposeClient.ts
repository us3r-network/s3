import { CeramicClient } from '@ceramicnetwork/http-client'
import { ComposeClient } from '@composedb/client'
import { RuntimeCompositeDefinition } from '@composedb/types'
import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { DID } from 'dids'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CERAMIC_MAINNET_HOST, CERAMIC_TESTNET_HOST } from '../constants'
import { Network } from '../types.d'
import useSelectedDapp from './useSelectedDapp'

export function useComposeClient(definition: RuntimeCompositeDefinition | undefined, ceramicNodeURL: string|undefined = undefined) {
  const { selectedDapp } = useSelectedDapp()
  const session = useSession()
  const ceramicClient = useMemo(
    () =>
      new CeramicClient(
            ceramicNodeURL ? ceramicNodeURL :
              selectedDapp?.network === Network.MAINNET
                ? CERAMIC_MAINNET_HOST
                : CERAMIC_TESTNET_HOST
          ),
    [ceramicNodeURL, selectedDapp?.network]
  )
  const composeClient = useMemo(
    () =>
      definition
        ? new ComposeClient({
            ceramic: ceramicNodeURL ? ceramicNodeURL :
              selectedDapp?.network === Network.MAINNET
                ? CERAMIC_MAINNET_HOST
                : CERAMIC_TESTNET_HOST,
            definition,
          })
        : null,
    [ceramicNodeURL, definition, selectedDapp?.network]
  )
  const [composeClientAuthenticated, setComposeClientAuthenticated] =
    useState(false)

  const authComposeClients = useCallback(() => {
    if (!composeClient) return
    if (session) {
      composeClient.setDID(session.did)
      setComposeClientAuthenticated(true)
    } else {
      const did = new DID()
      composeClient.setDID(did)
      setComposeClientAuthenticated(false)
    }
  }, [session, composeClient, setComposeClientAuthenticated])

  useEffect(() => {
    authComposeClients()
  }, [authComposeClients])

  async function loadMultiStreams(ids = []) {
    const queries = ids.map((streamId) => ({ streamId }))
    // This will return an Object of stream ID keys to stream values
    return await ceramicClient.multiQuery(queries)
  }
  return { ceramicClient, loadMultiStreams, composeClient, composeClientAuthenticated }
}
