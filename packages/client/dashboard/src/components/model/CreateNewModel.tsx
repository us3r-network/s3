import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { AxiosError } from 'axios'
import { GraphQLEditor, PassedSchema } from 'graphql-editor'
import { useCallback, useState } from 'react'
import styled from 'styled-components'
import { createDappModels } from '../../api/model'
import { useCeramicNodeCtx } from '../../context/CeramicNodeCtx'
import useSelectedDapp from '../../hooks/useSelectedDapp'
import { createCompositeFromBrowser } from '../../utils/composeDBUtils'
import { schemas } from '../../utils/composedb-types/schemas'
import CloseIcon from '../icons/CloseIcon'

export default function CreateNewModel ({
  loadDappModels,
  closeModal
}: {
  loadDappModels?: () => Promise<void>
  closeModal: () => void
}) {
  const { selectedDapp } = useSelectedDapp()
  const { currCeramicNode } = useCeramicNodeCtx()
  const session = useSession()
  const [submitting, setSubmitting] = useState(false)

  const [gqlSchema, setGqlSchema] = useState<PassedSchema>({
    code: schemas.code,
    libraries: schemas.library
  })

  const submit = useCallback(async () => {
    if (submitting) return
    if (!selectedDapp) return
    if (!session?.id) return
    if (!gqlSchema.code) return
    if (!currCeramicNode) return
    try {
      setSubmitting(true)

      // create model through api
      // const resp = await createModel(
      //   gqlSchema.code,
      //   (selectedDapp.network as Network) || Network.TESTNET
      // )
      // const { composite, runtimeDefinition } = resp.data.data
      // const newModelIDs = Object.key(composite.models)

      // create model directly through the ceramic node and index it
      const result = await createCompositeFromBrowser(
        gqlSchema.code,
        currCeramicNode.serviceUrl + '/',
        // `http://${ceramicNodes[0].serviceK8sMetadata.ceramicLoadbalanceHost}:${ceramicNodes[0].serviceK8sMetadata.ceramicLoadbalancePort}`,
        currCeramicNode.privateKey,
        session,
        true, // start index model on my private node
      )
      if (!result) return
      const { composite, runtimeDefinition } = result
      const newModelIDs = Object.values(composite.modelIDs)
      //save new model to dapp
      await Promise.all(
        newModelIDs.map(async mdoelStreamId => {
          return await createDappModels({
            data: { mdoelStreamId, gqlSchema, composite, runtimeDefinition },
            dapp: selectedDapp,
            did: session.serialize()
          })
        })
      )
      loadDappModels?.()
      closeModal()
    } catch (error) {
      const err = error as AxiosError
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }, [submitting, selectedDapp, session, gqlSchema, currCeramicNode, loadDappModels, closeModal])

  return (
    <CreateBox>
      <div className='title'>
        <h1>Create Model</h1>
        <button onClick={closeModal}>
          <CloseIcon />
        </button>
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
      <div className='btns'>
        <button onClick={closeModal}>Cancel</button>
        {(submitting && (
          <button className='submit'>
            <img src='/loading.gif' alt='' />
          </button>
        )) || (
          <button className='submit' onClick={submit}>
            Submit
          </button>
        )}
      </div>
    </CreateBox>
  )
}
const EditorBox = styled.div`
  height: calc(100vh - 230px);
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
