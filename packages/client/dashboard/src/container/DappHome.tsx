import styled from 'styled-components'
import useSelectedDapp from '../hooks/useSelectedDapp'

export default function DappHome() {
  const { selectedDapp } = useSelectedDapp()
  return (
    <DappHomeContainer>
      <h1>{selectedDapp?.name}, welcome to S3 Dashboard</h1>
      {new Array(5)
        .fill('')
        .map((_, idx) => `/dapp-home/f${idx + 1}.png`)
        .map((item) => {
          return (
            <div key={item}>
              <img src={item} alt="" />
            </div>
          )
        })}
    </DappHomeContainer>
  )
}

const DappHomeContainer = styled.div`
  margin-top: 25px;
  margin-bottom: 25px;
  background: #1b1e23;
  border: 1px solid #39424c;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
  gap: 40px;

  > h1 {
    font-style: italic;
    font-weight: 700;
    font-size: 40px;
    line-height: 47px;
    margin: 0;
    color: #ffffff;
  }

  > div {
    width: 100%;
    > img {
      width: inherit;
    }
    &:last-child {
      width: auto;
    }
  }
`
