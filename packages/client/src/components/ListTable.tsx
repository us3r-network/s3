import styled from 'styled-components'
import { Link } from 'react-router-dom'
import multiavatar from '@multiavatar/multiavatar'
import dayjs from 'dayjs'
import { isMobile } from 'react-device-detect'

import { Stream } from '../types'
import { shortPubKey } from '../utils/shortPubKey'
import { TableBox } from './TableBox'
import { FamilyOrAppMapReverse, Types } from '../constants'

export default function ListTable({
  network,
  data,
  showDid,
}: {
  network: string | undefined
  data: Array<Stream>
  showDid?: boolean
}) {
  return (
    <TableBox isMobile={isMobile}>
      <TableContainer isMobile={isMobile}>
        <thead>
          <tr>
            <th>Stream ID</th>
            {showDid && <th>DID</th>}
            <th>Family or app</th>
            <th>Tags</th>
            <th>Type</th>
            <th>Schema/Model</th>
            <th>Indexing time</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => {
            const pubkey = item.did.split(':').pop() || ''
            const tags: string[] = [...item.tags]
            if (item.content.type) {
              tags.push(item.content.type)
            }

            let schemaOrModel = <div className="xxxx">-</div>
            if (item.schema) {
              schemaOrModel = (
                <Link to={`/${network}/stream/${item.schema}`}>
                  {shortPubKey(item.schema, { len: 8, split: '-' })}
                </Link>
              )
            } else if (item.model && (item.type === '0' || item.type === '3')) {
              schemaOrModel = (
                <Link to={`/${network}/stream/${item.model}`}>
                  {shortPubKey(item.model, { len: 8, split: '-' })}
                </Link>
              )
            }

            return (
              <tr key={item.streamId + idx}>
                <td>
                  <Link to={`/${network}/stream/${item.streamId}`}>
                    {shortPubKey(item.streamId, { len: 8, split: '-' })}
                  </Link>
                </td>
                {showDid && (
                  <td>
                    <div className="did-container">
                      <div>
                        <Avatar
                          dangerouslySetInnerHTML={{
                            __html: multiavatar(pubkey),
                          }}
                        />
                      </div>
                      <div className="user-details-container">
                        <div className="name">
                          <a href={`/${network}/profile/${item.did}`}>
                            {shortPubKey(pubkey)}
                          </a>
                        </div>
                        <div className="badge grey">{shortPubKey(pubkey)}</div>
                      </div>
                    </div>
                  </td>
                )}
                <td>
                  {(item.domain && (
                    <div className="family-container">
                      <Link
                        to={`/${network}/family/${encodeURIComponent(
                          item.domain
                        )}`}
                      >
                        <div className="family">{item.domain}</div>
                      </Link>
                    </div>
                  )) || (
                    <div className="family-container">
                      {(item.familyOrApp && (
                        <Link to={`/${network}/family/${item.familyOrApp}`}>
                          <div className="family">
                            {FamilyOrAppMapReverse[item.familyOrApp] ||
                            item.familyOrApp.length > 15
                              ? shortPubKey(item.familyOrApp, {
                                  len: 8,
                                  split: '-',
                                })
                              : item.familyOrApp}
                          </div>
                        </Link>
                      )) || <div className="xxxx">-</div>}
                    </div>
                  )}
                </td>
                <td>
                  <div className="xxxx">
                    {tags.length > 0 ? tags.join(',') : '-'}
                  </div>
                </td>
                <td>
                  <div className="xxxx">{Types[item.type] || '-'}</div>
                </td>
                <td>{schemaOrModel}</td>
                <td>
                  <div className="index-time">
                    <time>{dayjs(item.indexingTime).fromNow()}</time>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </TableContainer>
    </TableBox>
  )
}

const Avatar = styled.div`
  width: 40px;
  height: 40px;
`

const TableContainer = styled.table<{ isMobile: boolean }>`
  ${({ isMobile }) => (isMobile ? `` : 'width: 100%;')}
  table-layout: fixed;
  border-collapse: collapse;

  tbody tr,
  thead tr {
    font-size: 15px;
    /* text-align: center; */
    height: 60px;
  }

  thead tr th {
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    color: #718096;
    opacity: 0.8;
    text-align: start;

    overflow: hidden;

    &:first-child {
      padding-left: 20px;
    }

    &:last-child {
      padding-left: 0px;
      padding-right: 20px;
    }
    ${({ isMobile }) => (isMobile ? `padding: 0 20px !important;` : '')};
  }

  tbody tr td {
    font-weight: 400;
    font-size: 16px;
    line-height: 19px;
    overflow: hidden;
    &:first-child {
      padding-left: 20px;
    }

    &:last-child {
      padding-left: 0px;
      padding-right: 20px;
    }
    ${({ isMobile }) => (isMobile ? `padding: 0 20px !important;` : '')};

    > div {
      text-overflow: ellipsis;
      overflow: hidden;
      padding-right: 5px;
    }
  }

  tbody tr {
    border-top: 1px solid #39424c;
  }

  tbody td {
    height: 88px;
  }

  .did-container {
    display: flex;
    gap: 10px;

    & div {
      text-align: start;
    }

    .badge {
      background-color: #718096;
      border-radius: 20px;
      padding: 0px 10px;
      font-size: 13px;
      font-weight: 500;
      align-items: center;
      flex-direction: row;
      display: flex;
      /* width: 101px; */
      height: 23px;
    }
    .grey {
      background: #14171a;
      font-size: 16px;
      line-height: 19px;

      color: #718096;
    }
  }

  & .family-container {
    overflow: hidden;
    box-sizing: border-box;
    .family {
      font-weight: 400;
      font-size: 12px;
      line-height: 14px;

      color: #ffffff;

      padding: 2px 4px;
      max-width: fit-content;
      border: 1px solid #ffffff;
      border-radius: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  & .xxxx {
    font-weight: 400;
    font-size: 16px;
    line-height: 19px;

    color: #718096;
  }

  & time {
    font-weight: 400;
    font-size: 16px;
    line-height: 19px;

    color: #718096;
  }
`
