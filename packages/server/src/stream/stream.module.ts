import { StreamController } from './stream.controller';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorySyncState, Stream } from '../entities/stream/stream.entity';
import StreamService from './stream.service';
import CeramicSubscriberService from './subscriber/ceramic.subscriber.service';
import { ModelModule } from 'src/model/model.module';
import HistorySyncService from './sync/history-sync.service';
import { S3SeverBizDbName } from 'src/common/constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stream, HistorySyncState], S3SeverBizDbName),
    forwardRef(() => ModelModule),
  ],
  controllers: [StreamController],
  providers: [StreamService, CeramicSubscriberService, HistorySyncService],
  exports: [StreamService, CeramicSubscriberService, HistorySyncService],
})
export class StreamModule {}
