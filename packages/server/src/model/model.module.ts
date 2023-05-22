import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CeramicModelMainNet,
  CeramicModelTestNet,
  MetaModel,
  MetaModelMainnet,
} from '../entities/model/model.entity';
import ModelService from './model.service';
import { ModelController } from './model.controller';
import { StreamModule } from '../stream/stream.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MetaModel, CeramicModelTestNet], 'testnet'),
    TypeOrmModule.forFeature([MetaModelMainnet, CeramicModelMainNet], 'mainnet'),
    forwardRef(() => StreamModule),
  ],
  controllers: [ModelController],
  providers: [ModelService],
  exports: [ModelService],
})
export class ModelModule {}
