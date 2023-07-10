import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ComposeClient } from '@composedb/client'
import { RuntimeCompositeDefinition } from '@composedb/types'
import { DID } from 'dids'
import useSelectedDapp from './useSelectedDapp'
import { Network } from '../components/Selector/EnumSelect'
import { CERAMIC_MAINNET_HOST, CERAMIC_TESTNET_HOST } from '../constants'

export function useComposeClient(definition: RuntimeCompositeDefinition) {
  const { selectedDapp } = useSelectedDapp()
  const session = useSession()

  const composeClient = useMemo(
    () =>
      definition
        ? new ComposeClient({
            ceramic:
              selectedDapp?.network === Network.MAINNET
                ? CERAMIC_MAINNET_HOST
                : CERAMIC_TESTNET_HOST,
            definition,
          })
        : null,
    [definition, selectedDapp?.network]
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

  return { composeClient, composeClientAuthenticated }
}
