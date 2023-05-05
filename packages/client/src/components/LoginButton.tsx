import { UserAvatar } from "@us3r-network/profile";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  useAuthentication,
  useSession,
} from "@us3r-network/auth-with-rainbowkit";

const LoginButton = () => {
  const { signIn, signOut } = useAuthentication();
  const session = useSession();
  const sessId = session?.id;
  const navigate = useNavigate();

  const navToProfile = useCallback(() => {
    navigate(`/streams/profile/${sessId}`);
  }, [navigate, sessId]);

  return (
    <Wrapper>
      {!!sessId && (
        <div onClick={navToProfile}>
          <UserAvatar title={sessId} />
        </div>
      )}
      <button
        onClick={() => {
          if (!sessId) {
            signIn();
          } else {
            signOut();
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
  > div {
    cursor: pointer;
  }
`;
