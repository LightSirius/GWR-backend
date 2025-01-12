import { NoticeType } from '../entities/notice.entity';

class NoticeList {
  notice_id: number;
  notice_type?: NoticeType;
  notice_title: string;
  create_date: Date;
}

export class NoticeMainDto {
  constructor() {
    this.noticeMainList = [];
    this.noticeListArray = [];

    this.noticeListArray[NoticeType.notice] = [];
    this.noticeListArray[NoticeType.update] = [];
    this.noticeListArray[NoticeType.event] = [];
  }
  noticeMainList: NoticeList[];
  noticeListArray: NoticeList[][];
}
