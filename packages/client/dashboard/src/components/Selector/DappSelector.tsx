import { Select } from './Select'
import { Item } from './ComboBox'
import { Label } from './ListBox'
import { useLocation, useNavigate } from 'react-router-dom'

export default function DappSelector({
  dapps,
  selected,
}: {
  dapps: { id: number; name: string }[]
  selected: string
}) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Select
      label="Reviewer"
      items={dapps}
      selectedKey={Number(selected)}
      onSelectionChange={(k) => {
        const { pathname } = location
        const data = pathname.split('/')
        data[2] = `${k}`
        navigate(data.join('/'))
      }}
    >
      {(item) => (
        <Item textValue={item.name}>
          <div>
            <Label>{item.name}</Label>
          </div>
        </Item>
      )}
    </Select>
  )
}
