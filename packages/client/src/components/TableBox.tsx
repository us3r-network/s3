import styled from 'styled-components'

export const TableBox = styled.div<{ isMobile?: boolean }>`
  border-radius: 20px;
  border: 1px solid #39424c;
  background: #1b1e23;

  ${({ isMobile }) => (isMobile ? `display: inline-block;` : '')}
`
