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
import { DappDto, convertToDapp, convertToDappDto } from './dtos/dapp.dto';
import IUserRequest from 'src/interfaces/user-request';

@ApiTags('/dapps')
@Controller('/dapps')
export class DappController {
  private readonly logger = new Logger(DappController.name);
  constructor(private readonly dappService: DappService) { }

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
  async findDappsByDid(@Req() req: IUserRequest) {
    this.logger.log(`Find dapps by did ${req.did}`);
    const dapps = await this.dappService.findDappsByDid(req.did);
    return new BasicMessageDto(
      'OK.',
      0,
      dapps?.map((dapp) => convertToDappDto(dapp)),
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
}
