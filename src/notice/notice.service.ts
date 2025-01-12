import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { RedisClientType } from 'redis';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice, NoticeType } from './entities/notice.entity';
import { EntityManager, Repository } from 'typeorm';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { NoticeInsertDto } from './dto/notice-insert.dto';
import { NoticeSearchDto, SearchType, SortType } from './dto/notice-search.dto';
import { ConfigService } from '@nestjs/config';
import {
  GetGetResult,
  SearchResponse,
} from '@elastic/elasticsearch/lib/api/types';
import { NoticeDetailDto } from './dto/notice-detail.dto';
import { isEmpty } from '../utils/utill';
import {
  NoticeSearchHitSource,
  NoticeSearchResponseDto,
} from './dto/notice-search.response.dto';
import { NoticeListPayload } from './payload/notice-list.payload';
import {
  NoticeInsertResponseDto,
  StatusType,
} from './dto/notice-insert.response.dto';
import { NoticeMainDto } from './dto/notice-main.dto';

@Injectable()
export class NoticeService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: RedisClientType,
    @InjectRepository(Notice)
    private noticeRepository: Repository<Notice>,
    private readonly entityManager: EntityManager,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly configService: ConfigService,
  ) {}
  create(createNoticeDto: any) {
    const notice = new Notice(createNoticeDto);
    return this.entityManager.save(notice);
  }

  findAll() {
    return this.noticeRepository.find();
  }

  findOne(notice_id: number) {
    return this.noticeRepository.findOneBy({ notice_id });
  }

  async update(id: number, updateNoticeDto: UpdateNoticeDto) {
    const notice = await this.findOne(id);
    return await this.noticeRepository.save({ ...notice, ...updateNoticeDto });
  }

  remove(id: number) {
    return `This action removes a #${id} notice`;
  }

  async noticeInsert(
    noticeInsertDto: NoticeInsertDto,
  ): Promise<NoticeInsertResponseDto> {
    const notice = await this.create({
      ...noticeInsertDto,
    });

    if (!notice) {
      return { status: StatusType.error, notice_id: 0 };
    }

    const es_result = await this.elasticsearchService.create({
      index: 'notice',
      id: notice.notice_id.toString(),
      document: {
        notice_id: notice.notice_id,
        notice_title: notice.notice_title,
        notice_contents: noticeInsertDto.notice_contents_es,
        notice_thumbnail: notice.notice_thumbnail,
        notice_type: notice.notice_type,
        info_delete: false,
        create_date: notice.create_date,
        comment_count: 0,
        view_count: 0,
        recommend_count: 0,
      },
    });
    if (!es_result) {
      Logger.error(`noticeInsert elastic generation failed`, `Notice`);
      return { status: StatusType.error, notice_id: 0 };
    }

    if (notice.notice_fix) {
      const notice_fix_list = await this.noticeRepository
        .createQueryBuilder('notice')
        .where('notice.notice_fix = :fix', { fix: true })
        .orderBy('notice.notice_id')
        .limit(this.configService.getOrThrow('NOTICE_FIX_COUNT'))
        .getRawMany();

      await this.redis.set('notice_fix_list', JSON.stringify(notice_fix_list));
    }

    return { status: StatusType.success, notice_id: notice.notice_id };
  }

  async noticeSearch(
    noticeSearchDto: NoticeSearchDto,
  ): Promise<NoticeSearchResponseDto> {
    if (
      noticeSearchDto.search_type != null &&
      noticeSearchDto.search_string == null
    ) {
      console.log('Fail to req');
      return { total_count: 0, notice_summary: [] };
    }
    if (
      noticeSearchDto.sort_type == SortType.score &&
      (noticeSearchDto.search_string == null ||
        noticeSearchDto.search_string == '')
    ) {
      console.log('Fail to req');
      return { total_count: 0, notice_summary: [] };
    }

    const now = Date.now();

    const search_sql: NoticeListPayload = {
      index: 'notice',
      size: noticeSearchDto.search_size ? noticeSearchDto.search_size : 20,
      query: {
        bool: {
          filter: [
            {
              term: {
                info_delete: false,
              },
            },
          ],
        },
      },
      track_total_hits: true,
    };

    if (noticeSearchDto.notice_type != undefined) {
      search_sql.query.bool.filter[1] = {
        term: {
          notice_type: noticeSearchDto.notice_type,
        },
      };
    }

    switch (noticeSearchDto.search_type) {
      case SearchType.contents: {
        search_sql.query.bool.must = {
          match: { notice_title: noticeSearchDto.search_string },
        };
        break;
      }
      case SearchType.title: {
        search_sql.query.bool.must = {
          match: { notice_contents: noticeSearchDto.search_string },
        };
        break;
      }
      default: {
        if (noticeSearchDto.sort_type == SortType.score) {
          search_sql.query.bool.must = {
            match: { notice_contents: noticeSearchDto.search_string },
          };
        }
        break;
      }
    }

    if (noticeSearchDto.sort_type == SortType.newest) {
      search_sql.sort = [{ notice_id: { order: 'desc' } }];
    }
    noticeSearchDto.search_page--;
    if (noticeSearchDto.search_page != 0 && noticeSearchDto.search_page > 0) {
      search_sql.from = noticeSearchDto.search_size
        ? noticeSearchDto.search_size * noticeSearchDto.search_page
        : 20 * noticeSearchDto.search_page;
    }

    const notice_data: SearchResponse =
      await this.elasticsearchService.search(search_sql);

    const noticeSearchResponse: NoticeSearchResponseDto = {
      total_count:
        typeof notice_data.hits.total != 'number'
          ? notice_data.hits.total.value
          : 0,
      notice_summary: [],
    };

    notice_data.hits.hits.forEach((hits: NoticeSearchHitSource) => {
      noticeSearchResponse.notice_summary.push({
        notice_id: +hits._id,
        notice_title: hits._source.notice_title,
        notice_type: hits._source.notice_type,
        create_date: hits._source.create_date,
        notice_thumbnail: hits._source.notice_thumbnail,
        comment_count: hits._source.comment_count,
        view_count: hits._source.view_count,
        recommend_count: hits._source.recommend_count,
      });
    });

    // console.log(noticeSearchResponse);
    Logger.log(`noticeSearch latency ${Date.now() - now}ms`, `Notice`);

    return noticeSearchResponse;
  }

  async getMainList() {
    const notice_main_data = new NoticeMainDto();

    const main_data = await this.noticeSearch({
      search_page: 0,
      search_size: 5,
      sort_type: SortType.newest,
    });
    notice_main_data.noticeMainList = [];
    main_data.notice_summary.forEach((notice) => {
      notice_main_data.noticeMainList.push({
        notice_id: notice.notice_id,
        notice_type: notice.notice_type,
        notice_title: notice.notice_title,
        create_date: notice.create_date,
      });
    });

    const notice_data_notice = await this.noticeSearch({
      search_page: 0,
      notice_type: NoticeType.notice,
      search_size: 5,
      sort_type: SortType.newest,
    });
    notice_main_data.noticeListArray[NoticeType.notice] = [];
    notice_data_notice.notice_summary.forEach((notice) => {
      notice_main_data.noticeListArray[NoticeType.notice].push({
        notice_id: notice.notice_id,
        notice_type: notice.notice_type,
        notice_title: notice.notice_title,
        create_date: notice.create_date,
      });
    });

    const notice_data_update = await this.noticeSearch({
      search_page: 0,
      notice_type: NoticeType.update,
      search_size: 5,
      sort_type: SortType.newest,
    });
    notice_main_data.noticeListArray[NoticeType.update] = [];
    notice_data_update.notice_summary.forEach((notice) => {
      notice_main_data.noticeListArray[NoticeType.update].push({
        notice_id: notice.notice_id,
        notice_type: notice.notice_type,
        notice_title: notice.notice_title,
        create_date: notice.create_date,
      });
    });

    const notice_data_event = await this.noticeSearch({
      search_page: 0,
      notice_type: NoticeType.event,
      search_size: 5,
      sort_type: SortType.newest,
    });
    notice_main_data.noticeListArray[NoticeType.event] = [];
    notice_data_event.notice_summary.forEach((notice) => {
      notice_main_data.noticeListArray[NoticeType.event].push({
        notice_id: notice.notice_id,
        notice_type: notice.notice_type,
        notice_title: notice.notice_title,
        create_date: notice.create_date,
      });
    });

    return notice_main_data;
  }

  async notice_detail(notice_id: number) {
    const now = Date.now();
    let notice_detail_data = new NoticeDetailDto();

    if (await this.redis.hExists('notice_detail_list', notice_id.toString())) {
      notice_detail_data = {
        ...JSON.parse(
          await this.redis.hGet('notice_detail_list', notice_id.toString()),
        ),
      };
    } else {
      notice_detail_data = {
        ...(await this.noticeRepository
          .createQueryBuilder('notice')
          .select([
            'notice.notice_id AS notice_id',
            'notice.notice_type AS notice_type',
            'notice.notice_title AS notice_title',
            'notice.notice_contents AS notice_contents',
            'notice.update_date AS update_date',
          ])
          .where('notice.notice_id = :notice_id', { notice_id: notice_id })
          .getRawOne()),
      };
    }

    if (isEmpty(notice_detail_data)) {
      throw new HttpException('Not Found', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    await this.redis.hSet(
      'notice_detail_list',
      notice_id.toString(),
      JSON.stringify(notice_detail_data),
    );

    await this.redis.multi();

    await this.elasticsearchService.update({
      index: 'notice',
      id: notice_id.toString(),
      script: {
        source: 'ctx._source.view_count += 1',
      },
    });

    const es_get_result: GetGetResult<{
      notice_id: number;
      notice_title: string;
      notice_contents: string;
      notice_type: string;
      comment_count?: number;
      view_count?: number;
      recommend_count?: number;
    }> = await this.elasticsearchService.get({
      index: 'notice',
      id: notice_id.toString(),
    });

    notice_detail_data.view_count = es_get_result._source.view_count;
    notice_detail_data.comment_count = es_get_result._source.comment_count;
    notice_detail_data.recommend_count = es_get_result._source.recommend_count;

    notice_detail_data.near_notice_list = {
      ...(await this.entityManager.query(
        'select notice_id, notice_type, notice_title, create_date ' +
          'from (select notice_id, notice_type, notice_title, create_date ' +
          'from notice where notice_id < $1 and notice_type = $2 order by notice_id DESC limit 1) as before_detail ' +
          'union all ' +
          'select notice_id, notice_type, notice_title, create_date ' +
          'from (select notice_id, notice_type, notice_title, create_date ' +
          'from board where notice_id > $1 and notice_type = $2 order by notice_id limit 1) as after_detail',
        [notice_id, notice_detail_data.notice_type],
      )),
    };

    console.log(Date.now() - now);
    return notice_detail_data;
  }
}
