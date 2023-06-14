import { TypeOrmModule } from '@nestjs/typeorm';
import DappService from './dapp.service';
import { DappController } from './dapp.controller';
import { Dapp } from 'src/entities/dapp/dapp.entity';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserAuthMiddleware } from 'src/middlewares/user-auth.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Dapp], 's3-server-db')],
  controllers: [DappController],
  providers: [DappService],
  exports: [DappService],
})
export class DappModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserAuthMiddleware)
      // .exclude({
      //   // path: 'twitter/webhook',
      //   // method: RequestMethod.ALL,
      // })
      .forRoutes(DappController);
  }
}
