import { useCallback, useState } from 'react'
import styled from 'styled-components'
import { DappCompositeDto } from '../../types'
import { toast } from 'react-toastify'
import { S3CompositeModel } from '../../api/compositeSDK/S3CompositeModel'
import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { CERAMIC_TESTNET_HOST } from '../../constants'
import { CompositeInput } from '../../api/compositeSDK/graphql'
import { postComposite } from '../../api/composite'

export default function CompositePublish ({
  composite
}: {
  composite: DappCompositeDto
}) {
  const [publishing, setPublishing] = useState(false)
  const session = useSession()
  const publish = useCallback(async () => {
    if (!session) {
      toast.error('Please login first')
      return
    }
    if (!composite) {
      toast.error('Please create composite first')
      return
    }
    const compositeInput: CompositeInput = {
      name: composite.name,
      // description: composite.description,
      schema: composite.graphql,
      encodedDefinition: composite.composite,
      createAt: new Date().toISOString()
    }
    console.log('compositeInput', compositeInput)
    setPublishing(true)
    const s3Composite = new S3CompositeModel(CERAMIC_TESTNET_HOST)
    s3Composite.authComposeClient(session)
    const stream = await s3Composite.createComposite({
      content: compositeInput
    })
    console.log(stream)
    const streamId = stream?.data?.createComposite?.document?.id
    if (!streamId) {
      toast.error('Publish failed')
      return
    } else {
      toast.success('Publish success')
      const newCompositeData = { ...composite, streamId }
      postComposite({
        did: session.serialize(),
        id: composite.id,
        data: newCompositeData
      })
    }
    setPublishing(false)
  }, [composite, session])

  return (
    <PublishBox>
      {composite.streamId ? (
        <div title={composite.streamId}>Published</div>
      ) : publishing ? (
        <button>
          <img src='/loading.gif' alt='' />
        </button>
      ) : (
        <button onClick={publish}>Publish</button>
      )}
    </PublishBox>
  )
}
const PublishBox = styled.div`
  button {
    cursor: pointer;
    padding: 0 15px;
    width: 100px;
    height: 36px;

    border-radius: 10px;
    font-size: 14px;
    line-height: 20px;
    text-align: center;
    background: #fff;
    font-weight: 700;
    color: #000;
  }
`
