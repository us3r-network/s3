import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from 'src/entities/account/account.entity';

export class LinkRequestDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  type: AccountType;

  @ApiProperty()
  thirdpartyId: string;

  // @ApiProperty()
  // signature: string;

  // @ApiProperty()
  // payload: string;
}

export class EmailRequestDto {
  @ApiProperty()
  email: string;
}
