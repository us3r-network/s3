import { Link } from 'react-router-dom'
import styled from 'styled-components'

export default function NoMatch() {
  return (
    <Container>
      <h2>404</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </Container>
  )
}

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`
