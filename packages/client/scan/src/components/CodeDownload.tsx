import FileSaver from 'file-saver'
import ChevronDown from './icons/CheckronDown'
import DownloadIcon from './icons/DownloadIcon'
import styled from 'styled-components'
import { useEffect, useState } from 'react'
import Prism from 'prismjs'

import 'prismjs/components/prism-typescript'
import 'prismjs/plugins/line-numbers/prism-line-numbers.js'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'

export default function CodeDownload({
  downloadContent,
  downloadFileName,
  title,
  content,
}: {
  title: string
  content: string
  downloadContent: string
  downloadFileName: string
}) {
  const [show, setShow] = useState(false)
  const download = (text: string, filename: string) => {
    const blob = new Blob([text], {
      type: 'text/plain;charset=utf-8',
    })

    FileSaver.saveAs(blob, filename)
  }

  return (
    <DefinitionBox show={show}>
      <div className="title">
        <div
          onClick={() => {
            setShow(!show)
          }}
        >
          <ChevronDown />
          <h3>{title}</h3>
        </div>
        <button
          onClick={() => {
            download(downloadContent, downloadFileName)
          }}
        >
          <DownloadIcon />
        </button>
      </div>
      {show && (
        <div className="result-text">
          <Code name="runtimeDefinition" content={content} />
        </div>
      )}
    </DefinitionBox>
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

const DefinitionBox = styled.div<{ show?: boolean }>`
  box-sizing: border-box;
  background-color: #1a1a1c;
  height: fit-content;
  .title {
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0;
    font-weight: 700;
    font-size: 24px;
    line-height: 28px;
    font-style: italic;
    color: #ffffff;

    > div {
      display: flex;
      align-items: center;
      cursor: pointer;
      > svg {
        transition: transform 0.1s ease-in-out;
        transform: ${(props) =>
          props.show ? `rotate(-180deg)` : `rotate(0deg)`};
      }
    }

    button {
      background: inherit;
    }

    h3 {
      margin: 0;
      padding: 0;
      font-weight: 700;
      font-size: 20px;
      line-height: 24px;
    }
  }
`
