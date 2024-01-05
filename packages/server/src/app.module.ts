import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerBehindProxyGuard } from './middlewares/throttler-behind-proxy.guard';
import { StreamModule } from './stream/stream.module';
import { ModelModule } from './model/model.module';
import 'dotenv/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from './health/health.module';
import { DappModule } from './dapp/dapp.module';
import { S3NodeServiceDbName, S3SeverBizDbName } from './common/constants';

const env: string | undefined = process.env.NODE_ENV;
function scheduleModule() {
  if (process.env.SCHEDULED) {
    return [ScheduleModule.forRoot()];
  }
  return [];
}
@Module({
  imports: [
    TypeOrmModule.forRoot({
      name: S3SeverBizDbName,
      port: 5432,
      host: process.env.DATABASE_HOST,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE,
      logging: false,
      entities: ['dist/**/dapp.entity{.ts,.js}', 'dist/**/stream.entity{.ts,.js}'],
      type: 'postgres',
      pool: {
        max: 70,
        min: 10,
        idleTimeoutMillis: 600000,
      },
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),

    TypeOrmModule.forRoot({
      name: S3NodeServiceDbName,
      port: 5432,
      host: process.env.DATABASE_HOST,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.NODE_SERVICE_DB_NAME,
      logging: false,
      entities: ['dist/**/ceramic.entity{.ts,.js}'],
      type: 'postgres',
      pool: {
        max: 70,
        min: 10,
        idleTimeoutMillis: 600000,
      },
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),

    TypeOrmModule.forRoot({
      name: 'testnet',
      port: 5432,
      host: process.env.DATABASE_HOST_TESTNET,
      username: process.env.DATABASE_USER_TESTNET,
      password: process.env.DATABASE_PASSWORD_TESTNET,
      database: process.env.DATABASE_TESTNET,
      logging: false,
      entities: ['dist/**/*.entity{.ts,.js}'],
      type: 'postgres',
      pool: {
        max: 70,
        min: 10,
        idleTimeoutMillis: 600000,
      },
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),

    TypeOrmModule.forRoot({
      name: 'mainnet',
      port: 5432,
      host: process.env.DATABASE_HOST_MAINNET,
      username: process.env.DATABASE_USER_MAINNET,
      password: process.env.DATABASE_PASSWORD_MAINNET,
      database: process.env.DATABASE_MAINNET,
      logging: false,
      entities: ['dist/**/*.entity{.ts,.js}'],
      type: 'postgres',
      ssl: true,
      pool: {
        max: 70,
        min: 10,
        idleTimeoutMillis: 600000,
      },
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),

    ThrottlerModule.forRoot({
      ttl: +process.env.THROTTLE_TTL,
      limit: +process.env.THROTTLE_LIMIT,
    }),
    HealthModule,
    StreamModule,
    ModelModule,
    DappModule,
    RedisModule.forRoot({
      config: {
        url: process.env.REDIS_URL,
      },
    }),
  ].concat(scheduleModule()),
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})

export class AppModule { }
