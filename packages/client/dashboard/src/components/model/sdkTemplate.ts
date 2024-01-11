export const sdkTemplate = `/**
 * How to use this model:
 * 
 * export const CERAMIC_TESTNET_HOST = "https://gcp-ceramic-testnet-dev.s3.xyz";
 * const <%= modelNameCamelcase %>Model = new S3<%= modelName %>Model(CERAMIC_TESTNET_HOST);
 * 
 * // auth with didSession
 * <%= modelNameCamelcase %>Model.authComposeClient(didSession);
 * 
 * // createNew
 * const resp = await <%= modelNameCamelcase %>Model.create<%= modelName %>({...});
 * 
 * // update
 * const resp = await <%= modelNameCamelcase %>Model.update<%= modelName %>({...});
 * 
 * // queryList
 * const resp = await <%= modelNameCamelcase %>Model.query<%= modelName %>Index({first: 100, after: ""});
 *
 * // queryWithId
 * const resp = await <%= modelNameCamelcase %>Model.query<%= modelName %>WithId("...");
 * 
 */

import { ComposeClient } from "@composedb/client";
import { RuntimeCompositeDefinition } from "@composedb/types";
import { DIDSession } from "did-session";
import type { CeramicApi } from "@ceramicnetwork/common";
import { DID } from "dids";
import { Page } from "@ceramicnetwork/common";

import { definition } from "./runtime-composite";

import {
  <%= modelName %>,
  Create<%= modelName %>Input,
  Create<%= modelName %>Payload,
  Update<%= modelName %>Input,
  Update<%= modelName %>Payload,
  Scalars,
} from "./graphql";

export class S3<%= modelName %>Model {
  composeClient: ComposeClient;

  constructor(ceramic: CeramicApi | string) {
    this.composeClient = new ComposeClient({
      ceramic: ceramic,
      definition: definition as RuntimeCompositeDefinition,
    });
  }

  public authComposeClient(session: DIDSession) {
    if (!session || (session.hasSession && session.isExpired)) {
      throw new Error("Please login with wallet first!");
    }
    this.composeClient.setDID(session.did);
  }

  public resetComposeClient() {
    const did = new DID();
    this.composeClient.setDID(did);
  }

  async create<%= modelName %>(input: Create<%= modelName %>Input) {
    const mutation = \`
      mutation create<%= modelName %>($input: Create<%= modelName %>Input!) {
        create<%= modelName %>(input: $input) {
          document {
            id
          }
        }
      }
    \`;
    const resp = await this.composeClient.executeQuery<{
      create<%= modelName %>: Create<%= modelName %>Payload;
    }>(mutation, {
      input: {
        content: {
          ...input.content,
        },
      },
    });
    return resp;
  }

  async update<%= modelName %>(input: Update<%= modelName %>Input) {
    const mutation = \`
      mutation($input: Update<%= modelName %>Input!) {
        update<%= modelName %>(input: $input) {
          document {
            id
          }
        }
      }
    \`;
    const resp = await this.composeClient.executeQuery<{
      update<%= modelName %>: Update<%= modelName %>Payload;
    }>(mutation, {
      input: {
        id: input.id,
        content: {
          ...input.content,
        },
      },
    });

    return resp;
  }

  async query<%= modelName %>Index({
    first = 100,
    after = "",
  }: {
    first: number;
    after?: string;
  }) {
    const query = \`
      query {
        <%= modelNameCamelcase %>Index(first: \${first}, after: "\${after}") {
          edges {
            node {
              id
              # other fields
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            endCursor
            startCursor
          }
        }
      }
    \`;

    const resp = await this.composeClient.executeQuery<{
      <%= modelNameCamelcase %>Index: Page<<%= modelName %>>;
    }>(query);

    return resp;
  }

  async query<%= modelName %>WithId(id: Scalars["ID"]["input"]) {
    const query = \`
      query($id: ID!) {
        node(id: $id) {
          ... on <%= modelName %> {
            id
            # other fields
          }
        }
      }
    \`;

    const resp = await this.composeClient.executeQuery<{
      node: <%= modelName %>;
    }>(query, {
      id,
    });

    return resp;
  }
}

`
