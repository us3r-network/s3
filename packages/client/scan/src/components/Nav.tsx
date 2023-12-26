import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import GitHubButton from 'react-github-btn'

import Logo from './Logo'
import { useCeramicCtx } from '../context/CeramicCtx'
import LoginButton from './LoginButton'

export default function Nav() {
  let location = useLocation()
  const { network } = useCeramicCtx()

  const homeActive = location.pathname === '/'
  const modelActive = location.pathname.startsWith('/models')
  const streamActive = location.pathname.startsWith('/streams')
  const dappActive = location.pathname.startsWith('/dapps')

  return (
    <NavContainer>
      <div className="fixed">
        <Link to={`/?network=${network}`}>
          <div className="logo-container">
            <Logo className="App-logo" alt="logo" />
            <span>Alpha</span>
          </div>
        </Link>

        <div className="nav">
          <Link to={`/?network=${network}`}>
            <div className={`nav-item ${homeActive ? 'active' : ''}`}>
              <HomeIcon stroke={homeActive ? 'white' : '#718096'} />
              <div className="tint-c">
                <div className="tint">Home</div>
              </div>
            </div>
          </Link>

          <Link to={`/streams?network=${network}`}>
            <div className={`nav-item ${streamActive ? 'active' : ''}`}>
              <StreamIcon stroke={streamActive ? 'white' : '#718096'} />
              <div className="tint-c">
                <div className="tint">Streams</div>
              </div>
            </div>
          </Link>

          <Link to={`/models?network=${network}`}>
            <div className={`nav-item ${modelActive ? 'active' : ''}`}>
              <ModelIcon stroke={modelActive ? 'white' : '#718096'} />
              <div className="tint-c">
                <div className="tint">ComposeDB Models</div>
              </div>
            </div>
          </Link>
          <Link to={`/dapps?network=${network}`}>
            <div className={`nav-item ${dappActive ? 'active' : ''}`}>
              {(dappActive && <DappIconActive />) || <DappIcon />}
              <div className="tint-c">
                <div className="tint">Dapps</div>
              </div>
            </div>
          </Link>
          <a target='_blank' href={`https://console.s3.xyz`} rel="noreferrer">
            <div className={`nav-item`}>
              <ConsoleIcon />
              <div className="tint-c">
                <div className="tint">Console</div>
              </div>
            </div>
          </a>
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

function DappIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <rect width="16" height="16" fill="url(#pattern0)" />
      <defs>
        <pattern
          id="pattern0"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_111_1177" transform="scale(0.0111111)" />
        </pattern>
        <image
          id="image0_111_1177"
          width="90"
          height="90"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAACXBIWXMAAAsTAAALEwEAmpwYAAAB2klEQVR4nO3a3UoCQRTA8X2DCqqHqKfp4zXEGTfQu1mDqLsIdsbs5azHyBvjOBf2IbTaEduz/x8seCHHAcf9kH9RAAAAAAAAAPsyuk9HLtTXgxAHrqq9vO6Hx0PmKylDOnUhvfgQ575Kiy9HiHMX4nPv7umkq/NVuNv63Ffx7ccCvx0upFd5b9fmq5Cd0GSRnxfb22BntH2+muXPreEi/eqYdGW+2oVv7Tntt11Rxffhw/TA+nw1ckexxW5YyNEP8dL6fDUuxJttF+qrVFqfr0Y+bNuFuqr21uer8eN0tfWOGE8urM9XI098u7yY9Fs+X5U8MW2+0BS7Ml+N3LzLTXzzhcbZIEyPuzJflTyWNltsnJVhcta1+arkW5YnJjl/rTunuRDTX3ZC2+erk4uE3Mwv/yKtai+vNS8cw5bPBwAAALBHdB071vbuoqTrKOg6LHQXJV1HRtdhoLsY0XVkdB1GugtH15HRdRjpLjxdR0bXYai7cHQdGV2Hoe7C0XWs0HUY6y6GdB0AAACAXXQdO9b27qKk6yjoOix0FyVdR0bXYaC7GNF1ZHQdRroLR9eR0XUY6S48XUdG12Gou3B0HRldh6HuwtF1rNB1GOsuhnQdAAAAAAAAKP6ZD86SUkZBPMKrAAAAAElFTkSuQmCC"
        />
      </defs>
    </svg>
  )
}

function DappIconActive() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <rect width="16" height="16" fill="url(#pattern0)" />
      <defs>
        <pattern
          id="pattern0"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_2_3366" transform="scale(0.0111111)" />
        </pattern>
        <image
          id="image0_2_3366"
          width="90"
          height="90"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAACXBIWXMAAAsTAAALEwEAmpwYAAABi0lEQVR4nO3aa0rDQBRA4ezACtZF6Gp8bKTWrfjAzVmXoX+ODDNQUaGpuaXmzvl+hVJuB5pmknKGQZIkSZIkSToW4BS4Be6AVTteOD8IcA68AB/8VF57Bpa9zg8BXAJv7LYp7+1tfoh2JoxZ5NfFLnuZH6b93Pb11Mv8yI3vt2vaLu/ASfb5YdodxV9dZ58fBrifsNB19vlhyodNWOgq+/wwwM2EhV5lnx+mPPEdeLNazHl+qPbEtK+HXuaHKTfv7SZ+rFfgrJf5odoj7GbkIi96mx+qfMvlialdv74rrz1OORPmPj9c2STKzXz7i3TVjsM2DmY+X5IkSdIR2XUc2Ny7C+w6BruODN0Fdh2VXUeC7gK7jsquI0l3gV1HZdeRpLvArqOy60jUXWDXUdl1JOousOvYsutI1l1g1yFJkiTlZddxYHPvLrDrGOw6MnQX2HVUdh0JugvsOiq7jiTdBXYdlV1Hku4Cu47KriNRd4FdR2XXkai7wK5jy64jWXeBXYckSZIkSZKGf+YT9fQB+MUko2oAAAAASUVORK5CYII="
        />
      </defs>
    </svg>
  )
}

function ConsoleIcon() {
  return (
    <svg
      width='21'
      height='20'
      viewBox='0 0 21 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M17.4604 2.58124H3.53542C3.04167 2.58124 2.56458 2.81457 2.23125 3.2229C1.92083 3.59999 1.75 4.09582 1.75 4.61874V13.0833C1.75 13.6062 1.92083 14.1021 2.23125 14.4792C2.56667 14.8875 3.04167 15.1208 3.53542 15.1208H17.4604C17.9542 15.1208 18.4292 14.8875 18.7667 14.4812C19.0792 14.1042 19.25 13.6062 19.25 13.0854V4.61665C19.25 4.09374 19.0792 3.5979 18.7667 3.22082C18.4312 2.81457 17.9542 2.58124 17.4604 2.58124ZM18 13.0833C18 13.5104 17.7521 13.8687 17.4604 13.8687H3.53542C3.24583 13.8687 3 13.5083 3 13.0833V4.61665C3 4.18957 3.24583 3.82915 3.53542 3.82915H17.4604C17.7479 3.82915 18 4.1979 18 4.61665V13.0833ZM13.95 17.5812C14.2958 17.5812 14.575 17.3021 14.575 16.9562C14.575 16.6104 14.2958 16.3312 13.95 16.3312H7.05C6.70417 16.3312 6.425 16.6104 6.425 16.9562C6.425 17.3021 6.70417 17.5812 7.05 17.5812H13.95Z'
        fill='#718096'
      />
      <path
        d='M6.16251 7.58124C5.81667 7.58124 5.53751 7.8604 5.53751 8.20624V10.7062C5.53751 11.0521 5.81667 11.3312 6.16251 11.3312C6.50834 11.3312 6.78751 11.0521 6.78751 10.7062V8.20624C6.78751 7.8604 6.50834 7.58124 6.16251 7.58124ZM11.125 5.08124C10.7792 5.08124 10.5 5.3604 10.5 5.70624V10.7083C10.5 11.0542 10.7792 11.3333 11.125 11.3333C11.4708 11.3333 11.75 11.0542 11.75 10.7083V5.70624C11.75 5.3604 11.4708 5.08124 11.125 5.08124ZM13.6438 7.58124C13.2979 7.58124 13.0188 7.8604 13.0188 8.20624V10.7062C13.0188 11.0521 13.2979 11.3312 13.6438 11.3312C13.9896 11.3312 14.2688 11.0521 14.2688 10.7062V8.20624C14.2688 7.8604 13.9896 7.58124 13.6438 7.58124ZM8.66251 6.33124C8.31667 6.33124 8.03751 6.6104 8.03751 6.95624V10.7062C8.03751 11.0521 8.31667 11.3312 8.66251 11.3312C9.00834 11.3312 9.28751 11.0521 9.28751 10.7062V6.95624C9.28751 6.6104 9.00834 6.33124 8.66251 6.33124Z'
        fill='#718096'
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
