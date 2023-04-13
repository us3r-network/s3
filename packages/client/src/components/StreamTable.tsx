import styled from 'styled-components'
import multiavatar from '@multiavatar/multiavatar'
import dayjs from 'dayjs'
import { isMobile } from 'react-device-detect'

import { Network, Stream } from '../types'
import { FamilyOrAppMapReverse, Types } from '../constants'
import { TableBox } from './TableBox'
import { useMemo } from 'react'
import { shortPubKey } from '../utils/shortPubKey'
import { Link } from 'react-router-dom'
import Check from './icons/Check'

export default function StreamTable({
  data,
  network,
}: {
  data: Stream
  network: Network
}) {
  const pubkey = useMemo(() => {
    return data.did.split(':').pop() || ''
  }, [data.did])

  const net = network.toLowerCase()
  const tags = [...data.tags]
  if (data.content.type) {
    tags.push(data.content.type)
  }

  return (
    <TableBox isMobile={isMobile}>
      <TableContainer isMobile={isMobile}>
        <div>
          <span className="name">Stream ID:</span>
          <div>
            <Link to={`/${net}/stream/${data.streamId}`}>{data.streamId}</Link>
          </div>
        </div>
        <div className="network">
          <span className="name">Network:</span>
          <div className="name">{network}</div>
        </div>
        <div>
          <span className="name">Indexing time:</span>
          <div className="name">{dayjs(data.indexingTime).fromNow()}</div>
        </div>
        {data.domain && (
          <div>
            <span className="name">Domain:</span>
            <div>{data.domain}</div>
          </div>
        )}
        <div>
          <span className="name">Family or App:</span>
          {(data.familyOrApp && (
            <div>
              <Link to={`/${net}/family/${data.familyOrApp}`}>
                <div className="family">
                  {FamilyOrAppMapReverse[data.familyOrApp] || data.familyOrApp}
                </div>
              </Link>
            </div>
          )) || <div>-</div>}
        </div>
        <div>
          <span className="name">Type:</span>
          <div className="name">{Types[data.type] || '-'}</div>
        </div>
        <div className="from">
          <span className="name">From:</span>
          <div>
            <Link to={`/${net}/profile/${data.did}`}>
              <div
                dangerouslySetInnerHTML={{
                  __html: multiavatar(pubkey),
                }}
              />
              {shortPubKey(pubkey)}
            </Link>
          </div>
        </div>
        <div>
          <span className="name">Tags:</span>
          <div className="name">{tags.join(' ').trim() || '-'}</div>
        </div>
        <div>
          <span className="name">Status:</span>
          <div className="name">{data.anchorStatus}</div>
        </div>
        {/* <div>
          <span>Hash:</span>
          <div>...</div>
        </div> */}
        {/* <div>
          <span>Date:</span>
          <div>...</div>
        </div> */}
        {(data.model && (
          <div className="model">
            <span className="name">Modal:</span>
            <div>
              <a href={`/${net}/stream/${data.model}`}>{data.model}</a>
              <div>
                <Check />
                <span>ComposeDB</span>
              </div>
            </div>
          </div>
        )) || (
          <div>
            <span className="name">Schema:</span>
            {(data.schema && (
              <div>
                <a href={`/${net}/stream/${data.schema}`}>{data.schema}</a>
              </div>
            )) ||
              '-'}
          </div>
        )}
        <div>
          <span className="name">Commit IDs:</span>
          <div className="name">{data.commitIds.join('\n')}</div>
        </div>
        <div className="content">
          <span className="name">Content:</span>
          <div className="name">
            <pre>
              <code>{JSON.stringify(data.content, null, 2)}</code>
            </pre>
          </div>
        </div>
        <div className="metadata">
          <span className="name">Metadata:</span>
          <div className="name">
            <pre>
              <code>{JSON.stringify(data.metadata, null, 2)}</code>
            </pre>
          </div>
        </div>
      </TableContainer>
    </TableBox>
  )
}

const TableContainer = styled.div<{ isMobile?: boolean }>`
  margin: 10px;
  > div {
    display: flex;

    ${({ isMobile }) => (isMobile ? `flex-direction: column;row-gap: 8px;` : '')};

    padding: 20px 0;
    border-bottom: 1px solid #39424c;
    word-break: break-all;
    &:first-child {
      padding-top: 15px;
    }
    &:last-child {
      border-bottom: none;
      padding-bottom: 15px;
    }

    > span {
      width: 200px;
      min-width: 200px;
      font-weight: 500;
    }

    > div {
      flex-grow: 1;
    }

    & div {
      overflow: scroll;
    }
  }

  .name {
    font-weight: 400;
    font-size: 16px;
    line-height: 19px;

    color: #718096;

    pre {
      white-space: pre-wrap;
    }
  }

  & .from {
    & > div > a {
      display: flex;
      align-items: center;
      gap: 10px;
      width: fit-content;
      > div {
        width: 50px;
      }
    }
  }

  & .network {
    > div {
      text-transform: capitalize;
    }
  }

  & .model {
    & div {
      display: flex;
      align-items: center;
      gap: 5px;

      & > div {
        padding: 5px 10px;
        border-radius: 10px;
        border: 1px solid #39424c;
        background: #1a1e23;
        font-weight: 500;
      }
    }
  }
`
