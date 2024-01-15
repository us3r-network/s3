import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { S3SeverBizDbName } from "src/common/constants";
import { UserAuthMiddleware } from "src/middlewares/user-auth.middleware";
import { UserController } from "./user.controller";
import { Account } from "src/entities/account/account.entity";


@Module({
  imports: [ 
    TypeOrmModule.forFeature([Account], S3SeverBizDbName),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserAuthMiddleware)
      .forRoutes(UserController);
  }
}
