import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import Search from '../components/common/Search'
import ModelList from '../components/model/ExploreModelList'

export default function ExploreModel () {
  const [searchParams, setSearchParams] = useSearchParams()
  const filterStar = useMemo(() => {
    return searchParams.get('filterStar') === 'true'
  }, [searchParams])
  const [searchText, setSearchText] = useState<string>(
    searchParams.get('searchText') || ''
  )
  return (
    <ExploreModelContainer>
      <div className={'title-box'}>
        {/* <div className='title'>ComposeDB Models</div> */}

        <div className='tools'>
          <Search
            text={searchText}
            searchAction={text => {
              setSearchText(text)
            }}
            placeholder={'Search by model name'}
          />
        </div>
      </div>
      <ModelList searchText={searchText} filterStar={filterStar} />
    </ExploreModelContainer>
  )
}

const ExploreModelContainer = styled.div`
  margin-top: 25px;
  margin-bottom: 25px;
  .no-more {
    padding: 20px;
    text-align: center;
    color: gray;
  }

  .mobile-models-box {
    margin-bottom: 20px;
  }

  .title-box {
    display: flex;
    align-items: center;
    justify-content: end;
    margin-bottom: 20px;
    .tools {
      display: flex;
      align-items: center;
      gap: 15px;

      > button {
        border-radius: 100px;
        background: #14171a;
        font-size: 14px;
        line-height: 20px;
        text-align: center;
        font-weight: 400;
        color: #a0aec0;
        text-transform: capitalize;
        background: #ffffff;
        font-weight: 500;
        color: #14171a;
        cursor: pointer;
        border: none;
        outline: none;
        /* width: 100px; */
        padding: 0 15px;
        height: 36px;

        &.star-btn {
          width: 52px;
          height: 40px;

          background: #1a1e23;
          border: 1px solid #39424c;
          border-radius: 100px;
          display: inline-flex;
          align-items: center;
          justify-items: center;
        }
      }
    }
  }

  .title {
    > span {
      font-size: 22px;
      font-weight: 700;
      line-height: 40px;
    }

    /* padding: 0 0 20px 0; */
    position: sticky;
    background-color: #14171a;
    top: 0;
    z-index: 100;

    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 700;
    font-size: 24px;
    line-height: 28px;
    font-style: italic;

    color: #ffffff;
  }

  .react-aria-Button {
    font-size: 18px;
  }
`
