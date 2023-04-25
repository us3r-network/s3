import styled from "styled-components";
import ComposeDB from "../../icons/ComposeDB";
import { Stats } from "../../../types";

export default function NumbersContainer({data}: {data: Stats}) {
    return (
      <NumbersBox>
        <NumberCard title="Total Models" data={data.totalModels}/>
        <NumberCard title="Total Streams" data={data.totalStreams}/>
        <NumberCard title="Release Today" data={data.todayModels}/>
        <NumberCard title="Streams per Hour" data={data.streamsPerHour}/>
      </NumbersBox>
    );
  }
  
  function NumberCard({ title, data }: { title: string, data: number }) {
    return (
      <NumberCardBox>
        <div className="title">
          <ComposeDB /> <span>{title}</span>
        </div>
        <h2>{data.toLocaleString()}</h2>
      </NumberCardBox>
    );
  }
  
  const NumberCardBox = styled.div`
    padding: 20px 15px;
    .title {
      display: flex;
      align-items: center;
      gap: 10px;
      span {
        font-weight: 700;
        font-size: 18px;
        line-height: 21px;
  
        color: #ffffff;
      }
    }
    h2 {
      margin: 0;
      margin-top: 20px;
      font-weight: 500;
      font-size: 32px;
      line-height: 38px;
      color: #ffffff;
    }
  `;
  
  const NumbersBox = styled.div`
    display: grid;
    grid-template-columns: auto auto;
  `;