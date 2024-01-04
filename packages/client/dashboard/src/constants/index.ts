/*
 * @Author: bufan bufan@hotmail.com
 * @Date: 2023-12-15 10:06:03
 * @LastEditors: bufan bufan@hotmail.com
 * @LastEditTime: 2023-12-22 10:59:18
 * @FilePath: /s3/packages/client/dashboard/src/constants/index.ts
 * @Description: 
 */
export const APP_API_URL = process.env.REACT_APP_API_BASE_URL

export const UPLOAD_API_URL = process.env.REACT_APP_UPLOAD_API_URL

export const CERAMIC_MAINNET_HOST = process.env
  .REACT_APP_CERAMIC_MAINNET_HOST as string
export const CERAMIC_TESTNET_HOST = process.env
  .REACT_APP_CERAMIC_TESTNET_HOST as string

export const DOCS_URL = process.env.REACT_APP_DOCS_URL as string
export const S3_SCAN_URL = process.env.REACT_APP_S3_SCAN_URL as string

export const TWITTER = 'twitter'
export const DISCORD = 'discord'
export const MEDIUM = 'medium'
export const MIRROR = 'mirror'
export const GITHUB = 'github'

export const WALLET_CONNECT_PROJECT_ID =
  process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID ||
  'c652d0148879353d7e965d7f6f361e59'

export const CERAMIC_NODE_SERVICE_API_URL = process.env.CERAMIC_NODE_SERVICE_API_URL || 'https://ceramic-node-service-test-3rnbvla4lq-df.a.run.app/ceramic-api';
export const CERAMIC_NODE_SERVICE_WSS_URL = process.env.CERAMIC_NODE_SERVICE_WSS_URL || 'wss://ceramic-node-service-test-3rnbvla4lq-df.a.run.app';