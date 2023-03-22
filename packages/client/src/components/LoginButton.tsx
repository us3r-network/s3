import {
  useUs3rAuthModal,
  useUs3rAuth,
  UserAvatar,
} from "@us3r-network/authkit";
import { useUs3rProfileContext } from "@us3r-network/profile";
import { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Network } from "../types";

const LoginButton = () => {
  const { sessId } = useUs3rProfileContext()!;
  const { logout } = useUs3rAuth();
  const { openLoginModal } = useUs3rAuthModal();
  const navigate = useNavigate();

  const navToProfile = useCallback(() => {
    let network = Network.MAINNET;
    try {
      const localNetwork =
        localStorage.getItem("network-select") || '"MAINNET"';
      network = JSON.parse(localNetwork);
    } catch (error) {
      console.error(error);
    }
    navigate(`/${network.toLowerCase()}/profile/${sessId}`);
  }, [navigate, sessId]);

  return (
    <Wrapper>
      {!!sessId && (
        <div onClick={navToProfile}>
          <UserAvatar did={sessId} title={sessId} />
        </div>
      )}
      <button
        onClick={() => {
          if (!sessId) {
            openLoginModal();
          } else {
            logout();
          }
        }}
      >
        <span>{sessId ? "Logout" : "Login"}</span>
      </button>
    </Wrapper>
  );
};

export default LoginButton;
const Wrapper = styled.div`
  width: 100%;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: end;
  gap: 10px;
  > img {
    width: 32px;
    height: 32px;
  }
  > button {
    overflow: hidden;
    cursor: pointer;
    width: 54px;
    height: 32px;
    border-radius: 10px;
    color: #fff;
    background: none;
    outline: none;
    border: 1px solid gray;
  }
`;
