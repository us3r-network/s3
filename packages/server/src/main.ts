import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Network } from './entities/stream/stream.entity';
import CeramicSubscriberService from './stream/ceramic.subscriber.service';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = new DocumentBuilder()
    .setTitle('userscan')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.use("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://scan.s3.xyz");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials", true);
    if (req.method == "OPTIONS") {
      res.send(200);
    } else {
      next();
    }
  });


  app.use("/api/*", createProxyMiddleware({
    target: 'https://ceramic-private-clay.3boxlabs.com',
    changeOrigin: true,
  }));

  await app.listen(3000);

  // const ceramicSubscriberService = app.get(CeramicSubscriberService);
  // Sub ceramic test network.
  // await ceramicSubscriberService.SubCeramic(
  //   Network.TESTNET,
  //   [
  //     '/dns4/go-ipfs-ceramic-public-clay-external.3boxlabs.com/tcp/4011/ws/p2p/QmWiY3CbNawZjWnHXx3p3DXsg21pZYTj4CRY1iwMkhP8r3',
  //     '/dns4/go-ipfs-ceramic-public-clay-external.ceramic.network/tcp/4011/ws/p2p/QmSqeKpCYW89XrHHxtEQEWXmznp6o336jzwvdodbrGeLTk',
  //     '/dns4/go-ipfs-ceramic-private-clay-external.3boxlabs.com/tcp/4011/ws/p2p/QmQotCKxiMWt935TyCBFTN23jaivxwrZ3uD58wNxeg5npi',
  //     '/dns4/go-ipfs-ceramic-private-cas-clay-external.3boxlabs.com/tcp/4011/ws/p2p/QmbeBTzSccH8xYottaYeyVX8QsKyox1ExfRx7T1iBqRyCd',
  //   ],
  //   ['/ip4/127.0.0.1/tcp/20000/ws'],
  //   '/ceramic/testnet-clay',
  //   'https://ceramic-clay.3boxlabs.com',
  // );
  // // Sub ceramic main network.
  // await ceramicSubscriberService.SubCeramic(
  //   Network.MAINNET,
  //   [
  //     '/dns4/go-ipfs-ceramic-private-mainnet-external.3boxlabs.com/tcp/4011/ws/p2p/QmXALVsXZwPWTUbsT8G6VVzzgTJaAWRUD7FWL5f7d5ubAL',
  //     '/dns4/go-ipfs-ceramic-private-cas-mainnet-external.3boxlabs.com/tcp/4011/ws/p2p/QmUvEKXuorR7YksrVgA7yKGbfjWHuCRisw2cH9iqRVM9P8',
  //   ],
  //   ['/ip4/127.0.0.1/tcp/30000/ws'],
  //   '/ceramic/mainnet',
  //   'https://ceramic.passport-iam.gitcoin.co/',
  // );
}
bootstrap();
