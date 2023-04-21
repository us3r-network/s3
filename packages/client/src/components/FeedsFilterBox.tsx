
import styled, { StyledComponentPropsWithRef } from 'styled-components';
import { useCallback, useEffect, useRef } from 'react';


type FeedsFilterBoxProps = StyledComponentPropsWithRef<'div'> & {
  open?: boolean;
};
export default function FeedsFilterBox({
  children,
  open,
  ...otherProps
}: FeedsFilterBoxProps) {
  const bottomInnerRef = useRef<HTMLDivElement>();
  const setOpenStyle = useCallback(() => {
    if (bottomInnerRef.current) {
      // bottomInnerRef.current.parentElement!.style.height = `${bottomInnerRef.current.offsetHeight}px`;
      bottomInnerRef.current.parentElement!.style.paddingTop = '20px';
      bottomInnerRef.current.parentElement!.style.opacity = '1';
    }
  }, []);
  const setCloseStyle = useCallback(() => {
    if (bottomInnerRef.current) {
      // bottomInnerRef.current.parentElement!.style.height = '0px';
      bottomInnerRef.current.parentElement!.style.paddingTop = '0px';
      bottomInnerRef.current.parentElement!.style.opacity = '0';
    }
  }, []);
  const isListenWindowSize = useRef(false);

  return (
    <FeedsFilterBoxWrapper open={!!open} { ...otherProps }>
      <FeedsFilterBoxInner
        ref={(el) => {
          if (el) {
            bottomInnerRef.current = el;
            if (open) {
              setOpenStyle();
              isListenWindowSize.current = true;
            } else {
              setCloseStyle();
              isListenWindowSize.current = false;
            }
          }
        }}
      >
        {children}
      </FeedsFilterBoxInner>
    </FeedsFilterBoxWrapper>
  );
}
const FeedsFilterBoxWrapper = styled.div<{open: boolean}>`
  width: 100%;
  overflow: hidden;
  transition: all 0.3s ease-out;
  margin-bottom: ${({open}) => open ? '20px' : '0'};
  position: sticky;
  top: 80px;
  padding: ${({open}) => open ? '20px' : '0 20px'};
  box-sizing: border-box;
  background: #1b1e23;
  border-radius: 20px;
  border: 1px solid #39424c;
  overflow: hidden;
  z-index: 100;

`;
const FeedsFilterBoxInner = styled.div`
  width: 100%;
  max-height: 50vh;
  overflow-y: auto;
`;
