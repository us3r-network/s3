import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'react-aria-components'
import { getModelInfo } from '../api'
import { ModelStream } from '../types'
import { useCeramicCtx } from '../context/CeramicCtx'
import Definition from '../components/ModelView/Definition'
import Instance from '../components/ModelView/Instance'
import PlaygroundGraphiQL from '../components/ModelView/Playground'
import styled from 'styled-components'
import {
  Button,
  Item,
  Label,
  ListBox,
  Popover,
  Select,
} from 'react-aria-components'
import AddIcon from '../components/icons/Add'
import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { Dapp } from '@us3r-network/data-model'

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
      const dappItem = dapps?.find((item) => item.node && item.node.id === dappId)
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

  useEffect(() => {
    if (!streamId) return
    fetchModelInfo(streamId)
  }, [streamId, fetchModelInfo])

  let options = useMemo(() => {
    return dapps?.filter(item => item.node).map((item) => {
      return {
        id: item.node.id,
        name: item.node.name,
      }
    })
  }, [dapps])

  return (
    <Tabs>
      <div className="title-bar">
        <ToolsBox>
          <span>{modelStream?.streamContent?.name}</span>
          <Select
            onSelectionChange={(k) => {
              addToDappAction(k as string)
            }}
          >
            <Label></Label>
            <Button className="add-to-dapp">
              <AddIcon stroke="#000" /> Add To Dapp
            </Button>
            <Popover className={'modelview-popover'}>
              <ListBox items={options}>
                {(item) => <Item id={item.id}>{item.name}</Item>}
              </ListBox>
            </Popover>
          </Select>
        </ToolsBox>
        <TabList aria-label="History of Ancient Rome">
          <Tab id="Definition">Model Definition</Tab>
          <Tab id="Instance">Model Instance Documents</Tab>
          <Tab id="Playground">Model Playground</Tab>
        </TabList>
      </div>
      <TabPanels>
        <TabPanel id="Definition">
          <Definition />
        </TabPanel>
        <TabPanel id="Instance">
          <Instance />
        </TabPanel>
        <TabPanel id="Playground">
          <PlaygroundGraphiQL />
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}

const ToolsBox = styled.div`
  flex-grow: 1;
  padding-right: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  > span {
    font-style: italic;
    font-weight: 700;
    font-size: 24px;
    line-height: 28px;
    color: #ffffff;
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
