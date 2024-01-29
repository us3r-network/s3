import styled from 'styled-components'
import CloseIcon from '../icons/CloseIcon'
import ModelList from './ExploreModelList'

export default function FavoriteModal({
  closeModal,
}: {
  closeModal: () => void
}) {
  return (
    <FavoriteBox>
      <div className="title">
        <h1>My Favorite Models</h1>
        <button onClick={closeModal}>
          <CloseIcon />
        </button>
      </div>
      <div>
        <ModelList filterStar />
      </div>
    </FavoriteBox>
  )
}

const FavoriteBox = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;
  min-height: calc(100vh - 300px);
  position: relative;
  width: 1240px;
  margin: 0 auto;

  background: #1b1e23;
  border-radius: 20px;

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
`
