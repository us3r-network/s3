import styled from "styled-components";

export default function Lists() {
  return (
    <Box>
      <div>Models</div>

      <div>Streams</div>
    </Box>
  );
}

const Box = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;

  gap: 20px;

  > div {
    background: #1b1e23;
    border: 1px solid #39424c;
    border-radius: 20px;
    padding: 20px;
  }
`;
