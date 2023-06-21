import styled from 'styled-components'
import Form, { FormProps } from '@rjsf/core'
import { RJSFSchema } from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'

const formatSchema = (schema: RJSFSchema) => {
  const newSchema = { ...schema }
  if (newSchema.properties) {
    for (const key in newSchema.properties) {
      const prop = newSchema.properties[key] || {}
      if (typeof prop === 'object' && prop['$ref'] && !prop['title']) {
        prop['title'] = key
      }
    }
  }
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

const FormBox = styled(Form)`
  button[type='submit'] {
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
