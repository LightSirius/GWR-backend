import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { BoardInsertDto } from './dto/board-insert.dto';
import { BoardSearchDto } from './dto/board-search.dto';
import { BoardEsNewestDto } from './dto/board-es-newest.dto';
import { BoardEsScoreDto } from './dto/board-es-score.dto';
import { BoardEsSearchDto } from './dto/board-es-search.dto';
import { BoardBlockDto } from './dto/board-block.dto';
import { BoardInsertResponseDto } from './dto/board-insert.response.dto';
import { BoardSearchResponseDto } from './dto/board-search.response.dto';
import { BoardDetailDto } from './dto/board-detail.dto';

/**
 * 게시판 컨트롤러
 * 게시글 CRUD 및 검색 기능을 제공합니다.
 */
@ApiTags('Board API')
@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  /**
   * 메인 게시글 목록 조회
   */
  @ApiOperation({ 
    summary: '메인 게시글 목록 조회',
    description: '메인 페이지에 표시할 게시글 목록을 조회합니다.',
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '게시글 목록을 반환합니다.',
  })
  @Get('main-list')
  async getMainBoardList() {
    return await this.boardService.boardMainList();
  }

  /**
   * 게시글 검색
   */
  @ApiOperation({ 
    summary: '게시글 검색',
    description: '검색 조건에 맞는 게시글을 조회합니다.',
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '검색 결과를 반환합니다.',
    type: BoardSearchResponseDto,
  })
  @Post('search')
  async searchBoard(@Body() boardListDto: BoardSearchDto) {
    return await this.boardService.searchBoard(boardListDto);
  }

  /**
   * 게시글 작성
   */
  @ApiOperation({ 
    summary: '게시글 작성',
    description: '새로운 게시글을 작성합니다. (로그인 필요)',
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: '게시글이 작성되었습니다.',
    type: BoardInsertResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('insert')
  async insertBoard(@Body() boardInsertDto: BoardInsertDto, @Request() req) {
    return await this.boardService.insertBoard(boardInsertDto, req.user);
  }

  /**
   * 게시글 상세 조회
   */
  @ApiOperation({ 
    summary: '게시글 상세 조회',
    description: '게시글의 상세 정보를 조회합니다. 조회수가 증가합니다.',
  })
  @ApiParam({ name: 'board_id', description: '게시글 ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '게시글 상세 정보를 반환합니다.',
    type: BoardDetailDto,
  })
  @Get('detail/:board_id')
  getBoardDetail(@Param('board_id') boardId: number) {
    return this.boardService.getBoardDetail(boardId);
  }

  /**
   * 게시글 차단
   */
  @ApiOperation({ 
    summary: '게시글 차단 (관리자용)',
    description: '부적절한 게시글을 차단합니다.',
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '게시글이 차단되었습니다.',
  })
  @Post('block')
  async blockBoard(@Body() boardBlockDto: BoardBlockDto) {
    return await this.boardService.boardBlock(boardBlockDto);
  }

  /**
   * 게시글 수정
   */
  @ApiOperation({ 
    summary: '게시글 수정',
    description: '자신이 작성한 게시글을 수정합니다.',
  })
  @ApiParam({ name: 'board_id', description: '게시글 ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '게시글이 수정되었습니다.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('modify/:board_id')
  modifyBoard(
    @Param('board_id') boardId: string,
    @Body() updateBoardDto: UpdateBoardDto,
    @Request() guard,
  ) {
    return this.boardService.modifyBoard(
      +boardId,
      updateBoardDto,
      guard.user,
    );
  }

  /**
   * 게시글 작성자 확인
   */
  @ApiOperation({ 
    summary: '게시글 작성자 확인',
    description: '현재 사용자가 게시글 작성자인지 확인합니다.',
  })
  @ApiParam({ name: 'board_id', description: '게시글 ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '작성자면 게시글 정보, 아니면 null을 반환합니다.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('check-owner/:board_id')
  checkBoardOwner(@Param('board_id') boardId: string, @Request() guard) {
    return this.boardService.checkBoardOwner(+boardId, guard.user);
  }

  /**
   * 게시글 검색 (Elasticsearch)
   */
  @ApiOperation({ 
    summary: '게시글 검색 (Elasticsearch)',
    description: 'Elasticsearch를 사용한 게시글 검색입니다.',
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Elasticsearch 검색 결과를 반환합니다.',
  })
  @Post('search-es')
  searchBoardEs(@Body() boardEsSearchDto: BoardEsSearchDto) {
    return this.boardService.searchBoardListEs(boardEsSearchDto);
  }

  /**
   * 게시글 검색 (Elasticsearch - 최신순)
   */
  @ApiOperation({ 
    summary: '게시글 검색 - 최신순',
    description: '최신순으로 정렬된 게시글을 검색합니다.',
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Elasticsearch 검색 결과 (최신순)를 반환합니다.',
  })
  @Post('search-es-newest')
  searchBoardEsNewest(@Body() boardEsNewestDto: BoardEsNewestDto) {
    return this.boardService.searchBoardListEsNewest(boardEsNewestDto);
  }

  /**
   * 게시글 검색 (Elasticsearch - 점수순)
   */
  @ApiOperation({ 
    summary: '게시글 검색 - 점수순',
    description: '검색 점수순으로 정렬된 게시글을 검색합니다.',
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Elasticsearch 검색 결과 (점수순)를 반환합니다.',
  })
  @Post('search-es-score')
  searchBoardEsScore(@Body() boardEsScoreDto: BoardEsScoreDto) {
    return this.boardService.searchBoardListEsScore(boardEsScoreDto);
  }
}
