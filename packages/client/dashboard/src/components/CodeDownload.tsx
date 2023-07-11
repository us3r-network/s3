import FileSaver from 'file-saver'
import ChevronDown from './Icons/CheckronDown'
import DownloadIcon from './Icons/DownloadIcon'
import { Code } from './ModelSDK'
import styled from 'styled-components'
import { useState } from 'react'

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
