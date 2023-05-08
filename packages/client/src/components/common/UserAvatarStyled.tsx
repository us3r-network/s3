import { UserAvatar } from "@us3r-network/profile";
import styled from "styled-components";
const UserAvatarStyled = styled(UserAvatar)`
  display: inline-block;
  width: 32px;
  height: 32px;
  svg {
    width: 100%;
    height: 100%;
    path {
      fill: #999;
    }
  }
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
`;
export default UserAvatarStyled;
