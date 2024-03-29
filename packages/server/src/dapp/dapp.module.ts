import { TypeOrmModule } from '@nestjs/typeorm';
import DappService from './dapp.service';
import { DappController } from './dapp.controller';
import { Dapp, DappComposite, DappCompositeMapping, DappDomain, DappModel } from 'src/entities/dapp/dapp.entity';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UserAuthMiddleware } from 'src/middlewares/user-auth.middleware';
import { ModelModule } from 'src/model/model.module';
import { StreamModule } from 'src/stream/stream.module';
import { S3SeverBizDbName } from 'src/common/constants';

@Module({
  imports: [TypeOrmModule.forFeature([Dapp, DappComposite, DappDomain, DappModel, DappCompositeMapping], S3SeverBizDbName), ModelModule, StreamModule],
  controllers: [DappController],
  providers: [DappService],
  exports: [DappService],
})
export class DappModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserAuthMiddleware)
      .exclude({
        path: '/dapps',
        method: RequestMethod.GET,
      },{
        path: '/dapps/newdata',
        method: RequestMethod.POST,
      }, {
        path: '/dapps/:id',
        method: RequestMethod.GET,
      }, {
        path: '/dapps/:dappId/composites',
        method: RequestMethod.GET,
      })
      .forRoutes(DappController);
  }
}
