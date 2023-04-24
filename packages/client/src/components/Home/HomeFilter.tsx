import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Network } from "../../types";

type Ops = "model" | "stream";
export default function SearchFilter() {
  const [ops, setOps] = useState<Ops>("model");
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        if (ops === "model") {
          navigate(`/modelview/${searchText}`);
        } else {
          let network = Network.MAINNET;
          try {
            const localNetwork =
              localStorage.getItem("network-select") || '"MAINNET"';
            network = JSON.parse(localNetwork);
          } catch (error) {
            console.error(error);
          }
          navigate(`/${network.toLowerCase()}/stream/${searchText}`);
        }
        console.log(searchText);
      }
    },
    [ops, searchText, navigate]
  );

  return (
    <Box className="search-area">
      <div className="select-box">
        <select
          name=""
          id=""
          value={ops}
          onChange={(e) => {
            setOps(e.target.value as Ops);
          }}
        >
          <option value="model">Model</option>
          <option value="stream">Stream</option>
        </select>
      </div>
      <input
        type="text"
        placeholder="Search by Model / Steam ID / DID / Family"
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
        }}
        onKeyDown={handleKeyDown}
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