import { Tabs, TabList, Tab, TabPanel } from 'react-aria-components'
import Definition from './Definition'
import PlaygroundGraphiQL from './Playground'
import { Network } from './Selector/EnumSelect'
import styled from 'styled-components'
import ExploreInstance from './ExploreInstance'

export default function ExploreModelTabs({
  name,
  modelId,
}: {
  name: string
  modelId: string
}) {
  return (
    <Tabs>
      <ModelModalBox>
        <TabList aria-label="History of Ancient Rome">
          <Tab id="Definition">Model Definition</Tab>
          <Tab id="Instance">Model Instance Documents</Tab>
          <Tab id="Playground">Model Playground</Tab>
        </TabList>
        <div>
          <button>addToDapp</button>
          <button>addToFavorite</button>
        </div>
      </ModelModalBox>
      <TabPanel id="Definition">
        <Definition streamId={modelId} />
      </TabPanel>
      <TabPanel id="Instance">
        <ExploreInstance streamId={modelId} />
      </TabPanel>
      <TabPanel id="Playground">
        <PlaygroundGraphiQL streamId={modelId} />
      </TabPanel>
    </Tabs>
  )
}

const ModelModalBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  .react-aria-TabList {
    border: 1px solid #39424c;
    border-radius: 100px;
    padding: 2px;

    &[aria-orientation='horizontal'] {
      .react-aria-Tab {
        border-bottom: none;
      }
    }
  }
  .react-aria-Tab {
    padding: 10px;
    cursor: default;
    outline: none;
    position: relative;
    font-weight: 700;
    font-size: 18px;
    line-height: 21px;
    color: #718096;
    cursor: pointer;
    transition: color 200ms;
    padding: 20px 15px;

    &[data-hovered],
    &:focus {
      color: var(--text-color-hover);
    }

    &[aria-selected='true'] {
      --border-color: var(--highlight-color);
      color: var(--text-color-selected);
    }

    &[aria-disabled] {
      color: var(--text-color-disabled);
      &[aria-selected='true'] {
        --border-color: var(--text-color-disabled);
      }
    }

    &[data-focus-visible]:after {
      content: '';
      position: absolute;
      inset: 4px;
      border-radius: 4px;
      border: 2px solid var(--highlight-color);
    }
  }

  .react-aria-Tab {
    padding: 6px 20px;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    &[aria-selected='true'] {
      color: #14171a;
      background-color: #ffffff;
      border-radius: 100px;
    }
  }

  .react-aria-TabPanel {
    margin-top: 4px;
    padding: 20px 0 0 0;
    border-radius: 4px;
    outline: none;
    flex-grow: 1;

    &[data-focus-visible] {
      box-shadow: inset 0 0 0 2px var(--highlight-color);
    }
  }
`
