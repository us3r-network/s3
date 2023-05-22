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

export class StatsDto {
  constructor(){
    this.streamsLastWeek = []; 
  }
  @ApiProperty()
  totalModels: number;
  @ApiProperty()
  totalStreams: number;
  @ApiProperty()
  todayModels: number;
  @ApiProperty()
  streamsPerHour: number;
  @ApiProperty()
  streamsLastWeek: number[];
}