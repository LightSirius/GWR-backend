import { Body, Controller, Get, Redirect, Res } from '@nestjs/common';
import { NiceService } from './nice.service';
import { ApiTags } from '@nestjs/swagger';
import { NiceCheckDto } from './dto/nice-check.dto';

@ApiTags('Nice API')
@Controller('nice')
export class NiceController {
  constructor(private readonly niceService: NiceService) {}

  @Get('check')
  async checkPlus(@Body() niceCheckDto: NiceCheckDto) {
    return await this.niceService.checkPlus(niceCheckDto);
  }
}
