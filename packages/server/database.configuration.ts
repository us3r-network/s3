import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import 'dotenv/config';

export class DatabaseConfiguration implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    return {
      port: 5432,
      host: process.env.DATABASE_HOST,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE,
      logging: false,
      entities: ['dist/**/*.entity{.ts,.js}'],
      type: 'postgres',
      synchronize: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        }
      }
    }
  }
}