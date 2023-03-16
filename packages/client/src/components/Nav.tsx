import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import GitHubButton from "react-github-btn";

import Logo from "./Logo";
import LoginButton from "./LoginButton";

export default function Nav() {
  let location = useLocation();

  const modelActive = location.pathname.startsWith("/model");
  return (
    <NavContainer>
      <div className="fixed">
        <Link to={"/"}>
          <div className="logo-container">
            <Logo className="App-logo" alt="logo" />
            <span>Alpha</span>
          </div>
        </Link>

        <div className="nav">
          <Link to={"/"}>
            <div className={`nav-item ${!modelActive ? "active" : ""}`}>
              <span>S</span>
              <div className="tint-c">
                <div className="tint">Streams</div>
              </div>
            </div>
          </Link>

          <Link to={"/model"}>
            <div className={`nav-item ${modelActive ? "active" : ""}`}>
              <span>M</span>
              <div className="tint-c">
                <div className="tint">ComposeDB Models</div>
              </div>
            </div>
          </Link>
        </div>

        <div className="nav-bottom">
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
        </div>
      </div>
    </NavContainer>
  );
}

const NavContainer = styled.nav`
  width: 70px;

  transition: all 0.15s ease-out;
  height: 100vh;

  > div.fixed {
    position: fixed;
    box-sizing: border-box;
    border-right: 1px solid #39424c;
    padding: 20px 0px;
    width: inherit;
    height: 100%;
    background: #1b1e23;
    overflow: hidden;
    display: flex;
    align-items: start;
    justify-content: space-between;
    flex-direction: column;

    .nav {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      a {
        color: #fff;
      }
      .nav-item {
        position: relative;
        width: 48px;
        height: 48px;
        border: 1px solid #39424c;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;

        .tint-c {
          position: absolute;
          left: 0;
          top: -15px;
        }

        .tint {
          position: fixed;
          display: none;
          font-size: 16px;
          width: fit-content;
          padding: 1px 3px;
          border: 1px solid #39424c;
        }

        &:hover {
          .tint {
            display: block;
          }
        }

        > span {
          color: #fff;
        }
        &.active {
          > span {
            color: #71aaff;
          }
        }

        /* font-weight: 700; */
      }
    }

    .nav-bottom {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
      .github-star {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;

        .github-star {
          width: 100%;
          text-align: center;
        }
      }
    }
  }

  a {
    text-decoration: none;
  }

  .logo-container {
    width: inherit;
    display: flex;
    align-items: flex-end;
    padding: 0 15px;
    path {
      fill: #fff;
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

  .App-logo {
    width: 40px;
    height: 40px;
    pointer-events: none;
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
