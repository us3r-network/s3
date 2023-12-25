/*
 * @Author: bufan bufan@hotmail.com
 * @Date: 2023-12-15 10:50:39
 * @LastEditors: bufan bufan@hotmail.com
 * @LastEditTime: 2023-12-21 16:51:47
 * @FilePath: /s3/packages/client/dashboard/src/container/DappNode.tsx
 * @Description:
 */

import styled from 'styled-components'
import { useEffect, useState } from 'react'
import { useCeramicNodeCtx } from '../context/CeramicNodeCtx'
import { Button, Dialog, DialogTrigger } from 'react-aria-components'

import { Modal, ModalOverlay } from 'react-aria-components'
import PlusIcon from '../components/Icons/PlusIcon'
import CreateCeramicNodeModal from '../components/CreateCeramicNodeModal'
import { CeramicDto, CeramicNetwork, CeramicStatus } from '../types.d'
import dayjs from 'dayjs'
import { useAppCtx } from '../context/AppCtx'
import DeleteCeramicNodeModal from '../components/DeleteCeramicNodeModal'
import TrashIcon from '../components/Icons/TrashIcon'
import { Network } from '../components/Selector/EnumSelect'
import { useSession } from '@us3r-network/auth-with-rainbowkit'
import NodeTerminal from '../components/Terminal'
import CopyTint from '../components/CopyTint'
export default function CeramicNodes () {
  const {
    loadingCeramicNodes: loading,
    ceramicNodes,
    loadCeramicNodes
  } = useCeramicNodeCtx()
  const { currDapp } = useAppCtx()
  const [selectedNode, setSelectedNode] = useState<CeramicDto | undefined>(
    undefined
  )
  useEffect(() => {
    console.log('ceramicNodes changes: ', ceramicNodes)
    if (ceramicNodes.length > 0) {
      if (ceramicNodes[0].status === CeramicStatus.PREPARING) {
        setTimeout(() => {
          loadCeramicNodes()
        }, 10000)
      }
      setSelectedNode(ceramicNodes[0])
    } else setSelectedNode(undefined)
  }, [ceramicNodes, loadCeramicNodes])

  const [curentDappNetwork, setCurentDappNetwork] = useState<CeramicNetwork>(
    CeramicNetwork.TESTNET
  )
  useEffect(() => {
    switch (currDapp?.network) {
      case Network.TESTNET:
        setCurentDappNetwork(CeramicNetwork.TESTNET)
        break
      case Network.MAINNET:
        setCurentDappNetwork(CeramicNetwork.MAINNET)
        break
      default:
        break
    }
  }, [currDapp])

  if (loading) {
    return (
      <ListBox>
        <div className='loading'>
          <img src='/loading.gif' alt='' />
        </div>
      </ListBox>
    )
  }
  if (ceramicNodes) {
    return (
      <Container>
        <ListBox>
          <div className='title'>
            <h3>Node</h3>
            {ceramicNodes.length === 0 && (
              <CreateNodeButton network={curentDappNetwork} />
            )}
          </div>
          <NodesListBox>
            {ceramicNodes?.map(item => {
              const active = selectedNode?.id === item.id
              return (
                <div key={item.id} className={active ? 'active' : ''}>
                  <div
                    className='title'
                    onClick={() => {
                      if (active) return
                      setSelectedNode(item)
                    }}
                  >
                    <div>{item.name}</div>
                  </div>
                  {active && (
                    <>
                      <hr />
                      <p>Network: {item.network}</p>
                      <p>Stutas: {item.status}</p>
                      <p>Created: {dayjs(item.createdAt).fromNow()}</p>
                    </>
                  )}
                </div>
              )
            })}
          </NodesListBox>
        </ListBox>
        {selectedNode && <CeramicNodeInfo node={selectedNode} />}
      </Container>
    )
  }
  return null
}

function CreateNodeButton ({ network }: { network?: string }) {
  const { loadCeramicNodes } = useCeramicNodeCtx()
  return (
    <DialogTrigger>
      <Button>
        <PlusIcon />
      </Button>
      <ModalOverlay>
        <Modal>
          <Dialog>
            {({ close }) => (
              <CreateCeramicNodeModal
                closeModal={close}
                onSussess={loadCeramicNodes}
                fixedNetwork={network as CeramicNetwork}
              />
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  )
}

function DeleteNodeButton ({ node }: { node: CeramicDto }) {
  const { loadCeramicNodes } = useCeramicNodeCtx()
  return (
    <DialogTrigger>
      <Button>
        <TrashIcon />
      </Button>
      <ModalOverlay>
        <Modal>
          <Dialog>
            {({ close }) => (
              <DeleteCeramicNodeModal
                closeModal={close}
                onSussess={loadCeramicNodes}
                node={node}
              />
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  )
}

function CeramicNodeInfo ({ node }: { node: CeramicDto }) {
  const session = useSession()
  return (
    <NodeInfoContainer>
      <NodeInfoBox>
        <div className='title'>
          <div className='name'>{node.name}</div>
          <div className='network-tag'>{node.network}</div>
          <DeleteNodeButton node={node} />
        </div>
        {node.status === CeramicStatus.PREPARING ? (
          <div className='prepareing-info'>
            <img src='/loading.gif' alt='' />
            Preparing your deployment... (It may take a few minutes)
          </div>
        ) : node.status === CeramicStatus.RUNNING ? (
          <div className='node-infos'>
            <div className='node-info'>
              <div className='node-info-key'>Node URL: </div>
              <div className='node-info-value'>{node.serviceUrl}</div>
              <CopyTint data={node.serviceUrl} />
            </div>
            <div className='node-info'>
              <div className='node-info-key'>Private Key: </div>
              <div className='node-info-value'>{node.privateKey}</div>
              <CopyTint data={node.privateKey} />
            </div>
            <div className='node-info'>
              <div className='node-info-key'>API Key: </div>
              <div className='node-info-value'>{node.apiKey}</div>
              <CopyTint data={node.apiKey} />
            </div>
          </div>
        ) : null}
      </NodeInfoBox>
      {node?.id && node.status === CeramicStatus.RUNNING && session?.did && (
        <NodeTermnalBox>
          <NodeTerminal ceramicId={node.id} didSession={session.serialize()} />
        </NodeTermnalBox>
      )}
    </NodeInfoContainer>
  )
}

const Container = styled.main`
  display: flex;
  flex-direction: row;
  gap: 20px;
  margin-top: 25px;
  margin-bottom: 25px;
  justify-content: stretch;
`
const ListBox = styled.div`
  background: #1b1e23;
  border: 1px solid #39424c;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
  gap: 20px;
  width: 260px;
  min-width: 260px;
  box-sizing: border-box;
  height: fit-content;
  flex-shrink: 0;
  flex-grow: 0;
  > div {
    width: 100%;
  }
  .title {
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    > h3 {
      font-style: italic;
      font-weight: 700;
      font-size: 20px;
      line-height: 24px;
      margin: 0;
      color: #ffffff;
    }
  }
  .loading {
    width: 100%;
    text-align: center;
  }
`

const NodesListBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: scroll;
  > div {
    padding: 10px 16px;
    box-sizing: border-box;
    border: 1px solid #39424c;
    border-radius: 12px;
    cursor: pointer;
  }

  div.title {
    > div {
      cursor: pointer;
      max-width: 80%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  div.active {
    background: rgba(113, 128, 150, 0.3);
    border: 1px solid #718096;
    border-radius: 12px;

    .id-copy {
      display: flex;
      align-items: center;
      justify-content: space-between;

      > p {
        margin: 0;
      }
    }
  }

  hr {
    border-color: rgba(255, 255, 255, 0.2);
    margin-top: 10px;
  }

  p {
    color: #718096;
    > span {
      color: #ffffff;
      font-size: 16px;
      font-family: Rubik;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
    }
  }

  .removing {
    > img {
      width: 20px;
    }
  }
`

const NodeInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-shrink: 1;
  flex-grow: 1;
`
const NodeInfoBox = styled.div`
  padding: 20px;
  border-radius: 20px;
  border: 1px solid #39424c;
  background: #1b1e23;
  width: calc(100%-280px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  .title {
    display: flex;
    flex-direction: row;
    gap: 20px;
    .name {
      font-size: 24px;
      font-weight: 700;
    }
    .network-tag {
      background: #718096;
      padding: 0px 8px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      height: 20px;
    }
  }
  .prepareing-info {
    display: flex;
    flex-direction: row;
    gap: 20px;
    /* align-items: center; */
    > img {
      width: 20px;
      height: auto;
    }
  }
  .node-infos {
    display: flex;
    flex-direction: column;
    gap: 12px;
    .node-info {
      width: 100%;
      display: flex;
      flex-direction: row;
      gap: 10px;
      .node-info-key {
        flex-shrink: 0;
        text-align: right;
        width: 90px;
        color: #718094;
      }
      .node-info-value {
        flex-shrink: 1;
        max-width: 840px;
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
`
const NodeTermnalBox = styled.div`
  width: calc(100%-280px);
  height: 600px;
  padding: 20px;
  background-color: black;
  border-radius: 20px;
  border: 1px solid #39424c;
`
