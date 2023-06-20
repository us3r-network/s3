import { ApiProperty } from '@nestjs/swagger';

export class BasicMessageDto {
  constructor(msg: string, code?: number, data?: any) {
    this.msg = msg;
    this.code = code;
    this.data = data;
  }
  @ApiProperty()
  private msg: string;
  @ApiProperty()
  private code: number;
  @ApiProperty()
  private data: any;
}
