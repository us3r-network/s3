import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dapp, DappComposite, DappDomain, Network } from 'src/entities/dapp/dapp.entity';
import { DappCompositeRepository, DappDomainRepository, DappRepository } from 'src/entities/dapp/dapp.repository';
import StreamService from 'src/stream/stream.service';
import { ILike } from 'typeorm';
import { Network as StreamNetwork } from 'src/entities/stream/stream.entity';
import ModelService from 'src/model/model.service';
@Injectable()
export default class DappService {
  private readonly logger = new Logger(DappService.name);

  constructor(
    @InjectRepository(Dapp, 's3-server-db')
    private readonly dappRepository: DappRepository,
    @InjectRepository(DappComposite, 's3-server-db')
    private readonly dappCompositeRepository: DappCompositeRepository,
    @InjectRepository(DappDomain, 's3-server-db')
    private readonly dappDomainRepository: DappDomainRepository,
    private readonly streamService: StreamService,
    private readonly modelService: ModelService,
  ) { }

  async getDappDomain(dappId: number, domain: string): Promise<DappDomain> {
    return await this.dappDomainRepository.findOne({ where: { dapp_id: dappId, domain: domain } });
  }

  async saveDappDomain(dappDomain: DappDomain): Promise<DappDomain> {
    return await this.dappDomainRepository.save(dappDomain);
  }

  async findDappsByDid(did: string, pageSize: number, pageNumber: number, name?: string): Promise<Dapp[]> {
    return await this.dappRepository.find({
      where: {
        created_by_did: did,
        name: ILike(`%${name || ''}%`),
        is_deleted: false
      },
      order: {
        created_at: "DESC"
      },
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
    });
  }

  async findDappsByDidAndNetwork(did: string, network: Network, pageSize: number, pageNumber: number, name?: string): Promise<Dapp[]> {
    return await this.dappRepository.find({
      where: {
        created_by_did: did,
        network: network,
        name: ILike(`%${name || ''}%`),
        is_deleted: false
      },
      order: {
        created_at: "DESC"
      },
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
    });
  }

  async findDappsByNetwork(network: Network, pageSize: number, pageNumber: number, name?: string): Promise<Dapp[]> {
    const allMatchedDapps = await this.dappRepository.find({
      where: {
        network: network,
        name: ILike(`%${name || ''}%`),
        is_deleted: false
      },
    });
    if (allMatchedDapps.length == 0 || allMatchedDapps.length < (pageNumber-1)*pageSize) return [];

    const models = new Set<string>();
    allMatchedDapps.forEach(dapp => {
      dapp.getModels?.forEach(m => {
        models.add(m)
      });
    });

    const modelUseCount = await this.modelService.findModelUseCount(StreamNetwork[network.toUpperCase()], Array.from(models));

    const dappUseCount = new Map<number, number>();
    allMatchedDapps.forEach(dapp => {
      if (dapp.getModels?.length > 0) {
        dapp.getModels.forEach(m => {
          dappUseCount.set(dapp.getId, (dappUseCount.get(dapp.getId) || 0) + modelUseCount.get(m));
        });
      } else {
        dappUseCount.set(dapp.getId, 0);
      }
    });
    const orderedDapps = [...dappUseCount.entries()].sort((a, b) => b[1] - a[1]);

    const dappIds = orderedDapps.slice((pageNumber-1)*pageSize, pageNumber*pageSize).map(d => d[0]);
    const dapps: Dapp[] = [];
    const dappMap = new Map<number, Dapp>();
    allMatchedDapps.forEach(dapp => {
      dappMap.set(dapp.getId, dapp);
    });
    dappIds.forEach(id => {
      dapps.push(dappMap.get(id));
    });
    return dapps;
  }

  async findDapps(pageSize: number, pageNumber: number, name?: string): Promise<Dapp[]> {
    return await this.dappRepository.find({
      where: { name: ILike(`%${name || ''}%`), is_deleted: false },
      order: {
        created_at: "DESC"
      },
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
    return await this.dappCompositeRepository.find({ dapp_id: dappId, is_deleted: false });
  }

  async deleteCompositeById(id: number): Promise<void> {
    await this.dappCompositeRepository.update({ id: id }, { is_deleted: true });
  }

  async deleteDappById(id: number): Promise<void> {
    await this.dappRepository.update({ id: id }, { is_deleted: true });
  }
}
