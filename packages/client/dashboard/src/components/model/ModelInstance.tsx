import { Stream } from '@ceramicnetwork/common'
import { AxiosError } from 'axios'
import { lowerFirst } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { Button } from 'react-aria-components'
import InfiniteScroll from 'react-infinite-scroll-component'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { queryModelGraphql } from '../../api/model'
import { useCeramicNodeCtx } from '../../context/CeramicNodeCtx'
import { useComposeClient } from '../../hooks/useComposeClient'
import useSelectedDapp from '../../hooks/useSelectedDapp'
import { ModelStream, Network } from '../../types'
import PlusIcon from '../icons/PlusIcon'
import ModelInstanceFormModal from './ModelInstanceFormModal'
import ModelStreamList from './ModelStreamList'

export default function Instance ({
  streamId,
  network,
  schema,
  name
}: {
  streamId: string
  network: Network
  schema: ModelStream['stream_content']['schema']
  name: string
}) {
  const { selectedDapp } = useSelectedDapp()
  const [definition, setDefinition] = useState<any>()
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

  const { currCeramicNode } = useCeramicNodeCtx()
  const {
    loadMultiStreams,
    composeClient,
    composeClientAuthenticated
  } = useComposeClient(definition, currCeramicNode?.serviceUrl)

  const PAGE_SIZE = 10
  const [hasMore, setHasMore] = useState(false)
  const [endCursor, setEndCursor] = useState('')
  const [streams, setStreams] = useState<Record<string, Stream>>()
  const [loading, setLoading] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  const queryStream = useCallback(
    async ({
      first = PAGE_SIZE,
      after = ''
    }: {
      first?: number
      after?: string
    }) => {
      if (!composeClientAuthenticated || !composeClient) {
        // toast.error('composeClient not authenticated')
        return
      }
      if (!name) {
        toast.error('model name not found')
        return
      }
      const listQueryName = `${lowerFirst(name)}Index`
      const query = `
        query {
          ${listQueryName}(first: ${first}, after: "${after}") {
            edges {
              node {
                id
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
          }
        }
        `
      const res = await composeClient.executeQuery(query)
      if (res?.errors && res?.errors.length > 0) {
        toast.error(res?.errors[0]?.message)
      } else {
        const data: { edges: any; pageInfo: any } = res?.data?.[
          listQueryName
        ] as { edges: any; pageInfo: any }
        if (!data) return
        if (data.edges)
          return {
            mids: data.edges?.map((edge: any) => edge.node) || [],
            pageInfo: data.pageInfo || {}
          }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [composeClientAuthenticated, composeClient]
  )

  const fetchMoreMids = useCallback(async () => {
    if (!endCursor) return
    const data = await queryStream({ after: endCursor })
    if (data) {
      setHasMore(data.pageInfo.hasNextPage || false)
      setEndCursor(data.pageInfo.endCursor || '')
      const ids = data.mids.map((item: { id: any }) => item.id)
      const newStreams = await loadMultiStreams(ids)
      setStreams({ ...streams, ...newStreams })
    }
  }, [endCursor, queryStream, loadMultiStreams, streams])

  const fetchMids = useCallback(async () => {
    try {
      setLoading(true)
      setErrMsg('')
      const data = await queryStream({})
      if (data) {
        setHasMore(data.pageInfo.hasNextPage || false)
        setEndCursor(data.pageInfo.endCursor || '')
        const ids = data.mids.map((item: { id: any }) => item.id)
        const newStreams = await loadMultiStreams(ids)
        setStreams(newStreams)
      }
    } catch (error) {
      const err = error as AxiosError
      setErrMsg((err.response?.data as any).message || err.message)
    } finally {
      setLoading(false)
    }
  }, [loadMultiStreams, queryStream])

  useEffect(() => {
    fetchMids()
  }, [fetchMids])

  const createStream = useCallback(
    async (formData = {}) => {
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
          content: { ...formData }
        }
      })
      if (res?.errors && res?.errors.length > 0) {
        toast.error(res?.errors[0]?.message)
      } else {
        toast.success('Submitted successfully!')
        setIsOpenStreamForm(false)
        fetchMids()
      }
      setFormDisabled(false)
    },
    [composeClientAuthenticated, composeClient, name, fetchMids]
  )

  const updateStream = useCallback(
    async (updateStreamId: string, formData = {}) => {
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
          content: { ...formData }
        }
      })
      if (res?.errors && res?.errors.length > 0) {
        toast.error(res?.errors[0]?.message)
      } else {
        toast.success('Submitted successfully!')
        setIsOpenStreamForm(false)
      }
      setFormDisabled(false)
    },
    [composeClientAuthenticated, composeClient, name]
  )

  const [isOpenStreamForm, setIsOpenStreamForm] = useState(false)
  const [formType, setFormType] = useState<'create' | 'update'>('create')
  const [formData, setFormData] = useState({})
  const [formDisabled, setFormDisabled] = useState(false)
  const [updateStreamId, setUpdateStreamId] = useState('')

  const submitStream = useCallback(async () => {
    if (formType === 'create') {
      await createStream(formData)
    }
    if (formType === 'update') {
      await updateStream(updateStreamId, formData)
    }
  }, [formType, createStream, formData, updateStream, updateStreamId])

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
        <div className='title-box' />
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
        onChange={e => setFormData(e.formData)}
        onSubmit={() => submitStream()}
      />
      <ListHeading>
        <h3>{name}</h3>
        {composeClientAuthenticated && (
          <PlusButton
            onPress={() => {
              setFormType('create')
              setFormData({})
              setIsOpenStreamForm(true)
            }}
          >
            <PlusIcon />
          </PlusButton>
        )}
      </ListHeading>
      {streams && Object.keys(streams).length > 0 && (
        <InfiniteScroll
          dataLength={Object.keys(streams).length}
          next={() => {
            fetchMoreMids()
          }}
          hasMore={hasMore}
          loader={<Loading>Loading...</Loading>}
        >
          {streamId && (
            <ModelStreamList
              data={streams}
              modelId={streamId}
              editable={composeClientAuthenticated}
              editAction={(stream: Stream) => {
                setFormType('update')
                setUpdateStreamId(stream?.id.toString())
                setFormData(stream?.content)
                setIsOpenStreamForm(true)
              }}
              // pinAction={(stream: Stream, pin:boolean =true) => {
              //   if (!stream?.id || !ceramicClient) return
              //   if (pin)
              //     ceramicClient?.pin.add(stream.id)
              //   else
              //     ceramicClient?.pin.rm(stream.id)
              // }}
            />
          )}
        </InfiniteScroll>
      )}
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
  justify-content: space-between;
  margin-bottom: 20px;

  h3 {
    margin: 0;
  }
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
