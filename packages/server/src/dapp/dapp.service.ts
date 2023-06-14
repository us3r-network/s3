import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dapp } from 'src/entities/dapp/dapp.entity';
import { DappRepository } from 'src/entities/dapp/dapp.repository';

@Injectable()
export default class DappService {
  private readonly logger = new Logger(DappService.name);

  constructor(
    @InjectRepository(Dapp, 's3-server-db')
    private readonly dappRepository: DappRepository,
  ) {}

  async findDappsByDid(did: string): Promise<Dapp[]> {
    return await this.dappRepository.find({
      where: { created_by_did: did, is_deleted: false },
    });
  }

  async save(dapp: Dapp): Promise<Dapp> {
    return await this.dappRepository.save(dapp);
  }

  async findDappById(id: number): Promise<Dapp> {
    return await this.dappRepository.findOne({
      where: { id: id },
    });
  }

  async deleteDappById(id: number): Promise<void> {
    await this.dappRepository.update({ id: id }, { is_deleted: true });
  }
}
