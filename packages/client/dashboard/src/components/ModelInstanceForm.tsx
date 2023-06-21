import styled, { css } from 'styled-components'
import Form, { FormProps } from '@rjsf/core'
import { RJSFSchema } from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'

const formatSchema = (schema: RJSFSchema) => {
  const newSchema = { ...schema }
  const formatFieldRef = (fieldObj: any) => {
    const refKey = fieldObj['$ref'].split('/').pop()
    const defs = newSchema['$defs'] || {}
    const def = defs[refKey]
    if (typeof def === 'object') {
      delete def.title
      delete fieldObj.$ref
      Object.assign(fieldObj, def)
      formatFieldTitle(fieldObj)
    }
  }
  const formatFieldItems = (fieldObj: any) => {
    const items = fieldObj['items']
    if (items['$ref']) {
      formatFieldRef(items)
    }
  }
  const formatFieldTitle = (fieldObj: any) => {
    if (typeof fieldObj !== 'object') return
    // has properties
    if (fieldObj.properties) {
      for (const key in fieldObj.properties) {
        const field = fieldObj.properties[key]
        field['title'] = key
        formatFieldTitle(field)
      }
    }
    // has $ref
    if (fieldObj['$ref']) {
      formatFieldRef(fieldObj)
    }
    // has items
    if (fieldObj['items']) {
      formatFieldItems(fieldObj)
    }
  }
  formatFieldTitle(newSchema)
  delete newSchema.$schema
  return newSchema
}

interface ModelInstanceFormProps extends Omit<FormProps, 'validator'> {
  validator?: FormProps['validator']
}
export default function ModelInstanceForm(props: ModelInstanceFormProps) {
  const newProps = {
    ...props,
    validator: props.validator || validator,
    schema: formatSchema(props.schema),
  }
  return <FormBox {...newProps} />
}

const ButtonCss = css`
  box-sizing: border-box;

  /* Auto layout */

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  isolation: isolate;

  width: 160px;
  height: 48px;

  /* 🌘 $neutral/100 */

  background: #1a1e23;
  border: 1px solid #39424c;
  border-radius: 12px;

  font-family: 'Rubik';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  /* identical to box height, or 150% */

  text-align: center;

  /* #718096 */

  color: #718096;

  margin-top: 20px;
`

const FormBox = styled(Form)`
  fieldset {
    border: none;
    margin: 0;
    padding: 0;
  }
  #root,
  .form-group,
  .field {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .field-array {
    button[type='button'] {
      ${ButtonCss}
      margin: 0;
    }
    button[type='button'].btn-add {
      margin: 0;
      margin-left: auto;
      &::before {
        content: '+';
        font-size: 24px;
        line-height: 24px;
        color: #718096;
      }
    }
    legend {
      width: 100%;
      padding-bottom: 10px;
      border-bottom: 1px solid #39424c;
    }
    .array-item-list {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .array-item {
      display: flex;
      flex-direction: row;
      gap: 20px;
      align-items: center;

      .field,
      .array-item-toolbox,
      .btn-group {
        display: flex;
        flex-direction: row;
        gap: 20px;
        align-items: center;
      }

      div:first-child {
        flex: 1;
      }

      .btn-group {
        button {
          width: 48px !important;
        }
        .array-item-remove {
          &::before {
            content: 'x';
            font-size: 24px;
            line-height: 24px;
            color: #fff;
          }
        }
        .array-item-move-up {
          &::before {
            content: '↑';
            font-size: 24px;
            line-height: 24px;
            color: #fff;
          }
        }
        .array-item-move-down {
          &::before {
            content: '↓';
            font-size: 24px;
            line-height: 24px;
            color: #fff;
          }
        }
      }
    }
  }
  button[type='submit'] {
    ${ButtonCss}
  }
  button[type='submit']:active {
    background: #1a1e23;
  }

  input {
    color: #fff;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;

    background: #1a1e23;
    border: 1px solid #39424c;
    border-radius: 12px;
    padding: 16px;
    outline: none;
    /* width: 100%; */
    flex-grow: 1;
    box-sizing: border-box;
    height: 48px;
  }
`
