import { RuntimeCompositeDefinition } from '@composedb/types'
import { useExplorerPlugin } from '@graphiql/plugin-explorer'
import { Fetcher, FetcherOpts, FetcherParams } from '@graphiql/toolkit'
import { LoadFromUrlOptions } from '@graphql-tools/url-loader'
import { AxiosError } from 'axios'
import {
  GraphiQL,
  GraphiQLInterface,
  GraphiQLProps,
  GraphiQLProvider,
} from 'graphiql'
import 'json-bigint-patch'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useUrlSearchParams } from 'use-url-search-params'
import { queryModelGraphql } from '../../api/model'
import { useComposeClient } from '../../hooks/useComposeClient'
import useSelectedDapp from '../../hooks/useSelectedDapp'
import { Network } from '../../types.d'
import { createGraphqlDefaultQuery } from '../../utils/createDefaultQuery'

const type = {
  query: String,
}

export type YogaGraphiQLProps = Omit<
  GraphiQLProps,
  | 'fetcher'
  | 'isHeadersEditorEnabled'
  | 'defaultEditorToolsVisibility'
  | 'onToggleDocs'
  | 'toolbar'
  | 'onSchemaChange'
  | 'query'
  | 'onEditQuery'
> &
  Partial<Omit<LoadFromUrlOptions, 'headers'>> & {
    title?: string
    additionalHeaders?: LoadFromUrlOptions['headers']
    streamId: string
    ceramicNodeURL: string | undefined
  }

const initialQuery = /* GraphQL */ `
  #
  # Welcome to S3 GraphiQL
  #

  # An example GraphQL query might look like:
  #
  #     {
  #       field(arg: "value") {
  #         subField
  #       }
  #     }
  #
  # Keyboard shortcuts:
  #
  #  Prettify Query:  Shift-Ctrl-P (or press the prettify button above)
  #
  #     Merge Query:  Shift-Ctrl-M (or press the merge button above)
  #
  #       Run Query:  Ctrl-Enter (or press the play button above)
  #
  #   Auto Complete:  Ctrl-Space (or just start typing)
  #
`

export default function PlaygroundGraphiQL(
  props: YogaGraphiQLProps
): React.ReactElement {
  const { streamId, ceramicNodeURL } = props
  // const { network } = useCeramicCtx()
  //   const [modelData, setModelData] = useState<ModeQueryResult>();
  const { selectedDapp } = useSelectedDapp()

  const [definition, setDefinition] = useState<RuntimeCompositeDefinition>()

  const [errMsg, setErrMsg] = useState('')

  const [loading, setLoading] = useState(false)
  const fetchModelGraphql = useCallback(async () => {
    if (!streamId || !selectedDapp) return
    try {
      setLoading(true)
      const resp = await queryModelGraphql(
        streamId,
        selectedDapp.network as Network
      )
      const { data } = resp.data
      setDefinition(data.runtimeDefinition)

      const definition = data.runtimeDefinition as unknown as RuntimeCompositeDefinition
      const modelName = Object.keys(definition.models)[0]
      const objValues: any[] = Object.values(definition.objects)
      const modelProperties = Object.entries(objValues[0])
      const defaultQuery = createGraphqlDefaultQuery(modelName, modelProperties)
      setQuery(initialQuery + defaultQuery)
    } catch (error) {
      const err = error as AxiosError
      setErrMsg((err.response?.data as any).message || err.message)
    } finally {
      setLoading(false)
    }
  }, [streamId, selectedDapp])

  const { composeClient, composeClientAuthenticated } =
  useComposeClient(definition, ceramicNodeURL)

  useEffect(() => {
    localStorage.setItem('graphiql:theme', 'dark')
    fetchModelGraphql()
  }, [fetchModelGraphql])

  const fetcher: Fetcher = useMemo(() => {
    return function fetcher(graphQLParams: FetcherParams, opts?: FetcherOpts) {
      return composeClient ?  composeClient.executeQuery(
        graphQLParams.query,
        graphQLParams.variables
      )
      :
      Promise.reject('composeClient is NOT ready yet!')
    }
  }, [composeClient])

  const [params, setParams] = useUrlSearchParams(
    {
      query: props.defaultQuery || initialQuery,
    },
    type,
    false
  )

  const [query, setQuery] = useState(params.query?.toString())
  const explorerPlugin = useExplorerPlugin({
    query: query as string,
    onEdit: setQuery,
    showAttribution: true,
  })

  if (loading) {
    return <Loading>Loading</Loading>
  }

  if (errMsg) {
    return <Loading>{errMsg}</Loading>
  }

  return (
    <GraphiqlContainer>
      <GraphiQLProvider
        plugins={[explorerPlugin]}
        query={query}
        headers={props.headers}
        schemaDescription={true}
        fetcher={fetcher}
      >
        <GraphiQLInterface
          isHeadersEditorEnabled
          defaultEditorToolsVisibility
          onEditQuery={(query) =>
            setParams({
              query,
            })
          }
        >
          <GraphiQL.Logo>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {composeClientAuthenticated && <div>Writable</div>}
            </div>
          </GraphiQL.Logo>
        </GraphiQLInterface>
      </GraphiQLProvider>
    </GraphiqlContainer>
  )
}

const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: gray;
`

const GraphiqlContainer = styled.div`
  border-radius: 20px;
  overflow: hidden;
  height: calc(100vh - 200px);
  > div {
    height: 100%;
    .graphiql-container {
      height: 100%;
      width: 100%;
    }
  }
`
