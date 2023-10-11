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
  private readonly jobQueue!: IJobQueue<StreamStoreData>

  constructor(
    @InjectRepository(Stream, 'testnet')
    private readonly streamRepository: StreamRepository,
  ) {
    this.jobQueue = new JobQueue(process.env.PG_BOSS_DATABASE_URL);
  }
  async subCeramic(
    network: Network,
    bootstrapMultiaddrs: string[],
    listen: string[],
    topic: string,
    ceramicNetworkUrl: string,
  ) {
    const node = await this.createP2PNode(bootstrapMultiaddrs, listen);
    node.pubsub.subscribe(topic);
    // init ceramic client
    const ceramicClient = await this.createCeramicClient(ceramicNetworkUrl);

    // init job queue
    const storeStreamJob = getStreamStoreJob(network);
    await this.jobQueue.init({
      [storeStreamJob]: new StoreWorker(
        this.streamRepository, ceramicClient
      ),
    });
    this.logger.log(`init job queue ${storeStreamJob} success`)
    node.pubsub.addEventListener('message', async (message) => {
      try {
        const textDecoder = new TextDecoder('utf-8');
        const asString = textDecoder.decode(message.detail.data);
        const parsed = JSON.parse(asString);
        if (parsed.typ == 0) {
          // MsgType: UPDATE
          this.logger.log(
            `${network}, sub p2p message: ${JSON.stringify(parsed)}`,
          );
          const job: Job<StreamStoreData> = createStreamStoreJob(storeStreamJob, {
            network: network,
            streamId: parsed.stream,
          });
          await this.jobQueue.addJob(job);
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
