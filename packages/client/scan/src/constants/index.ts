export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL
export const UPLOAD_API_URL = process.env.REACT_APP_UPLOAD_API_URL

export const CERAMIC_NODE =
  process.env.REACT_APP_CERAMIC_NODE || 'https://ceramic.s3.xyz/'
export const CERAMIC_NODE_ADMIN_PRIVATE_KEY =
  process.env.REACT_APP_CERAMIC_NODE_ADMIN_PRIVATE_KEY
export const USER_API_BASE_URL = process.env.REACT_APP_USER_API_BASE_URL
export const CERAMIC_MAINNET_HOST = process.env
  .REACT_APP_CERAMIC_MAINNET_HOST as string
export const CERAMIC_TESTNET_HOST = process.env
  .REACT_APP_CERAMIC_TESTNET_HOST as string
export const MEDIA_BREAK_POINTS = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 992,
  xl: 1024,
  xxl: 1280,
  xxxl: 1440,
}
export const MOBILE_BREAK_POINT = 768

export const FamilyOrAppMap = {
  'Gitcoin Passport':
    'kjzl6cwe1jw148h1e14jb5fkf55xmqhmyorp29r9cq356c7ou74ulowf8czjlzs',
}

export const FamilyOrAppMapReverse = Object.fromEntries(
  Object.entries(FamilyOrAppMap).map(([key, value]) => [value, key])
)

export const Types: { [key: string]: string } = {
  '0': 'TileDocument',
  '1': 'Caip10Link',
  '2': 'Model',
  '3': 'ModelInstanceDocument',
}

export const TypesReverse = Object.fromEntries(
  Object.entries(Types).map(([key, value]) => [value, key])
)

export const WALLET_CONNECT_PROJECT_ID =
  process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID ||
  'c652d0148879353d7e965d7f6f361e59'

export const ADMIN_ADDRESS = process.env.REACT_APP_ADMIN_ADDRESS

export const S3_CONSOLE_URL = process.env.REACT_APP_S3_CONSOLE_URL