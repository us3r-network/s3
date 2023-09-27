import styled from 'styled-components'
import { TableBox } from './TableBox'
import { ModelMid } from '../types'
import dayjs from 'dayjs'
import { shortPubKey } from '../utils/shortPubKey'
import UserAvatarStyled from './UserAvatarStyled'
import { UserName } from '@us3r-network/profile'
import EditIcon from './Icons/EditIcon'
import { Button } from 'react-aria-components'
import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { useMemo } from 'react'
import { S3_SCAN_URL } from '../constants'
import useSelectedDapp from '../hooks/useSelectedDapp'

export default function ModelStreamList({
  modelId,
  data,
  editable,
  editAction,
}: {
  modelId: string
  data: ModelMid[]
  editable?: boolean
  editAction?: (stream: ModelMid) => void
}) {
  const session = useSession()
  const showAction = useMemo(
    () => session?.id && editable,
    [editable, session?.id]
  )
  const { selectedDapp } = useSelectedDapp()
  return (
    <TableBox>
      <TableContainer>
        <thead>
          <tr>
            <th>Stream ID</th>
            <th>DID</th>
            <th>Create Time</th>
            <th>Update Time</th>
            {showAction && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            return (
              <tr key={item.streamId}>
                <td>
                  <a
                    href={`${S3_SCAN_URL}/streams/stream/${
                      item.streamId
                    }?network=${selectedDapp?.network.toUpperCase()}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div className="stream-id">
                      {shortPubKey(item.streamId, {
                        len: 8,
                        split: '-',
                      })}
                    </div>
                  </a>
                </td>
                <td className="td-did">
                  <UserAvatarStyled did={item.controllerDid} />
                  <UserName did={item.controllerDid} />
                </td>
                <td className="index-time">
                  <div>
                    <time>{dayjs(item.createdAt).fromNow()}</time>
                  </div>
                </td>
                <td className="index-time">
                  <div>
                    <time>{dayjs(item.updatedAt).fromNow()}</time>
                  </div>
                </td>
                {showAction && (
                  <td className="td-action">
                    {session?.id === item.controllerDid ? (
                      <EditBtn
                        onPress={() => {
                          if (editAction) editAction(item)
                        }}
                      >
                        <EditIcon />
                      </EditBtn>
                    ) : (
                      '-'
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </TableContainer>
    </TableBox>
  )
}

const TableContainer = styled.table`
  /* table-layout: fixed; */
  width: 100%;
  border-collapse: collapse;
  color: #718096;

  tbody tr,
  thead tr {
    font-size: 15px;
    /* text-align: center; */
    height: 60px;
  }

  tbody tr {
    border-top: 1px solid #39424c;
  }

  tbody td {
    height: 88px;
    &.index-time {
      width: 200px;
    }
  }

  tbody tr .td-did {
    display: flex;
    align-items: center;
    gap: 10px;
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

    > div {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      padding-right: 5px;
    }
  }

  & .stream-id {
    color: #fff;
  }

  & time {
    font-weight: 400;
    font-size: 16px;
    line-height: 19px;

    color: #718096;
  }
`
const EditBtn = styled(Button)`
  margin: 0;
  padding: 0;
`
