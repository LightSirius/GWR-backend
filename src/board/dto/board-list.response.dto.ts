export class BoardSummary {
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
export class BoardListResponseDto {
  total_count: number;
  board_summary: BoardSummary[];
}
