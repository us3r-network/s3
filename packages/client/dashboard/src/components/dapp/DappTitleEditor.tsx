import {
  Button,
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from 'react-aria-components'
import styled from 'styled-components'
import { ClientDApp, Network } from '../../types.d'
import EditIcon from '../icons/EditIcon'
import EditDappInfo from './EditDappInfo'

export default function DappTitleEditor({
  selectedDapp,
  isOwner,
}: {
  selectedDapp: ClientDApp
  isOwner: boolean
}) {
  return (
    <TitleBox>
      <div>
        <h3>{selectedDapp.name}</h3>
        <span className="net">{selectedDapp.network || Network.TESTNET}</span>
        <span>{selectedDapp.stage || 'Under Development'}</span>
      </div>
      {isOwner && (
        <DialogTrigger>
          <Button>
            <EditIcon />
          </Button>
          <ModalOverlay>
            <Modal>
              <Dialog>
                {({ close }) => (
                  <EditDappInfo
                    closeModal={close}
                    selectedDapp={selectedDapp}
                  />
                )}
              </Dialog>
            </Modal>
          </ModalOverlay>
        </DialogTrigger>
      )}
    </TitleBox>
  )
}

const TitleBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  > div {
    display: flex;
    align-items: center;
    gap: 10px;
    > h3 {
      margin: 0;
      font-style: italic;
      font-weight: 700;
      font-size: 24px;
      line-height: 28px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      max-width: 800px;

      padding: 0 5px 0 0;
    }
    > span {
      border-radius: 10px;
      padding: 4px 10px;
      background-color: #5ba85a;
      &.net {
        background-color: #718096;
      }
    }
  }
  > button {
  }
`
