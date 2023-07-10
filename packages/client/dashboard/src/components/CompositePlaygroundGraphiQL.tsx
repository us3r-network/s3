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
import { useUrlSearchParams } from 'use-url-search-params'

import { ComposeClient } from '@composedb/client'
import { RuntimeCompositeDefinition } from '@composedb/types'

import styled from 'styled-components'
import { useSession } from '@us3r-network/auth-with-rainbowkit'
import { DID } from 'dids'
import useSelectedDapp from '../hooks/useSelectedDapp'
import { Network } from './Selector/EnumSelect'
import { CERAMIC_MAINNET_HOST, CERAMIC_TESTNET_HOST } from '../constants'
import { createGraphqlDefaultQuery } from '../utils/createDefaultQuery'

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
  const { definition } = props
  const { selectedDapp } = useSelectedDapp()

  const updateQuery = useCallback(async () => {
    const data = JSON.parse(definition)
    const modelName = Object.keys(data.models)[0]
    const objValues: any[] = Object.values(data.objects)
    const modelProperties = Object.entries(objValues[0])
    const defaultQuery = createGraphqlDefaultQuery(modelName, modelProperties)
    setQuery(initialQuery + defaultQuery)
  }, [definition])

  const session = useSession()

  const composeClient = useMemo(
    () =>
      new ComposeClient({
        ceramic:
          selectedDapp?.network === Network.MAINNET
            ? CERAMIC_MAINNET_HOST
            : CERAMIC_TESTNET_HOST,
        definition: JSON.parse(definition) as RuntimeCompositeDefinition,
      }),
    [definition, selectedDapp?.network]
  )
  const [composeClientAuthenticated, setComposeClientAuthenticated] =
    useState(false)

  const authComposeClients = useCallback(() => {
    if (session) {
      composeClient.setDID(session.did)
      setComposeClientAuthenticated(true)
    } else {
      const did = new DID()
      composeClient.setDID(did)
      setComposeClientAuthenticated(false)
    }
  }, [session, composeClient, setComposeClientAuthenticated])

  useEffect(() => {
    authComposeClients()
  }, [authComposeClients])

  useEffect(() => {
    localStorage.setItem('graphiql:theme', 'dark')
    updateQuery()
  }, [updateQuery])

  const fetcher: Fetcher = useMemo(() => {
    return function fetcher(graphQLParams: FetcherParams, opts?: FetcherOpts) {
      return composeClient.executeQuery(
        graphQLParams.query,
        graphQLParams.variables
      )
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

  // eslint-disable-next-line react-hooks/rules-of-hooks
  // const isAuthenticated = useMemo(() => {
  //   return composeClientAuthenticated && composeClient.context.isAuthenticated()
  // }, [composeClient, composeClientAuthenticated])
  // console.log({ isAuthenticated })

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
