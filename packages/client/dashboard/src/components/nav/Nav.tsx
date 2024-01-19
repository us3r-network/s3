import React, { useMemo, useState } from 'react'
import { Link, NavLink, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import { DOCS_URL } from '../../constants'
import ChartIcon from '../icons/ChartIcon'
import ChevronRight from '../icons/ChevronRight'
import ComponentIcon from '../icons/ComponentIcon'
import DocIcon from '../icons/DocIcon'
import ExploreIcon from '../icons/ExploreIcon'
import HomeIcon from '../icons/HomeIcon'
import InfoIcon from '../icons/InfoIcon'
import LayoutIcon from '../icons/LayoutIcon'
import NodeIcon from '../icons/NodeIcon'
import SdkIcon from '../icons/SdkIcon'
import StarGoldIcon from '../icons/StarGoldIcon'
import StarIcon from '../icons/StarIcon'
import TerminalIcon from '../icons/TerminalIcon'

export default function Nav({ appId }: { appId: string }) {
  const [open, setOpen] = useState(true)
  const [searchParams] = useSearchParams()

  const filterStar = useMemo(() => {
    return searchParams.get('filterStar') || ''
  }, [searchParams])

  return (
    <NavContainer open={open}>
      <div></div>
      <div className="nav">
        <div className="top">
          {[
            {
              path: `/dapp/${appId}/index`,
              name: 'Home',
              icon: HomeIcon,
            },
            {
              path: `/dapp/${appId}/node`,
              name: 'Node Deployment',
              icon: NodeIcon,
            },
            {
              path: `/dapp/${appId}/model-editor`,
              name: 'Model Editor',
              icon: LayoutIcon,
            },
            {
              path: `/dapp/${appId}/model-playground`,
              name: 'Model Playground',
              icon: TerminalIcon,
            },
            {
              path: `/dapp/${appId}/model-sdk`,
              name: 'Model SDK',
              icon: SdkIcon,
            },
            {
              path: `/dapp/${appId}/statistic`,
              name: 'Model Metrics',
              icon: ChartIcon,
            },
            {
              path: `/dapp/${appId}/components`,
              name: 'S3 Components',
              icon: ComponentIcon,
            },
            {
              path: `/dapp/${appId}/info`,
              name: 'Info',
              icon: InfoIcon,
            },
          ].map((item) => {
            return (
              <NavLink to={item.path} key={item.path}>
                {({ isActive }) => (
                  <div className={`item ${isActive ? 'active' : ''}`}>
                    {React.createElement(item.icon, { isActive })}
                    <span>{item.name}</span>
                  </div>
                )}
              </NavLink>
            )
          })}
        </div>
        <div className="bottom">
          <NavLink to={`/dapp/${appId}/explore/model`}>
            {({ isActive }) => (
              <div className={`item ${isActive ? 'active' : ''}`}>
                <ExploreIcon />
                <span>Explore</span>
              </div>
            )}
          </NavLink>

          <NavLink to={`/dapp/${appId}/favorite/model?filterStar=filter`}>
            <div className={'item star'}>
              {(filterStar && <StarGoldIcon />) || <StarIcon />}
              <span>Favorite</span>
            </div>
          </NavLink>
          <Link to={DOCS_URL} target="_blank">
            <div className="item">
              <DocIcon />
              <span>Document</span>
            </div>
          </Link>
          <div className="chevron" onClick={() => setOpen(!open)}>
            <button>
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </NavContainer>
  )
}
const NavContainer = styled.nav<{ open?: boolean }>`
  > div {
    height: calc(100vh - 60px);
    width: ${(props) => (props.open ? '200px' : '57px')};
    top: 60px;
    bottom: 0;

    background: #1b1e23;
    border-right: 1px solid #39424c;
    transition: width 0.09s ease-in-out;
  }
  .nav {
    position: fixed;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;

    .active .item {
      background: #14171a;
      color: #fff;
    }
    .item {
      padding: 10px;
      border-radius: 10px;
      color: #718096;
      position: relative;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 20px;
      overflow: hidden;
      > span {
        opacity: ${(props) => (props.open ? 1 : 0)};
        position: absolute;
        left: 37px;
        width: 150px;
        transition: opacity 0.09s ease-in-out;
      }

      &.active {
        background: #14171a;
        color: #fff;
      }
    }

    .top {
      width: 100%;
      padding: 10px;
      box-sizing: border-box;
      display: block;
    }

    .bottom {
      width: 100%;
      margin-bottom: 20px;
      padding: 10px;
      box-sizing: border-box;
      display: block;

      .chevron {
        width: 100%;
        text-align: center;
        margin-top: 20px;
        border: 1px solid #39424c;
        border-radius: 20px;
        cursor: pointer;
        button {
          margin: 0 auto;
          width: 100%;
          height: 39px;
          background: none;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.1s ease-in-out;
          transform: ${(props) =>
            props.open ? `rotate(180deg)` : `rotate(0deg)`};
        }
      }
    }
  }

  .star {
    cursor: pointer;
  }
`
