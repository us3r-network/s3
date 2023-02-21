import { Link } from "react-router-dom";
import styled from "styled-components";
import GitHubButton from "react-github-btn";

import Logo from "./Logo";

export default function Nav() {
  return (
    <NavContainer>
      <div className="fixed">
        <Link to={"/"}>
          <div className="logo-container">
            <Logo className="App-logo" alt="logo" />
            <span>Alpha</span>
          </div>
        </Link>

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

    .github-star {
      width: 100%;
      text-align: center;
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

  .login-container {
    width: 100%;
    padding: 0 2px;

    > button {
      overflow: hidden;
      cursor: pointer;
      width: calc(100% - 4px);
      height: 40px;
      border-radius: 10px;
      color: #fff;
      background: none;
      outline: none;
      border: 1px solid gray;
    }
  }

  .avatar-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    margin-bottom: 5px;
    > span {
      display: none;
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
