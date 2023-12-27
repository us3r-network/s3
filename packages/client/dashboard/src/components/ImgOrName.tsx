import { useState } from 'react'

export function ImgOrName({ imgUrl, name }: { imgUrl: string | undefined; name: string }) {
  const [showName, setShowName] = useState(true)
  if (showName) {
    return (
      <>
        <span title={name} className="name">
          {name.slice(0, 1).toUpperCase()}
        </span>
        <img
          style={{ display: 'none' }}
          src={imgUrl}
          alt=""
          onLoad={() => {
            setShowName(false)
          }}
          onError={() => {
            setShowName(true)
          }}
        />
      </>
    )
  }
  return (
    <span title={name}>
      <img src={imgUrl} alt="" />
    </span>
  )
}
