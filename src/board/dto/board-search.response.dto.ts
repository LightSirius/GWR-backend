import { SearchHit } from '@elastic/elasticsearch/lib/api/types';

export interface BoardSummary {
  board_id: number;
  board_title: string;
  user_name: string;
  info_delete: boolean;
  info_block: boolean;
  create_date: Date;
  comment_count: number;
  view_count: number;
  recommend_count: number;
}

export interface BoardSearchHitSource extends SearchHit {
  _source: BoardSummary;
}

export class BoardSearchResponseDto {
  total_count: number;
  board_summary: BoardSummary[];
}
