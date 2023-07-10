import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'react-aria-components'
import Definition from './Definition'

import ModelSDK from './ModelSDK'

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
          <Tab id="model-sdk">Model SDK</Tab>
        </TabList>
      </div>
      <TabPanels>
        <TabPanel id="Definition">
          <Definition streamId={modelId} />
        </TabPanel>
        <TabPanel id="model-sdk">
          <ModelSDK modelId={modelId} modelName={name} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}
