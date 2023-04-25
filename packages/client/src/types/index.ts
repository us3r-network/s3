type Json = any;

export type Stream = {
  streamId: string;
  did: string;
  network: string;
  indexingTime: number;
  familyOrApp: string | null;
  type: string;
  from: string;
  tags: string[];
  status: string;
  hash: string;
  schema: string;
  model?: string;
  anchorStatus: string;
  commitIds: string[];
  content: Json;
  metadata: Json;
  domain?: string;
};

export enum Network {
  MAINNET = "MAINNET",
  TESTNET = "TESTNET",
}

export type ModelStream = {
  "stream_id": string;
  "controller_did": string;
  "tip": string;
  "stream_content": {
    "name": string;
    "description": string | null;
    "schema": {
      "type": "object";
      "$schema": "https://json-schema.org/draft/2020-12/schema";
      "required": ["myData"];
      "properties": {
        "myData": {
          "type": "integer";
          "maximum": 10000;
          "minimum": 0;
        };
      };
      "additionalProperties": false;
    };
    "version": "1.0";
    "accountRelation": {
      "type": "list";
    };
  };
  "last_anchored_at": null;
  "first_anchored_at": null;
  "created_at": string;
  "updated_at": string;
  "useCount": number;
  "isIndexed"?: boolean;
};

export type ModelStreamInfo = {
  content: any;
  state: any;
};

export type ModeCreateResult = {
  composite: any;
  runtimeDefinition: any;
};

export type ModeQueryResult = {
  composite: any;
  runtimeDefinition: any;
  graphqlSchema: string;
};

export type Stats = {
  streamsLastWeek: number[];
  streamsPerHour: number;
  todayModels: number;
  totalModels: number;
  totalStreams: number;
};
