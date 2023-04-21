import styled from "styled-components";

export default function SearchFilter() {
  return (
    <Box className="search-area">
      <div className="select-box">
        <select name="" id="">
          <option value="model">Model</option>
          <option value="stream">Stream</option>
        </select>
      </div>
      <input
        type="text"
        placeholder="Search by Model / Steam ID / DID / Family"
      />
    </Box>
  );
}

const Box = styled.div`
  margin-top: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px 4px;
  gap: 20px;

  width: 612px;
  height: 48px;

  background: #ffffff;
  border-radius: 12px;

  select,
  input {
    border: none;
    outline: none;
  }

  .select-box {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 0px 10px;
    gap: 10px;
    box-sizing: border-box;
    width: 130px;
    height: 40px;

    background: rgba(113, 128, 150, 0.1);
    border-radius: 10px;
    select {
      width: 110px;
      background: none;
    }
  }

  input {
    font-family: "Rubik";
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    flex-grow: 1;
  }
`;
