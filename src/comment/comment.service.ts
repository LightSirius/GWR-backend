import { Logger, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { EntityManager, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { CommentInsertDto } from './dto/comment-insert.dto';
import { GetGetResult } from '@elastic/elasticsearch/lib/api/types';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommentDeleteDto } from './dto/comment-delete.dto';
import { HttpService } from '@nestjs/axios';

/**
 * 댓글 서비스
 * 댓글 CRUD 및 Elasticsearch 연동을 담당합니다.
 */
@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  // Elasticsearch Agent URL
  private readonly ES_AGENT_URL = 'http://host.docker.internal:3100';
  // 댓글 페이지당 개수
  private readonly COMMENTS_PER_PAGE = 10;

  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private readonly httpService: HttpService,
    private readonly entityManager: EntityManager,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  /**
   * 새 댓글 생성
   * @param createCommentDto - 댓글 생성 정보
   * @returns 생성된 댓글 엔티티
   */
  create(createCommentDto: CreateCommentDto) {
    const comment = new Comment(createCommentDto);
    return this.entityManager.save(comment);
  }

  /**
   * 모든 댓글 조회
   * @returns 댓글 목록
   */
  findAll() {
    return this.commentRepository.find();
  }

  /**
   * 댓글 ID로 조회
   * @param commentId - 댓글 ID
   * @returns 댓글 엔티티
   */
  findOne(commentId: number) {
    return this.commentRepository.findOneBy({ comment_id: commentId });
  }

  /**
   * 댓글 수정
   * @param id - 댓글 ID
   * @param updateCommentDto - 수정할 내용
   * @returns 수정된 댓글
   */
  async update(id: number, updateCommentDto: UpdateCommentDto) {
    const comment = await this.findOne(id);
    return this.commentRepository.save({
      ...comment,
      ...updateCommentDto,
    });
  }

  /**
   * 댓글 삭제 (소프트 삭제)
   * @param commentId - 댓글 ID
   * @returns 삭제된 댓글
   */
  async remove(commentId: number) {
    const comment = await this.findOne(commentId);
    comment.is_delete = true;
    return await this.commentRepository.save(comment);
  }

  /**
   * 댓글 작성
   * @param commentInsertDto - 댓글 내용
   * @param guard - 인증된 사용자 정보
   * @returns 작성된 댓글 정보
   */
  async insertComment(
    commentInsertDto: CommentInsertDto,
    guard: { uuid: string },
  ) {
    const comment = await this.create({
      user_uuid: guard.uuid,
      ...commentInsertDto,
    });
    comment.comment_sort_idx =
      comment.comment_reply_id == 0
        ? comment.comment_id
        : comment.comment_reply_id;
    const commentResult = await this.entityManager.save(comment);
    
    if (commentResult) {
      const esGetResult: GetGetResult<{
        board_id: number;
        board_title: string;
        board_contents: string;
        board_type: string;
        user_name: string;
        comment_count?: number;
        view_count?: number;
        recommend_count?: number;
      }> = await this.elasticsearchService.get({
        index: 'board_free',
        id: commentInsertDto.board_id.toString(),
      });

      // Elasticsearch agent를 통해 댓글 수 업데이트
      const post = await this.httpService
        .post(this.ES_AGENT_URL, {
          index: 'board_free',
          id: commentInsertDto.board_id.toString(),
          script: {
            source: 'ctx._source.comment_count =' + await this.getCommentCount(
              commentInsertDto.board_id,
            ),
          },
        })
        .toPromise();
      if (!post.data) {
        this.logger.error('Comment count update failed');
      }

      return commentResult;
    }
  }

  /**
   * 댓글 작성자 확인
   * @param commentId - 댓글 ID
   * @param guard - 인증된 사용자 정보
   * @returns 작성자면 댓글, 아니면 null
   */
  async checkCommentOwner(commentId: number, guard: { uuid: string }) {
    const comment = await this.findOne(commentId);
    return comment.user_uuid == guard.uuid ? comment : null;
  }

  /**
   * 댓글 삭제
   * @param commentDeleteDto - 삭제할 댓글 정보
   * @param guard - 인증된 사용자 정보
   * @returns 업데이트된 댓글 수
   * @throws HttpException - 권한이 없을 때
   */
  async deleteComment(
    commentDeleteDto: CommentDeleteDto,
    guard: { uuid: string },
  ) {
    const comment = await this.checkCommentOwner(
      commentDeleteDto.comment_id,
      guard,
    );
    if (!comment) {
      throw new HttpException('권한이 없습니다.', HttpStatus.FORBIDDEN);
    }

    const commentResult = await this.remove(commentDeleteDto.comment_id);
    if (commentResult) {
      const esGetResult: GetGetResult<{
        board_id: number;
        board_title: string;
        board_contents: string;
        board_type: string;
        user_name: string;
        comment_count?: number;
        view_count?: number;
        recommend_count?: number;
      }> = await this.elasticsearchService.get({
        index: 'board_community',
        id: commentDeleteDto.board_id.toString(),
      });

      const commentCount = await this.getCommentCount(
        commentDeleteDto.board_id,
      );
      const esResult = await this.elasticsearchService.update({
        if_primary_term: 1,
        if_seq_no: esGetResult._seq_no,
        index: 'board_community',
        id: commentDeleteDto.board_id.toString(),
        doc: {
          comment_count: commentCount,
        },
      });

      if (esResult) {
        return commentCount;
      }
    }

    return null;
  }

  /**
   * 게시글의 댓글 목록 조회 (페이징)
   * @param boardId - 게시글 ID
   * @param page - 페이지 번호
   * @returns 댓글 목록 및 전체 페이지 수
   */
  async getCommentList(boardId: number, page: number) {
    const sqlLimit = this.COMMENTS_PER_PAGE;
    const sqlPage = page - 1 > 0 ? page - 1 : 0;
    const sqlOffset = sqlPage * sqlLimit;

    return {
      total_page: Math.ceil(
        (await this.commentRepository.count({
          where: {
            board_id: boardId,
          },
        })) / sqlLimit,
      ),
      comment_list: await this.commentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect(User, 'user', 'comment.user_uuid = user.user_uuid')
        .select([
          'comment.comment_id AS comment_id',
          'comment.comment_reply_id AS comment_reply_id',
          'comment.comment_contents AS comment_contents',
          'comment.is_delete AS is_delete',
          'comment.create_date AS create_date',
          'user.user_name AS user_name',
        ])
        .where('comment.board_id = :board_id', { board_id: boardId })
        .orderBy('comment.comment_sort_idx, comment.comment_id')
        .limit(sqlLimit)
        .offset(sqlOffset)
        .getRawMany(),
    };
  }

  /**
   * 게시글의 댓글 개수 조회
   * @param boardId - 게시글 ID
   * @returns 댓글 개수 (삭제된 댓글 제외)
   */
  async getCommentCount(boardId: number) {
    return await this.commentRepository.count({
      where: { board_id: boardId, is_delete: false },
    });
  }
}
