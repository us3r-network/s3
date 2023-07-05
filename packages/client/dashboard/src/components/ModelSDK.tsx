import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import camelCase from 'camelcase'

import Prism from 'prismjs'
import 'prismjs/components/prism-typescript'
import 'prismjs/plugins/line-numbers/prism-line-numbers.js'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'

import { getModelSDK } from '../api'
import useSelectedDapp from '../hooks/useSelectedDapp'
import { sdkTemplate } from './sdkTemplate'

import { GraphqlGenType, Network } from './Selector/EnumSelect'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'react-aria-components'
import FileSaver from 'file-saver'

export default function ModelSDK({
  modelId,
  modelName,
}: {
  modelId: string
  modelName: string
}) {
  const { selectedDapp } = useSelectedDapp()

  const [codes, setCodes] = useState<
    { id: number; title: string; content: string }[]
  >([])
  const [loading, setLoading] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState('')
  const [selectKey, setSelectKey] = useState<string>('0')
  const [genType, setGenType] = useState(GraphqlGenType.CLIENT_PRESET)

  const download = (text: string, filename: string) => {
    const blob = new Blob([text], {
      type: 'text/plain;charset=utf-8',
    })

    FileSaver.saveAs(blob, filename)
  }

  const downloadCurr = useCallback(() => {
    if (codes.length === 0) {
      return
    }
    let curr
    if (selectKey) {
      curr = codes.find((item) => `${item.id}` === selectKey)
    } else {
      curr = codes[0]
    }
    if (!curr) {
      console.error('no curr')
      return
    }

    download(curr.content, curr.title)
  }, [selectKey, codes])

  const fetchModelSDK = useCallback(async () => {
    try {
      setLoading(true)
      setErrMsg('')
      const resp = await getModelSDK({
        network: selectedDapp?.network as Network,
        modelId: modelId,
        type: genType,
      })
      if (resp.data.code !== 0) {
        throw new Error(resp.data.msg)
      }

      const data: { filename: string; content: string }[] = resp.data.data
      const graphql = data.find((item: any) => item.filename === 'graphql.ts')
      if (!graphql) {
        throw new Error('no graphql')
      }

      const sdkContent = sdkTemplate
        .replaceAll('<%= modelName %>', modelName)
        .replaceAll('<%= modelNameCamelcase %>', camelCase(modelName))

      setCodes(
        [
          graphql,
          {
            filename: `S3${modelName}Model.ts`,
            content: sdkContent,
          },
        ].map((item, i) => ({
          title: item.filename,
          content: item.content,
          id: i,
        }))
      )
    } catch (error) {
      console.error(error)
      setErrMsg((error as any).message)
    } finally {
      setLoading(false)
    }
  }, [selectedDapp?.network, modelId, genType, modelName])

  useEffect(() => {
    fetchModelSDK()
  }, [fetchModelSDK])

  return (
    <SDKContainer>
      {/* <EnumSelect
        value={genType}
        setValue={setGenType}
        labelText=""
        values={GraphqlGenType}
      /> */}

      {(errMsg && (
        <div className="err-msg">
          <p>An Error Occurred Please Try Again Later.</p>
          <p className="info">{errMsg}</p>
        </div>
      )) || (
        <>
          {(loading && (
            <SDKBoxLoading>
              <Loading>Loading...</Loading>
            </SDKBoxLoading>
          )) || (
            <SDKBox>
              <TabsStyle>
                <TabBox>
                  <TabList
                    className={'code-tabs'}
                    aria-label="Dynamic tabs"
                    items={codes}
                    onSelectionChange={(key) => {
                      setSelectKey(key.toString())
                    }}
                  >
                    {(item) => <Tab className={'code-tab'}>{item.title}</Tab>}
                  </TabList>

                  <button onClick={downloadCurr}>Download</button>
                </TabBox>
                <TabPanels items={codes}>
                  {(item) => (
                    <TabPanel>
                      <Code name={item.title} content={item.content} />
                    </TabPanel>
                  )}
                </TabPanels>
              </TabsStyle>
            </SDKBox>
          )}
        </>
      )}
    </SDKContainer>
  )
}

export function Code({ name, content }: { name: string; content: string }) {
  useEffect(() => {
    Prism.highlightAll()
  }, [content])

  const preCode = `<pre class="line-numbers"><code class="language-typescript">${content}</code></pre>`
  return (
    <CodeBox>
      <div
        className="line-numbers"
        dangerouslySetInnerHTML={{ __html: preCode }}
      ></div>
    </CodeBox>
  )
}

const SDKContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  .err-msg {
    text-align: center;
    margin-top: 20px;
    color: #ff4d4f;
    font-size: 16px;

    .info {
      font-size: 14px;
      color: #718096;
    }
  }
`

const SDKBox = styled.div`
  padding: 12px 20px 0 20px;
  border-radius: 20px;
  border: 1px solid #39424c;
  background: #1b1e23;
`

const CodeBox = styled.div`
  > .name {
    border-bottom: none;
    display: inline-block;
    padding: 10px 20px;
  }
  > .line-numbers {
    overflow: scroll;
    /* margin-bottom: 20px; */
  }
`

const TabsStyle = styled(Tabs)`
  margin: 0;
  padding: 0;

  .react-aria-TabPanel {
    padding: 0;
    margin: 0;
  }
`

const TabBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #39424c;
  margin-bottom: 10px;
  .code-tabs {
    display: flex;
    height: 72px;
    align-items: center;
    gap: 20px;

    .code-tab {
      display: flex;
      height: 72px;
      justify-content: center;
      align-items: center;

      position: relative;
      border-bottom: none;
      border-left: none;
      cursor: pointer;

      font-size: 18px;
      font-family: Rubik;
      border: none;
      outline: none;
      color: #718096;
      /* medium-16 */
      font-size: 16px;
      font-family: Rubik;
      font-weight: 500;

      &:first-child {
        border-top-left-radius: 5px;
      }

      &:last-child {
        border-top-right-radius: 5px;
      }

      &::before {
        content: ' ';
        position: absolute;
        width: 100%;
        height: 3px;
        left: 0;
        bottom: -1px;
        border-radius: 100px 100px 0px 0px;
      }
      &[aria-selected='true']::before {
        background-color: #fff;
      }

      &[aria-selected='true'] {
        color: #fff;
      }
    }
  }

  > button {
    background-color: #fff;
    padding: 5px 15px;
    border-radius: 100px;

    color: #14171a;
    height: 40px;
    /* Text/Body 16pt · 1rem */
    font-size: 16px;
    font-family: Rubik;
    line-height: 24px;
  }
`

const SDKBoxLoading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`

const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: gray;
`
