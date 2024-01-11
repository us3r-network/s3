import { useSession } from '@us3r-network/auth-with-rainbowkit'
import dayjs from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { updateDapp } from '../../api/dapp'
import { getStarModels, startIndexModel } from '../../api/model'
import { S3_SCAN_URL } from '../../constants'
import { PersonalCollection, useAppCtx } from '../../context/AppCtx'
import { useCeramicNodeCtx } from '../../context/CeramicNodeCtx'
import useSelectedDapp from '../../hooks/useSelectedDapp'
import { CeramicStatus, ModelStream, Network } from '../../types.d'
import { shortPubKey } from '../../utils/shortPubKey'
import { TableBox, TableContainer } from '../common/TableBox'
import CheckCircleIcon from '../icons/CheckCircleIcon'
import CloseIcon from '../icons/CloseIcon'
import PlusCircleIcon from '../icons/PlusCircleIcon'
import StarGoldIcon from '../icons/StarGoldIcon'

export default function FavoriteModal({
  closeModal,
}: {
  closeModal: () => void
}) {
  return (
    <FavoriteBox>
      <div className="title">
        <h1>My Favorite Models</h1>
        <button onClick={closeModal}>
          <CloseIcon />
        </button>
      </div>
      <div>
        <ModelList />
      </div>
    </FavoriteBox>
  )
}

function ModelList() {
  const { s3ModelCollection, selectedDapp } = useSelectedDapp()
  const session = useSession()
  const { currCeramicNode } = useCeramicNodeCtx()
  const [starModels, setStarModels] = useState<Array<ModelStream>>([])
  const [personalCollections, setPersonalCollections] = useState<
    PersonalCollection[]
  >([])
  const fetchPersonalCollections = useCallback(async () => {
    if (!session) return
    s3ModelCollection.authComposeClient(session)
    try {
      const personal = await s3ModelCollection.queryPersonalCollections({
        first: 500,
      })
      if (personal.errors) throw new Error(personal.errors[0].message)
      const collected = personal.data?.viewer.modelCollectionList

      if (collected) {
        setPersonalCollections(
          collected?.edges
            .filter((item) => item.node && item.node.revoke === false)
            .map((item) => {
              return {
                modelId: item.node.modelID,
                id: item.node.id!,
                revoke: !!item.node.revoke,
              }
            })
        )
      }
    } catch (error) {
      console.error(error)
    }
  }, [s3ModelCollection, session])

  const fetchStarModels = useCallback(async () => {
    const ids = personalCollections
      .filter((item) => item.revoke === false)
      .map((item) => {
        return item.modelId
      })
    if (ids.length === 0) {
      setStarModels([])
      return
    }

    try {
      const resp = await getStarModels({
        network: (selectedDapp?.network as Network) || Network.TESTNET,
        ids,
      })
      if (resp.data.code !== 0) {
        throw new Error(resp.data.msg)
      }

      const list = resp.data.data
      setStarModels([...list])
    } catch (error) {
      console.error(error)
    }
  }, [personalCollections, selectedDapp?.network])

  useEffect(() => {
    fetchPersonalCollections()
  }, [fetchPersonalCollections])

  useEffect(() => {
    fetchStarModels().catch(console.error)
  }, [fetchStarModels])

  return (
    <ListBox>
      <TableBox>
        <TableContainer>
          <thead>
            <tr>
              <th>Model Name</th>
              <th>Description</th>
              <th>ID</th>
              <th>Usage Count</th>
              <th>Release Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {starModels.map((item, idx) => {
              return (
                <tr key={item.stream_id + idx}>
                  <td>
                    <div className="usage-count">
                      <a
                        href={`${S3_SCAN_URL}/models/modelview/${
                          item.stream_id
                        }?network=${selectedDapp?.network.toUpperCase()}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.stream_content.name}
                      </a>
                    </div>
                  </td>
                  <td>
                    <div className="description">
                      {item.stream_content.description}
                    </div>
                  </td>
                  <td>
                    <div className="nav-stream">
                      <a
                        href={`${S3_SCAN_URL}/streams/stream/${
                          item.stream_id
                        }?network=${selectedDapp?.network.toUpperCase()}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {shortPubKey(item.stream_id, { len: 8, split: '-' })}
                      </a>
                    </div>
                  </td>
                  <td>
                    <div className="usage-count">
                      <a
                        href={`${S3_SCAN_URL}/models/model/${
                          item.stream_id
                        }/mids?network=${selectedDapp?.network.toUpperCase()}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.useCount}
                      </a>
                    </div>
                  </td>
                  <td>
                    <div className="release-date">
                      {(item.last_anchored_at &&
                        dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss')) ||
                        '-'}
                    </div>
                  </td>

                  <td>
                    <OpsBtns
                      modelId={item.stream_id}
                      hasIndexed={!!item.isIndexed}
                      ceramicNodeId={
                        currCeramicNode &&
                        currCeramicNode.status === CeramicStatus.RUNNING
                          ? currCeramicNode?.id
                          : undefined
                      }
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </TableContainer>
      </TableBox>
    </ListBox>
  )
}

export function OpsBtns({
  modelId,
  hasIndexed,
  ceramicNodeId,
}: {
  modelId: string
  hasIndexed: boolean
  ceramicNodeId?: number
}) {
  const { loadDapps } = useAppCtx()
  const session = useSession()
  const { selectedDapp } = useSelectedDapp()
  const [adding, setAdding] = useState(false)
  const addToModelList = useCallback(
    async (modelId: string) => {
      if (!session || !selectedDapp) return
      if (!hasIndexed) {
        startIndexModel({
          modelId,
          network: selectedDapp.network as Network,
          didSession: session.serialize(),
        }).catch(console.error)
      }
      if (!ceramicNodeId) return
      try {
        setAdding(true)
        const models = selectedDapp.models || []
        models.push(modelId)
        await updateDapp({ ...selectedDapp, models }, session.serialize(),ceramicNodeId)
        await loadDapps()
      } catch (err) {
        console.error(err)
      } finally {
        setAdding(false)
      }
    },
    [ceramicNodeId, hasIndexed, loadDapps, selectedDapp, session]
  )
  return (
    <div className="btns">
      <button>
        <StarGoldIcon />
      </button>
      {adding ? (
        <button>
          <img className="loading" src="/loading.gif" alt="loading" />
        </button>
      ) : (
        <>
          {selectedDapp?.models?.includes(modelId) ? (
            <button>
              <CheckCircleIcon />
            </button>
          ) : (
            <button
              onClick={() => {
                addToModelList(modelId)
              }}
            >
              <PlusCircleIcon />
            </button>
          )}
        </>
      )}
    </div>
  )
}

const FavoriteBox = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;
  min-height: calc(100vh - 300px);
  position: relative;
  width: 1240px;
  margin: 0 auto;

  background: #1b1e23;
  border-radius: 20px;

  > div.title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    color: #ffffff;
    > h1 {
      margin: 0;
      font-style: italic;
      font-weight: 700;
      font-size: 24px;
      line-height: 28px;
    }
  }
`

const ListBox = styled.div`
  .btns {
    display: flex;
    align-items: center;
    
    .loading {
      width: 20px;
    }
  }
`
