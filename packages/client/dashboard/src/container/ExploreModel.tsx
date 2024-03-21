import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import Search from '../components/common/Search'
import ModelList from '../components/model/ExploreModelList'

export default function ExploreModel () {
  const [searchParams] = useSearchParams()
  const filterStar = useMemo(() => {
    return searchParams.get('filterStar') === 'true'
  }, [searchParams])
  const [searchText, setSearchText] = useState<string>(
    searchParams.get('searchText') || ''
  )
  return (
    <ExploreContainer>
      <div className={'title-box'}>
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
    </ExploreContainer>
  )
}

export const ExploreContainer = styled.div`
  .title-box {
    display: flex;
    align-items: center;
    justify-content: start;
    margin-bottom: 20px;
  }
`
