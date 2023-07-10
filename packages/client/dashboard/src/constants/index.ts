export const APP_API_URL = process.env.REACT_APP_API_BASE_URL

export const UPLOAD_API_URL = process.env.REACT_APP_UPLOAD_API_URL

export const CERAMIC_NODE =
  process.env.REACT_APP_CERAMIC_NODE || 'https://ceramic.s3.xyz/'
export const CERAMIC_NODE_ADMIN_PRIVATE_KEY =
  process.env.REACT_APP_CERAMIC_NODE_ADMIN_PRIVATE_KEY

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
