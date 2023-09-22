import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BasicMessageDto } from '../common/dto';
import DappService from './dapp.service';
import { DappCompositeDto, DappDto, convertToCompositeDto, convertToDapp, convertToDappDto } from './dtos/dapp.dto';
import IUserRequest from 'src/interfaces/user-request';
import { Dapp, DappComposite, Network } from 'src/entities/dapp/dapp.entity';
import ModelService from 'src/model/model.service';
import { Network as StreamNetwork } from 'src/entities/stream/stream.entity';

@ApiTags('/dapps')
@Controller('/dapps')
export class DappController {
  private readonly logger = new Logger(DappController.name);
  constructor(private readonly dappService: DappService, private readonly modelService: ModelService) { }

  @ApiOkResponse({ type: BasicMessageDto })
  @Post('/')
  async save(@Req() req: IUserRequest, @Body() dto: DappDto) {
    this.logger.log(
      `Save req did ${req.did} dapp. dto: ${JSON.stringify(dto)}`,
    );
    const dapp = convertToDapp(dto, req.did);
    const savedDapp = await this.dappService.save(dapp);
    return new BasicMessageDto('OK.', 0, convertToDappDto(savedDapp));
  }

  @ApiOkResponse({ type: BasicMessageDto })
  @Get('/')
  async findDappsByDid(@Req() req: IUserRequest, @Query('pageSize') pageSize: number,
    @Query('pageNumber') pageNumber: number,
    @Query('network') network: Network = Network.ALL,
    @Query('name') name: string) {
    if (!pageSize || pageSize == 0) pageSize = 50;
    if (!pageNumber || pageNumber == 0) pageNumber = 1;
    this.logger.log(`Find dapps, pageSize ${pageSize} pageNumber ${pageNumber} did ${req.did} name ${name}`);

    let dapps: Dapp[];
    if (req.did) {
      if (network != Network.ALL) {
        dapps = await this.dappService.findDappsByDidAndNetwork(req.did, network, pageSize, pageNumber, name);
      } else {
        dapps = await this.dappService.findDappsByDid(req.did, pageSize, pageNumber, name);
      }
    } else {
      if (network != Network.ALL) {
        dapps = await this.dappService.findDappsByNetwork(network, pageSize, pageNumber, name);
      } else {
        dapps = await this.dappService.findDapps(pageSize, pageNumber, name);
      }
    }

    if (!dapps || dapps.length == 0) {
      return new BasicMessageDto(
        'OK.',
        0,
        []
      );
    }

    const modelDetailsMap = new Map<number, any[]>();
    if (network != Network.ALL) {
      const modelIds = new Set<string>();
      dapps.forEach(dapp => dapp.getModels.forEach(m => modelIds.add(m)));
      const modelDetails = await this.modelService.findModelsByIds(Array.from(modelIds), network == Network.TESTNET ? StreamNetwork.TESTNET : StreamNetwork.MAINNET);
      const modelMap = new Map<string, any>();
      modelDetails?.forEach(modelDetail => {
        modelMap.set(modelDetail.getStreamId, modelDetail);
      });
      dapps.forEach(dapp => {
        const modelDetails = modelDetailsMap.get(dapp.getId)??[];
        dapp.getModels.forEach(m => {
          const modelDetail = modelMap.get(m);
          if (modelDetail) {
            modelDetails.push(modelDetail);
          }
        });
        modelDetailsMap.set(dapp.getId, modelDetails);
      });

      console.log('modelDetailsMap', modelDetailsMap)
    }

    return new BasicMessageDto(
      'OK.',
      0,
      dapps?.map((dapp) => convertToDappDto(dapp, modelDetailsMap)),
    );
  }

  @ApiOkResponse({ type: BasicMessageDto })
  @Get('/:id')
  async findDapp(@Req() req: IUserRequest, @Param('id') id: number) {
    this.logger.log(`Find the dapp by id ${id}`);
    const dapp = await this.dappService.findDappById(+id);
    if (!dapp) throw new NotFoundException(`Dapp not found. id: ${id}`);
    return new BasicMessageDto(
      'OK.',
      0,
      convertToDappDto(dapp),
    );
  }

  @ApiOkResponse({ type: BasicMessageDto })
  @Delete('/:id')
  async deleteDappById(@Req() req: IUserRequest, @Param('id') id: string) {
    this.logger.log(`Delete dapp by id ${id}`);
    const dapp = await this.dappService.findDappById(+id);
    if (!dapp) throw new NotFoundException(`Dapp not found. id: ${id}`);
    if (dapp.getCreatedByDid !== req.did)
      throw new BadRequestException(
        `Dapp did not match. dapp.did: ${dapp.getCreatedByDid}, req.did: ${req.did}`,
      );
    await this.dappService.deleteDappById(+id);
    return new BasicMessageDto('OK.', 0);
  }


  @ApiOkResponse({ type: BasicMessageDto })
  @Post('/:dappId/composites')
  async saveComposite(@Req() req: IUserRequest, @Param('dappId') dappId: string, @Body() dto: DappCompositeDto) {
    this.logger.log(
      `Save req did ${req.did} dapp. dto: ${JSON.stringify(dto)}`,
    );
    const dapp = await this.dappService.findDappById(+dappId);
    if (!dapp) throw new NotFoundException(`Dapp not found. id: ${dappId}`);
    const compositeInfo = await this.modelService.createAndDeployModel({ network: dapp.getNetwork, graphql: dto.graphql })

    const dappComposite = new DappComposite();
    dappComposite.setComposite = compositeInfo.composite;
    dappComposite.setName = dto.name;
    dappComposite.setGraphql = dto.graphql;
    dappComposite.setRuntimeDefinition = compositeInfo.runtimeDefinition;
    const savedDappComposite = await this.dappService.saveComposite(+dappId, dappComposite);
    return new BasicMessageDto('OK.', 0, convertToCompositeDto(savedDappComposite));
  }

  @ApiOkResponse({ type: BasicMessageDto })
  @Get('/:dappId/composites')
  async findCompositesByDappId(@Req() req: IUserRequest, @Param('dappId') dappId: string) {
    this.logger.log(`Find composites by dappId ${dappId}`);
    const dapp = await this.dappService.findDappById(+dappId);
    if (!dapp) throw new NotFoundException(`Dapp not found. id: ${dappId}`);

    const composites = await this.dappService.findCompositesByDappId(+dappId);
    return new BasicMessageDto(
      'OK.',
      0,
      composites?.map((composite) => convertToCompositeDto(composite)) ?? [],
    );
  }

  @ApiOkResponse({ type: BasicMessageDto })
  @Delete('/:dappId/composites/:id')
  async deleteCompositeById(@Req() req: IUserRequest, @Param('dappId') dappId: string, @Param('id') id: string) {
    this.logger.log(`Delete composite by id ${id}`);
    const dapp = await this.dappService.findDappById(+dappId);
    if (!dapp) throw new NotFoundException(`Dapp not found. id: ${dappId}`);
    if (dapp.getCreatedByDid !== req.did)
      throw new BadRequestException(
        `Dapp did not match. dapp.did: ${dapp.getCreatedByDid}, req.did: ${req.did}`,
      );

    await this.dappService.deleteCompositeById(+id);
    return new BasicMessageDto('OK.', 0);
  }
}
