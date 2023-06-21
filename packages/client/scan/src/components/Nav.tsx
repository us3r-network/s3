import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import GitHubButton from 'react-github-btn'

import Logo from './Logo'
import LoginButton from './LoginButton'
import { useCeramicCtx } from '../context/CeramicCtx'
import DappAdd from './icons/DappAdd'
import { useSession } from '@us3r-network/auth-with-rainbowkit'

export default function Nav() {
  let location = useLocation()
  const session = useSession()
  const { dapps } = useCeramicCtx()

  const homeActive = location.pathname === '/'
  const modelActive = location.pathname.startsWith('/models')
  const streamActive = location.pathname.startsWith('/streams')
  const componentActive = location.pathname.startsWith('/components')

  return (
    <NavContainer>
      <div className="fixed">
        <Link to={'/'}>
          <div className="logo-container">
            <Logo className="App-logo" alt="logo" />
            <span>Alpha</span>
          </div>
        </Link>

        <div className="nav">
          <Link to={'/'}>
            <div className={`nav-item ${homeActive ? 'active' : ''}`}>
              <HomeIcon stroke={homeActive ? 'white' : '#718096'} />
              <div className="tint-c">
                <div className="tint">Home</div>
              </div>
            </div>
          </Link>

          <Link to={'/streams'}>
            <div className={`nav-item ${streamActive ? 'active' : ''}`}>
              <StreamIcon stroke={streamActive ? 'white' : '#718096'} />
              <div className="tint-c">
                <div className="tint">Streams</div>
              </div>
            </div>
          </Link>

          <Link to={'/models'}>
            <div className={`nav-item ${modelActive ? 'active' : ''}`}>
              <ModelIcon stroke={modelActive ? 'white' : '#718096'} />
              <div className="tint-c">
                <div className="tint">ComposeDB Models</div>
              </div>
            </div>
          </Link>

          <Link to={'/components'}>
            <div className={`nav-item ${componentActive ? 'active' : ''}`}>
              <ComponentIcon stroke={componentActive ? 'white' : '#718096'} />
              <div className="tint-c">
                <div className="tint">Components</div>
              </div>
            </div>
          </Link>

          {/*session && (
            <div className="dapp">
              <hr />
              {dapps
                ?.filter((item) => item.node)
                .map((item) => {
                  return (
                    <Link to={`/dapp/${item.node.id!}`} key={item.node.id!}>
                      <div className="icon">
                        <img src={item.node.icon!} alt="" />
                      </div>
                    </Link>
                  )
                })}

              <Link to={'/dapp/create'}>
                <DappAdd />
                <div className="tint-c">
                  <div className="tint">Create Application</div>
                </div>
              </Link>
            </div>
              )*/}
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
  )
}

function HomeIcon({ stroke = 'white' }) {
  return (
    <svg
      width="17"
      height="16"
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.5 14.0005V9.06714C6.5 8.69378 6.5 8.50709 6.57266 8.36448C6.63658 8.23904 6.73857 8.13706 6.86401 8.07314C7.00661 8.00048 7.1933 8.00048 7.56667 8.00048H9.43333C9.8067 8.00048 9.99339 8.00048 10.136 8.07314C10.2614 8.13706 10.3634 8.23904 10.4273 8.36448C10.5 8.50709 10.5 8.69378 10.5 9.06714V14.0005M7.84513 1.84315L3.32359 5.3599C3.02135 5.59498 2.87022 5.71252 2.76135 5.85973C2.66491 5.99012 2.59307 6.13701 2.54935 6.29319C2.5 6.4695 2.5 6.66095 2.5 7.04386V11.8671C2.5 12.6139 2.5 12.9872 2.64532 13.2725C2.77316 13.5233 2.97713 13.7273 3.22801 13.8552C3.51323 14.0005 3.8866 14.0005 4.63333 14.0005H12.3667C13.1134 14.0005 13.4868 14.0005 13.772 13.8552C14.0229 13.7273 14.2268 13.5233 14.3547 13.2725C14.5 12.9872 14.5 12.6139 14.5 11.8671V7.04386C14.5 6.66095 14.5 6.4695 14.4506 6.29319C14.4069 6.13701 14.3351 5.99012 14.2386 5.85973C14.1298 5.71252 13.9787 5.59499 13.6764 5.35991L9.15487 1.84315C8.92065 1.66099 8.80354 1.5699 8.67423 1.53489C8.56013 1.504 8.43987 1.504 8.32577 1.53489C8.19646 1.5699 8.07935 1.66099 7.84513 1.84315Z"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function StreamIcon({ stroke = 'white' }) {
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
  )
}

function ModelIcon({ stroke = '#718096' }) {
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
  )
}

function ComponentIcon({ stroke = '#718096' }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.49967 1.83398V3.83398M10.4997 1.83398V3.83398M6.49967 13.1673V15.1673M10.4997 13.1673V15.1673M13.1663 6.50065H15.1663M13.1663 9.83398H15.1663M1.83301 6.50065H3.83301M1.83301 9.83398H3.83301M7.03301 13.1673H9.96634C11.0864 13.1673 11.6465 13.1673 12.0743 12.9493C12.4506 12.7576 12.7566 12.4516 12.9484 12.0753C13.1663 11.6475 13.1663 11.0874 13.1663 9.96732V7.03398C13.1663 5.91388 13.1663 5.35383 12.9484 4.926C12.7566 4.54968 12.4506 4.24372 12.0743 4.05197C11.6465 3.83398 11.0864 3.83398 9.96634 3.83398H7.03301C5.9129 3.83398 5.35285 3.83398 4.92503 4.05197C4.5487 4.24372 4.24274 4.54968 4.05099 4.926C3.83301 5.35383 3.83301 5.91388 3.83301 7.03398V9.96732C3.83301 11.0874 3.83301 11.6475 4.05099 12.0753C4.24274 12.4516 4.5487 12.7576 4.92503 12.9493C5.35285 13.1673 5.9129 13.1673 7.03301 13.1673Z"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const NavContainer = styled.nav`
  width: 70px;

  transition: all 0.15s ease-out;
  height: 100vh;
  z-index: 500;

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
        width: 39px;
        height: 39px;
        /* border: 1px solid #39424c; */
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
          background: #718096;
          border-radius: 5px;
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
          background: #14171a;
          > span {
          }
        }

        /* font-weight: 700; */
      }
    }

    .dapp {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
      hr {
        width: 70%;
        border-color: #39424c;
      }

      img {
        width: 39px;
        height: 39px;
      }

      .icon {
        border-radius: 10px;
        overflow: hidden;
      }

      a {
        position: relative;

        .tint-c {
          position: absolute;
          right: -5px;
          top: 3px;
        }

        .tint {
          position: fixed;
          display: none;
          font-size: 16px;
          width: fit-content;
          padding: 8px;
          background: linear-gradient(52.42deg, #cd62ff 35.31%, #62aaff 89.64%),
            #343941;
          border-radius: 10px;
          &::before {
            content: ' ';
            position: absolute;
            top: 15px;
            left: -5px;
            width: 7px;
            height: 5px;
            background: linear-gradient(
                52.42deg,
                #cd62ff 35.31%,
                #62aaff 89.64%
              ),
              #343941;
            transform: rotate(-90deg);
            border-top-left-radius: 100px;
            border-top-right-radius: 100px;
          }
        }

        &:hover {
          .tint {
            display: block;
          }
        }
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
`
