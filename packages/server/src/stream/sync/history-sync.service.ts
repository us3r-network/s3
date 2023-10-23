import { Injectable, Logger } from "@nestjs/common";
import type { Provider } from '@ethersproject/providers'
import { IJobQueue, JobQueue } from "../subscriber/job-queue";
import { CeramicAnchorContractAddress, ChainIdEnum, EthChainIdMappings, EthNetwork, InitialIndexingBlocks, SyncJobData } from "./constants";
import { InjectRepository } from "@nestjs/typeorm";
import { HistorySyncState, Stream } from "src/entities/stream/stream.entity";
import { HistorySyncStateRepository, StreamRepository } from "src/entities/stream/stream.repository";
import { StreamStoreData } from "../subscriber/store.worker";
import * as providers from '@ethersproject/providers';
import {
    getCidFromAnchorEventLog,
} from '@ceramicnetwork/anchor-utils'
import PQueue from 'p-queue';
const _importDynamic = new Function('modulePath', 'return import(modulePath)');

@Injectable()
export default class HistorySyncService {
    private readonly logger = new Logger(HistorySyncService.name);
    public streamJobQueue!: IJobQueue<StreamStoreData>
    private mainnetProvider: Provider;
    private testnetProvider: Provider;
    private ipfs: any;

    constructor(@InjectRepository(HistorySyncState, 'testnet')
    private readonly historySyncStateRepository: HistorySyncStateRepository,
        @InjectRepository(Stream, 'testnet')
        private readonly streamRepository: StreamRepository,) {
    }

    async init(streamJobQueue: IJobQueue<StreamStoreData>): Promise<void> {
        this.streamJobQueue = streamJobQueue;

        // init eth providers
        this.mainnetProvider = this.getProvider(ChainIdEnum.MAINNET.toString());
        this.testnetProvider = this.getProvider(ChainIdEnum.GNOSIS.toString());

        // init state table data
        await this.initStatetable(ChainIdEnum.MAINNET.toString());
        await this.initStatetable(ChainIdEnum.GNOSIS.toString());

        // init ipfs client
        const ipfsHttpClient = await _importDynamic('ipfs-http-client');
        this.ipfs = await ipfsHttpClient.create({
          url: 'https://gateway.ipfs.io',
        });
    }

    async startHistorySync() {
        // start history sync for each chain
        await this.startHistorySyncForChain(ChainIdEnum.MAINNET.toString());
        await this.startHistorySyncForChain(ChainIdEnum.GNOSIS.toString());
    }

    async startHistorySyncForChain(chainId: string) {
        const historySyncState = await this.historySyncStateRepository.findOne({
            where: {
                chain_id: chainId
            }
        })
        this.logger.log('Start history sync state:' + JSON.stringify(historySyncState) + 'for chain id:' + chainId);
        if (historySyncState == null) {
            this.logger.error('History sync state is null, please check the history sync state table');
            return;
        }

        const currentBlockNumber = historySyncState.getProcessedBlockNumber;
        // get block log data from the provider
        // and parse anchor proof root for ETH logs
        const provider = chainId == ChainIdEnum.MAINNET.toString() ? this.mainnetProvider : this.testnetProvider;
        const logs = await provider.getLogs({
            address: CeramicAnchorContractAddress,
            fromBlock: historySyncState.getProcessedBlockNumber,
            toBlock: +historySyncState.getProcessedBlockNumber + 1,
        });
        this.logger.log(`[${chainId}] Logs' length: ${logs?.length}`);
        if (logs?.length == 0) {
            return;
        }
        // anchor proof root is a CID
        const anchorProofRoots = logs.map(log => getCidFromAnchorEventLog(log))
        this.logger.log(`[${chainId}] Anchor proof roots' length: ${anchorProofRoots?.length}`);
        if (anchorProofRoots?.length == 0) {
            return;
        }

        // parse stream id by ipfs

        // add stream id to queue

        // update state table data
    }

    async initStatetable(chainId: string) {
        const historySyncState = await this.historySyncStateRepository.findOne({
            where: {
                chain_id: chainId
            }
        })
        this.logger.log('Init history sync state data, the current data is:' + JSON.stringify(historySyncState));
        if (historySyncState == null) {
            const newHistorySyncState = new HistorySyncState()
            newHistorySyncState.setChainId = chainId
            newHistorySyncState.setProcessedBlockNumber = InitialIndexingBlocks[chainId].toString();
            await this.historySyncStateRepository.save(newHistorySyncState)
        }
    }

    /**
     * Gets Ethereum provider based on chain ID
     * @param chain - CAIP-2 Chain ID
     * @private
     */
    getProvider(chainId: string | null): providers.BaseProvider {

        if (!chainId.startsWith('eip155')) {
            throw new Error(`Unsupported chainId '${chainId}' - must be eip155 namespace`)
        }

        const ethNetwork: EthNetwork = EthChainIdMappings[chainId]
        const endpoint = ethNetwork?.endpoint

        let provider
        if (endpoint) {
            provider = new providers.StaticJsonRpcProvider(endpoint)
        } else {
            if (ethNetwork == null) {
                throw new Error(`No ethereum provider available for chainId ${chainId}`)
            }

            provider = providers.getDefaultProvider(ethNetwork.network)
        }
        return provider
    }
}