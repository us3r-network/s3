import {
  Button,
  Dialog,
  Heading,
  Modal,
  ModalOverlay,
} from 'react-aria-components'
import styles from './ModalBase.module.css'
import CloseIcon from '../Icons/CloseIcon'

export interface ModalBaseProps {
  title?: string
  showCloseBtn?: boolean
  children?: React.ReactNode
  isOpen: boolean
  onOpenChange?: (isOpen: boolean) => void
  isDismissable?: boolean
  overlayClassName?: string
  modalClassName?: string
  dialogClassName?: string
}
const ModalBase = ({
  title,
  showCloseBtn = true,
  children,
  isOpen,
  onOpenChange,
  isDismissable = true,
  overlayClassName = '',
  modalClassName = '',
  dialogClassName = '',
}: ModalBaseProps) => {
  return (
    <ModalOverlay
      className={`${styles.ModalOverlay} ${overlayClassName}`}
      isDismissable={isDismissable}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <Modal className={`${styles.Modal} ${modalClassName}`}>
        <Dialog className={`${styles.Dialog} ${dialogClassName}`}>
          {(!!title || showCloseBtn) && (
            <Heading className={styles.Heading}>
              {' '}
              <span>{title}</span>
              {showCloseBtn && (
                <Button
                  className={styles.CloseBtn}
                  onPress={() => {
                    if (!onOpenChange) return
                    onOpenChange(false)
                  }}
                >
                  <CloseIcon />
                </Button>
              )}
            </Heading>
          )}
          {children}
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}

export default ModalBase
