import { Controller, Get, Post, Body } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { NoticeInsertDto } from './dto/notice-insert.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { NoticeSearchDto } from './dto/notice-search.dto';

@ApiTags('Notice API')
@Controller('notice')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  // @Post()
  // create(@Body() createNoticeDto: CreateNoticeDto) {
  //   return this.noticeService.create(createNoticeDto);
  // }
  //
  // @Get()
  // findAll() {
  //   return this.noticeService.findAll();
  // }
  //
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.noticeService.findOne(+id);
  // }
  //
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateNoticeDto: UpdateNoticeDto) {
  //   return this.noticeService.update(+id, updateNoticeDto);
  // }
  //
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.noticeService.remove(+id);
  // }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  @Post('insert')
  notice_insert(@Body() noticeInsertDto: NoticeInsertDto) {
    return this.noticeService.noticeInsert(noticeInsertDto);
  }

  @Post('search')
  async board_search(@Body() noticeSearchDto: NoticeSearchDto) {
    return await this.noticeService.noticeSearch(noticeSearchDto);
  }

  @Get('main')
  async getMainList() {
    return await this.noticeService.getMainList();
  }
}
