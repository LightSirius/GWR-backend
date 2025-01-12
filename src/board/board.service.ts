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

const KoLang = {
  board: {
    delete_title: '삭제된 게시글입니다.',
    block_title: '삭제된 게시글입니다.',
  },
};

@Injectable()
export class BoardService {
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
  create(createBoardDto: CreateBoardDto) {
    const board = new Board(createBoardDto);
    return this.entityManager.save(board);
  }

  async findAll() {
    return this.boardRepository.find();
  }

  async findOne(board_id: number) {
    return this.boardRepository.findOneBy({ board_id });
  }

  async update(id: number, updateBoardDto: UpdateBoardDto) {
    const board = await this.findOne(id);
    return await this.boardRepository.save({ ...board, ...updateBoardDto });
  }

  remove(id: number) {
    return `This action removes a #${id} board`;
  }

  boardTypeToIndex(board_type: BoardType) {
    switch (board_type) {
      case BoardType.free: {
        return 'board_free';
      }
      case BoardType.market: {
        return 'board_market';
      }
      case BoardType.guild: {
        return 'board_guild';
      }
      case BoardType.ucc: {
        return 'board_ucc';
      }
    }
  }

  async boardInsert(
    boardInsertDto: BoardInsertDto,
    guard: AuthTokenPayloadDto,
  ): Promise<BoardInsertResponseDto> {
    const user = await this.userService.findOneWithAuth(guard.uuid);
    if (!user) {
      return { status: StatusType.error, board_id: 0 };
    }
    if (!user.member_cuid) {
      return { status: StatusType.notsetcuid, board_id: 0 };
    }

    const game_info = await this.userService.user_game_info_detail(
      user.member_uuid.toString(),
      user.member_cuid.toString(),
    );

    const board = await this.create({
      user_uuid: guard.uuid,
      user_name: game_info.NickName,
      ...boardInsertDto,
    });
    if (!board) {
      return { status: StatusType.error, board_id: 0 };
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
      Logger.error(`boardInsert elastic generation failed`, `Board`);
      return { status: StatusType.error, board_id: 0 };
    }

    return { status: StatusType.success, board_id: board.board_id };
  }

  async boardSearch(
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
            ? KoLang.board.delete_title
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

    Logger.log(`boardList latency ${Date.now() - now}ms`, `Board`);

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

  async board_detail(board_id: number): Promise<BoardDetailDto> {
    let board_detail_data = new BoardDetailDto();

    if (await this.redis.hExists('board_detail_list', board_id.toString())) {
      board_detail_data = {
        ...JSON.parse(
          await this.redis.hGet('board_detail_list', board_id.toString()),
        ),
      };
    } else {
      board_detail_data = {
        ...(await this.findOne(board_id)),
        near_board_list: null,
      };
    }

    if (isEmpty(board_detail_data)) {
      throw new HttpException('Not Found', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    await this.redis.hSet(
      'board_detail_list',
      board_id.toString(),
      JSON.stringify(board_detail_data),
    );

    await this.redis.multi();

    // # Call elasticsearch agent
    const post = await this.httpService
      .post('http://host.docker.internal:3100', {
        index: 'board_free',
        id: board_id.toString(),
        script: {
          source: 'ctx._source.view_count += 1',
        },
      })
      .toPromise();
    if (!post.data) {
      Logger.error('board_detail: view count not updated', `Board`);
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
      index: 'board_free',
      id: board_id.toString(),
    });

    board_detail_data.view_count = es_get_result._source.view_count;
    board_detail_data.comment_count = es_get_result._source.comment_count;
    board_detail_data.recommend_count = es_get_result._source.recommend_count;

    board_detail_data.near_board_list = {
      ...(await this.entityManager.query(
        'select board_id, board_type, board_title, create_date ' +
          'from (select board_id, board_type, board_title, create_date ' +
          'from board where board_id < $1 and board_type = $2 order by board_id DESC limit 1) as before_detail ' +
          'union all ' +
          'select board_id, board_type, board_title, create_date ' +
          'from (select board_id, board_type, board_title, create_date ' +
          'from board where board_id > $1 and board_type = $2 order by board_id limit 1) as after_detail',
        [board_id, board_detail_data.board_type],
      )),
    };

    return board_detail_data;
  }

  async board_modify(
    id: number,
    boardModifyDto: BoardModifyDto,
    guard: { uuid: string; name: string },
  ) {
    const board = await this.board_check_owner(id, guard);

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

  async board_check_owner(
    board_id: number,
    guard: { uuid: string },
  ): Promise<Board | null> {
    const board = await this.findOne(board_id);
    if (board.user_uuid == guard.uuid) {
      return board;
    } else {
      return null;
    }
  }

  async board_search_list_es(boardEsSearchDto: BoardEsSearchDto) {
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
    Logger.log(`board_search_list_es latency ${Date.now() - now}ms`, `Board`);

    return board_data;
  }

  async board_search_list_es_newest(boardEsNewestDto: BoardEsNewestDto) {
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
    Logger.log(
      `board_search_list_es_newest latency ${Date.now() - now}ms`,
      `Board`,
    );

    return board_data;
  }

  async board_search_list_es_score(boardEsScoreDto: BoardEsScoreDto) {
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
    Logger.log(
      `board_search_list_es_score latency ${Date.now() - now}ms`,
      `Board`,
    );

    return board_data;
  }

  async insert_migration() {
    return false;
  }
}
