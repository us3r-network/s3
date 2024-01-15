import { ApiTags } from "@nestjs/swagger";
import UserService from "./user.service";
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Req,
  Param,
  ServiceUnavailableException,
  Res,
  Headers,
} from '@nestjs/common';
import { EmailRequestDto, LinkRequestDto } from "./dtos/link.request.dto";
import IUserRequest from "src/interfaces/user-request";
import { BasicMessageDto } from "src/common/dto";
import { AccountType } from "src/entities/account/account.entity";
@ApiTags('/users')
@Controller('/users')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private readonly userService: UserService) {}

  @Post('/email')
  async linkByEmail(
    @Body() dto: EmailRequestDto,
    @Req() req: IUserRequest,
  ): Promise<BasicMessageDto> {
    const account = await this.userService.getAccount(req.did, AccountType.EMAIL);
    if (!account) {
      throw new BadRequestException('The email has existed.');
    }
    await this.userService.linkByEmail(req.did, dto.email);
    return new BasicMessageDto('OK', 0);
  }

  @Get('/email')
  async getEmail(
    @Body() dto: EmailRequestDto,
    @Req() req: IUserRequest,
  ): Promise<BasicMessageDto> {
    const account = await this.userService.getAccount(req.did, AccountType.EMAIL);
    if (!account) {
      throw new BadRequestException('email not found');
    }
    return new BasicMessageDto('OK', 0, { email: account.getThirdpartyId });
  }

  @Post('/link')
  async link(
    @Body() dto: LinkRequestDto,
    @Req() req: IUserRequest,
  ): Promise<BasicMessageDto> {
    this.logger.log('link data:', dto);

    const account = await this.userService.link(
      req.did,
      dto.code,
      dto.type,
      dto.thirdpartyId,
    );
    return new BasicMessageDto('OK', 0);
  }

}
