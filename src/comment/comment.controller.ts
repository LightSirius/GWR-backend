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
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CommentInsertDto } from './dto/comment-insert.dto';
import { CommentDeleteDto } from './dto/comment-delete.dto';

/**
 * 댓글 컨트롤러
 * 댓글 CRUD 기능을 제공합니다.
 */
@ApiTags('Comment API')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentService.create(createCommentDto);
  }

  @Get()
  findAll() {
    return this.commentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(+id, updateCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentService.remove(+id);
  }

  /**
   * 댓글 작성
   */
  @ApiOperation({ 
    summary: '댓글 작성',
    description: '게시글에 댓글을 작성합니다. (로그인 필요)',
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: '댓글이 작성되었습니다.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('insert')
  async insertComment(
    @Body() commentInsertDto: CommentInsertDto,
    @Request() guard,
  ) {
    return await this.commentService.insertComment(
      commentInsertDto,
      guard.user,
    );
  }

  /**
   * 댓글 삭제
   */
  @ApiOperation({ 
    summary: '댓글 삭제',
    description: '자신이 작성한 댓글을 삭제합니다.',
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '댓글이 삭제되었습니다.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('delete')
  async deleteComment(
    @Body() commentDeleteDto: CommentDeleteDto,
    @Request() guard,
  ) {
    return await this.commentService.deleteComment(
      commentDeleteDto,
      guard.user,
    );
  }

  /**
   * 댓글 목록 조회
   */
  @ApiOperation({ 
    summary: '댓글 목록 조회',
    description: '특정 게시글의 댓글 목록을 페이징하여 조회합니다.',
  })
  @ApiParam({ name: 'board_id', description: '게시글 ID' })
  @ApiParam({ name: 'page', description: '페이지 번호 (1부터 시작)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '댓글 목록을 반환합니다.',
  })
  @Get('list/:board_id/:page')
  getCommentList(
    @Param('board_id') boardId: number,
    @Param('page') page: number,
  ) {
    return this.commentService.getCommentList(+boardId, +page);
  }

  /**
   * 댓글 개수 조회
   */
  @ApiOperation({ 
    summary: '댓글 개수 조회',
    description: '특정 게시글의 댓글 개수를 조회합니다.',
  })
  @ApiParam({ name: 'board_id', description: '게시글 ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '댓글 개수를 반환합니다.',
  })
  @Get('count/:board_id')
  getCommentCount(@Param('board_id') boardId: number) {
    return this.commentService.getCommentCount(boardId);
  }
}
