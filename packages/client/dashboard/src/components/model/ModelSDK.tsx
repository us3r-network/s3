import camelCase from 'camelcase'
import FileSaver from 'file-saver'
import JSZip from 'jszip'
import Prism from 'prismjs'
import 'prismjs/components/prism-typescript'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'
import 'prismjs/plugins/line-numbers/prism-line-numbers.js'
import { useCallback, useEffect, useState } from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components'
import styled from 'styled-components'
import { getModelSDK, getModelsInfoByIds } from '../../api/model'
import { GraphqlGenType, Network } from '../../types.d'
import { sdkTemplate } from './sdkTemplate'

export default function ModelSDK ({
  modelId,
  network,
  modelName
}: {
  modelId: string
  network: Network
  modelName?: string
}) {
  const [codes, setCodes] = useState<
    { id: number; title: string; content: string }[]
  >([])
  const [loading, setLoading] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState('')
  const [genType] = useState(GraphqlGenType.CLIENT_PRESET)

  const downloadCurr = useCallback(() => {
    if (codes.length === 0) {
      return
    }
    const zip = new JSZip()

    codes.forEach(item => {
      zip.file(item.title, item.content)
    })
    zip
      .generateAsync({ type: 'blob' })
      .then(function (content) {
        FileSaver.saveAs(content, `${camelCase(modelName ||'')}SDK.zip`)
      })
      .catch(console.error)
  }, [codes, modelName])

  const fetchModelSDK = useCallback(async () => {
    if (!modelId || !network || !modelName) return
    try {
      setLoading(true)
      setErrMsg('')
      const resp = await getModelSDK({
        network: network,
        modelId: modelId,
        type: genType
      })
      if (resp.data.code !== 0) {
        throw new Error(resp.data.msg)
      }

      const data: { filename: string; content: string }[] = resp.data.data
      const graphql = data.find((item: any) => item.filename === 'graphql.ts')
      if (!graphql) {
        throw new Error('no graphql')
      }

      const runtimeComposite = data.find(
        item => item.filename === 'runtime-composite.ts'
      )
      if (!runtimeComposite) {
        throw new Error('no runtime-composite')
      }

      runtimeComposite.content = `// This is an auto-generated file, do not edit manually

export const definition = ${JSON.stringify(
        JSON.parse(runtimeComposite.content),
        null,
        2
      )}
      `

      const sdkContent = sdkTemplate
        .replaceAll('<%= modelName %>', modelName)
        .replaceAll('<%= modelNameCamelcase %>', camelCase(modelName))

      setCodes(
        [
          {
            filename: `S3${modelName}Model.ts`,
            content: sdkContent
          },
          runtimeComposite,
          graphql
        ].map((item, i) => ({
          title: item.filename,
          content: item.content,
          id: i
        }))
      )
    } catch (error) {
      console.error(error)
      setErrMsg((error as any).message)
    } finally {
      setLoading(false)
    }
  }, [network, modelId, genType, modelName])

  useEffect(() => {
    fetchModelSDK()
  }, [fetchModelSDK])

  useEffect(() => {
    if (!modelId || !network) return
    if (!modelName) {
      getModelsInfoByIds({
        network,
        ids: [modelId]
      }).then(resp => {
        modelName = resp.data.data[0].stream_content.name
      })
    }
  }, [network, modelId, genType, modelName])

  return (
    <SDKContainer>
      {/* <EnumSelect
        value={genType}
        setValue={setGenType}
        labelText=""
        values={GraphqlGenType}
      /> */}

      {(errMsg && (
        <div className='err-msg'>
          <p>An Error Occurred Please Try Again Later.</p>
          <p className='info'>{errMsg}</p>
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
                    aria-label='Dynamic tabs'
                    items={codes}
                  >
                    {item => (
                      <Tab id={String(item.id)} className={'code-tab'}>
                        {item.title}
                      </Tab>
                    )}
                  </TabList>

                  <button onClick={downloadCurr}>Download</button>
                </TabBox>
                {codes.map(item => (
                  <TabPanel id={String(item.id)} key={item.id}>
                    <Code name={item.title} content={item.content} />
                  </TabPanel>
                ))}
              </TabsStyle>
            </SDKBox>
          )}
        </>
      )}
    </SDKContainer>
  )
}

export function Code ({ name, content }: { name: string; content: string }) {
  useEffect(() => {
    Prism.highlightAll()
  }, [content])

  const preCode = `<pre class="line-numbers"><code class="language-typescript">${content}</code></pre>`
  return (
    <CodeBox>
      <div
        className='line-numbers'
        dangerouslySetInnerHTML={{ __html: preCode }}
      ></div>
    </CodeBox>
  )
}

const SDKContainer = styled.div`
  width: 100%;
  height: 100%;
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
  height: 100%;
  padding: 12px 20px 0 20px;
  border-radius: 20px;
  border: 1px solid #39424c;
  background: #1b1e23;
  overflow: scroll;
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
