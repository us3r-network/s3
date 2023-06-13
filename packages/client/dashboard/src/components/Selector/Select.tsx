import React from 'react'
import styled from 'styled-components'
import type { AriaSelectProps } from '@react-types/select'
import { useSelectState } from 'react-stately'
import {
  useSelect,
  HiddenSelect,
  useButton,
  mergeProps,
  useFocusRing,
} from 'react-aria'

import { ListBox } from './ListBox'
import { Popover } from './Popover'
import { Wrapper, Label } from './shared'
import SelectorIcon from './SelectorIcon'

export { Item } from 'react-stately'

interface ButtonProps {
  isOpen?: boolean
  isFocusVisible?: boolean
}

const Button = styled.button<ButtonProps>`
  appearance: none;
  border: none;
  outline: none;
  padding: 8px 20px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 214px;
  height: 40px;
  text-align: left;
  color: #718096;
  background: #14171a;
  border-radius: 100px;
  font-size: inherit;
  line-height: inherit;
  cursor: pointer;
`

const Value = styled.span`
  display: inline-flex;
  align-items: center;
`

const StyledIcon = styled(SelectorIcon)``

export function Select<T extends object>(props: AriaSelectProps<T>) {
  let state = useSelectState(props)
  let ref = React.useRef(null)
  let { labelProps, triggerProps, valueProps, menuProps } = useSelect(
    props,
    state,
    ref
  )
  let { buttonProps } = useButton(triggerProps, ref)
  let { focusProps, isFocusVisible } = useFocusRing()

  return (
    <Wrapper>
      <Label {...labelProps}>{props.label}</Label>
      <HiddenSelect
        state={state}
        triggerRef={ref}
        label={props.label}
        name={props.name}
      />
      <Button
        {...mergeProps(buttonProps, focusProps)}
        ref={ref}
        isOpen={state.isOpen}
        isFocusVisible={isFocusVisible}
      >
        <Value {...valueProps}>
          {state.selectedItem
            ? state.selectedItem.rendered
            : 'Select an option'}
        </Value>
        <StyledIcon />
      </Button>
      {state.isOpen && (
        <Popover state={state} triggerRef={ref} placement="bottom start">
          <ListBox {...menuProps} state={state} />
        </Popover>
      )}
    </Wrapper>
  )
}
