import { ApiProperty } from '@nestjs/swagger';
import { SocialLink, Dapp, DappComposite, DappModel } from 'src/entities/dapp/dapp.entity';
import { Network } from '../../entities/dapp/dapp.entity';

export class DappCompositeDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  dappId: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  composite: string;
  @ApiProperty()
  graphql: string;
  @ApiProperty()
  runtimeDefinition: string;
  @ApiProperty()
  createdAt: number;
  @ApiProperty()
  lastModifiedAt: number;
}

export class DappModelDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  dappId: number;
  @ApiProperty()
  mdoelStreamId: string;
  @ApiProperty()
  composite: string;
  @ApiProperty()
  graphql: string;
  @ApiProperty()
  runtimeDefinition: string;
  @ApiProperty()
  createdAt: number;
  @ApiProperty()
  lastModifiedAt: number;
}


export function convertToModelDto(model: DappModel): DappModelDto {
  const dto = new DappModelDto();
  dto.id = model.getId;
  dto.dappId = model.getDappId;
  dto.mdoelStreamId = model.getModelStreamId;
  dto.graphql = model.getGraphql;
  dto.composite = model.getComposite;
  dto.runtimeDefinition = model.getRuntimeDefinition;
  dto.createdAt = model.getCreatedAt?.getTime();
  dto.lastModifiedAt = model.getLastModifiedAt?.getTime();
  return dto;
}

export class DappDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  stage: string;
  @ApiProperty()
  type: string;
  @ApiProperty()
  network: Network;
  @ApiProperty()
  icon: string;
  @ApiProperty()
  url: string;
  @ApiProperty()
  socialLinks: SocialLink[];
  @ApiProperty()
  tags: string[];
  @ApiProperty()
  models: string[];
  @ApiProperty()
  schemas: string[];
  @ApiProperty()
  modelDetails: any[];
  @ApiProperty()
  ceramicId?: number;
  // TODO Delete the property
  @ApiProperty()
  modelDetals: any[];
  @ApiProperty()
  schemaDetails: any[];
  @ApiProperty()
  createdAt: number;
  @ApiProperty()
  lastModifiedAt: number;
}

export function convertToDappDto(dapp: Dapp, modelDetailsMap?: Map<number, any[]>, schemaDetails?: Map<number, any[]>): DappDto {
  const dto = new DappDto();
  dto.id = dapp.getId;
  dto.name = dapp.getName;
  dto.description = dapp.getDescription;
  dto.icon = dapp.getIcon;
  dto.url = dapp.getUrl;
  dto.socialLinks = dapp.getSocialLinks;
  dto.tags = dapp.getTags;
  dto.models = dapp.getModels;
  dto.schemas = dapp.getSchemas;
  dto.modelDetails = modelDetailsMap?.get(dapp.getId)??[];
  dto.modelDetals = modelDetailsMap?.get(dapp.getId)??[];
  dto.schemaDetails = schemaDetails?.get(dapp.getId)??[];
  dto.stage = dapp.getStage;
  dto.type = dapp.getType;
  dto.network = dapp.getNetwork;
  dto.createdAt = dapp.getCreatedAt?.getTime();
  dto.lastModifiedAt = dapp.getLastModifiedAt?.getTime();
  return dto;
}

export function convertToDapp(dappDto: DappDto, did: string): Dapp {
  const dapp = new Dapp();
  dapp.setId = dappDto.id;
  dapp.setName = dappDto.name;
  dapp.setDescription = dappDto.description;
  dapp.setIcon = dappDto.icon;
  dapp.setUrl = dappDto.url;
  dapp.setSocialLinks = dappDto.socialLinks;
  dapp.setTags = dappDto.tags;
  dapp.setStage = dappDto.stage;
  dapp.setType = dappDto.type;
  dapp.setNetwork = dappDto.network;
  dapp.setModels = dappDto.models;
  dapp.setCreatedByDid = did;
  return dapp;
}
