type Json = any;

export type Stream = {
  streamId: string;
  did: string;
  network: string;
  indexingTime: number;
  familyOrApp: number | null;
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
};

export enum Network {
  MAINNET = 'MAINNET',
  TESTNET = 'TESTNET',
}
