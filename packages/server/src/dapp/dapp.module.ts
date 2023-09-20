import { TypeOrmModule } from '@nestjs/typeorm';
import DappService from './dapp.service';
import { DappController } from './dapp.controller';
import { Dapp, DappComposite } from 'src/entities/dapp/dapp.entity';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UserAuthMiddleware } from 'src/middlewares/user-auth.middleware';
import { ModelModule } from 'src/model/model.module';

@Module({
  imports: [TypeOrmModule.forFeature([Dapp, DappComposite], 's3-server-db'), ModelModule],
  controllers: [DappController],
  providers: [DappService],
  exports: [DappService],
})
export class DappModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserAuthMiddleware)
      .exclude({
        path: '/dapps/:id',
        method: RequestMethod.GET,
      }, {
        path: '/dapps/:dappId/composites',
        method: RequestMethod.GET,
      })
      .forRoutes(DappController);
  }
}
