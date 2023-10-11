import { StreamController } from './stream.controller';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stream } from '../entities/stream/stream.entity';
import StreamService from './stream.service';
import CeramicSubscriberService from './subscriber/ceramic.subscriber.service';
import { ModelModule } from 'src/model/model.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stream], 'testnet'),
    forwardRef(() => ModelModule),
  ],
  controllers: [StreamController],
  providers: [StreamService, CeramicSubscriberService],
  exports: [StreamService, CeramicSubscriberService],
})
export class StreamModule {}
