/**
 * How to use this model:
 * 
 * export const CERAMIC_TESTNET_HOST = "https://gcp-ceramic-testnet-dev.s3.xyz";
 * const compositeModel = new S3CompositeModel(CERAMIC_TESTNET_HOST);
 * 
 * // auth with didSession
 * compositeModel.authComposeClient(didSession);
 * 
 * // createNew
 * const resp = await compositeModel.createComposite({...});
 * 
 * // update
 * const resp = await compositeModel.updateComposite({...});
 * 
 * // queryList
 * const resp = await compositeModel.queryCompositeIndex({first: 100, after: ""});
 *
 * // queryWithId
 * const resp = await compositeModel.queryCompositeWithId("...");
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
  Composite,
  CreateCompositeInput,
  CreateCompositePayload,
  UpdateCompositeInput,
  UpdateCompositePayload,
  Scalars,
} from "./graphql";

export class S3CompositeModel {
  composeClient: ComposeClient;

  constructor(ceramic: CeramicApi | string) {
    this.composeClient = new ComposeClient({
      ceramic: ceramic,
      definition: definition as unknown as RuntimeCompositeDefinition,
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

  async createComposite(input: CreateCompositeInput) {
    const mutation = `
      mutation createComposite($input: CreateCompositeInput!) {
        createComposite(input: $input) {
          document {
            id
          }
        }
      }
    `;
    const resp = await this.composeClient.executeQuery<{
      createComposite: CreateCompositePayload;
    }>(mutation, {
      input: {
        content: {
          ...input.content,
        },
      },
    });
    return resp;
  }

  async updateComposite(input: UpdateCompositeInput) {
    const mutation = `
      mutation($input: UpdateCompositeInput!) {
        updateComposite(input: $input) {
          document {
            id
          }
        }
      }
    `;
    const resp = await this.composeClient.executeQuery<{
      updateComposite: UpdateCompositePayload;
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

  async queryCompositeIndex({
    first = 100,
    after = "",
  }: {
    first: number;
    after?: string;
  }) {
    const query = `
      query {
        compositeIndex(first: ${first}, after: "${after}") {
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
    `;

    const resp = await this.composeClient.executeQuery<{
      compositeIndex: Page<Composite>;
    }>(query);

    return resp;
  }

  async queryCompositeWithId(id: Scalars["ID"]["input"]) {
    const query = `
      query($id: ID!) {
        node(id: $id) {
          ... on Composite {
            id
            # other fields
          }
        }
      }
    `;

    const resp = await this.composeClient.executeQuery<{
      node: Composite;
    }>(query, {
      id,
    });

    return resp;
  }
}

