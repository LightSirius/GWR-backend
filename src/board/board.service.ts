import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisClientType } from 'redis';
import { isEmpty } from '../utils/utill';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  GetGetResult,
  SearchResponse,
} from '@elastic/elasticsearch/lib/api/types';
import { RecommendService } from '../recommend/recommend.service';
import { Board, BoardType } from './entities/board.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardDetailDto } from './dto/board-detail.dto';
import { BoardInsertDto } from './dto/board-insert.dto';
import { BoardModifyDto } from './dto/board-modify.dto';
import { BoardSearchDto, SearchType, SortType } from './dto/board-search.dto';
import { BoardEsNewestDto } from './dto/board-es-newest.dto';
import { BoardEsScoreDto } from './dto/board-es-score.dto';
import { BoardEsSearchDto } from './dto/board-es-search.dto';
import {
  BoardEsNewestPayload,
  BoardEsScorePayload,
  BoardEsSearchPayload,
} from './payload/board-es.payload';
import { AuthTokenPayloadDto } from '../auth/dto/auth-token-payload.dto';
import {
  BoardInsertResponseDto,
  StatusType,
} from './dto/board-insert.response.dto';
import { UserService } from '../user/user.service';
import { BoardListPayload } from './payload/board-list.payload';
import { HttpService } from '@nestjs/axios';
import {
  BoardSearchHitSource,
  BoardSearchResponseDto,
} from './dto/board-search.response.dto';
import { BoardBlockDto } from './dto/board-block.dto';
import { BoardBlockResponseDto, Status } from './dto/board-block.response.dto';
import { 
  BOARD_INDEX, 
  BOARD_REDIS_KEYS, 
  BOARD_SEARCH_CONFIG,
  ELASTICSEARCH_AGENT_URL,
  BOARD_MESSAGES,
  BOARD_ERROR_MESSAGES,
} from './constants/board.constants';

/**
 * 게시판 서비스
 * 게시글 CRUD, 검색, Elasticsearch 연동을 담당합니다.
 */
@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: RedisClientType,
    private readonly httpService: HttpService,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    private readonly entityManager: EntityManager,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly recommendService: RecommendService,
    private readonly userService: UserService,
  ) {}

  /**
   * 새 게시글 생성
   * @param createBoardDto - 게시글 생성 정보
   * @returns 생성된 게시글 엔티티
   */
  create(createBoardDto: CreateBoardDto) {
    const board = new Board(createBoardDto);
    return this.entityManager.save(board);
  }

  /**
   * 모든 게시글 조회
   * @returns 게시글 목록
   */
  async findAll() {
    return this.boardRepository.find();
  }

  /**
   * 게시글 ID로 조회
   * @param boardId - 게시글 ID
   * @returns 게시글 엔티티
   */
  async findOne(boardId: number) {
    return this.boardRepository.findOneBy({ board_id: boardId });
  }

  /**
   * 게시글 수정
   * @param id - 게시글 ID
   * @param updateBoardDto - 수정할 내용
   * @returns 수정된 게시글
   */
  async update(id: number, updateBoardDto: UpdateBoardDto) {
    const board = await this.findOne(id);
    return await this.boardRepository.save({ ...board, ...updateBoardDto });
  }

  /**
   * 게시글 삭제 (소프트 삭제)
   * @param id - 게시글 ID
   * @returns 삭제 메시지
   */
  remove(id: number) {
    return `This action removes a #${id} board`;
  }

  /**
   * 게시판 타입에 해당하는 Elasticsearch 인덱스 이름 반환
   * @param boardType - 게시판 타입
   * @returns Elasticsearch 인덱스 이름
   */
  boardTypeToIndex(boardType: BoardType) {
    switch (boardType) {
      case BoardType.free: {
        return BOARD_INDEX.FREE;
      }
      case BoardType.ucc: {
        return BOARD_INDEX.UCC;
      }
      case BoardType.tips: {
        return BOARD_INDEX.TIPS;
      }
    }
  }

  /**
   * 새 게시글 등록
   * @param boardInsertDto - 게시글 내용
   * @param guard - 인증된 사용자 정보
   * @returns 게시글 등록 결과
   */
  async insertBoard(
    boardInsertDto: BoardInsertDto,
    guard: AuthTokenPayloadDto,
  ): Promise<BoardInsertResponseDto> {
    const user = await this.userService.findOneWithAuth(guard.uuid);
    if (!user) {
      return { status: StatusType.error, board_id: 0, board_type: boardInsertDto.board_type };
    }
    // if (!user.member_cuid) {
    //   return { status: StatusType.notsetcuid, board_id: 0 };
    // }

    // const game_info = await this.userService.user_game_info_detail(
    //   user.member_uuid.toString(),
    //   user.member_cuid.toString(),
    // );

    const game_info = {
      NickName: user.user_name.toString(),
    };

    const board = await this.create({
      user_uuid: guard.uuid,
      user_name: game_info.NickName,
      ...boardInsertDto,
    });
    if (!board) {
      return { status: StatusType.error, board_id: 0, board_type: boardInsertDto.board_type };
    }

    const es_result = await this.elasticsearchService.create({
      index: this.boardTypeToIndex(board.board_type),
      id: board.board_id.toString(),
      document: {
        board_id: board.board_id,
        board_title: board.board_title,
        board_contents: boardInsertDto.board_contents_es,
        board_type: board.board_type,
        board_category: board.board_category,
        user_name: board.user_name,
        info_delete: false,
        info_block: false,
        create_date: board.create_date,
        comment_count: 0,
        view_count: 0,
        recommend_count: 0,
      },
    });
    if (!es_result) {
      this.logger.error(`insertBoard: Elasticsearch generation failed`);
      return { status: StatusType.error, board_id: 0, board_type: boardInsertDto.board_type };
    }

    return { status: StatusType.success, board_id: board.board_id, board_type: boardInsertDto.board_type };
  }

  /**
   * 게시글 검색 (Elasticsearch)
   * @param boardSearchDto - 검색 조건
   * @returns 검색 결과
   */
  async searchBoard(
    boardSearchDto: BoardSearchDto,
  ): Promise<BoardSearchResponseDto> {
    if (
      boardSearchDto.search_type != null &&
      boardSearchDto.search_string == null
    ) {
      return { total_count: 0, board_summary: [] };
    }
    if (
      boardSearchDto.sort_type == SortType.score &&
      (boardSearchDto.search_string == null ||
        boardSearchDto.search_string == '')
    ) {
      return { total_count: 0, board_summary: [] };
    }

    const now = Date.now();

    const search_sql: BoardListPayload = {
      index: this.boardTypeToIndex(boardSearchDto.board_type),
      size: boardSearchDto.search_size ? boardSearchDto.search_size : 20,
      query: {
        bool: {
          filter: [
            {
              term: {
                board_category: boardSearchDto.board_category,
              },
            },
          ],
        },
      },
      track_total_hits: true,
    };

    switch (boardSearchDto.search_type) {
      case SearchType.contents: {
        search_sql.query.bool.must = {
          match: { board_title: boardSearchDto.search_string },
        };
        break;
      }
      case SearchType.title: {
        search_sql.query.bool.must = {
          match: { board_contents: boardSearchDto.search_string },
        };
        break;
      }
      case SearchType.username: {
        search_sql.query.bool.must = {
          match: { user_name: boardSearchDto.search_string },
        };
        break;
      }
      default: {
        if (boardSearchDto.sort_type == SortType.score) {
          search_sql.query.bool.must = {
            match: { board_contents: boardSearchDto.search_string },
          };
        }
        break;
      }
    }

    if (boardSearchDto.sort_type == SortType.newest) {
      search_sql.sort = [{ board_id: { order: 'desc' } }];
    }
    boardSearchDto.search_page--;
    if (boardSearchDto.search_page != 0 && boardSearchDto.search_page > 0) {
      search_sql.from = boardSearchDto.search_size
        ? boardSearchDto.search_size * boardSearchDto.search_page
        : 20 * boardSearchDto.search_page;
    }

    const board_data: SearchResponse =
      await this.elasticsearchService.search(search_sql);

    const boardSearchResponse: BoardSearchResponseDto = {
      total_count:
        typeof board_data.hits.total != 'number'
          ? board_data.hits.total.value
          : 0,
      board_summary: [],
    };

    board_data.hits.hits.forEach((hits: BoardSearchHitSource) => {
      boardSearchResponse.board_summary.push({
        board_id: +hits._id,
        board_title:
          hits._source.info_delete || hits._source.info_block
            ? BOARD_MESSAGES.DELETED_TITLE
            : hits._source.board_title,
        user_name: hits._source.user_name,
        info_delete: hits._source.info_delete,
        info_block: hits._source.info_block,
        create_date: hits._source.create_date,
        comment_count: hits._source.comment_count,
        view_count: hits._source.view_count,
        recommend_count: hits._source.recommend_count,
      });
    });

    this.logger.log(`Board search completed in ${Date.now() - now}ms`);

    return boardSearchResponse;
  }

  async boardMainList() {}

  async boardBlock(
    boardBlockDto: BoardBlockDto,
  ): Promise<BoardBlockResponseDto> {
    const board = await this.findOne(boardBlockDto.board_id);
    if (!board) {
      return {
        status: Status.fail,
        board_id: boardBlockDto.board_id,
        board_type: boardBlockDto.board_type,
      };
    }

    board.info_block = true;
    const result = await this.boardRepository.save(board);

    if (!result) {
      return {
        status: Status.error,
        board_id: boardBlockDto.board_id,
        board_type: boardBlockDto.board_type,
      };
    }

    return {
      status: Status.success,
      board_id: boardBlockDto.board_id,
      board_type: boardBlockDto.board_type,
    };
  }

  /**
   * 게시글 상세 조회 (조회수 증가)
   * @param boardId - 게시글 ID
   * @returns 게시글 상세 정보
   * @throws HttpException - 게시글을 찾을 수 없을 때
   */
  async getBoardDetail(boardId: number): Promise<BoardDetailDto> {
    let boardDetailData = new BoardDetailDto();

    if (await this.redis.hExists(BOARD_REDIS_KEYS.DETAIL_LIST, boardId.toString())) {
      boardDetailData = {
        ...JSON.parse(
          await this.redis.hGet(BOARD_REDIS_KEYS.DETAIL_LIST, boardId.toString()),
        ),
      };
    } else {
      boardDetailData = {
        ...(await this.findOne(boardId)),
        near_board_list: null,
      };
    }

    if (isEmpty(boardDetailData)) {
      throw new HttpException(BOARD_ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this.redis.hSet(
      BOARD_REDIS_KEYS.DETAIL_LIST,
      boardId.toString(),
      JSON.stringify(boardDetailData),
    );

    await this.redis.multi();

    // Elasticsearch agent를 통해 조회수 증가
    const post = await this.httpService
      .post(ELASTICSEARCH_AGENT_URL, {
        index: BOARD_INDEX.FREE,
        id: boardId.toString(),
        script: {
          source: 'ctx._source.view_count += 1',
        },
      })
      .toPromise();
    if (!post.data) {
      this.logger.error(BOARD_ERROR_MESSAGES.VIEW_COUNT_UPDATE_FAILED);
    }

    const es_get_result: GetGetResult<{
      board_id: number;
      board_title: string;
      board_contents: string;
      board_type: string;
      user_name: string;
      comment_count?: number;
      view_count?: number;
      recommend_count?: number;
    }> = await this.elasticsearchService.get({
      index: BOARD_INDEX.FREE,
      id: boardId.toString(),
    });

    boardDetailData.view_count = es_get_result._source.view_count;
    boardDetailData.comment_count = es_get_result._source.comment_count;
    boardDetailData.recommend_count = es_get_result._source.recommend_count;

    boardDetailData.near_board_list = {
      ...(await this.entityManager.query(
        'select board_id, board_type, board_title, create_date ' +
          'from (select board_id, board_type, board_title, create_date ' +
          'from board where board_id < $1 and board_type = $2 order by board_id DESC limit 1) as before_detail ' +
          'union all ' +
          'select board_id, board_type, board_title, create_date ' +
          'from (select board_id, board_type, board_title, create_date ' +
          'from board where board_id > $1 and board_type = $2 order by board_id limit 1) as after_detail',
        [boardId, boardDetailData.board_type],
      )),
    };

    return boardDetailData;
  }

  /**
   * 게시글 수정
   * @param id - 게시글 ID
   * @param boardModifyDto - 수정할 내용
   * @param guard - 인증된 사용자 정보
   * @returns 수정된 게시글 ID
   * @throws HttpException - 권한이 없거나 수정 실패 시
   */
  async modifyBoard(
    id: number,
    boardModifyDto: BoardModifyDto,
    guard: { uuid: string; name: string },
  ) {
    const board = await this.checkBoardOwner(id, guard);

    if (!board) {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }

    boardModifyDto.user_name = guard.name;

    const change_board = await this.update(id, boardModifyDto);

    await this.redis.hDel('board_detail_list', id.toString());

    const es_result = await this.elasticsearchService.update({
      index: 'board_community',
      id: change_board.board_id.toString(),
      doc: {
        board_id: change_board.board_id,
        board_title: change_board.board_title,
        board_contents: change_board.board_contents,
        board_type: change_board.board_type,
        user_name: change_board.user_name,
      },
    });
    if (!es_result) {
      throw new HttpException(
        'Generation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return change_board.board_id;
  }

  /**
   * 게시글 작성자 확인
   * @param boardId - 게시글 ID
   * @param guard - 인증된 사용자 정보
   * @returns 작성자가 맞으면 게시글, 아니면 null
   */
  async checkBoardOwner(
    boardId: number,
    guard: { uuid: string },
  ): Promise<Board | null> {
    const board = await this.findOne(boardId);
    if (board.user_uuid == guard.uuid) {
      return board;
    } else {
      return null;
    }
  }

  /**
   * 게시글 검색 (Elasticsearch - 검색어 기반)
   * @param boardEsSearchDto - 검색 조건
   * @returns Elasticsearch 검색 결과
   * @throws HttpException - 잘못된 검색 파라미터
   */
  async searchBoardListEs(boardEsSearchDto: BoardEsSearchDto) {
    if (
      boardEsSearchDto.search_type != 0 &&
      boardEsSearchDto.search_string == ''
    ) {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }

    const now = Date.now();

    const search_sql: BoardEsSearchPayload = {
      index: 'board_free',
      size: 20,
      query: {
        bool: {
          filter: [
            {
              term: {
                board_type: boardEsSearchDto.board_type,
              },
            },
          ],
        },
      },
      track_total_hits: true,
    };

    switch (boardEsSearchDto.search_type) {
      case 1: {
        search_sql.query.bool.must = {
          match: { board_title: boardEsSearchDto.search_string },
        };
        break;
      }
      case 2: {
        search_sql.query.bool.must = {
          match: { board_contents: boardEsSearchDto.search_string },
        };
        break;
      }
      case 3: {
        search_sql.query.bool.must = {
          match: { user_name: boardEsSearchDto.search_string },
        };
        break;
      }
      default: {
        if (boardEsSearchDto.sort_type == 0) {
          search_sql.query.bool.must = {
            match: { board_contents: boardEsSearchDto.search_string },
          };
        }
        break;
      }
    }

    if (boardEsSearchDto.sort_type == 1) {
      search_sql.sort = [{ board_id: { order: 'desc' } }];
    }

    if (boardEsSearchDto.search_from != 0) {
      search_sql.from = boardEsSearchDto.search_from;
    }

    const board_data: SearchResponse =
      await this.elasticsearchService.search(search_sql);
    this.logger.log(`Elasticsearch search completed in ${Date.now() - now}ms`);

    return board_data;
  }

  /**
   * 게시글 검색 (Elasticsearch - 최신순 정렬)
   * @param boardEsNewestDto - 검색 조건
   * @returns Elasticsearch 검색 결과 (최신순)
   * @throws HttpException - 잘못된 검색 파라미터
   */
  async searchBoardListEsNewest(boardEsNewestDto: BoardEsNewestDto) {
    const now = Date.now();

    const search_sql: BoardEsNewestPayload = {
      index: 'board_free',
      size: 20,
      sort: [
        {
          board_id: {
            order: 'desc',
          },
        },
      ],
      query: {
        bool: {
          must: {
            match: {},
          },
          filter: [
            {
              term: {
                board_type: boardEsNewestDto.board_type,
              },
            },
          ],
        },
      },
      track_total_hits: true,
    };

    if (
      boardEsNewestDto.search_type != 0 &&
      boardEsNewestDto.search_string == ''
    ) {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }

    switch (boardEsNewestDto.search_type) {
      case 1: {
        search_sql.query.bool.must.match.board_title =
          boardEsNewestDto.search_string;
        break;
      }
      case 2: {
        search_sql.query.bool.must.match.board_contents =
          boardEsNewestDto.search_string;
        break;
      }
      case 3: {
        search_sql.query.bool.must.match.user_name =
          boardEsNewestDto.search_string;
        break;
      }
      default: {
        break;
      }
    }

    if (boardEsNewestDto.search_after != 0) {
      search_sql.search_after = [boardEsNewestDto.search_after];
    }

    const board_data = await this.elasticsearchService.search(search_sql);
    this.logger.log(
      `Elasticsearch newest search completed in ${Date.now() - now}ms`,
    );

    return board_data;
  }

  /**
   * 게시글 검색 (Elasticsearch - 검색 점수 기반 정렬)
   * @param boardEsScoreDto - 검색 조건
   * @returns Elasticsearch 검색 결과 (점수순)
   */
  async searchBoardListEsScore(boardEsScoreDto: BoardEsScoreDto) {
    const now = Date.now();

    const search_sql: BoardEsScorePayload = {
      index: 'board_free',
      size: 20,
      query: {
        bool: {
          must: {
            match: {},
          },
          filter: [
            {
              term: {
                board_type: boardEsScoreDto.board_type,
              },
            },
          ],
        },
      },
      track_total_hits: true,
    };

    switch (boardEsScoreDto.search_type) {
      case 1: {
        search_sql.query.bool.must.match.board_title =
          boardEsScoreDto.search_string;
        break;
      }
      case 2: {
        search_sql.query.bool.must.match.board_contents =
          boardEsScoreDto.search_string;
        break;
      }
      case 3: {
        search_sql.query.bool.must.match.user_name =
          boardEsScoreDto.search_string;
        break;
      }
      default: {
        search_sql.query.bool.must.match.board_contents =
          boardEsScoreDto.search_string;
        break;
      }
    }

    if (boardEsScoreDto.search_from != 0) {
      search_sql.from = boardEsScoreDto.search_from;
    }

    const board_data = await this.elasticsearchService.search(search_sql);
    this.logger.log(
      `Elasticsearch score search completed in ${Date.now() - now}ms`,
    );

    return board_data;
  }

  /**
   * 마이그레이션 (사용하지 않음)
   * @deprecated
   */
  async insertMigration() {
    return false;
  }
}
