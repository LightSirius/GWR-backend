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
} from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { BoardInsertDto } from './dto/board-insert.dto';
import { BoardSearchDto } from './dto/board-search.dto';
import { BoardEsNewestDto } from './dto/board-es-newest.dto';
import { BoardEsScoreDto } from './dto/board-es-score.dto';
import { BoardEsSearchDto } from './dto/board-es-search.dto';
import { BoardBlockDto } from './dto/board-block.dto';

@ApiTags('Board API')
@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get('main-list')
  async board_main_list() {
    return await this.boardService.boardMainList();
  }

  @Post('search')
  async board_search(@Body() boardListDto: BoardSearchDto) {
    return await this.boardService.boardSearch(boardListDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('insert')
  async board_insert(@Body() boardInsertDto: BoardInsertDto, @Request() req) {
    return await this.boardService.boardInsert(boardInsertDto, req.user);
  }

  @Get('detail/:board_id')
  board_detail(@Param('board_id') board_id: number) {
    return this.boardService.board_detail(board_id);
  }

  @Post('block')
  async board_block(@Body() boardBlockDto: BoardBlockDto) {
    return await this.boardService.boardBlock(boardBlockDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('modify/:board_id')
  board_modify(
    @Param('board_id') board_id: string,
    @Body() updateBoardDto: UpdateBoardDto,
    @Request() guard,
  ) {
    return this.boardService.board_modify(
      +board_id,
      updateBoardDto,
      guard.user,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('check-owner/:board_id')
  board_check_owner(@Param('board_id') board_id: string, @Request() guard) {
    return this.boardService.board_check_owner(+board_id, guard.user);
  }

  @Post('search-es')
  board_search_list_es(@Body() boardEsSearchDto: BoardEsSearchDto) {
    return this.boardService.board_search_list_es(boardEsSearchDto);
  }

  @Post('search-es-newest')
  board_search_list_es_newest(@Body() boardEsNewestDto: BoardEsNewestDto) {
    return this.boardService.board_search_list_es_newest(boardEsNewestDto);
  }

  @Post('search-es-score')
  board_search_list_es_score(@Body() boardEsScoreDto: BoardEsScoreDto) {
    return this.boardService.board_search_list_es_score(boardEsScoreDto);
  }
}
