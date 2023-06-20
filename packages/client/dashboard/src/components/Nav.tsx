import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import ChevronRight from './Icons/ChevronRight'
import Home from './Icons/HomeIcon'
import LayoutIcon from './Icons/LayoutIcon'
import InfoIcon from './Icons/InfoIcon'
import TerminalIcon from './Icons/TerminalIcon'
import ChartIcon from './Icons/ChartIcon'
import { NavLink, Link, useSearchParams } from 'react-router-dom'
import ExploreIcon from './Icons/ExploreIcon'
import StarIcon from './Icons/StarIcon'
import DocIcon from './Icons/DocIcon'
import { DOCS_URL } from '../constants'
import StarGoldIcon from './Icons/StarGoldIcon'

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
              icon: Home,
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
              path: `/dapp/${appId}/statistic`,
              name: 'Model Metrics',
              icon: ChartIcon,
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
          <NavLink to={`/dapp/${appId}/explore`}>
            {({ isActive }) => (
              <div className={`item ${isActive ? 'active' : ''}`}>
                <ExploreIcon />
                <span>Explore Models</span>
              </div>
            )}
          </NavLink>

          <NavLink to={`/dapp/${appId}/favorite?filterStar=filter`}>
            <div className={'item star'}>
              {(filterStar && <StarGoldIcon />) || <StarIcon />}
              <span>Favorite Models</span>
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
