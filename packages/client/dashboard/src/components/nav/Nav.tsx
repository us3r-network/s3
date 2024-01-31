import React, { useMemo, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
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
import TerminalIcon from '../icons/TerminalIcon'
import ChevronDown from '../icons/ChevronDown'
import ModelIcon from '../icons/ModelIcon'
import CompositeIcon from '../icons/CompositeIcon'

type NavItem = {
  path?: string
  name: string
  icon: any
  items?: NavItem[]
}

export default function Nav ({ appId }: { appId: string }) {
  const [open, setOpen] = useState(true)
  const navItems = useMemo(() => {
    return [
      {
        path: `/dapp/${appId}/index`,
        name: 'Home',
        icon: HomeIcon
      },
      {
        // path: `/dapp/${appId}/explore`,
        name: 'Explore',
        icon: ExploreIcon,
        items: [
          {
            path: `/dapp/${appId}/explore/model`,
            name: 'Models',
            icon: ModelIcon
          },
          {
            path: `/dapp/${appId}/explore/composite`,
            name: 'Composites',
            icon: CompositeIcon
          },
          {
            path: `/dapp/${appId}/explore/components`,
            name: 'Components',
            icon: ComponentIcon
          }
        ]
      },
      {
        // path: `/dapp/${appId}/build`,
        name: 'Build',
        icon: InfoIcon,
        items: [
          {
            path: `/dapp/${appId}/build/editor`,
            name: 'Compose',
            icon: LayoutIcon
          },
          {
            path: `/dapp/${appId}/build/playground`,
            name: 'Playground',
            icon: TerminalIcon
          },
          {
            path: `/dapp/${appId}/build/sdk`,
            name: 'SDK',
            icon: SdkIcon
          },
          {
            path: `/dapp/${appId}/build/metrics`,
            name: 'Metrics',
            icon: ChartIcon
          }
        ]
      },
      {
        path: `/dapp/${appId}/node`,
        name: 'Node',
        icon: NodeIcon
      },
      {
        path: `/dapp/${appId}/info`,
        name: 'Info',
        icon: InfoIcon
      }
    ]
  }, [appId])

  return (
    <NavContainer open={open}>
      <div></div>
      <div className='nav'>
        <div className='top'>
          {navItems.map(item => (
            <NavItemRenderer item={item} />
          ))}
        </div>
        <div className='bottom'>
          <Link to={DOCS_URL} target='_blank'>
            <div className='item'>
              <DocIcon />
              <span>S3 Scan</span>
            </div>
          </Link>
          <Link to={DOCS_URL} target='_blank'>
            <div className='item'>
              <DocIcon />
              <span>Document</span>
            </div>
          </Link>
          {/* <div className='chevron' onClick={() => setOpen(!open)}>
            <button>
              <ChevronRight />
            </button>
          </div> */}
        </div>
      </div>
    </NavContainer>
  )
}

function NavItemRenderer ({
  item,
  level = 0,
}: {
  item: NavItem
  level?: number
}) {
  return (
    <NavItemBox>
      <div className='item-container'>
        {item.path ? (
          <NavLink to={item.path} key={item.path}>
            {({ isActive }) => (
              <div className={`item ${isActive ? 'active' : ''}`}>
                {React.createElement(item.icon, { isActive })}
                <span>{item.name}</span>
              </div>
            )}
          </NavLink>
        ) : (
          <div className={`item`}>
            {React.createElement(item.icon)}
            <span>{item.name}</span>
          </div>
        )}
        {item.items && (
          <div>
            <ChevronDown />
          </div>
        )}
      </div>
      {item.items && (
        <div className='sub'>
          {item.items.map(item => (
            <NavItemRenderer item={item} level={level + 1} />
          ))}
        </div>
      )}
    </NavItemBox>
  )
}


const NavContainer = styled.nav<{ open?: boolean }>`
  > div {
    height: calc(100vh - 60px);
    width: ${props => (props.open ? '200px' : '57px')};
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
    z-index: 100;
    .item-container {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      gap: 1px;
    }
    .item {
        flex: 1;
        padding: 10px;
        border-radius: 10px;
        color: #718096;
        position: relative;
        display: flex;
        align-items: center;
        gap: 10px;
        overflow: hidden;
        > span {
          opacity: ${props => (props.open ? 1 : 0)};
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
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .bottom {
      width: 100%;
      margin-bottom: 10px;
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
          transform: ${props =>
            props.open ? `rotate(180deg)` : `rotate(0deg)`};
        }
      }
    }
  }
`

const NavItemBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  .sub {
    margin-left: 24px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
`
