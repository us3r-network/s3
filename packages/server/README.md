# Introduction
Userscan is the explorer for the Ceramic network, which can index all Ceramic streams in real-time and don't have access to the historical state of Ceramic. 
Userscan is completely open source.

# Quick start
1. run a postgres db:  `docker-compose up postgres`
2. config .env for sevice:
    > DATABASE=userscan_db   
    >
    > DATABASE_USER=userscan_user
    >
    > DATABASE_PASSWORD=123456
    >
    > DATABASE_HOST=127.0.0.1
3. run the sevice by development mod: `yarn start:dev` 
4. run the sevice by docker: 
    >`docker build -t userscan . `
    >
    >`docker run userscan`
5. run unit tests: `yarn test`
6. run e2e tests: `yarn test:e2e`

# Code structure
```
├── src
│   ├── app.module.ts
│   ├── entities
│   │   └── stream
│   │       ├── stream.entity.ts
│   │       └── stream.repository.ts
│   ├── filters
│   │   └── all-exceptions.filter.ts
│   ├── main.ts
│   ├── middlewares
│   │   └── throttler-behind-proxy.guard.ts
│   └── stream
│       ├── _test_                                   // unit tests
│       │   └── ceramic.subscriber.service.spec.ts
│       ├── ceramic.subscriber.service.ts            // subscribe ceramic topic on ipfs network by jsp2p
│       ├── dtos
│       │   ├── common.dto.ts
│       │   └── stream.dto.ts
│       ├── stream.controller.ts                     // restful apis
│       ├── stream.module.ts
│       └── stream.service.ts
├── test                                             // e2e tests
│   ├── jest-e2e.json
│   └── stream.e2e-spec.ts
├── .env                      // env config
├── Dockerfile                // server dockerfile
├── LICENSE
├── README.md
├── database.configuration.ts  // db conifg
├── docker-compose.yml    // server & databases(contains the db for e2e test ) docker compose        
├── nest-cli.json
├── package.json
├── tsconfig.build.json
├── tsconfig.json
└── yarn.lock
```
