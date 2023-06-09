import styled from 'styled-components'

export const TableBox = styled.div<{ isMobile?: boolean }>`
  border-radius: 20px;
  border: 1px solid #39424c;
  background: #1b1e23;

  ${({ isMobile }) => (isMobile ? `display: inline-block;` : '')}
`

export const TableContainer = styled.table<{ isMobile?: boolean }>`
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

    width: calc((100% - 70px) / 7) !important;
    overflow: hidden;
    ${({ isMobile }) => (isMobile ? `padding: 0 20px !important;` : '')};

    &:first-child {
      padding-left: 20px;
    }

    &:last-child {
      padding-left: 20px;
      padding-right: 0px;
      width: 70px !important;
    }
  }

  tbody tr td {
    font-weight: 400;
    font-size: 16px;
    line-height: 19px;
    overflow: hidden;
    color: #ffffff;
    ${({ isMobile }) => (isMobile ? `padding: 0 20px !important;` : '')};

    &:first-child {
      padding-left: 20px;
    }

    &:last-child {
      padding-left: 20px;
      padding-right: 0px;
    }

    > div {
      padding-right: 20px;
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

  .release-date,
  .usage-count,
  .description {
    font-weight: 400;
    font-size: 16px;
    line-height: 19px;
    color: #718096;
  }

  .did-container {
    display: flex;
    gap: 10px;

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
    overflow: hidden;
    box-sizing: border-box;
    .family {
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

  .nav-stream {
    cursor: pointer;
  }

  .star,
  .staring {
    > img {
      width: 23px;
    }
  }
  .star {
    cursor: pointer;
  }
  .staring {
    cursor: not-allowed;
  }
`
