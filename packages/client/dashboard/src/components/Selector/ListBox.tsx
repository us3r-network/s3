/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from 'react'
import styled from 'styled-components'
import type { AriaListBoxOptions } from '@react-aria/listbox'
import type { Node } from '@react-types/shared'
import type { ListState } from 'react-stately'
import { useListBox, useOption } from 'react-aria'

interface ListBoxProps extends AriaListBoxOptions<any> {
  listBoxRef?: React.RefObject<HTMLUListElement>
  state: ListState<any>
}

interface OptionProps {
  item: Node<any>
  state: ListState<any>
}

const List = styled.ul`
  max-height: 300px;
  overflow: auto;
  list-style: none;
  padding: 0;
  margin: 4px 0;
  outline: none;
  width: 100%;
`

interface ListItemProps {
  isFocused?: boolean
  isSelected?: boolean
}

const ListItem = styled.li<ListItemProps>`
  background: ${(props) => (props.isFocused ? '#14171A' : '')};
  color: ${(props) =>
    props.isFocused ? 'white' : props.isSelected ? '#fff' : '#718096'};
  font-size: inherit;
  font-weight: ${(props) => (props.isSelected ? '600' : 'normal')};
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  outline: none;
  border-radius: 20px;
  height: 59px;
  box-sizing: border-box;
`

const ItemContent = styled.div`
  display: flex;
  align-items: center;
`

export function ListBox(props: ListBoxProps) {
  let ref = React.useRef<HTMLUListElement>(null)
  let { listBoxRef = ref, state } = props
  let { listBoxProps } = useListBox(props, state, listBoxRef)

  return (
    <List {...listBoxProps} ref={listBoxRef}>
      {Array.from(state.collection).map((item) => (
        <Option key={item.key} item={item} state={state} />
      ))}
    </List>
  )
}

interface OptionContextValue {
  labelProps: React.HTMLAttributes<HTMLElement>
  descriptionProps: React.HTMLAttributes<HTMLElement>
}

const OptionContext = React.createContext<OptionContextValue>({
  labelProps: {},
  descriptionProps: {},
})

function Option({ item, state }: OptionProps) {
  let ref = React.useRef<HTMLLIElement>(null)
  let { optionProps, labelProps, descriptionProps, isSelected, isFocused } =
    useOption(
      {
        key: item.key,
      },
      state,
      ref
    )

  return (
    <ListItem
      {...optionProps}
      ref={ref}
      isFocused={isFocused}
      isSelected={isSelected}
    >
      <ItemContent>
        <OptionContext.Provider value={{ labelProps, descriptionProps }}>
          {item.rendered}
        </OptionContext.Provider>
      </ItemContent>
    </ListItem>
  )
}

export function Label({ children }: { children: React.ReactNode }) {
  let { labelProps } = React.useContext(OptionContext)
  return <div {...labelProps}>{children}</div>
}

const StyledDescription = styled.div`
  font-weight: normal;
  font-size: 12px;
`

export function Description({ children }: { children: React.ReactNode }) {
  let { descriptionProps } = React.useContext(OptionContext)
  return <StyledDescription {...descriptionProps}>{children}</StyledDescription>
}
