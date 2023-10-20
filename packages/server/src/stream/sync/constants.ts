export interface EthNetwork {
    network: string
    chain: string
    chainId: number
    networkId: number
    type: string
    endpoint?: string
}

export const EthChainIdMappings: Record<string, EthNetwork> = {
    'eip155:1': { network: 'mainnet', chain: 'ETH', chainId: 1, networkId: 1, type: 'Production' },
    'eip155:3': { network: 'ropsten', chain: 'ETH', chainId: 3, networkId: 3, type: 'Test' },
    'eip155:4': { network: 'rinkeby', chain: 'ETH', chainId: 4, networkId: 4, type: 'Test' },
    'eip155:5': { network: 'goerli', chain: 'ETH', chainId: 5, networkId: 5, type: 'Test' },
    'eip155:100': {
        network: 'mainnet',
        chain: 'Gnosis',
        chainId: 100,
        networkId: 100,
        type: 'Test',
        endpoint: 'https://rpc.ankr.com/gnosis',
    },
}

export const InitialIndexingBlocks: Record<string, number> = {
    'eip155:1': 16695723,
    'eip155:5': 8503000,
    'eip155:100': 26511896,
}

export interface SyncJobData {
    currentBlock?: number
    fromBlock: number
    toBlock: number
}