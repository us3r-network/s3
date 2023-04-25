import styled from "styled-components";
import NumbersContainer from "./Totals";
import { ChartContainer } from "./Charts";
import { Stats } from "../../../types";

export default function Dashboard({ data }: { data: Stats | undefined }) {
  if (!data) {
    return null;
  }
  return (
    <Box>
      <NumbersContainer data={data}/>
      <div className="split-line"></div>
      <ChartContainer data={data.streamsLastWeek}/>
    </Box>
  );
}
const Box = styled.div`
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  padding: 20px;
  gap: 20px;

  background: #1b1e23;
  border: 1px solid #39424c;
  border-radius: 20px;

  > .split-line {
    border: 1px solid rgba(57, 66, 76, 0.5);
    width: 1;
  }

  div.numbers,
  div.charts {
    flex-grow: 1;
  }
`;
