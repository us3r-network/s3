import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Search from '../components/common/Search'
import { CompositeList } from '../components/model/ExploreCompositeList'
import { ExploreContainer } from './ExploreModel'

export default function ExploreComposite () {
  const [searchParams] = useSearchParams()
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
            placeholder={'Search by name'}
          />
        </div>
      </div>
      <CompositeList searchText={searchText} />
    </ExploreContainer>
  )
}
