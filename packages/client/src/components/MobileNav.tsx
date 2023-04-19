import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import styled from "styled-components";
import IconFilterFunnel from "./icons/FilterFunnel";
import BackCircle from "./icons/BackCircle";
import GitHubButton from "react-github-btn";

import Logo from "./Logo";
import LoginButton from "./LoginButton";
import LoginSvg from "./icons/login.svg";
import LogoutSvg from "./icons/logout.svg";
import {
  useAuthentication,
  useSession,
} from "@us3r-network/auth-with-rainbowkit";
import { UserAvatar } from "@us3r-network/profile";

export default function Nav() {
  const { signIn, signOut } = useAuthentication();
  const session = useSession();
  let location = useLocation();
  const navigate = useNavigate();
  const [openFilter, setOpenFilter] = useState(false);
  const modelActive = location.pathname.startsWith("/model");
  const isSubPage = !(
    location.pathname === "/model" || location.pathname === "/"
  );

  return (
    <NavContainer>
      {/* <div className="fixed"> */}
      {isSubPage ? (
        <span onClick={() => navigate(-1)}>
          <BackCircle />
        </span>
      ) : (
        <Link to={"/"}>
          <div className="logo-container">
            <Logo className="App-logo" alt="logo" />
            {/* <span>Alpha</span> */}
          </div>
        </Link>
      )}
      <span className="title">
        {modelActive ? "ComposeDB Models" : "Streams"}
      </span>

      <div className="right">
        {session ? (
          <UserAvatar width={30} height={30} />
        ) : (
          <div
            onClick={() => {
              signIn();
            }}
          >
            <LoginIcon />
          </div>
        )}

        <div
          onClick={() => {
            setOpenFilter(!openFilter);
          }}
        >
          <IconFilterFunnel />
        </div>
      </div>

      <FilterSelectModal isOpen={openFilter}>
        <FilterSelectModalInner>
          <FilterSelectWrapper>
            <FilterSelectInner>
              <div className="nav">
                <Link to={"/"} onClick={() => setOpenFilter(!openFilter)}>
                  <div className={`nav-item ${!modelActive ? "active" : ""}`}>
                    <StreamIcon stroke={!modelActive ? "white" : "#718096"} />
                    <div className="tint-c">
                      <div className="tint">Streams</div>
                    </div>
                  </div>
                </Link>

                <Link to={"/model"} onClick={() => setOpenFilter(!openFilter)}>
                  <div className={`nav-item ${modelActive ? "active" : ""}`}>
                    <ModelIcon stroke={modelActive ? "white" : "#718096"} />
                    <div className="tint-c">
                      <div className="tint">ComposeDB Models</div>
                    </div>
                  </div>
                </Link>

                {!!session && (
                  <div
                    onClick={() => {
                      signOut();
                      setOpenFilter(!openFilter);
                    }}
                  >
                    <div className={`nav-item ${modelActive ? "active" : ""}`}>
                      <LogoutIcon />
                      <div className="tint-c">
                        <div className="tint">Logout</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </FilterSelectInner>
          </FilterSelectWrapper>
        </FilterSelectModalInner>
      </FilterSelectModal>

      {/* <div className="nav-bottom">
          <LoginButton />
          <div className="github-star">
            <GitHubButton
              href="https://github.com/us3r-network/userscan"
              data-color-scheme="no-preference: light; light: light; dark: dark;"
              data-icon="octicon-star"
              aria-label="Star buttons/github-buttons on GitHub"
            >
              Star
            </GitHubButton>
          </div>
        </div> */}
      {/* </div> */}
    </NavContainer>
  );
}
const LoginIcon = styled.img.attrs({
  src: LoginSvg,
})`
  width: 20px;
  height: 20px;
`;
const LogoutIcon = styled.img.attrs({
  src: LogoutSvg,
})`
  width: 20px;
  height: 20px;
`;
function StreamIcon({ stroke = "white" }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.83333 3.50065H12.7C13.4467 3.50065 13.8201 3.50065 14.1053 3.64598C14.3562 3.77381 14.5602 3.97778 14.688 4.22866C14.8333 4.51388 14.8333 4.88725 14.8333 5.63398V6.50065C14.8333 7.12191 14.8333 7.43253 14.7318 7.67756C14.5965 8.00427 14.3369 8.26383 14.0102 8.39916C13.7652 8.50065 13.4546 8.50065 12.8333 8.50065M9.16666 13.5007H4.3C3.55326 13.5007 3.17989 13.5007 2.89467 13.3553C2.64379 13.2275 2.43982 13.0235 2.31199 12.7726C2.16666 12.4874 2.16666 12.1141 2.16666 11.3673V10.5007C2.16666 9.8794 2.16666 9.56877 2.26816 9.32374C2.40348 8.99704 2.66305 8.73747 2.98975 8.60215C3.23478 8.50065 3.54541 8.50065 4.16666 8.50065M7.36666 10.1673H9.63333C9.82001 10.1673 9.91335 10.1673 9.98466 10.131C10.0474 10.099 10.0984 10.048 10.1303 9.98531C10.1667 9.91401 10.1667 9.82067 10.1667 9.63398V7.36732C10.1667 7.18063 10.1667 7.08729 10.1303 7.01599C10.0984 6.95327 10.0474 6.90227 9.98466 6.87032C9.91335 6.83398 9.82001 6.83398 9.63333 6.83398H7.36666C7.17998 6.83398 7.08664 6.83398 7.01533 6.87032C6.95261 6.90227 6.90162 6.95327 6.86966 7.01599C6.83333 7.08729 6.83333 7.18063 6.83333 7.36732V9.63398C6.83333 9.82067 6.83333 9.91401 6.86966 9.98531C6.90162 10.048 6.95261 10.099 7.01533 10.131C7.08664 10.1673 7.17998 10.1673 7.36666 10.1673ZM12.3667 15.1673H14.6333C14.82 15.1673 14.9134 15.1673 14.9847 15.131C15.0474 15.099 15.0984 15.048 15.1303 14.9853C15.1667 14.914 15.1667 14.8207 15.1667 14.634V12.3673C15.1667 12.1806 15.1667 12.0873 15.1303 12.016C15.0984 11.9533 15.0474 11.9023 14.9847 11.8703C14.9134 11.834 14.82 11.834 14.6333 11.834H12.3667C12.18 11.834 12.0866 11.834 12.0153 11.8703C11.9526 11.9023 11.9016 11.9533 11.8697 12.016C11.8333 12.0873 11.8333 12.1806 11.8333 12.3673V14.634C11.8333 14.8207 11.8333 14.914 11.8697 14.9853C11.9016 15.048 11.9526 15.099 12.0153 15.131C12.0866 15.1673 12.18 15.1673 12.3667 15.1673ZM2.36666 5.16732H4.63333C4.82001 5.16732 4.91335 5.16732 4.98466 5.13099C5.04738 5.09903 5.09837 5.04804 5.13033 4.98531C5.16666 4.91401 5.16666 4.82067 5.16666 4.63398V2.36732C5.16666 2.18063 5.16666 2.08729 5.13033 2.01599C5.09837 1.95327 5.04738 1.90227 4.98466 1.87032C4.91335 1.83398 4.82001 1.83398 4.63333 1.83398H2.36666C2.17998 1.83398 2.08664 1.83398 2.01533 1.87032C1.95261 1.90227 1.90162 1.95327 1.86966 2.01599C1.83333 2.08729 1.83333 2.18063 1.83333 2.36732V4.63398C1.83333 4.82067 1.83333 4.91401 1.86966 4.98531C1.90162 5.04804 1.95261 5.09903 2.01533 5.13099C2.08664 5.16732 2.17998 5.16732 2.36666 5.16732Z"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ModelIcon({ stroke = "#718096" }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.1666 5.35221L8.49998 8.50036M8.49998 8.50036L2.83331 5.35221M8.49998 8.50036L8.5 14.8337M14.5 11.2061V5.79468C14.5 5.56625 14.5 5.45204 14.4663 5.35017C14.4366 5.26005 14.3879 5.17733 14.3236 5.10754C14.2509 5.02865 14.151 4.97318 13.9514 4.86224L9.01802 2.1215C8.82895 2.01646 8.73442 1.96395 8.6343 1.94336C8.5457 1.92513 8.45431 1.92513 8.3657 1.94336C8.26559 1.96395 8.17105 2.01646 7.98198 2.1215L3.04865 4.86225C2.84896 4.97318 2.74912 5.02865 2.67642 5.10754C2.61211 5.17733 2.56343 5.26005 2.53366 5.35017C2.5 5.45204 2.5 5.56625 2.5 5.79468V11.2061C2.5 11.4345 2.5 11.5487 2.53366 11.6506C2.56343 11.7407 2.61211 11.8234 2.67642 11.8932C2.74912 11.9721 2.84897 12.0276 3.04865 12.1385L7.98198 14.8793C8.17105 14.9843 8.26559 15.0368 8.3657 15.0574C8.45431 15.0756 8.5457 15.0756 8.6343 15.0574C8.73442 15.0368 8.82895 14.9843 9.01802 14.8793L13.9514 12.1385C14.151 12.0276 14.2509 11.9721 14.3236 11.8932C14.3879 11.8234 14.4366 11.7407 14.4663 11.6506C14.5 11.5487 14.5 11.4345 14.5 11.2061Z"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const NavContainer = styled.nav`
  width: 100%;
  height: 56px;
  transition: all 0.15s ease-out;

  background: rgb(27, 30, 35);
  width: 100%;
  height: 56px;
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 1;
  padding: 10px;
  border-bottom: 1px solid rgb(57, 66, 76);
  box-sizing: border-box;
  display: flex;
  -webkit-box-pack: justify;
  justify-content: space-between;
  -webkit-box-align: center;
  align-items: center;

  a {
    text-decoration: none;
  }

  .logo-container {
    width: inherit;
    display: flex;
    align-items: flex-end;
    /* padding: 0 10px; */
    path {
      fill: #fff;
    }

    > svg {
      width: 30px;
      height: 30px;
      pointer-events: none;
    }

    > span {
      opacity: 0;
      transition: all 0.15s ease-out;
      font-weight: 500;
      font-size: 16px;
      color: rgb(255, 255, 255);
      padding-bottom: 5px;
    }
  }

  .title {
    font-weight: 700;
    font-weight: 700;
    font-size: 20px;
    line-height: 28px;
    font-style: italic;
    color: white;
  }

  .App-logo {
    width: 30px;
    height: 30px;
    pointer-events: none;
  }
  .right {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  /* @media (prefers-reduced-motion: no-preference) {
    .App-logo {
      animation: App-logo-spin infinite 20s linear;
    }
  } */

  @keyframes App-logo-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;
const FilterSelectModal = styled.div<{ isOpen: boolean }>`
  width: 100vw;
  height: ${({ isOpen }) => (isOpen ? "calc(100vh - 56px)" : "0px")};
  background: rgba(0, 0, 0, 0.8);
  position: absolute;
  top: 56px;
  left: 0;
  overflow: hidden;
  transition: all 0.3s;
`;
const FilterSelectModalInner = styled.div`
  width: 100%;
`;
const FilterSelectWrapper = styled.div`
  width: 100%;
  max-height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;
  background: #1b1e23;
`;
const FilterSelectInner = styled.div`
  height: 0;
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
  box-sizing: border-box;

  .nav {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    a {
      color: #fff;
    }
    .nav-item {
      position: relative;
      /* width: 39px; */
      padding: 0 10px;
      height: 39px;
      /* border: 1px solid #39424c; */
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      column-gap: 8px;

      .tint-c {
        /* position: absolute;
          left: 0;
          top: -15px; */
      }

      .tint {
        /* position: fixed; */
        /* display: none; */
        font-size: 16px;
        width: fit-content;
        padding: 1px 3px;
        /* border: 1px solid #39424c; */
      }

      /* &:hover {
          .tint {
            display: block;
          }
        } */

      > span {
        color: #fff;
      }
      &.active {
        background: #14171a;
        > span {
        }
      }
    }
  }
`;
