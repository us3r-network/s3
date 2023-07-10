import { useMemo } from 'react'
import styled, { css } from 'styled-components'
import Form, { FormProps } from '@rjsf/core'
import { RJSFSchema } from '@rjsf/utils'
import defaultValidator from '@rjsf/validator-ajv8'

const formatSchema = (schema: RJSFSchema) => {
  const newSchema = { ...schema }

  const formatDefByRef = (orgDef: RJSFSchema) => {
    if (!orgDef?.$ref) return
    // 从 $ref 中的路径获取对应的定义，如：#/definitions/aaa/bbb 中获取bbb的定义
    const refPaths = orgDef.$ref.replace(/^#/, '').split('/').filter(Boolean)
    if (!refPaths.length) return
    const def = refPaths.reduce((acc, cur) => {
      if (!acc) return null
      return acc[cur]
    }, newSchema)
    if (!def || typeof def !== 'object') return
    delete def.title
    delete orgDef.$ref
    Object.assign(orgDef, { ...def, ...orgDef })
    formatDef(orgDef)
  }

  const formatDefByObj = (objDef: RJSFSchema) => {
    if (objDef?.type !== 'object' || !objDef?.properties) return
    for (const key in objDef.properties) {
      if (!objDef.properties[key]) continue
      const prop = objDef.properties[key]
      formatDef(prop as RJSFSchema)
    }
  }

  const formatDefByAry = (aryDef: RJSFSchema) => {
    if (aryDef?.type !== 'array' || !aryDef?.items) return
    const items = aryDef.items
    formatDef(items as RJSFSchema)
  }

  const formatDef = (def: RJSFSchema, defConfig?: Partial<RJSFSchema>) => {
    if (def?.$ref) {
      formatDefByRef(def)
    }

    if (def?.type === 'object') {
      formatDefByObj(def)
    }

    if (def?.type === 'array') {
      formatDefByAry(def)
    }

    if (defConfig) {
      Object.assign(def, defConfig)
    }
  }
  formatDef(newSchema)
  delete newSchema.$schema
  return newSchema
}

export interface ModelInstanceFormProps extends Omit<FormProps, 'validator'> {
  validator?: FormProps['validator']
}
export default function ModelInstanceForm({
  validator,
  schema,
  ...props
}: ModelInstanceFormProps) {
  const newSchema = useMemo(() => formatSchema(schema), [schema])
  const newProps = {
    ...props,
    validator: validator || defaultValidator,
    schema: newSchema,
  }
  return <FormBox {...newProps} />
}

const ButtonCss = css`
  display: flex;
  width: 160px;
  height: 48px;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  background: #fff;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
`
const InputCss = css`
  color: #fff;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;

  background: #1a1e23;
  border: 1px solid #39424c;
  border-radius: 12px;
  padding: 16px;
  outline: none;
  width: 100%;
  flex-grow: 1;
  box-sizing: border-box;
  height: 48px;

  &::-webkit-calendar-picker-indicator {
    filter: invert(1);
  }
`

const FormBox = styled(Form)`
  & > .errors {
    display: none;
  }
  .text-danger {
    font-size: 12px;
    color: #aa4f4f;
  }
  & > .form-group:first-child {
    padding-bottom: 20px;
    border-bottom: 1px solid #39424c;
  }
  button {
    margin: 0;
    padding: 0;
  }
  fieldset {
    border: unset;
    margin: unset;
    padding: unset;

    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  legend {
    width: 100%;
    box-sizing: border-box;
    text-transform: capitalize;
  }
  .control-label {
    color: #fff;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
  }

  .field-array {
    & > fieldset > legend {
      border-left: 6px solid #fff;
      color: var(--ffffff, #fff);
      font-size: 20px;
      font-style: italic;
      font-weight: 700;
      padding-left: 10px;
    }
    .btn-add {
      ${ButtonCss}
      margin-left: auto;
      width: 132px;
      border: 1px solid #39424c;
      background: #718096;
      color: #fff;
      &::before {
        content: '＋ Add';
      }
    }

    .array-item-list {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .array-item-add {
      margin: 0;
      margin-top: 20px;
    }
    .array-item {
      display: flex;
      flex-direction: row;
      gap: 20px;
      align-items: flex-end;
      justify-content: space-between;
      .form-group > fieldset > legend {
        margin-bottom: 20px;
      }

      & > div:first-child {
        flex: 1;
      }

      & > .array-item-toolbox {
        & > .btn-group {
          ${ButtonCss}
          width: 132px;
          background: #14171a;

          button {
            font-size: 20px;
          }
          & > .array-item-remove {
            &::before {
              content: 'x';
              color: #aa4f4f;
            }
          }
          & > .array-item-move-up {
            &::before {
              content: '↑';
              color: #718096;
            }
          }
          & > .array-item-move-down {
            &::before {
              content: '↓';
              color: #718096;
            }
          }
        }
      }
    }
  }
  button[type='submit'] {
    ${ButtonCss}
    margin-top: 20px;
    margin-left: auto;
  }
  button[type='submit']:active {
    background: var(--ffffff, #fff);
  }

  input {
    ${InputCss}
  }
`
