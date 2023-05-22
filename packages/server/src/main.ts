import tracer from './tracer';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Network } from './entities/stream/stream.entity';
import CeramicSubscriberService from './stream/ceramic.subscriber.service';

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

  const ceramicSubscriberService = app.get(CeramicSubscriberService);

  // Sub ceramic test network.
  await ceramicSubscriberService.subCeramic(
    Network.TESTNET,
    [
      '/dns4/go-ipfs-ceramic-public-clay-external.3boxlabs.com/tcp/4011/ws/p2p/QmWiY3CbNawZjWnHXx3p3DXsg21pZYTj4CRY1iwMkhP8r3',
      '/dns4/go-ipfs-ceramic-private-clay-external.3boxlabs.com/tcp/4011/ws/p2p/QmQotCKxiMWt935TyCBFTN23jaivxwrZ3uD58wNxeg5npi',
      '/dns4/go-ipfs-ceramic-private-cas-clay-external.3boxlabs.com/tcp/4011/ws/p2p/QmbeBTzSccH8xYottaYeyVX8QsKyox1ExfRx7T1iBqRyCd',
    ],
    ['/ip4/127.0.0.1/tcp/20000/ws'],
    '/ceramic/testnet-clay',
    // 'https://ceramic-clay.3boxlabs.com/'
    'http://ad497108e5a364981b9c97eb1fd3fb47-710717156.ap-southeast-1.elb.amazonaws.com:7007/'
  );

  // Sub ceramic main network.
  await ceramicSubscriberService.subCeramic(
    Network.MAINNET,
    [
      '/dns4/go-ipfs-ceramic-private-mainnet-external.3boxlabs.com/tcp/4011/ws/p2p/QmXALVsXZwPWTUbsT8G6VVzzgTJaAWRUD7FWL5f7d5ubAL',
      '/dns4/go-ipfs-ceramic-private-cas-mainnet-external.3boxlabs.com/tcp/4011/ws/p2p/QmUvEKXuorR7YksrVgA7yKGbfjWHuCRisw2cH9iqRVM9P8',
    ],
    ['/ip4/127.0.0.1/tcp/30000/ws'],
    '/ceramic/mainnet',
    // 'https://gateway.ceramic.network/',
    'http://a9f6aaba5bc61415286ccee3220ec9f5-1768786203.ap-southeast-1.elb.amazonaws.com:7007/'
  );
}
bootstrap();
