import { Injectable, Logger } from "@nestjs/common";
import type { Provider } from '@ethersproject/providers'
import { IJobQueue, Job, JobQueue } from "../subscriber/job-queue";
import { CeramicAnchorContractAddress, ChainIdEnum, EthChainIdMappings, EthNetwork, InitialIndexingBlocks, SyncJobData } from "./constants";
import { InjectRepository } from "@nestjs/typeorm";
import { HistorySyncState, Network, Stream } from "src/entities/stream/stream.entity";
import { HistorySyncStateRepository, StreamRepository } from "src/entities/stream/stream.repository";
import { StreamStoreData, createStreamStoreJob, getStreamStoreJob } from "../subscriber/store.worker";
import * as providers from '@ethersproject/providers';
import {
    getCidFromAnchorEventLog,
} from '@ceramicnetwork/anchor-utils';
import { CID } from 'multiformats/cid';
import PQueue from 'p-queue';
import { sleep } from "./utils";
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
        while (true) {
            try {
                const historySyncState = await this.historySyncStateRepository.findOne({
                    where: {
                        chain_id: chainId
                    }
                })
                this.logger.log('Start history sync state:' + JSON.stringify(historySyncState) + 'for chain id:' + chainId);
                if (historySyncState == null) {
                    this.logger.error('History sync state is null, please check the history sync state table');
                    break;
                }
                const currentBlockNumber = historySyncState.getProcessedBlockNumber;
                // TODO  verify the history sync state, if the state exceed the max block number, then return;

                try {
                    // get block log data from the provider
                    // and parse anchor proof root for ETH logs
                    const provider = chainId == ChainIdEnum.MAINNET.toString() ? this.mainnetProvider : this.testnetProvider;
                    const logs = await provider.getLogs({
                        address: CeramicAnchorContractAddress,
                        fromBlock: historySyncState.getProcessedBlockNumber,
                        toBlock: +historySyncState.getProcessedBlockNumber + 1,
                    });
                    this.logger.log(`[${chainId}] Logs' length: ${logs?.length}`);
                    if (logs?.length > 0) {
                        // anchor proof root is a CID
                        const anchorProofRoots = logs.map(log => getCidFromAnchorEventLog(log))
                        this.logger.log(`[${chainId}] Anchor proof roots' length: ${anchorProofRoots?.length}`);
                        if (anchorProofRoots?.length > 0) {
                            // parse stream id from anchor proof roots by ipfs
                            const streamIdsFromBlockLogs: string[] = [];
                            for await (const cid of anchorProofRoots) {
                                try {
                                    const streamIds = await this.getStreamIdsFromIpfs(cid);
                                    streamIdsFromBlockLogs.push(...streamIds);
                                    this.logger.log(`[${chainId}] Stream ids' length: ${streamIds?.length} for cid: ${cid}`);
                                } catch (error) {
                                    this.logger.error(`[${chainId}] Error: ${error.message}`);
                                }
                            }
                            this.logger.log(`[${chainId}] Stream ids' length: ${streamIdsFromBlockLogs?.length} for block number: ${currentBlockNumber}`);
                            // add stream id to queue
                            const network = chainId == ChainIdEnum.MAINNET.toString() ? Network.MAINNET : Network.TESTNET;
                            for await (const streamId of streamIdsFromBlockLogs) {
                                const job: Job<StreamStoreData> = createStreamStoreJob(getStreamStoreJob(network), {
                                    network: network,
                                    streamId: streamId,
                                });
                                await this.streamJobQueue.addJob(job);
                            }
                        }
                    }
                } catch (error) {
                    this.logger.error(`[${chainId}] Error: ${error.message}`);
                }
                // update state table data
                historySyncState.setProcessedBlockNumber = currentBlockNumber + 1;
                await this.historySyncStateRepository.update({ chain_id: chainId }, historySyncState);

                // sleep 10 seconds
                await sleep(10000);
            } catch (error) {
                this.logger.error(`[${chainId}] Error: ${error.message}`);
            }
        }
    }

    async getStreamIdsFromIpfs(cid: CID | string): Promise<any> {
        const metedataPath = '2'
        const resolution = this.ipfs.dag.resolve(cid, {
            timeout: 30000,
            path: metedataPath,
        });
        const blockCid = resolution.cid

        const codec = await this.ipfs.codecs.getCodec(blockCid.code);
        const block = this.ipfs.block.get(blockCid, {
            timeout: 30000,
        });
        const metadata = codec.decode(block)
        return metadata?.streamIds;
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