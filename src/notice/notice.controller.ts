import { 
  Controller, 
  Get, 
  Post, 
  Body,
  Param,
  HttpStatus,
} from '@nestjs/common';
import { NoticeService } from './notice.service';
import { NoticeInsertDto } from './dto/notice-insert.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { NoticeSearchDto } from './dto/notice-search.dto';
import { NoticeInsertResponseDto } from './dto/notice-insert.response.dto';
import { NoticeDetailDto } from './dto/notice-detail.dto';

/**
 * 공지사항 컨트롤러
 * 공지사항 조회 및 작성 기능을 제공합니다.
 */
@ApiTags('Notice API')
@Controller('notice')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  /**
   * 공지사항 작성 (관리자용)
   */
  @ApiOperation({ 
    summary: '공지사항 작성 (관리자용)',
    description: '새로운 공지사항을 작성합니다.',
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: '공지사항이 작성되었습니다.',
    type: NoticeInsertResponseDto,
  })
  @Post('insert')
  insertNotice(@Body() noticeInsertDto: NoticeInsertDto) {
    return this.noticeService.noticeInsert(noticeInsertDto);
  }

  /**
   * 공지사항 검색
   */
  @ApiOperation({ 
    summary: '공지사항 검색',
    description: '검색 조건에 맞는 공지사항을 조회합니다.',
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '검색 결과를 반환합니다.',
  })
  @Post('search')
  async searchNotice(@Body() noticeSearchDto: NoticeSearchDto) {
    return await this.noticeService.noticeSearch(noticeSearchDto);
  }

  /**
   * 메인 공지사항 목록 조회
   */
  @ApiOperation({ 
    summary: '메인 공지사항 목록',
    description: '메인 페이지에 표시할 공지사항 목록을 조회합니다.',
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '공지사항 목록을 반환합니다.',
  })
  @Get('main')
  async getMainList() {
    return await this.noticeService.getMainList();
  }

  /**
   * 공지사항 상세 조회
   */
  @ApiOperation({ 
    summary: '공지사항 상세 조회',
    description: '공지사항의 상세 정보를 조회합니다. 조회수가 증가합니다.',
  })
  @ApiParam({ name: 'notice_id', description: '공지사항 ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '공지사항 상세 정보를 반환합니다.',
    type: NoticeDetailDto,
  })
  @Get('detail/:notice_id')
  getNoticeDetail(@Param('notice_id') noticeId: number) {
    return this.noticeService.getNoticeDetail(noticeId);
  }
}
