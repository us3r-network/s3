import styled from 'styled-components'
import { useCallback, useState } from 'react'
import { GraphQLEditor, PassedSchema } from 'graphql-editor'
import { AxiosError } from 'axios'

import CloseIcon from './Icons/CloseIcon'

import { schemas } from '../utils/composedb-types/schemas'
import useSelectedDapp from '../hooks/useSelectedDapp'
import { createModel, updateDapp } from '../api'
import { Network } from './Selector/EnumSelect'
import { useAppCtx } from '../context/AppCtx'
import { useSession } from '@us3r-network/auth-with-rainbowkit'

export default function CreateNewModel({
  closeModal,
}: {
  closeModal: () => void
}) {
  const { selectedDapp } = useSelectedDapp()
  const { loadDapps } = useAppCtx()
  const session = useSession()
  const [submitting, setSubmitting] = useState(false)

  const [gqlSchema, setGqlSchema] = useState<PassedSchema>({
    code: schemas.code,
    libraries: schemas.library,
  })

  const submit = useCallback(async () => {
    if (submitting) return
    if (!selectedDapp) return
    if (!session?.id) return
    if (!gqlSchema.code) return
    try {
      setSubmitting(true)
      const resp = await createModel(
        gqlSchema.code,
        (selectedDapp.network as Network) || Network.TESTNET
      )
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { composite, runtimeDefinition } = resp.data.data
      const modelsId = Object.keys(composite.models)
      const modelId = modelsId[0]
      const models = selectedDapp.models || []
      models.push(modelId)
      await updateDapp({ ...selectedDapp, models }, session.serialize())
      await loadDapps()
      closeModal()
    } catch (error) {
      const err = error as AxiosError
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }, [closeModal, gqlSchema.code, loadDapps, selectedDapp, session, submitting])

  return (
    <CreateBox>
      <div className="title">
        <h1>Create Model</h1>
        <button onClick={closeModal}>
          <CloseIcon />
        </button>
      </div>
      <EditorBox>
        <GraphQLEditor
          setSchema={(props) => {
            setGqlSchema(props)
          }}
          schema={gqlSchema}
        />
      </EditorBox>
      <div className="btns">
        <button onClick={closeModal}>Cancel</button>
        {(submitting && (
          <button className="submit">
            <img src="/loading.gif" alt="" />
          </button>
        )) || (
          <button className="submit" onClick={submit}>
            Submit
          </button>
        )}
      </div>
    </CreateBox>
  )
}
const EditorBox = styled.div`
  height: calc(100vh - 88px);
  /* max-height: 800px; */
  background: #14171a;
  border: 1px solid #39424c;
  border-radius: 20px;
  overflow: hidden;

  div {
    /* height: calc(100v - 88px); */
    box-sizing: border-box;
  }

  input {
    width: auto;
  }
`

const CreateBox = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;

  position: relative;
  width: 1240px;
  margin: 0 auto;

  /* #1B1E23 */

  background: #1b1e23;
  border-radius: 20px;
  > div.title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    color: #ffffff;
    > h1 {
      margin: 0;
      font-style: italic;
      font-weight: 700;
      font-size: 24px;
      line-height: 28px;
    }
  }

  .btns {
    display: flex;
    align-items: center;
    gap: 20px;
    justify-content: end;
    > button {
      background: #1a1e23;
      border: 1px solid #39424c;
      border-radius: 12px;
      padding: 12px 24px;
      font-weight: 500;
      font-size: 16px;
      line-height: 24px;
      color: #718096;
      width: 160px;
      &.submit {
        color: #14171a;
        background: #ffffff;
      }

      > img {
        height: 18px;
      }
    }
  }
`
