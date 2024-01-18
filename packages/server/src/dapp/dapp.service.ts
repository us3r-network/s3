import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dapp, DappComposite, DappCompositeMapping, DappDomain, DappModel, Network } from 'src/entities/dapp/dapp.entity';
import { DappCompositeMappingRepository, DappCompositeRepository, DappDomainRepository, DappModelRepository, DappRepository } from 'src/entities/dapp/dapp.repository';
import StreamService from 'src/stream/stream.service';
import { ILike, In } from 'typeorm';
import { Network as StreamNetwork } from 'src/entities/stream/stream.entity';
import ModelService from 'src/model/model.service';
import { S3SeverBizDbName } from 'src/common/constants';
@Injectable()
export default class DappService {
  private readonly logger = new Logger(DappService.name);

  constructor(
    @InjectRepository(Dapp, S3SeverBizDbName)
    private readonly dappRepository: DappRepository,
    @InjectRepository(DappComposite, S3SeverBizDbName)
    private readonly dappCompositeRepository: DappCompositeRepository,
    @InjectRepository(DappModel, S3SeverBizDbName)
    private readonly dappModelRepository: DappModelRepository,
    @InjectRepository(DappDomain, S3SeverBizDbName)
    private readonly dappDomainRepository: DappDomainRepository,
    @InjectRepository(DappCompositeMapping, S3SeverBizDbName)
    private readonly dappCompositeMappingRepository: DappCompositeMappingRepository,
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
    if (allMatchedDapps.length == 0 || allMatchedDapps.length < (pageNumber - 1) * pageSize) return [];

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

    const dappIds = orderedDapps.slice((pageNumber - 1) * pageSize, pageNumber * pageSize).map(d => d[0]);
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

  async findCompositesByDappIds(dappIds: number[]): Promise<Map<number, DappComposite[]>> {
    const dappCompositeMappings = await this.dappCompositeMappingRepository.find({ where: { dapp_id: In(dappIds) } });
    const dappCompositeIds = dappCompositeMappings.map(d => d.composite_id);
    const dappComposites = await this.dappCompositeRepository.find({ where: { id: In(dappCompositeIds), is_deleted: false } });

    const dappCompositeMap = new Map<number, DappComposite>();
    dappComposites.forEach(d => { dappCompositeMap.set(d.id, d) });

    const dappIdCompositesMap = new Map<number, DappComposite[]>();
    dappCompositeMappings.forEach(d => {
      if (dappCompositeMap.get(d.composite_id)) {
        const composites = dappIdCompositesMap.get(d.dapp_id) || [];
        composites.push(dappCompositeMap.get(d.composite_id));
        dappIdCompositesMap.set(d.dapp_id, composites);
      }
    });

    return dappIdCompositesMap;
  }

  async saveModel(dappId: number, dappModel: DappModel): Promise<DappModel> {
    const dapp = await this.findDappById(dappId);
    if (!dapp) throw new NotFoundException(`Dapp not found. id: ${dappId}`);

    dappModel.setDappId = dappId;
    dappModel.setLastModifiedAt = new Date();
    return await this.dappModelRepository.save(dappModel);
  }

  // TODO add TX for the following methods
  async saveComposite(dappId: number, dappComposite: DappComposite): Promise<DappComposite> {
    const dapp = await this.findDappById(dappId);
    if (!dapp) throw new NotFoundException(`Dapp not found. id: ${dappId}`);

    const savedDappComposite = await this.dappCompositeRepository.save(dappComposite);

    const dappCompositeMapping = new DappCompositeMapping();
    dappCompositeMapping.setDappId = dappId;
    dappCompositeMapping.setCompositeId = savedDappComposite.getId;
    await this.dappCompositeMappingRepository.save(dappCompositeMapping);
    return savedDappComposite;
  }

  async updateComposite(dappComposite: DappComposite): Promise<DappComposite> {
    if (dappComposite.getId == null) throw new BadRequestException("Composite id is required.");
    return await this.dappCompositeRepository.save(dappComposite);
  }

  // async findCompositesByDappId(dappId: number): Promise<DappComposite[]> {
  //   return await this.dappCompositeRepository.find({ dapp_id: dappId, is_deleted: false });
  // }

  async findModelsByDappId(dappId: number): Promise<DappModel[]> {
    return await this.dappModelRepository.find({ dapp_id: dappId, is_deleted: false });
  }

  async findCompositeById(id: number): Promise<DappComposite> {
    return await this.dappCompositeRepository.findOne({ id: id });
  }


  async findDappsByCompositeId(id: number): Promise<Dapp[]> {
    const dappCompositeMappings = await this.dappCompositeMappingRepository.find({ where: { composite_id: id } });
    if (dappCompositeMappings.length == 0) return [];
    const dappIds = dappCompositeMappings.map(d => d.dapp_id);
    return await this.dappRepository.find({ id: In(dappIds) });
  }

  async findDappsByCompositeIds(ids: number[]): Promise<Map<number, Dapp[]>> {
    const dappCompositeMappings = await this.dappCompositeMappingRepository.find({ where: { composite_id: In(ids) } });
    if (dappCompositeMappings.length == 0) return;

    const dappIds = dappCompositeMappings.map(d => d.dapp_id);
    const dapps = await this.dappRepository.find({ id: In(dappIds) });
    const dappMap = new Map<number, Dapp>();
    dapps.forEach(d => {
      dappMap.set(d.id, d);
    });

    const compositeIdDappsMap = new Map<number, Dapp[]>();
    dappCompositeMappings.forEach(d => {
      const dapps = compositeIdDappsMap.get(d.getCompositeId) || [];
      dapps.push(dappMap.get(d.getDappId));
      compositeIdDappsMap.set(d.getCompositeId, dapps);
    });

    return compositeIdDappsMap;
  }

  async findCompositeByOrder(pageSize: number, pageNumber: number): Promise<DappComposite[]> {
    const composites = await this.dappCompositeRepository.find({ is_deleted: false });
    if (composites.length == 0) return [];

    const compositeIds = composites.map(c => { c.getId });
    const dappComposites = await this.dappCompositeMappingRepository.find({ where: { composite_id: In(compositeIds) } });
    const dappCompositeDappMap = new Map<number, number[]>();
    dappComposites?.forEach(dc => {
      const dappIds = dappCompositeDappMap.get(dc.getCompositeId) || [];
      if (!dappIds.includes(dc.getDappId)) dappIds.push(dc.getDappId);
      dappCompositeDappMap.set(dc.getCompositeId, dappIds);
    }
    );

    const rankedComposites = composites.sort((a, b) => {
      const aDappIds = dappCompositeDappMap.get(a.getId) || [];
      const bDappIds = dappCompositeDappMap.get(b.getId) || [];
      return bDappIds.length - aDappIds.length;
    });
    if (rankedComposites.length < pageNumber * pageSize) return rankedComposites;

    return rankedComposites.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  }

  async deleteCompositeById(id: number): Promise<void> {
    await this.dappCompositeRepository.update({ id: id }, { is_deleted: true });
  }

  async deleteCompositeMapping(dappId: number, composteId: number): Promise<void> {
    await this.dappCompositeMappingRepository.delete({ dapp_id: dappId, composite_id: composteId });
  }

  async createCompositeMapping(dappId: number, composteId: number): Promise<void> {
    await this.dappCompositeMappingRepository.upsert({ dapp_id: dappId, composite_id: composteId }, ['dapp_id', 'composite_id']);
  }

  async deleteModelById(id: number): Promise<void> {
    await this.dappModelRepository.update({ id: id }, { is_deleted: true });
  }

  async deleteDappById(id: number): Promise<void> {
    await this.dappRepository.update({ id: id }, { is_deleted: true });
  }
}
