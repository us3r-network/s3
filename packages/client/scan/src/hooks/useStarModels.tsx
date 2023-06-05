import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { useCeramicCtx } from '../context/CeramicCtx'
import { useCallback, useEffect, useState } from 'react'
import { ModelStream } from '../types'
import { getStarModels } from '../api'

export default function useStarModels() {
  const { network, s3ModelCollection } = useCeramicCtx()
  const session = useSession()

  const [starModels, setStarModels] = useState<Array<ModelStream>>([])

  const fetchStarModels = useCallback(
    async (
      personalCollections: Array<{
        modelId: string
        id: string
        revoke: boolean
      }>
    ) => {
      const ids = personalCollections.map((item) => {
        return item.modelId
      })

      const resp = await getStarModels({ network, ids })

      const list = resp.data.data
      setStarModels([...list])
    },
    [network]
  )

  const fetchPersonal = useCallback(async () => {
    if (!session) return
    s3ModelCollection.authComposeClient(session)
    const personal = await s3ModelCollection.queryPersonalCollections({
      first: 500,
    })
    const collected = personal.data?.viewer.modelCollectionList

    if (collected) {
      const personalCollections = collected?.edges
        .filter((item) => item.node && item.node.revoke !== true)
        .map((item) => {
          return {
            modelId: item.node.modelID,
            id: item.node.id!,
            revoke: !!item.node.revoke,
          }
        })

      await fetchStarModels(personalCollections)
    }
  }, [s3ModelCollection, session, fetchStarModels])

  useEffect(() => {
    fetchPersonal()
  }, [fetchPersonal])

  return {
    starModels,
  }
}
