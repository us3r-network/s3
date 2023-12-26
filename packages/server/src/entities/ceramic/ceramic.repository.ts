import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Ceramic } from './ceramic.entity';
@Injectable()
export class CeramicRepository extends Repository<Ceramic> {}
