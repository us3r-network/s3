import { useCallback } from 'react';
import { useState } from 'react';
import styled from 'styled-components';

export default function Search({
  searchAction,
}: {
  searchAction: (text: string) => void;
}) {
  const [search, setSearch] = useState('');

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        searchAction(search);
      }
    },
    [search, searchAction]
  );

  return (
    <SearchBox>
      <span
        onClick={() => {
          if (search.trim()) searchAction(search.trim());
        }}
      >
        <SearchIcon />
      </span>
      <input
        title="search"
        placeholder="Search by stream id, did or family..."
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
        onKeyDown={handleKeyDown}
      />
    </SearchBox>
  );
}

const SearchBox = styled.div`
  border: 1px solid #39424c;
  width: 400px;
  height: 40px;
  padding: 5px;
  padding-left: 10px;
  box-sizing: border-box;
  /* background: #1a1e23; */
  /* border: 1px solid #39424c; */
  border-radius: 100px;
  display: flex;
  gap: 5px;
  align-items: center;

  > input {
    flex-grow: 1;
    border: none;
    outline: none;
    height: 100%;
    background-color: inherit;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    caret-color: #fff;
    color: #fff;
  }

  & svg {
    vertical-align: middle;
    cursor: pointer;
  }
`;

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
        stroke="#718096"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
