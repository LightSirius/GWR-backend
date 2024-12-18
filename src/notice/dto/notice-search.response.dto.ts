import { SearchHit } from '@elastic/elasticsearch/lib/api/types';
import { NoticeType } from '../entities/notice.entity';

export interface NoticeSummary {
  notice_id: number;
  notice_title: string;
  notice_type: NoticeType;
  notice_thumbnail?: string;
  // info_delete: boolean;
  create_date: Date;
  comment_count?: number;
  view_count: number;
  recommend_count?: number;
}

export interface NoticeSearchHitSource extends SearchHit {
  _source: NoticeSummary;
}
export class NoticeSearchResponseDto {
  total_count: number;
  notice_summary: NoticeSummary[];
}
