import { useCallback, useEffect, useRef, useState } from 'react'

import styled from 'styled-components'
import InfiniteScroll from 'react-infinite-scroll-component'
// import ModelStreamList from '../../components/ModelStreamList'
import { AxiosError } from 'axios'
import { Network } from './Selector/EnumSelect'
import { ModelMid, ModelStream } from '../types'
import { getModelMid, PageSize } from '../api'
import ModelStreamList from './ModelStreamList'
import {
  Button,
  Dialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
} from 'react-aria-components'
import ModelInstanceForm from './ModelInstanceForm'
import PlusIcon from './Icons/PlusIcon'
import CloseIcon from './Icons/CloseIcon'

export default function Instance({
  streamId,
  network,
  schema,
}: {
  streamId: string
  network: Network
  schema: ModelStream['stream_content']['schema']
}) {
  const pageNum = useRef(1)
  // const { network } = useCeramicCtx()
  const [hasMore, setHasMore] = useState(true)
  const [streams, setStreams] = useState<Array<ModelMid>>([])
  const [loading, setLoading] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [formData, setFormData] = useState({})

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
      <ListHeading>
        <DialogTrigger>
          <PlusButton>
            <PlusIcon />
          </PlusButton>
          <ModalOverlay>
            <Modal>
              <Dialog>
                {({ close }) => (
                  <FormContentBox>
                    <Heading className="title">
                      <span>Create Stream</span>
                      <button onClick={close}>
                        <CloseIcon />
                      </button>
                    </Heading>
                    <ModelInstanceForm
                      schema={schema}
                      formData={formData}
                      onChange={(e) => setFormData(e.formData)}
                      onSubmit={() => close()}
                    />
                  </FormContentBox>
                )}
              </Dialog>
            </Modal>
          </ModalOverlay>
        </DialogTrigger>
      </ListHeading>
      <InfiniteScroll
        dataLength={streams.length}
        next={() => {
          pageNum.current += 1
          fetchMoreStreams(pageNum.current)
        }}
        hasMore={hasMore}
        loader={<Loading>Loading...</Loading>}
      >
        {streamId && <ModelStreamList data={streams} modelId={streamId} />}
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
const FormContentBox = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;

  position: relative;
  width: 800px;
  margin: 0 auto;

  /* #1B1E23 */

  background: #1b1e23;
  border-radius: 20px;

  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    color: #ffffff;
  }
`
