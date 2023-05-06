import "json-bigint-patch";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useExplorerPlugin } from "@graphiql/plugin-explorer";
import { Fetcher, FetcherOpts, FetcherParams } from "@graphiql/toolkit";
import { LoadFromUrlOptions } from "@graphql-tools/url-loader";
import {
  GraphiQL,
  GraphiQLInterface,
  GraphiQLProps,
  GraphiQLProvider,
} from "graphiql";
import { useUrlSearchParams } from "use-url-search-params";

import "@graphiql/plugin-explorer/dist/style.css";
import { ComposeClient } from "@composedb/client";
import { RuntimeCompositeDefinition } from "@composedb/types";

import "graphiql/graphiql.css";
import "../../styles/playground.css";
import {  useParams } from "react-router-dom";
import { queryModelGraphql } from "../../api";
import { AxiosError } from "axios";
import styled from "styled-components";
import { createGraphqlDefaultQuery } from "../../utils/createDefaultQuery";
import {
  useSession,
} from "@us3r-network/auth-with-rainbowkit";
import { DID } from "dids";
import { useCeramicCtx } from "../../context/CeramicCtx";

const type = {
  query: String,
};

const ceramicHost =
  process.env.REACT_APP_CERAMIC_HOST || "http://13.215.254.225:7007";

export type YogaGraphiQLProps = Omit<
  GraphiQLProps,
  | "fetcher"
  | "isHeadersEditorEnabled"
  | "defaultEditorToolsVisibility"
  | "onToggleDocs"
  | "toolbar"
  | "onSchemaChange"
  | "query"
  | "onEditQuery"
> &
  Partial<Omit<LoadFromUrlOptions, "headers">> & {
    title?: string;
    additionalHeaders?: LoadFromUrlOptions["headers"];
  };

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
`;

export default function PlaygroundGraphiQL(
  props: YogaGraphiQLProps
): React.ReactElement {
  const { streamId } = useParams();
  const { network } = useCeramicCtx();
  //   const [modelData, setModelData] = useState<ModeQueryResult>();

  const [definition, setDefinition] = useState({
    models: {
      Profile: {
        id: "kjzl6hvfrbw6cah5z1j58emxetv28ky4hpmmmdbspnb7a2yycpi1o03e2webxrn",
        accountRelation: { type: "single" },
      },
    },
    objects: {
      Wallet: {
        chain: {
          type: "reference",
          refType: "enum",
          refName: "ChainType",
          required: false,
        },
        address: { type: "string", required: true },
        primary: { type: "boolean", required: true },
      },
      Profile: {
        bio: { type: "string", required: false },
        name: { type: "string", required: true },
        tags: {
          type: "list",
          required: false,
          item: { type: "string", required: false },
        },
        avatar: { type: "string", required: false },
        wallets: {
          type: "list",
          required: false,
          item: {
            type: "reference",
            refType: "object",
            refName: "Wallet",
            required: false,
          },
        },
        version: { type: "view", viewType: "documentVersion" },
      },
    },
    enums: { ChainType: ["EVM", "SOLANA"] },
    accountData: { profile: { type: "node", name: "Profile" } },
  });

  const [errMsg, setErrMsg] = useState("");

  const [loading, setLoading] = useState(false);
  const fetchModelGraphql = useCallback(async () => {
    if (!streamId) return;
    try {
      setLoading(true);
      const resp = await queryModelGraphql(streamId, network);
      const { data } = resp.data;
      setDefinition(data.runtimeDefinition);
      const definition = data.runtimeDefinition;
      const modelName = Object.keys(definition.models)[0];
      const objValues: any[] = Object.values(definition.objects);
      const modelProperties = Object.entries(objValues[0]);
      const defaultQuery = createGraphqlDefaultQuery(
        modelName,
        modelProperties
      );
      setQuery(initialQuery + defaultQuery);
    } catch (error) {
      const err = error as AxiosError;
      setErrMsg((err.response?.data as any).message || err.message);
    } finally {
      setLoading(false);
    }
  }, [streamId, network]);

  const session = useSession();

  const composeClient = useMemo(
    () =>
      new ComposeClient({
        ceramic: ceramicHost,
        definition: definition as RuntimeCompositeDefinition,
      }),
    [definition]
  );
  const [composeClientAuthenticated, setComposeClientAuthenticated] =
    useState(false);

  const authComposeClients = useCallback(() => {
    if (session) {
      composeClient.setDID(session.did);
      setComposeClientAuthenticated(true);
    } else {
      const did = new DID();
      composeClient.setDID(did);
      setComposeClientAuthenticated(false);
    }
  }, [session, composeClient, setComposeClientAuthenticated]);

  useEffect(() => {
    authComposeClients();
  }, [authComposeClients]);

  useEffect(() => {
    localStorage.setItem("graphiql:theme", "dark");
    fetchModelGraphql();
  }, [fetchModelGraphql]);

  const fetcher: Fetcher = useMemo(() => {
    return function fetcher(graphQLParams: FetcherParams, opts?: FetcherOpts) {
      return composeClient.executeQuery(
        graphQLParams.query,
        graphQLParams.variables
      );
    };
  }, [composeClient]);

  const [params, setParams] = useUrlSearchParams(
    {
      query: props.defaultQuery || initialQuery,
    },
    type,
    false
  );

  const [query, setQuery] = useState(params.query?.toString());
  const explorerPlugin = useExplorerPlugin({
    query: query as string,
    onEdit: setQuery,
    showAttribution: true,
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const isAuthenticated = useMemo(() => {
    return (
      composeClientAuthenticated && composeClient.context.isAuthenticated()
    );
  }, [composeClient, composeClientAuthenticated]);
  console.log({ isAuthenticated });

  if (loading) {
    return <Loading>Loading</Loading>;
  }

  if (errMsg) {
    return <Loading>{errMsg}</Loading>;
  }

  return (
    <div className="graphiql-container">
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
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              {composeClientAuthenticated && <div>Writable</div>}
            </div>
          </GraphiQL.Logo>
        </GraphiQLInterface>
      </GraphiQLProvider>
    </div>
  );
}

const Loading = styled.div`
  padding: 20px;
  text-align: center;
  color: gray;
`;
