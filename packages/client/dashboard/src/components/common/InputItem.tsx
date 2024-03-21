import styled from "styled-components"

export default function InputItem({
  label,
  placeHolder,
  value,
  setValue,
}: {
  label: string
  value: string
  setValue: (v: string) => void
  placeHolder?: string
}) {
  return (
    <InputItemBox>
      <h4>{label}</h4>
      <input
        type="text"
        placeholder={placeHolder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
        }}
      />
    </InputItemBox>
  )
}

const InputItemBox = styled.div``