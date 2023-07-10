import { useCallback, useEffect, useRef, useState } from 'react'

import styled from 'styled-components'
import InfiniteScroll from 'react-infinite-scroll-component'
// import ModelStreamList from '../../components/ModelStreamList'
import { AxiosError } from 'axios'
import { Network } from './Selector/EnumSelect'
import { ModelMid, ModelStream } from '../types'
import { getModelMid, PageSize, queryModelGraphql } from '../api'
import ModelStreamList from './ModelStreamList'
import { Button } from 'react-aria-components'
import PlusIcon from './Icons/PlusIcon'
import ModelInstanceFormModal from './ModelInstanceFormModal'
import useSelectedDapp from '../hooks/useSelectedDapp'
import { useComposeClient } from '../hooks/useComposeClient'
import { toast } from 'react-toastify'

export default function Instance({
  streamId,
  network,
  schema,
  name,
}: {
  streamId: string
  network: Network
  schema: ModelStream['stream_content']['schema']
  name: string
}) {
  const pageNum = useRef(1)
  // const { network } = useCeramicCtx()
  const [hasMore, setHasMore] = useState(true)
  const [streams, setStreams] = useState<Array<ModelMid>>([])
  const [loading, setLoading] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  const fetchMoreStreams = useCallback(
    async (pageNumber: number) => {
      if (!streamId) return
      const resp = await getModelMid({
        network,
        modelId: streamId,
        pageNumber,
      })
      const list = resp.data.data
      setHasMore(list.length >= PageSize)
      setStreams([...streams, ...list])
    },
    [streams, streamId, network]
  )
  const fetchModelMid = useCallback(async () => {
    if (!streamId) return
    try {
      setLoading(true)
      setErrMsg('')
      const resp = await getModelMid({ network, modelId: streamId })
      const list = resp.data.data
      setHasMore(list.length >= PageSize)
      setStreams(list)
    } catch (error) {
      const err = error as AxiosError
      setErrMsg((err.response?.data as any).message || err.message)
    } finally {
      setLoading(false)
    }
  }, [streamId, network])

  useEffect(() => {
    fetchModelMid()
  }, [fetchModelMid])

  // stream form
  const [isOpenStreamForm, setIsOpenStreamForm] = useState(false)
  const [formType, setFormType] = useState<'create' | 'update'>('create')
  const [formData, setFormData] = useState({})
  const [formDisabled, setFormDisabled] = useState(false)
  const [updateStreamId, setUpdateStreamId] = useState('')
  const [definition, setDefinition] = useState<any>()
  const { selectedDapp } = useSelectedDapp()
  useEffect(() => {
    ;(async () => {
      if (!streamId || !selectedDapp) {
        setDefinition(null)
        return
      }
      try {
        const resp = await queryModelGraphql(
          streamId,
          selectedDapp.network as Network
        )
        const { data } = resp.data
        setDefinition(data.runtimeDefinition)
      } catch (error) {
        setDefinition(null)
      }
    })()
  }, [streamId, selectedDapp])

  const { composeClient, composeClientAuthenticated } =
    useComposeClient(definition)

  const createStream = useCallback(async () => {
    if (!composeClientAuthenticated || !composeClient) {
      toast.error('composeClient not authenticated')
      return
    }
    if (!name) {
      toast.error('model name not found')
      return
    }
    const mutation = `
      mutation create${name}($input: Create${name}Input!) {
        create${name}(input: $input) {
          document {
            id
          }
        }
      }
    `
    setFormDisabled(true)
    const res = await composeClient.executeQuery(mutation, {
      input: {
        content: { ...formData },
      },
    })
    if (res?.errors && res?.errors.length > 0) {
      toast.error(res?.errors[0]?.message)
    } else {
      toast.success('Submitted successfully!')
      setIsOpenStreamForm(false)
      fetchModelMid()
    }
    setFormDisabled(false)
  }, [formData, composeClientAuthenticated, composeClient, name, fetchModelMid])

  const updateStream = useCallback(async () => {
    if (!composeClientAuthenticated || !composeClient) {
      toast.error('composeClient not authenticated')
      return
    }
    if (!name) {
      toast.error('model name not found')
      return
    }
    const mutation = `
      mutation update${name}($input: Update${name}Input!) {
        update${name}(input: $input) {
          document {
            id
          }
        }
      }
    `
    setFormDisabled(true)
    const res = await composeClient.executeQuery(mutation, {
      input: {
        id: updateStreamId,
        content: { ...formData },
      },
    })
    if (res?.errors && res?.errors.length > 0) {
      toast.error(res?.errors[0]?.message)
    } else {
      toast.success('Submitted successfully!')
      setStreams(
        (streams) =>
          streams?.map((stream: any) => {
            if (stream.streamId === updateStreamId) {
              return {
                ...stream,
                streamContent: {
                  ...(stream?.streamContent || {}),
                  ...formData,
                },
              }
            }
            return stream
          }) || []
      )
      setIsOpenStreamForm(false)
    }
    setFormDisabled(false)
  }, [
    updateStreamId,
    formData,
    composeClientAuthenticated,
    composeClient,
    name,
  ])

  const submitStream = useCallback(async () => {
    if (formType === 'create') {
      await createStream()
    }
    if (formType === 'update') {
      await updateStream()
    }
  }, [formType, createStream, updateStream])

  if (loading) {
    return (
      <PageBox>
        <Loading>Loading...</Loading>
      </PageBox>
    )
  }

  if (errMsg) {
    return (
      <PageBox>
        <div className="title-box" />
        <Loading>{errMsg}</Loading>
      </PageBox>
    )
  }

  return (
    <PageBox>
      <ModelInstanceFormModal
        title={formType === 'create' ? 'Create Stream' : 'Update Stream'}
        isOpen={isOpenStreamForm}
        disabled={formDisabled}
        onOpenChange={setIsOpenStreamForm}
        schema={schema}
        formData={formData}
        onChange={(e) => setFormData(e.formData)}
        onSubmit={() => submitStream()}
      />

      {composeClientAuthenticated && (
        <ListHeading>
          <PlusButton
            onPress={() => {
              setFormType('create')
              setFormData({})
              setIsOpenStreamForm(true)
            }}
          >
            <PlusIcon />
          </PlusButton>
        </ListHeading>
      )}

      <InfiniteScroll
        dataLength={streams.length}
        next={() => {
          pageNum.current += 1
          fetchMoreStreams(pageNum.current)
        }}
        hasMore={hasMore}
        loader={<Loading>Loading...</Loading>}
      >
        {streamId && (
          <ModelStreamList
            data={streams}
            modelId={streamId}
            editable={composeClientAuthenticated}
            editAction={(stream: any) => {
              setFormType('update')
              setUpdateStreamId(stream?.streamId)
              setFormData(stream?.streamContent)
              setIsOpenStreamForm(true)
            }}
          />
        )}
      </InfiniteScroll>
      {!hasMore && <Loading>no more data</Loading>}
    </PageBox>
  )
}

const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: gray;
`

const PageBox = styled.div`
  .title-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 20px 0;
    box-sizing: border-box;

    .title {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 0;
      font-weight: 700;
      font-size: 24px;
      line-height: 28px;
      font-style: italic;
      color: #ffffff;

      button {
        background: #ffffff;
      }

      h3 {
        margin: 0;
        padding: 0;
      }
    }
  }
`
const ListHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 20px;
`
const PlusButton = styled(Button)`
  box-sizing: border-box;

  /* Auto layout */

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  isolation: isolate;

  height: 36px;

  /* 🌘 $neutral/100 */

  background: #1a1e23;
  border: 1px solid #39424c;
  border-radius: 12px;

  font-family: 'Rubik';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  /* identical to box height, or 150% */

  text-align: center;

  /* #718096 */

  color: #718096;
`
