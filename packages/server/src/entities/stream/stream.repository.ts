import { EntityRepository, Repository } from 'typeorm';
import { Stream } from './stream.entity';

@EntityRepository(Stream)
export class StreamRepository extends Repository<Stream> {}
