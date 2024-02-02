import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { AxiosError } from 'axios'
import { GraphQLEditor, PassedSchema } from 'graphql-editor'
import { useCallback, useState } from 'react'
import styled from 'styled-components'
import { createDappComposites } from '../../api/composite'
import useSelectedDapp from '../../hooks/useSelectedDapp'
import { schemas } from '../../utils/composedb-types/schemas'
import CloseIcon from '../icons/CloseIcon'
import { createCompositeFromBrowser } from '../../utils/composeDBUtils'
import { useCeramicNodeCtx } from '../../context/CeramicNodeCtx'
import { startIndexModels } from '../../api/model'

export default function CreateNewComposite ({
  closeModal,
  loadDappComposites,
  defaultName,
  defaultSchema,
  readonly
}: {
  closeModal: () => void
  loadDappComposites?: () => Promise<void>
  defaultName?: string
  defaultSchema: string
  readonly?: boolean
}) {
  const { selectedDapp } = useSelectedDapp()
  const session = useSession()
  const { currCeramicNode } = useCeramicNodeCtx()
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState(defaultName)
  const [gqlSchema, setGqlSchema] = useState<PassedSchema>({
    code: defaultSchema,
    libraries: schemas.library
  })

  const submit = useCallback(async () => {
    if (submitting) return
    if (!selectedDapp) return
    if (!session?.id || !currCeramicNode) return
    if (!gqlSchema.code || !name) return
    try {
      setSubmitting(true)
      const result = await createCompositeFromBrowser(
        gqlSchema.code,
        currCeramicNode.serviceUrl + '/',
        // `http://${ceramicNodes[0].serviceK8sMetadata.ceramicLoadbalanceHost}:${ceramicNodes[0].serviceK8sMetadata.ceramicLoadbalancePort}`,
        currCeramicNode.privateKey,
        session
      )
      if (!result) return
      const { composite, runtimeDefinition } = result
      
      const newCompositeData = {
        graphql: gqlSchema.code,
        name,
        composite:JSON.stringify(composite),
        runtimeDefinition:JSON.stringify(runtimeDefinition),
      }
      const resp = await createDappComposites({
        data: newCompositeData,
        dapp: selectedDapp,
        did: session.serialize()
      })
      if (resp.data.code !== 0) {
        throw new Error(resp.data.msg)
      }
      const modelIds = composite.modelIDs
      await startIndexModels({
        modelIds,
        network: selectedDapp.network,
        didSession: session.serialize()
      }).catch(console.error)

      if (loadDappComposites) await loadDappComposites()
      closeModal()
    } catch (error) {
      const err = error as AxiosError
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }, [
    submitting,
    selectedDapp,
    session,
    currCeramicNode,
    gqlSchema,
    name,
    loadDappComposites,
    closeModal
  ])

  return (
    <CreateBox>
      <div className='title'>
        <h1>Create Composite</h1>
        <button onClick={closeModal}>
          <CloseIcon />
        </button>
      </div>
      <div className='name'>
        <span>Composite Name:</span>
        <input
          type='text'
          placeholder='Enter composite name'
          disabled={readonly}
          value={name}
          onChange={e => {
            setName(e.target.value)
          }}
        />
      </div>
      <EditorBox>
        <GraphQLEditor
          setSchema={props => {
            setGqlSchema(props)
          }}
          schema={gqlSchema}
          sidebarExpanded={false}
          routeState={{
            code: 'on'
          }}
        />
      </EditorBox>
      {!readonly && (
        <div className='btns'>
          <button onClick={closeModal}>Cancel</button>
          {(submitting && (
            <button className='submit'>
              <img src='/loading.gif' alt='' />
            </button>
          )) || (
            <button
              className='submit'
              onClick={submit}
              disabled={!name || !gqlSchema}
            >
              Submit
            </button>
          )}
        </div>
      )}
    </CreateBox>
  )
}
const EditorBox = styled.div`
  height: calc(100vh - 270px);
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

  > div.name {
    display: flex;
    align-items: center;
    gap: 10px;
    > span {
      font-weight: 500;
      font-size: 16px;
      line-height: 24px;
      color: #ffffff;
    }
    > input {
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
