import { EntityRepository, Repository } from 'typeorm';
import { HistorySyncState, Stream } from './stream.entity';

@EntityRepository(Stream)
export class StreamRepository extends Repository<Stream> {}

@EntityRepository(HistorySyncState)
export class HistorySyncStateRepository extends Repository<HistorySyncState> {}
