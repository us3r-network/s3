import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
@Module({
  controllers: [HealthController],
  imports: [TerminusModule, HttpModule],
})
export class HealthModule {}
