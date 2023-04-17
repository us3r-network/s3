import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerBehindProxyGuard } from './middlewares/throttler-behind-proxy.guard';
import { StreamModule } from './stream/stream.module';
import { ModelModule } from './model/model.module';
import 'dotenv/config';
import { ScheduleModule } from '@nestjs/schedule';

const env: string | undefined = process.env.NODE_ENV;

@Module({
  imports: [
    // TypeOrmModule.forRootAsync({
    //   useClass: DatabaseConfiguration,
    // }),
    TypeOrmModule.forRoot({
      name: 'testnet',
      port: 5432,
      host: process.env.DATABASE_HOST,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE,
      logging: false,
      entities: ['dist/**/*.entity{.ts,.js}'],
      type: 'postgres',
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
    StreamModule,
    ModelModule,
    RedisModule.forRoot({
      config: {
        url: process.env.REDIS_URL,
      },
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export class AppModule {}
