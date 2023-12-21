/*
 * @Author: bufan bufan@hotmail.com
 * @Date: 2023-12-15 10:06:03
 * @LastEditors: bufan bufan@hotmail.com
 * @LastEditTime: 2023-12-21 12:46:51
 * @FilePath: /s3/packages/client/dashboard/src/components/ModelTabs.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Tabs, TabList, Tab, TabPanel } from 'react-aria-components'
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
      <TabPanel id="Definition">
        <Definition streamId={modelId} />
      </TabPanel>
      <TabPanel id="model-sdk">
        <ModelSDK modelId={modelId} modelName={name} />
      </TabPanel>
    </Tabs>
  )
}
