import { NoticeType } from '../entities/notice.entity';

class NearNoticeList {
  notice_id: number;
  notice_title: string;
  create_date: Date;
}

export class NoticeDetailDto {
  notice_id: number;
  notice_type: NoticeType;
  notice_title: string;
  notice_contents: string;
  user_name: string;
  comment_count?: number;
  view_count?: number;
  recommend_count?: number;
  update_date: Date;
  near_notice_list: NearNoticeList;
}
