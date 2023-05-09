import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useSession } from "@us3r-network/auth-with-rainbowkit";
import UserAvatarStyled from "./common/UserAvatarStyled";
import { LoginButton as LoginButtonStyled } from "@us3r-network/profile";

const LoginButton = () => {
  const session = useSession();
  const sessId = session?.id;
  const navigate = useNavigate();

  const navToProfile = useCallback(() => {
    navigate(`/streams/profile/${sessId}`);
  }, [navigate, sessId]);

  return (
    <Wrapper>
      {!!sessId ? (
        <div onClick={navToProfile}>
          <UserAvatarStyled title={sessId} />
        </div>
      ) : (
        <LoginButtonStyled>Login</LoginButtonStyled>
      )}
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
  button[data-us3r-loginbutton] {
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
