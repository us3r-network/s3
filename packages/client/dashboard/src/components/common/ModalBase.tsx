import {
  Button,
  Dialog,
  Heading,
  Modal,
  ModalOverlay,
  ModalOverlayProps,
} from 'react-aria-components'
import styled, { keyframes } from 'styled-components'
import CloseIcon from '../icons/CloseIcon'

export interface ModalBaseProps extends ModalOverlayProps {
  children?: React.ReactNode
  title?: string
  showCloseBtn?: boolean
  modalClassName?: string
  dialogClassName?: string
  headingClassName?: string
  titleClassName?: string
  closeBtnClassName?: string
}

export default function ModalBase({
  children,
  title,
  showCloseBtn = true,
  modalClassName = '',
  dialogClassName = '',
  headingClassName = '',
  titleClassName = '',
  closeBtnClassName = '',
  onOpenChange,
  ...props
}: ModalBaseProps) {
  return (
    <ModalOverlayStyled onOpenChange={onOpenChange} {...props}>
      <ModalStyled className={modalClassName}>
        <DialogStyled className={dialogClassName}>
          {(!!title || showCloseBtn) && (
            <HeadingStyled className={headingClassName}>
              {' '}
              <span className={titleClassName}>{title}</span>
              {showCloseBtn && (
                <CloseBtnStyled
                  className={closeBtnClassName}
                  onPress={() => {
                    if (!onOpenChange) return
                    onOpenChange(false)
                  }}
                >
                  <CloseIcon />
                </CloseBtnStyled>
              )}
            </HeadingStyled>
          )}
          {children}
        </DialogStyled>
      </ModalStyled>
    </ModalOverlayStyled>
  )
}

const fade = keyframes`
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
`
const zoom = keyframes`
    from {
        transform: scale(0.8);
    }

    to {
        transform: scale(1);
    }
`
const ModalOverlayStyled = styled(ModalOverlay)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  z-index: 100000;
  height: var(--visual-viewport-height);
  background: rgba(0 0 0 / 0.5);
  backdrop-filter: blur(12px);
  overflow: scroll;

  &[data-entering] {
    animation: ${fade} 200ms;
  }

  &[data-exiting] {
    animation: ${fade} 150ms reverse ease-in;
  }
`
const ModalStyled = styled(Modal)`
  box-shadow: 0 8px 20px rgba(0 0 0 / 0.1);
  border-radius: 6px;
  background: var(--page-background);
  border: 1px solid var(--spectrum-global-color-gray-300);
  outline: none;
  padding: 30px;
  position: relative;

  &[data-entering] {
    animation: ${zoom} 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
`
const DialogStyled = styled(Dialog)`
  outline: none;
  width: fit-content;
  margin: 0 auto;
  background: #1b1e23;
  border-radius: 20px;
  padding: 20px;
`
const HeadingStyled = styled(Heading)`
  margin: 0;
  padding: 0;
  height: 30px;
  line-height: 30px;
  margin-top: 0;
  color: #fff;
  font-size: 24px;
  font-style: italic;
  font-weight: 700;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`
const CloseBtnStyled = styled(Button)`
  margin-left: auto;
`
