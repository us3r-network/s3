import { LoginButton, UserAvatar } from "@us3r-network/profile";
import styled from "styled-components";
import { useCeramicCtx } from "../context/CeramicCtx";
import ChevronDown from "./icons/ChevronDown";
import { Network } from "../types";

export default function Header() {
  return (
    <Box>
      <div>
        <NetworkSwitch />
        <UserAvatar />
      </div>
    </Box>
  );
}

function NetworkSwitch() {
  const { network, setNetwork } = useCeramicCtx();

  return (
    <SwitchBox>
      <div className="title">
        <div>{network.toLowerCase()}</div>
        <ChevronDown />
      </div>
      <div className="list">
        <div
          onClick={() => {
            setNetwork(Network.MAINNET);
          }}
        >
          Mainnet
        </div>
        <div
          onClick={() => {
            setNetwork(Network.TESTNET);
          }}
        >
          Testnet
        </div>
      </div>
    </SwitchBox>
  );
}

const SwitchBox = styled.div`
  width: 125px;
  height: 40px;
  cursor: pointer;
  background: #1a1e23;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #39424c;
  border-radius: 100px;
  position: relative;

  > .title {
    display: flex;
    align-items: center;
    text-transform: capitalize;
    padding: 8px 20px 8px 16px;
    gap: 8px;
  }
  > .list {
    position: absolute;
    top: 40px;
    display: flex;
    flex-direction: column;
    border: 1px solid #39424c;
    width: 100%;
    padding: 10px 20px;
    box-sizing: border-box;
    /* gap: 20px; */
    background: #1a1e23;
    border-radius: 10px;
    visibility: hidden;
    > div {
      padding: 10px 0;
      &:first-child {
        border-bottom: 1px solid #39424c;
      }
      
    }
  }

  &:hover {
    > .list {
      visibility: visible;
    }
  }
`;

const Box = styled.div`
  position: sticky;
  top: 0;
  background-color: #1b1e23;
  z-index: 100;
  > div {
    justify-content: end;
    display: flex;
    height: 60px;
    gap: 20px;
    align-items: center;
    padding: 10px 0;
    width: calc(100vw - 300px);
    max-width: 1300px;
    margin: 0 auto;
    box-sizing: border-box;
  }
`;
