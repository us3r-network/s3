import styled from 'styled-components'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import { isMobile } from 'react-device-detect'

import { Stream } from '../types'
import { shortPubKey } from '../utils/shortPubKey'
import { TableBox } from './TableBox'
import { FamilyOrAppMapReverse, Types } from '../constants'
import UserAvatarStyled from './common/UserAvatarStyled'
import { UserName } from '@us3r-network/profile'
import { useCeramicCtx } from '../context/CeramicCtx'

export default function ListTable({
  data,
  showDid,
}: {
  data: Array<Stream>
  showDid?: boolean
}) {
  const { network } = useCeramicCtx()
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
            const tags: string[] = [...item.tags]
            if (item.content.type) {
              tags.push(item.content.type)
            }

            let schemaOrModel = <div className="xxxx">-</div>
            if (item.schema) {
              schemaOrModel = (
                <Link to={`/streams/stream/${item.schema}?network=${network}`}>
                  {item.modelOrSchemaName ||
                    shortPubKey(item.schema, { len: 8, split: '-' })}
                </Link>
              )
            } else if (item.model && (item.type === '0' || item.type === '3')) {
              schemaOrModel = (
                <Link to={`/streams/stream/${item.model}?network=${network}`}>
                  {item.modelOrSchemaName ||
                    shortPubKey(item.model, { len: 8, split: '-' })}
                </Link>
              )
            }

            return (
              <tr key={item.streamId + idx}>
                <td>
                  <Link
                    to={`/streams/stream/${item.streamId}?network=${network}`}
                  >
                    {shortPubKey(item.streamId, { len: 8, split: '-' })}
                  </Link>
                </td>
                {showDid && (
                  <td>
                    <div className="did-container">
                      <Avatar did={item.did} />
                      <Link
                        to={`/streams/profile/${item.did}?network=${network}`}
                      >
                        <UserName did={item.did} />
                      </Link>
                    </div>
                  </td>
                )}
                <td>
                  {(item.domain && (
                    <div className="family-container">
                      <Link
                        to={`/streams/family/${encodeURIComponent(
                          item.domain
                        )}?network=${network}`}
                      >
                        <div className="family">
                          {item.domain.length > 15
                            ? shortPubKey(item.domain, { len: 8, split: '-' })
                            : item.domain}
                        </div>
                      </Link>
                    </div>
                  )) || (
                    <div className="family-container">
                      {(item.familyOrApp && (
                        <Link
                          to={`/streams/family/${item.familyOrApp}?network=${network}`}
                        >
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

const Avatar = styled(UserAvatarStyled)`
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
    align-items: center;
    gap: 10px;

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
