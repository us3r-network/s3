import tracer from './tracer';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Network } from './entities/stream/stream.entity';
import CeramicSubscriberService from './stream/subscriber/ceramic.subscriber.service';
import HistorySyncService from './stream/sync/history-sync.service';

async function bootstrap() {
  // init the apm
  await tracer.start();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = new DocumentBuilder()
    .setTitle('userscan')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors();

  await app.listen(3000);

  // Sync and subscribe to ceramic.
  if (!process.env.DISABLE_P2P_SUB){
    const ceramicSubscriberService = app.get(CeramicSubscriberService);
    await ceramicSubscriberService.initJobQueue();

    // Sync history data from ceramic.
    const historySyncService = app.get(HistorySyncService);
    await historySyncService.init(ceramicSubscriberService.jobQueue);
    await historySyncService.startHistorySync();

    // Subsciber ceramic test network.
    await ceramicSubscriberService.subCeramic(
      Network.TESTNET,
      [
        '/dns4/go-ipfs-ceramic-public-clay-external.3boxlabs.com/tcp/4011/ws/p2p/QmWiY3CbNawZjWnHXx3p3DXsg21pZYTj4CRY1iwMkhP8r3',
        '/dns4/go-ipfs-ceramic-private-clay-external.3boxlabs.com/tcp/4011/ws/p2p/QmQotCKxiMWt935TyCBFTN23jaivxwrZ3uD58wNxeg5npi',
        '/dns4/go-ipfs-ceramic-private-cas-clay-external.3boxlabs.com/tcp/4011/ws/p2p/QmbeBTzSccH8xYottaYeyVX8QsKyox1ExfRx7T1iBqRyCd',
      ],
      ['/ip4/127.0.0.1/tcp/20000/ws'],
      '/ceramic/testnet-clay',
    );
  
    // Subsciber ceramic main network.
    await ceramicSubscriberService.subCeramic(
      Network.MAINNET,
      [
        '/dns4/go-ipfs-ceramic-private-mainnet-external.3boxlabs.com/tcp/4011/ws/p2p/QmXALVsXZwPWTUbsT8G6VVzzgTJaAWRUD7FWL5f7d5ubAL',
        '/dns4/go-ipfs-ceramic-private-cas-mainnet-external.3boxlabs.com/tcp/4011/ws/p2p/QmUvEKXuorR7YksrVgA7yKGbfjWHuCRisw2cH9iqRVM9P8',
      ],
      ['/ip4/127.0.0.1/tcp/30000/ws'],
      '/ceramic/mainnet',
    );
  }
}
bootstrap();
