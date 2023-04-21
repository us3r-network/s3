import styled from "styled-components";
import ComposeDB from "../../icons/ComposeDB";

export default function NumbersContainer() {
    return (
      <NumbersBox>
        <NumberCard title="Total Models" />
        <NumberCard title="Total Streams" />
        <NumberCard title="Release Today" />
        <NumberCard title="Streams per Second" />
      </NumbersBox>
    );
  }
  
  function NumberCard({ title }: { title: string }) {
    const n = 12345567;
    return (
      <NumberCardBox>
        <div className="title">
          <ComposeDB /> <span>{title}</span>
        </div>
        <h2>{n.toLocaleString()}</h2>
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
    grid-row-gap: 20px;
  `;