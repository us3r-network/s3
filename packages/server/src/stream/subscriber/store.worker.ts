import PgBoss = require("pg-boss")
import { type SendOptions } from 'pg-boss'
import type { Worker, Job } from './job-queue'
import { Network, Status, Stream } from '../../entities/stream/stream.entity';
import { Logger } from '@nestjs/common';
import { StreamRepository } from 'src/entities/stream/stream.repository';
const _importDynamic = new Function('modulePath', 'return import(modulePath)');

const JobOption: SendOptions = {
  retryLimit: 5,
  retryDelay: 60, // 1 minute
  retryBackoff: true,
  expireInHours: 12,
  retentionDays: 3,
}

export interface StreamStoreData {
  network: Network
  streamId: string
}

export function createStreamStoreJob(
  name: string,
  data: StreamStoreData,
  options?: SendOptions
): Job<StreamStoreData> {
  return {
    name,
    data,
    options: options || JobOption,
  }
}

export function getStreamStoreJob(network: Network) {
  return 'store_stream_job_from_' + network.toLowerCase();
}
export default class StoreWorker implements Worker<StreamStoreData> {
  private readonly logger = new Logger(StoreWorker.name);
  constructor(
    private readonly streamRepository: StreamRepository,
    private readonly ceramicClient: any,
  ) { }

  async handler(job: PgBoss.Job) {
    const jobData = job.data as StreamStoreData;
    this.logger.log('Reived job: ' + JSON.stringify(jobData));
    this.store(jobData.network, jobData.streamId);
  }

  async storeCacao(network: Network,
    streamId: string, cid: any): Promise<any> {
    try {
      const ipfsHttpClient = await _importDynamic('ipfs-http-client');
      const ipfs = await ipfsHttpClient.create({
        url: 'https://gateway.ipfs.io',
      });

      const genesisDag = await ipfs.dag.get(cid, { timeout: 6000 });
      if (!genesisDag.value || !genesisDag.value.signatures) {
        return;
      }
      this.logger.log(`[CACAO] Getting genesis cacao value:${JSON.stringify(genesisDag.value)} cid:${cid}`);

      const { base64urlToJSON } = await _importDynamic(
        '@ceramicnetwork/common',
      );
      const decodedProtectedHeader = base64urlToJSON(
        genesisDag.value.signatures[0].protected,
      );
      const capIPFSUri = decodedProtectedHeader.cap;
      this.logger.log(`[CACAO] Getting capIPFSUri:${capIPFSUri} cid:${cid}`);
      if (!capIPFSUri) return;

      const { CID } = await _importDynamic('multiformats/cid');
      const cacaoCid = CID.parse(capIPFSUri.replace('ipfs://', ''));
      if (!cacaoCid) return;

      const cacaoDag = await ipfs.dag.get(cacaoCid, { timeout: 6000 });
      this.logger.log(`[CACAO] Getting cacao(${JSON.stringify(cacaoDag)}) stream(${streamId})  network:${network}`);

      const domain = cacaoDag?.value?.p?.domain;
      this.logger.log(`[CACAO] Getting domain(${domain}) stream(${streamId})  network:${network}`);
      if (domain) {
        const stream = new Stream();
        stream.setStreamId = streamId;
        stream.setNetwork = network;
        stream.setDomain = domain;
        const savedStream = await this.streamRepository.upsert(stream, [
          'network',
          'stream_id',
        ]);
      }
    } catch (error) {
      const ipfsErr = 'Error 500 (Internal server error) when trying to fetch content from the IPFS network.';
      if (error.toString().includes(ipfsErr)) {
        this.logger.warn(`Getting cacao err, cid:${cid} error:${ipfsErr}`);
      } else {
        this.logger.warn(`Getting cacao err, cid:${cid} error:${JSON.stringify(error)}`);
      }
    }
  }

  async loadStream(streamId: string) {
    let remainRetires = 3;
    while (remainRetires > 0) {
      try {
        const stream = await this.ceramicClient.loadStream(streamId);
        return stream;
      } catch (error) {
        remainRetires--;
        this.logger.error(
          `load stream err, remainRetires:${remainRetires} streamId:${streamId} error:${error}`,
        );
      }
    }
  }

  // Store all streams.
  async store(network: Network, streamId: string) {
    try {
      const stream = await this.loadStream(streamId);
      if (!stream) return;
  
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
        const schemaStream = await this.loadStream(schemaStreamId);
        if (schemaStream) {
          await this.storeStream(
            network,
            schemaStreamId,
            schemaStream.allCommitIds,
            schemaStream.state,
          );
        }
      }
      // save model stream
      if (stream?.metadata?.model) {
        const modelStreamId = stream.metadata.model.toString();
        const modelStream = await this.loadStream(modelStreamId);
        if (modelStream) {
          await this.storeStream(
            network,
            modelStreamId,
            modelStream.allCommitIds,
            modelStream.state,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `To store network(${network}) stream(${streamId}) err:${JSON.stringify(
          error,
        )}`,
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
      let domain: string;
      if (genesisCid && streamState?.metadata?.model) {
        this.storeCacao(network, streamId, genesisCid);
      }

      const stream = this.convertToStreamEntity(
        network,
        streamId,
        commitIds,
        streamState,
        domain,
      );
      if (!stream) return;

      const savedStream = await this.streamRepository.upsert(stream, [
        'network',
        'stream_id',
      ]);
      this.logger.log(`Saved network(${network}) stream id(${streamId})`);
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