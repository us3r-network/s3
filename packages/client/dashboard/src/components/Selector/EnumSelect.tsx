import {
  Button,
  Item,
  Label,
  ListBox,
  Popover,
  Select,
  SelectValue,
} from 'react-aria-components'
import styled from 'styled-components'
import SelectorIcon from './SelectorIcon'
import { useMemo, useState } from 'react'

export enum Stage {
  DEVELOPMENT = 'Under development',
  NOT_RELEASE = 'Completed but not released',
  RELEASE = 'Completed and released',
}

export enum Network {
  MAINNET = 'Mainnet',
  TESTNET = 'Testnet',
}

export enum AppType {
  GAME = 'Game',
  SOCIAL = 'Social',
  MARKETPLACE = 'Marketplace',
  TOOL = 'Tool',
  DEFI = 'DeFi',
  OTHER = 'Other',
}

export default function EnumSelector<T extends Stage | Network | AppType>({
  value,
  setValue,
  values,
  labelText = 'Selector:',
}: {
  value: T
  setValue: (s: T) => void
  values: any // TODO: fix this
  labelText?: string
}) {
  const [width, setWidth] = useState(0)
  let options = useMemo(() => {
    return Object.entries(values).map(([key, value]) => ({
      id: value as string,
      name: value as string,
    }))
  }, [values])

  return (
    <SelectStyled
      selectedKey={value}
      onSelectionChange={(k) => {
        setValue(k as T)
      }}
    >
      <Label>{labelText}</Label>
      <ButtonStyled
        onPress={(e) => {
          setWidth(e.target.clientWidth)
        }}
      >
        <SelectValue />
        <SelectorIcon />
      </ButtonStyled>
      <PopoverStyled width={width}>
        <ListBox items={options}>
          {(item) => <ItemStyled id={item.id}>{item.name}</ItemStyled>}
        </ListBox>
      </PopoverStyled>
    </SelectStyled>
  )
}

const SelectStyled = styled(Select)`
  display: flex;
  flex-direction: column;
  position: relative;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  position: relative;
  > span {
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    margin-bottom: 8px;
  }
`

const ButtonStyled = styled(Button)`
  background: #1a1e23;
  cursor: pointer;
  border: 1px solid #39424c;
  border-radius: 12px;
  padding: 0px 14px 0px 16px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  outline: none;
  > span {
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;

    color: #ffffff;
  }
`

const PopoverStyled = styled(Popover)<{ width: number }>`
  background: #1b1e23;
  border: 1px solid #39424c;
  width: ${(props) => (props.width > 300 ? props.width : 300) + 'px'};
  border-radius: 10px;

  &[data-placement='top'] {
    --origin: translateY(8px);
  }

  &[data-placement='bottom'] {
    --origin: translateY(-8px);
  }

  &[data-entering] {
    animation: slide 200ms;
  }

  &[data-exiting] {
    animation: slide 200ms reverse ease-in;
  }

  @keyframes slide {
    from {
      transform: var(--origin);
      opacity: 0;
    }

    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`

const ItemStyled = styled(Item)`
  margin: 0px;
  padding: 15px 20px;
  border-radius: 6px;
  outline: none;
  cursor: default;
  position: relative;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  border-radius: 20px;

  &[aria-selected='true'] {
    font-weight: 600;
  }

  &[data-focused],
  &[data-pressed] {
    background: #14171a;
  }

  [slot='label'] {
    font-weight: bold;
  }

  [slot='description'] {
    font-size: small;
  }
`
