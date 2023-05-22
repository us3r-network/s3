import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Network, Status, Stream } from '../entities/stream/stream.entity';
import { StreamRepository } from '../entities/stream/stream.repository';
const _importDynamic = new Function('modulePath', 'return import(modulePath)');

@Injectable()
export default class CeramicSubscriberService {
  private readonly logger = new Logger(CeramicSubscriberService.name);

  constructor(
    @InjectRepository(Stream, 'testnet')
    private readonly streamRepository: StreamRepository,
  ) { }
  async subCeramic(
    network: Network,
    bootstrapMultiaddrs: string[],
    listen: string[],
    topic: string,
    ceramicNetworkUrl: string,
  ) {
    const node = await this.createP2PNode(bootstrapMultiaddrs, listen);
    node.pubsub.subscribe(topic);

    const ceramic = await this.createCeramicClient(ceramicNetworkUrl);
    node.pubsub.addEventListener('message', async (message) => {
      try {
        const textDecoder = new TextDecoder('utf-8');
        const asString = textDecoder.decode(message.detail.data);
        const parsed = JSON.parse(asString);
        if (parsed.typ == 0) {
          // MsgType: UPDATE
          // console.log(network, ' p2p message:', parsed);
          await this.store(ceramic, network, parsed.stream);
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

  async getCacao(cid: any): Promise<any> {
    let cacaoDag;
    try {
      const ipfsHttpClient = await _importDynamic('ipfs-http-client');
      const ipfs = await ipfsHttpClient.create({
        url: 'https://ipfs.io',
      });

      const genesisDag = await ipfs.dag.get(cid, { timeout: 6000 });
      if (!genesisDag?.value) return;

      const { base64urlToJSON } = await _importDynamic(
        '@ceramicnetwork/common',
      );
      const decodedProtectedHeader = base64urlToJSON(
        genesisDag.value.signatures[0].protected,
      );
      const capIPFSUri = decodedProtectedHeader.cap;
      if (!capIPFSUri) return;

      const { CID } = await _importDynamic('multiformats/cid');
      const cacaoCid = CID.parse(capIPFSUri.replace('ipfs://', ''));
      if (!cacaoCid) return;

      cacaoDag = await ipfs.dag.get(cacaoCid, { timeout: 6000 });
    } catch (error) {
      // this.logger.warn(`get Cacao err, cid:${cid} error:${error}`);
    }

    return cacaoDag;
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

  async createCeramicClient(ceramicNetworkUrl: string) {
    const CeramicClient = await _importDynamic('@ceramicnetwork/http-client');
    return new CeramicClient.CeramicClient(ceramicNetworkUrl);
  }

  // Store all streams.
  async store(ceramic: any, network: Network, streamId: string) {
    const stream = await ceramic.loadStream(streamId);
    await this.storeStream(
      network,
      streamId,
      stream.allCommitIds,
      stream.state,
      stream.id.cid,
    );
    // save schema stream
    if (stream?.metadata?.schema) {
      const schemaStreamId = stream.metadata.schema.replace('ceramic://', '');
      const schemaStream = await ceramic.loadStream(schemaStreamId);
      await this.storeStream(
        network,
        schemaStreamId,
        schemaStream.allCommitIds,
        schemaStream.state,
      );
    }
    // save model stream
    if (stream?.metadata?.model) {
      const modelStreamId = stream.metadata.model.toString();
      const modelStream = await ceramic.loadStream(modelStreamId);
      await this.storeStream(
        network,
        modelStreamId,
        modelStream.allCommitIds,
        modelStream.state,
      );
    }
  }

  async storeStream(
    network: Network,
    streamId: string,
    commitIds: string[],
    streamState: any,
    genesisCid?: any,
  ) {
    try {
      let domian: string;
      if (genesisCid) {
        // this.logger.log(`To store stream(${streamId})  network:${network}`);
        const cacao = await this.getCacao(genesisCid);
        domian = cacao?.value?.p?.domain;
      }

      const stream = this.convertToStreamEntity(
        network,
        streamId,
        commitIds,
        streamState,
        domian,
      );
      if (!stream) return;

      const savedStream = await this.streamRepository.upsert(stream, [
        'network',
        'stream_id',
      ]);
      // this.logger.log(`Saved network(${network}) stream id(${streamId})`);
      return savedStream;
    } catch (error) {
      // this.logger.error(
      //   `To store network(${network}) stream(${streamId}) err:${JSON.stringify(
      //     error,
      //   )}`,
      // );
    }
  }

  convertToStreamEntity(
    network: Network,
    streamId: string,
    commitIds: string[],
    streamState: any,
    domain?: string,
  ): Stream {
    const stream = new Stream();
    stream.setStreamId = streamId;
    stream.setNetwork = network;
    if (streamState?.metadata?.family)
      stream.setFamily = streamState.metadata.family;
    stream.setType = streamState.type;
    stream.setDid = streamState?.metadata?.controllers[0];
    if (streamState.anchorStatus == 3) {
      stream.setAnchorStatus = Status.ANCHORED;
    } else {
      stream.setAnchorStatus = Status.NOT_ANCHORED;
    }
    if (streamState?.anchorProof && streamState.anchorProof.blockTimestamp) {
      stream.setAnchorDate = new Date(
        streamState.anchorProof.blockTimestamp * 1000,
      );
      stream.setAnchorHash = streamState.anchorProof.txHash.toString();
    }
    if (streamState?.metadata?.schema)
      stream.setSchema = streamState.metadata.schema.replace('ceramic://', '');
    if (streamState?.metadata?.model) {
      stream.setModel = streamState.metadata.model.toString();
    }
    if (streamState?.metadata?.tags) stream.setTags = streamState.metadata.tags;
    stream.setCommitIds = commitIds?.map((id) =>
      id.toString().replace('CommitID(', '').replace(')', ''),
    );
    if (domain) {
      // this.logger.log(`The stream(${streamId}) has the domain:${domain}`);
      stream.setDomain = domain;
    }
    stream.setContent = streamState.content;
    stream.setMetadata = streamState.metadata;
    stream.setOriginData = JSON.parse(JSON.stringify(streamState));
    stream.setLastModifiedAt = new Date();
    return stream;
  }
}
