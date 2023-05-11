import styled from 'styled-components'
import ComposeDB from '../../icons/ComposeDB'
import { Link } from 'react-router-dom'

export default function Title({
  title,
  viewAll,
}: {
  title: string
  viewAll: string
}) {
  return (
    <Box>
      <div>
        <ComposeDB />
        <h2>{title}</h2>
      </div>
      <div className="view-all">
        <Link to={viewAll}>View All</Link>
      </div>
    </Box>
  )
}

const Box = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  > div {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  > div.view-all {
    a {
      font-weight: 400;
      font-size: 16px;
      line-height: 19px;
      text-align: center;
      color: #748094;
    }
  }

  h2 {
    font-style: italic;
    font-weight: 700;
    font-size: 24px;
    line-height: 28px;

    color: #ffffff;
    margin: 0;
  }
`
