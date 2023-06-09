import styled from "styled-components";

export const EditPageBox = styled.div`
  background-color: #1b1e23;
  margin-top: 24px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  border-radius: 20px;

  .app-basic {
    display: flex;
    gap: 20px;

    > div {
      flex-grow: 1;
    }
  }

  input,
  textarea {
    color: #fff;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;

    background: #1a1e23;
    border: 1px solid #39424c;
    border-radius: 12px;
    padding: 16px;
    outline: none;
    width: 100%;
    box-sizing: border-box;
  }

  input {
    height: 48px;
  }

  textarea {
    padding: 10px 16px;
    resize: none;
  }
`

export const EditInfoBox = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;

  > div {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .items {
    gap: 20px;
    display: flex;
    flex-direction: column;
  }
  h3 {
    margin: 0;
    font-style: italic;
    font-weight: 700;
    font-size: 18px;
    line-height: 21px;
    color: #ffffff;
  }

  h4 {
    margin: 0 0 5px 0;
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: #ffffff;
  }
`

export const EditBtnsBox = styled.div`
  display: flex;
  justify-content: end;
  gap: 20px;
  margin-top: 40px;
  button {
    width: 180px;
    height: 48px;

    background: #1b1e23;
    border: 1px solid #39424c;
    border-radius: 24px;
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: #ffffff;
    cursor: pointer;

    &.create {
      background: #ffffff;
      color: #14171a;
    }
  }
`