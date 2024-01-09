import styled from 'styled-components'
import CloseIcon from './Icons/CloseIcon'
import { Link } from 'react-router-dom'
import useSelectedDapp from '../hooks/useSelectedDapp'
import { useCeramicNodeCtx } from '../context/CeramicNodeCtx'
import { CeramicStatus } from '../types.d'

export default function NoCeramicNodeModal ({
  closeModal
}: {
  closeModal: () => void
}) {
  const { selectedDapp } = useSelectedDapp()
  const { currCeramicNode } = useCeramicNodeCtx()
  return (
    <Box>
      <div className='title'>
        <h1>Node Serivce</h1>
        <button onClick={closeModal}>
          <CloseIcon />
        </button>
      </div>
      {currCeramicNode ? (
        currCeramicNode.status !== CeramicStatus.RUNNING ? (
          <div>
            <p>Your Private Ceramic Node is {currCeramicNode.status} ......</p>
            <p>Please wait while it is ready!</p>
          </div>
        ) : (
          <div>Your Private Ceramic Node is Ready to use.</div>
        )
      ) : (
        <div>
          <div>There is no available node now.</div>
          {selectedDapp && (
            <Link to={`/dapp/${selectedDapp?.id}/node`}>
              <button className='ok-button'>Deploy Private Node</button>
            </Link>
          )}
        </div>
      )}
    </Box>
  )
}
const Box = styled.div`
  display: flex;
  flex-direction: column;
  /* justify-content: space-between; */
  padding: 30px;
  gap: 20px;
  position: relative;
  width: 600px;
  min-height: 160px;
  margin: 0 auto;

  background: #1b1e23;
  border-radius: 20px;
  font-size: 16px;

  > div.title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    color: #ffffff;
    > h1 {
      margin: 0;
      font-style: italic;
      font-weight: 700;
      font-size: 24px;
      line-height: 28px;
    }
  }
  .ok-button {
    font-size: 12px;
    font-weight: 700;
    background-color: #ffffff;
    width: 220px;
    height: 40px;
    border-radius: 10px;
  }
`
