import { StreamController } from './stream.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stream } from '../entities/stream/stream.entity';
import StreamService from './stream.service';
import CeramicSubscriberService from './ceramic.subscriber.service';

@Module({
  imports: [TypeOrmModule.forFeature([Stream])],
  controllers: [StreamController],
  providers: [StreamService, CeramicSubscriberService],
  exports: [StreamService, CeramicSubscriberService],
})
export class StreamModule {}
