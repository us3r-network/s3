import { ModelInstanceFormProps } from './ModelInstanceForm'
import ModelInstanceForm from './ModelInstanceForm'
import styled from 'styled-components'
import ModalBase, { ModalBaseProps } from './Modal/ModalBase'

interface ModelInstanceFormModalProps
  extends ModalBaseProps,
    Pick<
      ModelInstanceFormProps,
      'schema' | 'formData' | 'onChange' | 'onSubmit'
    > {}
export default function ModelInstanceFormModal({
  schema,
  formData,
  onChange,
  onSubmit,
  ...props
}: ModelInstanceFormModalProps) {
  return (
    <ModalBase {...props}>
      <ModelInstanceFormStyled
        schema={schema}
        formData={formData}
        onChange={onChange}
        onSubmit={onSubmit}
      />
    </ModalBase>
  )
}

const ModelInstanceFormStyled = styled(ModelInstanceForm)`
  width: 800px;
  height: calc(100vh - 150px);
  overflow-y: auto;
`
