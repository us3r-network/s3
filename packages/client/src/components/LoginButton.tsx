import {
  useUs3rAuthModal,
  useUs3rAuth,
  UserAvatar,
} from "@us3r-network/authkit";
import { useUs3rProfileContext } from "@us3r-network/profile";
import styled from "styled-components";

const LoginButton = () => {
  const { sessId } = useUs3rProfileContext()!;
  const { logout } = useUs3rAuth();
  const { openLoginModal } = useUs3rAuthModal();

  return (
    <Wrapper style={{}}>
      {!!sessId && <UserAvatar did={sessId} title={sessId} />}
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
  display: flex;
  flex-direction: column;
  align-items: center;
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
