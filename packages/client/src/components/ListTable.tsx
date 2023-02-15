import styled from 'styled-components';
import { Link } from 'react-router-dom';
import multiavatar from '@multiavatar/multiavatar';
import dayjs from 'dayjs';

import { Stream } from '../types';
import { sortPubKey } from '../utils/sortPubkey';
import { TableBox } from './TableBox';
import { FamilyOrAppMapReverse } from '../constants';

export default function ListTable({
  network,
  data,
  showDid,
}: {
  network: string | undefined;
  data: Array<Stream>;
  showDid?: boolean;
}) {
  return (
    <TableBox>
      <TableContainer>
        <thead>
          <tr>
            <th>Stream ID</th>
            {showDid && <th>DiD</th>}
            <th>Family or app</th>
            <th>Tags or type</th>
            <th>Schema</th>
            <th>Indexing time</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => {
            const pubkey = item.did.split(':').pop() || '';
            return (
              <tr key={item.streamId + idx}>
                <td>
                  <Link to={`/${network}/stream/${item.streamId}`}>
                    {sortPubKey(item.streamId, { len: 8, split: '-' })}
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
                            {sortPubKey(pubkey)}
                          </a>
                        </div>
                        <div className="badge grey">{sortPubKey(pubkey)}</div>
                      </div>
                    </div>
                  </td>
                )}
                <td>
                  <div className="family-container">
                    {(item.familyOrApp && (
                      <Link to={`/${network}/family/${item.familyOrApp}`}>
                        <div className="family">
                          {FamilyOrAppMapReverse[item.familyOrApp] ||
                            item.familyOrApp}
                        </div>
                      </Link>
                    )) || <div className="xxxx">-</div>}
                  </div>
                </td>
                <td>
                  <div className="xxxx">
                    {(item.tags.length > 0 ? item.tags.join(',') : item.type) ||
                      '-'}
                  </div>
                </td>
                <td>
                  {(item.schema && (
                    <Link to={`/${network}/stream/${item.schema}`}>
                      {sortPubKey(item.schema, { len: 8, split: '-' })}
                    </Link>
                  )) || <div className="xxxx">-</div>}
                </td>
                <td>
                  <span>
                    <time>{dayjs(item.indexingTime).fromNow()}</time>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </TableContainer>
    </TableBox>
  );
}

const Avatar = styled.div`
  width: 40px;
  height: 40px;
`;

const TableContainer = styled.table`
  width: 100%;

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

    width: 231px !important;
    overflow: hidden;

    &:first-child {
      padding-left: 20px;
    }

    &:last-child {
      width: 106px !important;
      padding-left: 0px;
      padding-right: 20px;
    }
  }

  tbody tr td {
    font-weight: 400;
    font-size: 16px;
    line-height: 19px;
    width: 231px !important;
    overflow: hidden;
    color: #71aaff;

    &:first-child {
      padding-left: 20px;
    }

    &:last-child {
      width: 106px !important;
      padding-left: 0px;
      padding-right: 20px;
    }
  }

  tbody tr {
    border-top: 1px solid #39424c;
  }

  tbody td {
    height: 88px;
    /* padding: 10px 0; */
  }

  .did-container {
    display: flex;
    gap: 10px;
    /* justify-content: center; */

    & div {
      text-align: start;
    }

    .badge {
      background-color: #718096;
      border-radius: 20px;
      padding: 4px 10px;
      font-size: 13px;
      font-weight: 500;
      align-items: center;
      flex-direction: row;
      display: flex;
    }
    .grey {
      color: #14171a;
    }
  }

  & .family-container {
    /* text-align: center; */
    max-width: 166px;
    overflow: hidden;
    box-sizing: border-box;
    .family {
      /* margin: 0 auto; */
      font-weight: 400;
      font-size: 12px;
      line-height: 14px;

      color: #6c8fc1;

      padding: 2px 4px;
      width: fit-content;

      border: 1px solid #6c8fc1;
      border-radius: 4px;
    }
  }

  & .xxxx {
    font-weight: 400;
    font-size: 16px;
    line-height: 19px;

    color: #ffffff;
  }

  & time {
    font-weight: 400;
    font-size: 16px;
    line-height: 19px;

    color: #ffffff;
  }
`;
