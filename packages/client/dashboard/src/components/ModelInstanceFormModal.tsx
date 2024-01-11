import { ModelInstanceFormProps } from './ModelInstanceForm'
import ModelInstanceForm from './ModelInstanceForm'
import styled from 'styled-components'
import ModalBase, { ModalBaseProps } from './common/ModalBase'

interface ModelInstanceFormModalProps
  extends ModalBaseProps,
    Pick<
      ModelInstanceFormProps,
      'schema' | 'formData' | 'onChange' | 'onSubmit' | 'disabled'
    > {}
export default function ModelInstanceFormModal({
  schema,
  formData,
  onChange,
  onSubmit,
  disabled,
  ...props
}: ModelInstanceFormModalProps) {
  return (
    <ModalBase {...props}>
      <ModelInstanceFormStyled
        schema={schema}
        formData={formData}
        onChange={onChange}
        onSubmit={onSubmit}
        disabled={disabled}
      />
    </ModalBase>
  )
}

const ModelInstanceFormStyled = styled(ModelInstanceForm)`
  width: 800px;
  max-height: calc(100vh - 150px);
  overflow-y: auto;
`
