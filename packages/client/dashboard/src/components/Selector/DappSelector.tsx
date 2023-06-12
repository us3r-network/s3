import { Select } from './Select'
import { Item } from './ComboBox'
import { Label } from './ListBox'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'

export default function DappSelector({
  dapps,
  selected,
}: {
  dapps: { id: number; name: string }[]
  selected: string
}) {
  const navigate = useNavigate()
  const location = useLocation()

  const dappItems = useMemo(() => {
    return [...dapps, { id: 0, name: '+ Create Dapp' }]
  }, [dapps])

  return (
    <Select
      label="Reviewer"
      items={dappItems}
      selectedKey={Number(selected)}
      onSelectionChange={(k) => {
        console.log({ k })
        if (k === 0) {
          navigate('/dapp/create')
          return
        }
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
