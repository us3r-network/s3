/*
 * @Author: bufan bufan@hotmail.com
 * @Date: 2023-12-15 10:06:03
 * @LastEditors: bufan bufan@hotmail.com
 * @LastEditTime: 2023-12-21 14:55:14
 * @FilePath: /s3/packages/client/dashboard/src/components/ModelTabs.tsx
 * @Description: 
 */
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components'
// import Definition from './Definition'
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
      <TabPanel id="Definition">
        {/* <Definition streamId={modelId} /> */}
      </TabPanel>
      <TabPanel id="model-sdk">
        <ModelSDK modelId={modelId} modelName={name} />
      </TabPanel>
    </Tabs>
  )
}
