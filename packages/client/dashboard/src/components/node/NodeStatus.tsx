import styled from 'styled-components'
import { CeramicStatus } from '../../types.d'
import CircleIcon from '../icons/CircleIcon'
import CheckCircleIcon from '../icons/CheckCircleIcon'

import { ProgressBar, Label } from 'react-aria-components'
import { useEffect, useState } from 'react'

export default function NodeStatus ({
  status,
}: {
  status: CeramicStatus
}) {
  const [prepageingPercentage, setPrepageingPercentage] = useState(0)
  const [startingPercentage, setStartingPercentage] = useState(0)

  useEffect(() => {
    if (status !== CeramicStatus.PREPARING) return
    if (prepageingPercentage < 100) {
      console.log('set prepare timeout', prepageingPercentage)
      setTimeout(() => {
        setPrepageingPercentage(prepageingPercentage + 1)
      }, 350)
    }
  }, [prepageingPercentage, status])

  useEffect(() => {
    if (status !== CeramicStatus.STARTING) return
    if (startingPercentage < 100) {
      console.log('set start timeout', startingPercentage)
      setTimeout(() => {
        setStartingPercentage(startingPercentage + 1)
      }, 200)
    }
  }, [startingPercentage, status])

  useEffect(() => {
    switch (status) {
      case CeramicStatus.PREPARING:
        setPrepageingPercentage(0)
        setStartingPercentage(0)
        break
      case CeramicStatus.STARTING:
        setPrepageingPercentage(100)
        setStartingPercentage(0)
        break
      case CeramicStatus.RUNNING:
          setPrepageingPercentage(100)
          setStartingPercentage(100)
          break
      default:
        break
    }
  }, [status])

  switch (status) {
    case CeramicStatus.PREPARING:
      return (
        <Box>
          <div>
            <StepNode percentage={prepageingPercentage} />
            <StepProgress percentage={prepageingPercentage} />
            <StepNode />
            <StepProgress />
            <StepNode />
          </div>
          <div>
            <Label className='green'>Preparing</Label>
            <Label className='gray'>Start</Label>
            <Label className='gray'>Run</Label>
          </div>
        </Box>
      )
    case CeramicStatus.STARTING:
      return (
        <Box>
          <div>
            <StepNode percentage={100} />
            <StepProgress percentage={100} />
            <StepNode percentage={startingPercentage} />
            <StepProgress percentage={startingPercentage} />
            <StepNode />
          </div>
          <div>
            <Label className='green'>Prepared</Label>
            <Label className='green'>Starting</Label>
            <Label className='gray'>Run</Label>
          </div>
        </Box>
      )
    case CeramicStatus.RUNNING:
      return (
        <Box>
          <div>
            <StepNode percentage={100} />
            <StepProgress percentage={100} />
            <StepNode percentage={100} />
            <StepProgress percentage={100} />
            <StepNode percentage={1} />
          </div>
          <div>
            <Label className='green'>Prepared</Label>
            <Label className='green'>Started</Label>
            <Label className='green'>Running</Label>
          </div>
        </Box>
      )
    default:
      return null
  }
}

const Box = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  > div {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: space-between;
  }
  .green {
    color: #00b171;
  }
  .gray {
    color: #718096;
  }
  label {
    font-size: 12px;
    font-weight: 500;
    line-height: 1.2;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .react-aria-ProgressBar {
    display: grid;
    grid-template-areas: "label value"
                        "bar bar";
    grid-template-columns: 1fr auto;
    color: var(--text-color);
    flex: 1;
    .value {
        grid-area: value;
    }

    .bar {
        grid-area: bar;
        box-shadow: inset 0px 0px 0px 1px #718096;
        forced-color-adjust: none;
        height: 2px;
        overflow: hidden;
        will-change: transform;
    }

    .fill {
        background: #00b171;
        height: 100%;
    }
    }
`
function StepNode ({ percentage = 0 }: { percentage?: number }) {
  if (percentage === 0) {
    return <CircleIcon bgc='#718096' />
  } else if (percentage < 100) {
    return <CircleIcon bgc='#00B171' />
  } else if (percentage >= 100) {
    return <CheckCircleIcon />
  }
  return null
}
function StepProgress ({ percentage = 0 }: { percentage?: number }) {
  return (
    <ProgressBar value={percentage}>
      {({ percentage, valueText }) => (
        <>
          {/* <span className='value'>{valueText}</span> */}
          <div className='bar'>
            <div className='fill' style={{ width: percentage + '%' }} />
          </div>
        </>
      )}
    </ProgressBar>
  )
}
