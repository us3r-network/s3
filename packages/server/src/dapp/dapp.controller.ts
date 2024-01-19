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
import { DappCompositeDto, DappDto, DappModelDto, convertToModelDto, convertToDapp, convertToDappDto, convertToCompositeDto } from './dtos/dapp.dto';
import IUserRequest from 'src/interfaces/user-request';
import { Dapp, DappComposite, DappDomain, DappModel, Network } from 'src/entities/dapp/dapp.entity';
import ModelService from 'src/model/model.service';
import { Network as StreamNetwork } from 'src/entities/stream/stream.entity';
import { getDidStrFromDidSession } from 'src/utils/user/user-util';
import StreamService from '../stream/stream.service';
import { ConvertToStream } from 'src/stream/dtos/stream.dto';

@ApiTags('/dapps')
@Controller('/dapps')
export class DappController {
  private readonly logger = new Logger(DappController.name);
  constructor(private readonly dappService: DappService, private readonly modelService: ModelService, private readonly streamService: StreamService) { }

  @ApiOkResponse({ type: BasicMessageDto })
  @Post('/')
  async save(@Req() req: IUserRequest, @Body() dto: DappDto) {
    this.logger.log(
      `Save req did ${req.did} dapp. dto: ${JSON.stringify(dto)}`,
    );
    if (dto.ceramicId && dto.models?.length > 0) {
      await this.modelService.indexModels(dto.models, dto.ceramicId, req.did);
    }
    const dapp = convertToDapp(dto, req.did);
    const savedDapp = await this.dappService.save(dapp);
    return new BasicMessageDto('OK.', 0, convertToDappDto(savedDapp));
  }


  @ApiOkResponse({ type: BasicMessageDto })
  @Get('/composites/:id')
  async findComposite(@Req() req: IUserRequest, @Param('id') compositeId: string) {
    this.logger.log(`Find the composite by id ${compositeId}`);
    const composite = await this.dappService.findCompositeById(+compositeId);
    if (!composite) throw new NotFoundException(`The composite not found. id: ${compositeId}`);

    const dapps = await this.dappService.findDappsByCompositeId(+compositeId);
    let dappDtos: DappDto[];
    if (dapps.length > 0) {
      dappDtos = dapps.map(d => convertToDappDto(d));
    }
    return new BasicMessageDto(
      'OK.',
      0,
      convertToCompositeDto(composite, dappDtos),
    );
  }

  @ApiOkResponse({ type: BasicMessageDto })
  @Post('/composites/:id')
  async updateComposite(@Req() req: IUserRequest, @Param('id') id: string, @Body() dto: DappCompositeDto) {
    this.logger.log(
      `Update req did ${req.did} dapp. dto: ${JSON.stringify(dto)}`,
    );

    const dappComposite = new DappComposite();
    dappComposite.id =+id;
    dappComposite.setComposite = dto.composite;
    dappComposite.setName = dto.name;
    dappComposite.setGraphql = dto.graphql;
    dappComposite.setStreamId = dto.streamId
    dappComposite.setRuntimeDefinition = dto.runtimeDefinition;
    const savedDappComposite = await this.dappService.updateComposite(dappComposite);
    return new BasicMessageDto('OK.', 0, convertToCompositeDto(savedDappComposite));
  }

  @ApiOkResponse({ type: BasicMessageDto })
  @Get('/composites')
  async findComposites(@Req() req: IUserRequest,
    @Query('pageSize')
    pageSize: number = 10,
    @Query('pageNumber')
    pageNumber: number = 1,) {
    this.logger.log(`Find the composite by pageSize: ${pageSize}, pageNumber: ${pageNumber}`);
    const composites = await this.dappService.findCompositeByOrder(pageSize, pageNumber) ?? [];

    if (composites.length > 0) {
      const compositeIds = composites.map(c => c.id);
      const compositeIdDappsMap = await this.dappService.findDappsByCompositeIds(compositeIds);
      return new BasicMessageDto(
        'OK.',
        0,
        composites.map(c => {
          const dapps = compositeIdDappsMap?.get(c.id);
          let dappDto: DappDto[];
          if (dapps?.length > 0) {
            dappDto = dapps.map(d => convertToDappDto(d));
          }
          return convertToCompositeDto(c, dappDto);
        }),
      );
    }

    return new BasicMessageDto(
      'OK.',
      0,
      composites.map(c => convertToCompositeDto(c)),
    );
  }

  @ApiOkResponse({ type: BasicMessageDto })
  @Post('/newdata')
  async updateDappData(@Req() req: IUserRequest) {
    this.logger.log(
      `update dapp data req did ${req.did} dapp.`,
    );

    const networks = [StreamNetwork.TESTNET, StreamNetwork.MAINNET];
    for await (const network of networks) {
      const modelDomainMap = await this.streamService.getModelDomainMap(network);
      const dappModels = new Map<string, string[]>();
      const domains = new Set<string>();
      modelDomainMap.forEach((domain, model) => {
        // buid dapp models
        const paths = domain.split('.');
        if (paths.length > 1) {
          const dapp = paths[paths.length - 2] + '.' + paths[paths.length - 1];
          if (!dappModels.has(dapp)) {
            dappModels.set(dapp, [model]);
          } else {
            dappModels.get(dapp).push(model);
          }
        }
        // buid dapp domains
        domains.add(domain);
      });

      // find dapp if existed by dapp
      for await (const dappModel of dappModels) {
        let dapp: Dapp;
        const dapps = await this.dappService.findDappsByNetwork(network == StreamNetwork.MAINNET ? Network.MAINNET : Network.TESTNET, 1, 1, dappModel[0]);
        if (dapps.length > 0) {
          dapp = dapps[0];
          dapp.setModels = Array.from(new Set(dappModel[1].concat(dapp.getModels)));
        } else {
          dapp = new Dapp();
          dapp.setName = dappModel[0];
          dapp.setNetwork = network == StreamNetwork.MAINNET ? Network.MAINNET : Network.TESTNET;
          dapp.setModels = Array.from(dappModel[1]);
        }
        console.log('Saving dapp', dapp);
        dapp = await this.dappService.save(dapp);
        // Save dapp domain
        for await (const domain of domains) {
          const dappDomain = await this.dappService.getDappDomain(dapp.getId, domain);
          if (!dappDomain) {
            const dappDomain = new DappDomain();
            dappDomain.setDappId = dapp.getId;
            dappDomain.setDomain = domain;
            await this.dappService.saveDappDomain(dappDomain);
            console.log('Saving dapp domain', dappDomain);
          }
        }
      }
    }

    return new BasicMessageDto('OK.', 0);
  }

  @ApiOkResponse({ type: BasicMessageDto })
  @Get('/')
  async findDappsByDid(@Req() req: IUserRequest, @Query('pageSize') pageSize: number,
    @Query('pageNumber') pageNumber: number,
    @Query('network') network: Network = Network.ALL,
    @Query('name') name: string) {
    if (!pageSize || pageSize == 0) pageSize = 50;
    if (!pageNumber || pageNumber == 0) pageNumber = 1;
    let did: string;

    const didSession = req.headers['did-session']
    if (didSession) {
      did = await getDidStrFromDidSession(didSession);
    }
    this.logger.log(`Find dapps, pageSize ${pageSize} pageNumber ${pageNumber} did ${did} dapp name ${name}`);

    let dapps: Dapp[];
    if (did) {
      if (network != Network.ALL) {
        dapps = await this.dappService.findDappsByDidAndNetwork(did, network, pageSize, pageNumber, name);
      } else {
        dapps = await this.dappService.findDappsByDid(did, pageSize, pageNumber, name);
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

    // build model details map
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
        const modelDetails = modelDetailsMap.get(dapp.getId) ?? [];
        dapp.getModels.forEach(m => {
          const modelDetail = modelMap.get(m);
          if (modelDetail) {
            modelDetails.push(modelDetail);
          }
        });
        modelDetailsMap.set(dapp.getId, modelDetails);
      });
    }

    // build schema details map
    const schemaDetailsMap = new Map<number, any[]>();
    if (network != Network.ALL) {
      const schemaIds = new Set<string>();
      dapps.forEach(dapp => dapp.getSchemas.forEach(m => schemaIds.add(m)));
      const schemaDetails = await this.streamService.findStreamsByStreamIds(network == Network.TESTNET ? StreamNetwork.TESTNET : StreamNetwork.MAINNET, Array.from(schemaIds));
      const schemaMap = new Map<string, any>();
      schemaDetails?.forEach(schemaDetail => {
        schemaMap.set(schemaDetail.getStreamId, ConvertToStream(schemaDetail));
      });
      dapps.forEach(dapp => {
        const schemaDetails = schemaDetailsMap.get(dapp.getId) ?? [];
        dapp.getSchemas.forEach(m => {
          const schemaDetail = schemaMap.get(m);
          if (schemaDetail) {
            schemaDetails.push(schemaDetail);
          }
        });
        schemaDetailsMap.set(dapp.getId, schemaDetails);
      });
    }

    // build composites
    const dappCompositesMap = await this.dappService.findCompositesByDappIds(dapps.map(dapp => dapp.getId));

    return new BasicMessageDto(
      'OK.',
      0,
      dapps?.map((dapp) => {
        const dappComposites = dappCompositesMap?.get(dapp.getId);
        console.log('dappComposites', dappComposites);
        let dappCompositeDtos: DappCompositeDto[];
        if (dappComposites) {
          dappCompositeDtos = dappComposites.map(composite => {
            return convertToCompositeDto(composite);
          });
        }

      return convertToDappDto(dapp, modelDetailsMap, schemaDetailsMap, dappCompositeDtos)
      }),
    );
  }

  @ApiOkResponse({ type: BasicMessageDto })
  @Get('/:id')
  async findDapp(@Req() req: IUserRequest, @Param('id') id: number) {
    this.logger.log(`Find the dapp by id ${id}`);
    const dapp = await this.dappService.findDappById(+id);
    if (!dapp) throw new NotFoundException(`Dapp not found. id: ${id}`);
    // build model details
    const modelDetails = await this.modelService.findModelsByIds(dapp.getModels, dapp.getNetwork == Network.TESTNET ? StreamNetwork.TESTNET : StreamNetwork.MAINNET);
    const modelDetailsMap = new Map<number, any[]>();
    modelDetailsMap.set(dapp.getId, modelDetails);
    // build schema details
    const schemaDetails = await this.streamService.findStreamsByStreamIds(dapp.getNetwork == Network.TESTNET ? StreamNetwork.TESTNET : StreamNetwork.MAINNET, dapp.getSchemas);
    const schemaDetailsMap = new Map<number, any[]>();
    schemaDetailsMap.set(dapp.getId, schemaDetails?.map(schemaDetail => ConvertToStream(schemaDetail)) ?? []);

    // build composites
    const dappCompositesMap = await this.dappService.findCompositesByDappIds([+id]);
    const dappComposites = dappCompositesMap?.get(+id);
    let dappCompositeDtos: DappCompositeDto[];
    if (dappComposites) {
      dappCompositeDtos = dappComposites.map(composite => {
        return convertToCompositeDto(composite);
      });
    }

    return new BasicMessageDto(
      'OK.',
      0,
      convertToDappDto(dapp, modelDetailsMap, schemaDetailsMap, dappCompositeDtos),
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

    const dappComposite = new DappComposite();
    dappComposite.setComposite = dto.composite;
    dappComposite.setName = dto.name;
    dappComposite.setGraphql = dto.graphql;
    dappComposite.setStreamId = dto.streamId
    dappComposite.setIsDeleted = false;
    dappComposite.setRuntimeDefinition = dto.runtimeDefinition;
    const savedDappComposite = await this.dappService.saveComposite(+dappId, dappComposite);
    return new BasicMessageDto('OK.', 0, convertToCompositeDto(savedDappComposite));
  }

  @ApiOkResponse({ type: BasicMessageDto })
  @Post('/:dappId/models')
  async saveModel(@Req() req: IUserRequest, @Param('dappId') dappId: string, @Body() dto: DappModelDto) {
    this.logger.log(
      `Save model req did ${req.did} dapp. dto: ${JSON.stringify(dto)}`,
    );
    const dapp = await this.dappService.findDappById(+dappId);
    if (!dapp) throw new NotFoundException(`Dapp not found. id: ${dappId}`);

    const dappModel = new DappModel();
    // TODO store composites to composite table
    dappModel.setComposite = dto.composite;
    dappModel.setModelStreamId = dto.mdoelStreamId;
    dappModel.setGraphql = dto.graphql;
    dappModel.setRuntimeDefinition = dto.runtimeDefinition;
    const savedDappModel = await this.dappService.saveModel(+dappId, dappModel);
    return new BasicMessageDto('OK.', 0, convertToModelDto(savedDappModel));
  }

  @ApiOkResponse({ type: BasicMessageDto })
  @Get('/:dappId/models')
  async findModelsByDappId(@Req() req: IUserRequest, @Param('dappId') dappId: string) {
    this.logger.log(`Find models by dappId ${dappId}`);
    const dapp = await this.dappService.findDappById(+dappId);
    if (!dapp) throw new NotFoundException(`Dapp not found. id: ${dappId}`);

    const models = await this.dappService.findModelsByDappId(+dappId);
    return new BasicMessageDto(
      'OK.',
      0,
      models?.map((model) => convertToModelDto(model)) ?? [],
    );
  }

  @ApiOkResponse({ type: BasicMessageDto })
  @Get('/:dappId/composites')
  async findCompositesByDappId(@Req() req: IUserRequest, @Param('dappId') dappId: string) {
    this.logger.log(`Find models by dappId ${dappId}`);
    const dapp = await this.dappService.findDappById(+dappId);
    if (!dapp) throw new NotFoundException(`Dapp not found. id: ${dappId}`);

    const conposites = await this.dappService.findCompositesByDappId(+dappId);
    return new BasicMessageDto(
      'OK.',
      0,
      conposites?.map((conposite) => convertToCompositeDto(conposite)) ?? [],
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

    await this.dappService.deleteCompositeMapping(+dappId, +id);
    return new BasicMessageDto('OK.', 0);
  }

  @ApiOkResponse({ type: BasicMessageDto })
  @Post('/:dappId/composites/:id/bindings')
  async bindingCompositeById(@Req() req: IUserRequest, @Param('dappId') dappId: string, @Param('id') id: string) {
    this.logger.log(`Bind dapp ${dappId} with composite by id ${id}`);
    const dapp = await this.dappService.findDappById(+dappId);
    if (!dapp) throw new NotFoundException(`Dapp not found. id: ${dappId}`);
    if (dapp.getCreatedByDid !== req.did)
      throw new BadRequestException(
        `Dapp did not match. dapp.did: ${dapp.getCreatedByDid}, req.did: ${req.did}`,
      );

    await this.dappService.createCompositeMapping(+dappId, +id);
    return new BasicMessageDto('OK.', 0);
  }

  @ApiOkResponse({ type: BasicMessageDto })
  @Delete('/:dappId/models/:id')
  async deleteModelById(@Req() req: IUserRequest, @Param('dappId') dappId: string, @Param('id') id: string) {
    this.logger.log(`Delete model by id ${id}`);
    const dapp = await this.dappService.findDappById(+dappId);
    if (!dapp) throw new NotFoundException(`Dapp not found. id: ${dappId}`);
    if (dapp.getCreatedByDid !== req.did)
      throw new BadRequestException(
        `Dapp did not match. dapp.did: ${dapp.getCreatedByDid}, req.did: ${req.did}`,
      );

    await this.dappService.deleteModelById(+id);
    return new BasicMessageDto('OK.', 0);
  }
}
