import styled from 'styled-components'
import Streams from './Streams'
import Models from './Models'

export default function Lists(props: any) {
  return (
    <Box {...props}>
      <Models />

      <Streams />
    </Box>
  )
}

const Box = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;

  gap: 20px;

  > div {
    background: #1b1e23;
    border: 1px solid #39424c;
    border-radius: 20px;
    padding: 20px;
  }
`

export const ListsMobile = styled(Lists)`
  grid-template-columns: 1fr;

  .models-box {
    grid-template-columns: 1fr 1fr;
    .desc {
      display: none;
    }
  }

  .streams-box {
    grid-template-columns: 1fr 1fr;
    position: relative;
    .short-key {
      top: 20px;
      left: 0;
      position: absolute;
    }
    .avatar {
      margin-top: 25px;
      span {
        width: 20px;
        height: 20px;
      }
    }
  }
`
