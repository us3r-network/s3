import styled from "styled-components";

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import dayjs from "dayjs";

export function ChartContainer({ data }: { data: number[] }) {
  const today = dayjs();
  const chartData = data.map((item, idx) => {
    return {
      name: today.subtract(data.length - idx, 'day').format("DD/MM"),
      stream: item,
    };
  });
  return (
    <Box>
      <div className="title chat-title">Stream history in 7 days</div>
      <div className="chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={500}
            height={300}
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Line
              type="monotone"
              dataKey="stream"
              stroke="#62D0FF"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Box>
  );
}

const Box = styled.div`
  display: flex;
  flex-direction: column;
  .title {
    padding: 20px;
    font-family: "Rubik";
    font-style: normal;
    font-weight: 700;
    font-size: 18px;
    line-height: 21px;

    color: #ffffff;
  }

  .chart {
    flex-grow: 1;
  }
`;
