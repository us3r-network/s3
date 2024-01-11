import * as React from 'react'
import styled from 'styled-components'
import type { ComboBoxProps } from '@react-types/combobox'
import { useComboBoxState } from 'react-stately'
import { useComboBox, useButton, useFilter } from 'react-aria'

import { ListBox } from './ListBox'
import { Popover } from './Popover'
import { Wrapper, Label } from './shared'

export { Item, Section } from 'react-stately'

interface StyleProps {
  isFocused?: boolean
  isOpen?: boolean
}

const InputGroup = styled.div<StyleProps>`
  position: relative;
  display: inline-flex;
  flex-direction: row;
  overflow: hidden;
  margin-top: 4px;
  border-radius: 4px;
  width: 200px;
  box-shadow: ${(props) =>
    props.isFocused ? '0 0 0 3px rgba(143, 188, 143, 0.5)' : ''};
`

const Input = styled.input<StyleProps>`
  appearance: none;
  border: none;
  padding: 6px 8px;
  outline: none;
  font-size: 16px;
  border: 1px solid;
  border-right: none;
  border-color: ${(props) => (props.isFocused ? 'seagreen' : 'lightgray')};
  border-radius: 4px 0 0 4px;
  margin: 0;
  flex: 1;
  width: 0;
`

const Button = styled.button`
  appearance: none;
  border: none;
  background: seagreen;
  color: white;
  margin: 0;
`

export function ComboBox<T extends object>(props: ComboBoxProps<T>) {
  let { contains } = useFilter({ sensitivity: 'base' })
  let state = useComboBoxState({ ...props, defaultFilter: contains })

  let buttonRef = React.useRef(null)
  let inputRef = React.useRef(null)
  let listBoxRef = React.useRef(null)
  let popoverRef = React.useRef(null)

  let {
    buttonProps: triggerProps,
    inputProps,
    listBoxProps,
    labelProps,
  } = useComboBox(
    {
      ...props,
      inputRef,
      buttonRef,
      listBoxRef,
      popoverRef,
    },
    state
  )

  let { buttonProps } = useButton(triggerProps, buttonRef)

  return (
    <Wrapper>
      <Label {...labelProps}>{props.label}</Label>
      <InputGroup isFocused={state.isFocused}>
        <Input {...inputProps} ref={inputRef} isFocused={state.isFocused} />
        <Button {...buttonProps} ref={buttonRef}></Button>
      </InputGroup>
      {state.isOpen && (
        <Popover
          popoverRef={popoverRef}
          triggerRef={inputRef}
          state={state}
          isNonModal
          placement="bottom start"
        >
          <ListBox {...listBoxProps} listBoxRef={listBoxRef} state={state} />
        </Popover>
      )}
    </Wrapper>
  )
}
