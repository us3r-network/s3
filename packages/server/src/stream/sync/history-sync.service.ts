import { Injectable, Logger } from "@nestjs/common";
import type { Provider } from '@ethersproject/providers'
import { IJobQueue, Job } from "../subscriber/job-queue";
import { BlockConfirmations, CeramicAnchorContractAddress, ChainIdEnum, EthChainIdMappings, EthNetwork, InitialIndexingBlocks, SyncJobData } from "./constants";
import { InjectRepository } from "@nestjs/typeorm";
import { HistorySyncState, Network, Stream } from "src/entities/stream/stream.entity";
import { HistorySyncStateRepository, StreamRepository } from "src/entities/stream/stream.repository";
import { StreamStoreData, createStreamStoreJob, getStreamStoreJob } from "../subscriber/store.worker";

import { sleep } from "./utils";
import { S3SeverBizDbName } from "src/common/constants";
import { timeout } from 'rxjs';
const _importDynamic = new Function('modulePath', 'return import(modulePath)');

@Injectable()
export default class HistorySyncService {
    private readonly logger = new Logger(HistorySyncService.name);
    public streamJobQueue!: IJobQueue<StreamStoreData>
    private mainnetProvider: Provider;
    private testnetProvider: Provider;
    private ipfs: any;

    constructor(@InjectRepository(HistorySyncState, S3SeverBizDbName)
    private readonly historySyncStateRepository: HistorySyncStateRepository,
        @InjectRepository(Stream, S3SeverBizDbName)
        private readonly streamRepository: StreamRepository,) {
    }

    async init(streamJobQueue: IJobQueue<StreamStoreData>): Promise<void> {
        this.streamJobQueue = streamJobQueue;

        // init eth providers
        this.mainnetProvider = await this.getProvider(ChainIdEnum.MAINNET.toString());
        this.testnetProvider = await this.getProvider(ChainIdEnum.GNOSIS.toString());

        // init state table data
        await this.initStatetable(ChainIdEnum.MAINNET.toString());
        await this.initStatetable(ChainIdEnum.GNOSIS.toString());

        // init ipfs client
        const ipfsHttpClient = await _importDynamic('ipfs-http-client');
        this.ipfs = await ipfsHttpClient.create({
            url: 'https://cloudflare-ipfs.com/',
        });
    }

    async startHistorySync() {
        // start history sync for each chain
        // await this.startHistorySyncForChain(ChainIdEnum.MAINNET.toString());
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
                this.logger.log('Start history sync state:' + JSON.stringify(historySyncState) + ' for chain id:' + chainId);
                if (historySyncState == null) {
                    this.logger.error('History sync state is null, please check the history sync state table');
                    break;
                }
                const currentBlockNumber = historySyncState.getProcessedBlockNumber;
                // verify the history sync state, if the state exceed the max block number, then skip;
                const provider = chainId == ChainIdEnum.MAINNET.toString() ? this.mainnetProvider : this.testnetProvider;
                const confirmedBlock = await provider.getBlock(-BlockConfirmations);
                this.logger.log(`[${chainId}] Current confirmed block number: ${confirmedBlock.number}, processed block number: ${currentBlockNumber}`);
                if (confirmedBlock.number <= +currentBlockNumber) {
                    this.logger.log(`[${chainId}] Current confirmed block number: ${confirmedBlock.number} is not greater than processed block number: ${currentBlockNumber}, skip to sync`);
                    continue;
                }
                const blockDelta = 100;               
                try {
                    // get block log data from the provider
                    // and parse anchor proof root for ETH logs
                    const logs = await provider.getLogs({
                        address: CeramicAnchorContractAddress,
                        fromBlock: +historySyncState.getProcessedBlockNumber,
                        toBlock: +historySyncState.getProcessedBlockNumber + blockDelta,
                    });
                    this.logger.log(`[${chainId}] Logs' length: ${logs?.length}, ${JSON.stringify(logs)}`);
                    if (logs?.length > 0) {
                        // anchor proof root is a CID
                        const { getCidFromAnchorEventLog } = await _importDynamic('@ceramicnetwork/anchor-utils');
                        const anchorProofRoots = logs.map(log => getCidFromAnchorEventLog(log))
                        this.logger.log(`[${chainId}] Anchor proof roots' length: ${anchorProofRoots?.length}, ${JSON.stringify(anchorProofRoots)}`);
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
                historySyncState.setProcessedBlockNumber = (+currentBlockNumber + blockDelta).toString();
                await this.historySyncStateRepository.update({ chain_id: chainId }, historySyncState);

                // sleep 10 seconds
                await sleep(1000);
            } catch (error) {
                this.logger.error(`[${chainId}] Error: ${error.message}`);
            }
        }
    }

    async getStreamIdsFromIpfs(cid: any): Promise<any> {
        const metedataPath = '2'
        const timeoutMs = 3000;
        const resolution = await this.ipfs.dag.resolve(cid, {
            timeout: timeoutMs,
            path: metedataPath,
        });
        this.logger.log(`[${cid}] Block resolution: ${JSON.stringify(resolution)}`);
        const blockCid = resolution.cid
        this.logger.log(`[${cid}] Block CID: ${JSON.stringify(blockCid)}`);
        const codec = await this.ipfs.codecs.getCodec(blockCid.code);
        this.logger.log(`[${cid}] Codec: ${JSON.stringify(codec)}`);
        const block = await this.ipfs.block.get(blockCid, {
            timeout: timeoutMs,
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
        if (!historySyncState) {
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
    async getProvider(chainId: string | null) {
        const { StaticJsonRpcProvider, getDefaultProvider } = await _importDynamic('@ethersproject/providers');
        if (!chainId.startsWith('eip155')) {
            throw new Error(`Unsupported chainId '${chainId}' - must be eip155 namespace`)
        }
        const ethNetwork: EthNetwork = EthChainIdMappings[chainId]
        const endpoint = ethNetwork?.endpoint

        let provider
        if (endpoint) {
            provider = new StaticJsonRpcProvider(endpoint)
        } else {
            if (ethNetwork == null) {
                throw new Error(`No ethereum provider available for chainId ${chainId}`)
            }

            provider = getDefaultProvider(ethNetwork.network)
        }
        return provider
    }
}