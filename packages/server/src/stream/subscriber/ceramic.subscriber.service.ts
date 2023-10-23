import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Network, Stream } from '../../entities/stream/stream.entity';
import { StreamRepository } from '../../entities/stream/stream.repository';
import { IJobQueue, Job, JobQueue } from './job-queue';
import StoreWorker, { getStreamStoreJob, StreamStoreData, createStreamStoreJob } from './store.worker';
const _importDynamic = new Function('modulePath', 'return import(modulePath)');

@Injectable()
export default class CeramicSubscriberService {
  private readonly logger = new Logger(CeramicSubscriberService.name);
  public jobQueue!: IJobQueue<StreamStoreData>
  private p2pNode: any;

  constructor(
    @InjectRepository(Stream, 'testnet')
    private readonly streamRepository: StreamRepository,
  ) {
    this.jobQueue = new JobQueue(process.env.PG_BOSS_DATABASE_URL);
  }

  async initJobQueue() {
    // init ceramic clients
    const ceramicMiannetClient = await this.createCeramicClient('http://35.220.227.2:7007/');
    const ceramicTestnetClient = await this.createCeramicClient('http://34.92.232.17:7007/');
    await this.jobQueue.init({
      [getStreamStoreJob(Network.MAINNET)]: new StoreWorker(
        this.streamRepository, ceramicMiannetClient
      ),
      [getStreamStoreJob(Network.TESTNET)]: new StoreWorker(
        this.streamRepository, ceramicTestnetClient
      ),
    });
    this.logger.log('init job queue success');
  }

  async subCeramic(
    network: Network,
    bootstrapMultiaddrs: string[],
    listen: string[],
    topic: string) {
    this.p2pNode = await this.createP2PNode(bootstrapMultiaddrs, listen);
    this.p2pNode.pubsub.subscribe(topic);

    this.p2pNode.pubsub.addEventListener('message', async (message) => {
      try {
        const textDecoder = new TextDecoder('utf-8');
        const asString = textDecoder.decode(message.detail.data);
        const parsed = JSON.parse(asString);
        if (parsed.typ == 0) {
          // MsgType: UPDATE
          this.logger.log(
            `${network}, sub p2p message: ${JSON.stringify(parsed)}`,
          );
          const job: Job<StreamStoreData> = createStreamStoreJob(getStreamStoreJob(network), {
            network: network,
            streamId: parsed.stream,
          });
          this.jobQueue.addJob(job);
        }
        // else if (parsed.typ == 2) {
        //   // MsgType: RESPONSE
        //   const streamIds = Object.keys(parsed.tips);
        //   await Promise.all(
        //     streamIds?.map(async (streamId) => {
        //       await this.store(ceramic, network, streamId);
        //     }),
        //   );
        // }
      } catch (error) {
        this.logger.error(
          `${network} ceramic sub err, messgage:${message} error:${error}`,
        );
      }
    });
  }

  async createCeramicClient(ceramicNetworkUrl: string) {
    const CeramicClient = await _importDynamic('@ceramicnetwork/http-client');
    return new CeramicClient.CeramicClient(ceramicNetworkUrl);
  }

  async createP2PNode(bootstrapMultiaddrs: string[], listen: string[]) {
    const libp2p = await _importDynamic('libp2p');
    const webSockets = await _importDynamic('@libp2p/websockets');
    const mplex = await _importDynamic('@libp2p/mplex');
    const noise = await _importDynamic('@chainsafe/libp2p-noise');
    const gossipsub = await _importDynamic('@chainsafe/libp2p-gossipsub');
    const bootstrap = await _importDynamic('@libp2p/bootstrap');

    return await libp2p.createLibp2p({
      peerDiscovery: [
        bootstrap.bootstrap({
          list: bootstrapMultiaddrs, // provide array of multiaddrs
        }),
      ],
      connectionManager: {
        autoDial: true, // Auto connect to discovered peers (limited by ConnectionManager minConnections)
        // The `tag` property will be searched when creating the instance of your Peer Discovery service.
        // The associated object, will be passed to the service when it is instantiated.
      },
      addresses: {
        listen: listen,
      },
      transports: [webSockets.webSockets()],
      streamMuxers: [mplex.mplex()],
      connectionEncryption: [noise.noise()],
      pubsub: gossipsub.gossipsub(),
    });
  }
}
