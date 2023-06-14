import { ApiProperty } from '@nestjs/swagger';
import { SocialLink, Dapp } from 'src/entities/dapp/dapp.entity';
import { Network } from '../../entities/dapp/dapp.entity';

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
  createdAt: number;
  @ApiProperty()
  lastModifiedAt: number;
}

export function convertToDappDto(dapp: Dapp): DappDto {
  const dto = new DappDto();
  dto.id = dapp.getId;
  dto.name = dapp.getName;
  dto.description = dapp.getDescription;
  dto.icon = dapp.getIcon;
  dto.url = dapp.getUrl;
  dto.socialLinks = dapp.getSocialLinks;
  dto.tags = dapp.getTags;
  dto.models = dapp.getModels;
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
