import { useCallback, useState } from 'react'
import styled from 'styled-components'
import CopyIcon from '../icons/CopyIcon'

export default function CopyTint({ data }: { data: string }) {
  const [showCopyTint, setShowCopyTint] = useState(false)
  const copyId = useCallback(async (appId: string) => {
    try {
      await navigator.clipboard.writeText(appId)
      setShowCopyTint(true)
      setTimeout(() => {
        setShowCopyTint(false)
      }, 2000)
    } catch (error) {
      console.error(error)
    }
  }, [])
  return (
    <CopyBox>
      <button
        onClick={() => {
          copyId(data)
        }}
      >
        <CopyIcon />
      </button>
      {showCopyTint && <span>Copied</span>}
    </CopyBox>
  )
}

const CopyBox = styled.div`
  position: relative;
  > span {
    position: absolute;
    font-size: 13px;
    color: inherit;
    left: 0;
    bottom: -12px;
    /* transform: translate(-50%, 50%); */
  }
  > button {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`
