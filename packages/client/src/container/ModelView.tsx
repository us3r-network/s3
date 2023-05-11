import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'react-aria-components'
import { getModelInfo } from '../api'
import { ModelStream } from '../types'
import { useCeramicCtx } from '../context/CeramicCtx'
import Definition from '../components/ModelView/Definition'
import Instance from '../components/ModelView/Instance'
import PlaygroundGraphiQL from '../components/ModelView/Playground'

export default function ModelView() {
  const { streamId } = useParams()
  const { network } = useCeramicCtx()

  const [modelStream, setModelStream] = useState<ModelStream>()

  const fetchModelInfo = useCallback(
    async (streamId: string) => {
      const resp = await getModelInfo({ network, id: streamId })
      setModelStream(resp.data.data)
    },
    [network]
  )

  useEffect(() => {
    if (!streamId) return
    fetchModelInfo(streamId)
  }, [streamId, fetchModelInfo])

  return (
    <Tabs>
      <div className="title-bar">
        <span>{modelStream?.streamContent?.name}</span>
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
