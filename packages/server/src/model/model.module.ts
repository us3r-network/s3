import { forwardRef, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CeramicModelMainNet,
  CeramicModelTestNet,
  MetaModelTestNet,
  MetaModelMainnet,
} from '../entities/model/model.entity';
import ModelService from './model.service';
import { ModelController } from './model.controller';
import { StreamModule } from '../stream/stream.module';
import { Stream } from 'src/entities/stream/stream.entity';
import { Dapp, DappDomain } from 'src/entities/dapp/dapp.entity';
import { S3NodeServiceDbName, S3SeverBizDbName } from 'src/common/constants';
import { UserAuthMiddleware } from 'src/middlewares/user-auth.middleware';
import { Ceramic } from 'src/entities/ceramic/ceramic.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [MetaModelTestNet, CeramicModelTestNet],
      'testnet',
    ),
    TypeOrmModule.forFeature(
      [MetaModelMainnet, CeramicModelMainNet],
      'mainnet',
    ),
    TypeOrmModule.forFeature([Stream, Dapp, DappDomain], S3SeverBizDbName),
    TypeOrmModule.forFeature([Ceramic], S3NodeServiceDbName),
    forwardRef(() => StreamModule),
  ],
  controllers: [ModelController],
  providers: [ModelService],
  exports: [ModelService],
})
export class ModelModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserAuthMiddleware)
      .forRoutes( {
        path: '/models/indexing',
        method: RequestMethod.ALL,
      });
  }
}
