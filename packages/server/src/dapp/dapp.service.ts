import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dapp, DappComposite } from 'src/entities/dapp/dapp.entity';
import { DappCompositeRepository, DappRepository } from 'src/entities/dapp/dapp.repository';

@Injectable()
export default class DappService {
  private readonly logger = new Logger(DappService.name);

  constructor(
    @InjectRepository(Dapp, 's3-server-db')
    private readonly dappRepository: DappRepository,
    @InjectRepository(DappComposite, 's3-server-db')
    private readonly dappCompositeRepository: DappCompositeRepository,
  ) {}

  async findDappsByDid(did: string): Promise<Dapp[]> {
    return await this.dappRepository.find({
      where: { created_by_did: did, is_deleted: false },
    });
  }
  async findDapps(pageSize: number, pageNumber: number): Promise<Dapp[]> {
    return await this.dappRepository.find({
      where: {is_deleted: false },
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
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

  async saveComposite(dappId: number, dappComposite: DappComposite): Promise<DappComposite> {
    const dapp = await this.findDappById(dappId);
    if (!dapp) throw new NotFoundException(`Dapp not found. id: ${dappId}`);

    dappComposite.setDappId = dappId;
    dappComposite.setLastModifiedAt = new Date();
    return await this.dappCompositeRepository.save(dappComposite);
  }

  async findCompositesByDappId(dappId: number): Promise<DappComposite[]> {
    return await this.dappCompositeRepository.find({dapp_id: dappId, is_deleted: false});
  }

  async deleteCompositeById(id: number): Promise<void> {
    await this.dappCompositeRepository.update({ id: id }, { is_deleted: true });
  }

  async deleteDappById(id: number): Promise<void> {
    await this.dappRepository.update({ id: id }, { is_deleted: true });
  }
}
