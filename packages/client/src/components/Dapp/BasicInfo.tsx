import { Dapp } from '@us3r-network/dapp'
import DappEdit from '../icons/DappEdit'
import DappTwitter from '../icons/DappTwitter'
import DappDiscord from '../icons/DappDiscord'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

export default function BasicInfo({ dapp }: { dapp?: Dapp }) {
  return (
    <BasicBox>
      <div>
        <img src={dapp?.icon} alt="" />
        <div className="app-id">
          <h3>{dapp?.name}</h3>
          <p>APP ID: {dapp?.id}</p>
        </div>
        <div className="edit">
          <Link to={`/dapp/${dapp?.id}/edit`}>
            <button>
              <DappEdit />
            </button>
          </Link>
          <div className="social">
            <button>
              <DappTwitter />
            </button>
            <button>
              <DappDiscord />
            </button>
          </div>
        </div>
      </div>
      {dapp?.description && <p>{dapp?.description}</p>}
    </BasicBox>
  )
}

const BasicBox = styled.div`
  margin: 24px 0;
  padding: 20px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
  gap: 20px;

  /* height: 184px; */
  background: #1b1e23;
  border: 1px solid #39424c;
  border-radius: 20px;

  > div {
    width: 100%;
    display: flex;
    gap: 20px;

    > img {
      width: 100px;
      height: 100px;
      border-radius: 20px;
    }

    .app-id {
      padding-top: 20px;
      h3 {
        font-style: italic;
        font-weight: 700;
        font-size: 24px;
        line-height: 28px;
        margin: 0;
      }
    }

    .edit {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      justify-content: space-between;
      align-items: end;
      button {
        cursor: pointer;
        background-color: inherit;
        border: none;
      }

      .social {
        /* align-self: end; */
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
      }
    }
  }

  p {
    padding: 0;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: #718096;
  }
  > p {
    margin: 0;
  }
`
