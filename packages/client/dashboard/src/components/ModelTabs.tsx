import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'react-aria-components'
import Definition from './Definition'
import Instance from './Instance'
import PlaygroundGraphiQL from './Playground'
import { Network } from './Selector/EnumSelect'

export default function ModelTabs({
  name,
  modelId,
}: {
  name: string
  modelId: string
}) {
  return (
    <Tabs>
      <div className="dapp-title-bar">
        <span>{name}</span>
        <TabList aria-label="History of Ancient Rome">
          <Tab id="Definition">Model Definition</Tab>
          <Tab id="Instance">Model Instance Documents</Tab>
          <Tab id="Playground">Model Playground</Tab>
        </TabList>
      </div>
      <TabPanels>
        <TabPanel id="Definition">
          <Definition streamId={modelId} network={Network.TESTNET} />
        </TabPanel>
        <TabPanel id="Instance">
          <Instance streamId={modelId} network={Network.TESTNET} />
        </TabPanel>
        <TabPanel id="Playground">
          <PlaygroundGraphiQL streamId={modelId} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}