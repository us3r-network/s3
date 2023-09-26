import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Tabs, TabList, Tab, TabPanel } from 'react-aria-components'
import { getModelInfo, startIndexModel } from '../api'
import { ModelStream } from '../types'
import { useCeramicCtx } from '../context/CeramicCtx'
import Definition from '../components/ModelView/Definition'
import Instance from '../components/ModelView/Instance'
import PlaygroundGraphiQL from '../components/ModelView/Playground'
import styled from 'styled-components'

import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { Dapp } from '@us3r-network/data-model'
import Spinner from '../components/icons/Spinner'
import { ADMIN_ADDRESS } from '../constants'

export default function ModelView() {
  const { streamId } = useParams()
  const {
    network,
    dapps,
    s3Dapp,
    loadDapps,
    s3ModelCollection,
    personalCollectionsWithoutFilter,
    fetchPersonalCollections,
  } = useCeramicCtx()
  const session = useSession()

  const [modelStream, setModelStream] = useState<ModelStream>()
  const [indexing, setIndexing] = useState(false)

  const fetchModelInfo = useCallback(
    async (streamId: string) => {
      const resp = await getModelInfo({ network, id: streamId })
      setModelStream(resp.data.data)
    },
    [network]
  )

  const addModelToDapp = useCallback(
    async (dapp: Dapp, modelId: string) => {
      if (!session) return
      s3Dapp.authComposeClient(session)
      const models = dapp.models || []
      if (models.includes(modelId)) return
      models.push(modelId)
      await s3Dapp.updateDapp(dapp.id!, {
        models,
      })
      await loadDapps()
    },
    [loadDapps, s3Dapp, session]
  )

  const addModelToCollection = useCallback(
    async (modelId: string) => {
      if (!session) return
      s3ModelCollection.authComposeClient(session)
      const hasCollected = personalCollectionsWithoutFilter.find(
        (item) => item.modelId === modelId
      )

      if (hasCollected) {
        if (!hasCollected.revoke) {
          console.log('has collected')
        } else {
          await s3ModelCollection.updateCollection(hasCollected.id, {
            revoke: !hasCollected.revoke,
          })
        }
      } else {
        await s3ModelCollection.createCollection({
          modelID: modelId,
          revoke: false,
        })
      }

      await fetchPersonalCollections()
    },
    [
      s3ModelCollection,
      session,
      personalCollectionsWithoutFilter,
      fetchPersonalCollections,
    ]
  )

  const addToDappAction = useCallback(
    async (dappId: string) => {
      const modelId = streamId
      if (!modelId) return
      const dappItem = dapps?.find(
        (item) => item.node && item.node.id === dappId
      )
      if (!dappItem) return

      if (!dappItem.node.models?.includes(modelId)) {
        console.log('add to dapp')
        await addModelToDapp(dappItem.node, modelId)
      }

      // add to model-collection
      await addModelToCollection(modelId)
    },
    [streamId, dapps, addModelToDapp, addModelToCollection]
  )

  const startIndex = useCallback(async () => {
    if (!streamId) return
    try {
      setIndexing(true)
      const resp = await startIndexModel({
        network,
        modelId: streamId,
        didSession: session?.serialize(),
      })

      if (resp.data.code !== 0) {
        throw new Error(resp.data.msg)
      }
      await fetchModelInfo(streamId)
    } catch (error) {
      console.error(error)
    } finally {
      setIndexing(false)
    }
  }, [streamId, network, session, fetchModelInfo])

  useEffect(() => {
    if (!streamId) return
    fetchModelInfo(streamId)
  }, [streamId, fetchModelInfo])

  let options = useMemo(() => {
    return dapps
      ?.filter((item) => item.node)
      .map((item) => {
        return {
          id: item.node.id,
          name: item.node.name,
        }
      })
  }, [dapps])

  const isIndexed = useMemo(() => {
    return !!modelStream?.isIndexed
  }, [modelStream])

  const disabledKeys = useMemo(() => {
    if (isIndexed) return []
    return ['Instance', 'Playground']
  }, [isIndexed])

  const isAdmin = useMemo(() => {
    if (!session?.id || !ADMIN_ADDRESS) return false
    return session.id.endsWith(ADMIN_ADDRESS.toLowerCase())
  }, [session?.id])

  return (
    <Tabs disabledKeys={disabledKeys}>
      <div className="title-bar">
        <ToolsBox>
          <span>{modelStream?.streamContent?.name}</span>
          {isAdmin && !isIndexed && (
            <>
              {indexing ? (
                <button>
                  <Spinner />
                </button>
              ) : (
                <button onClick={startIndex}>Start index</button>
              )}
            </>
          )}
        </ToolsBox>
        <TabList aria-label="History of Ancient Rome">
          <Tab id="Definition">Model Definition</Tab>
          <Tab id="Instance">Model Instance Documents</Tab>
          <Tab id="Playground">Model Playground</Tab>
        </TabList>
      </div>

      <TabPanel id="Definition">
        <Definition />
      </TabPanel>
      <TabPanel id="Instance">
        <Instance />
      </TabPanel>
      <TabPanel id="Playground">
        <PlaygroundGraphiQL />
      </TabPanel>
    </Tabs>
  )
}

const ToolsBox = styled.div`
  flex-grow: 1;
  padding-right: 20px;
  display: flex;
  align-items: center;
  gap: 20px;

  > span {
    font-style: italic;
    font-weight: 700;
    font-size: 24px;
    line-height: 28px;
    color: #ffffff;
  }

  > button {
    cursor: pointer;
    border: none;
    outline: none;
    padding: 0 15px;
    height: 36px;
    border-radius: 100px;
    background: #14171a;
    font-size: 14px;
    line-height: 20px;
    text-align: center;
    color: #a0aec0;
    text-transform: capitalize;
    background: #718096;
    color: #14171a;
    background: #ffffff;
    font-family: Rubik;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
  }

  .add-to-dapp {
    border: none;
    border-radius: 100px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    padding: 8px 20px;
    cursor: pointer;
  }
`
