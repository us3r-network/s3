import { useRef } from "react"
import AddIcon from "../icons/Add"
import styled from "styled-components"
import { uploadImage } from "../../api"

export default function AppIconInput({
    icon,
    setIcon,
  }: {
    icon?: string
    setIcon: (url: string) => void
  }) {
    const inputRef = useRef<HTMLInputElement>(null)
    return (
      <AppIconBox>
        <h4>App Icon:</h4>
        <div
          className="add-place"
          onClick={() => {
            inputRef.current!.click()
          }}
        >
          {(icon && <img src={icon} alt="icon" />) || (
            <>
              <AddIcon />
              <input
                type="file"
                accept="image/*"
                ref={inputRef}
                onChange={async (e) => {
                  const files = e.target.files
                  if (!files) return
                  const file = files[0]
                  const resp = await uploadImage({ file })
                  const iconUrl = resp.data.url
                  setIcon(iconUrl)
                }}
              />
            </>
          )}
        </div>
      </AppIconBox>
    )
  }
  
  
  const AppIconBox = styled.div`
    width: 150px;
    flex-grow: 0 !important;
    .add-place {
      cursor: pointer;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      isolation: isolate;
      box-sizing: border-box;
      width: 150px;
      height: 150px;
      background: #1a1e23;
      border: 1px solid #39424c;
      border-radius: 12px;
  
      img {
        width: 100%;
      }
      input {
        display: none;
      }
    }
  `
  