import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import {
  Button,
  ListBoxItem,
  Label,
  ListBox,
  Popover,
  Select,
  SelectValue,
} from 'react-aria-components'
import ChevronDown from '../icons/ChevronDown'

type Ops = 'model' | 'stream'
export default function SearchFilter() {
  const [ops, setOps] = useState<Ops>('model')
  const [searchText, setSearchText] = useState('')
  const navigate = useNavigate()

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        if (ops === 'model') {
          navigate(`/models?searchText=${searchText}`)
        } else {
          if (searchText.startsWith('did')) {
            navigate(`/streams/profile/${searchText}`)
          } else if (searchText.length < 62) {
            navigate(`/streams/family/${searchText}`)
          } else {
            navigate(`/streams/stream/${searchText}`)
          }
        }
      }
    },
    [ops, searchText, navigate]
  )

  return (
    <Box className="search-area">
      <div className="select-box">
        <Select
          selectedKey={ops}
          onSelectionChange={(k) => {
            setOps(k as Ops)
          }}
        >
          <Label></Label>
          <Button>
            <SelectValue />
            <span aria-hidden="true">
              <ChevronDown  fill='#000'/>
            </span>
          </Button>
          <Popover className={'home-popover'}>
            <ListBox>
              <ListBoxItem id={'model'}>Model</ListBoxItem>
              <ListBoxItem id={'stream'}>Stream</ListBoxItem>
            </ListBox>
          </Popover>
        </Select>
      </div>
      <input
        type="text"
        placeholder={
          ops === 'stream'
            ? 'Search by stream id, did or family...'
            : 'Search by model name'
        }
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value)
        }}
        onKeyDown={handleKeyDown}
      />
    </Box>
  )
}

const Box = styled.div`
  margin-top: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px 4px;
  gap: 20px;

  width: 612px;
  height: 48px;

  background: #ffffff;
  border-radius: 12px;

  select,
  input {
    border: none;
    outline: none;
  }

  .select-box {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    /* padding: 0px 10px; */
    gap: 10px;
    box-sizing: border-box;
    /* width: 130px; */
    height: 40px;
    color: #000;

    background: rgba(113, 128, 150, 0.1);
    border-radius: 10px;
    select {
      width: 110px;
      background: none;
    }
  }

  input {
    font-family: 'Rubik';
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    flex-grow: 1;
  }
`
