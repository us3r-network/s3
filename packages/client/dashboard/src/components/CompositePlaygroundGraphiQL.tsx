import 'json-bigint-patch'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useExplorerPlugin } from '@graphiql/plugin-explorer'
import { Fetcher, FetcherOpts, FetcherParams } from '@graphiql/toolkit'
import { LoadFromUrlOptions } from '@graphql-tools/url-loader'
import {
  GraphiQL,
  GraphiQLInterface,
  GraphiQLProps,
  GraphiQLProvider,
} from 'graphiql'
import { RuntimeCompositeDefinition } from '@composedb/types'

import styled from 'styled-components'
import { createGraphqlDefaultQuery } from '../utils/createDefaultQuery'
import { useComposeClient } from '../hooks/useComposeClient'
import { useUrlSearchParams } from 'use-url-search-params'

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
    definition: string
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

export default function CompositePlaygroundGraphiQL(
  props: YogaGraphiQLProps
): React.ReactElement {
  const { definition, ceramicNodeURL } = props

  const updateQuery = useCallback(async () => {
    const data = JSON.parse(definition)
    const modelName = Object.keys(data.models)[0]
    const objValues: any[] = Object.values(data.objects)
    const modelProperties = Object.entries(objValues[0])
    const defaultQuery = createGraphqlDefaultQuery(modelName, modelProperties)
    setQuery(initialQuery + defaultQuery)
  }, [definition])

  const { composeClient, composeClientAuthenticated } =
  useComposeClient(definition as unknown as RuntimeCompositeDefinition, ceramicNodeURL)

  useEffect(() => {
    localStorage.setItem('graphiql:theme', 'dark')
    updateQuery()
  }, [updateQuery])

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
