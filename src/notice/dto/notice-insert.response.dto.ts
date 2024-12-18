export enum StatusType {
  'success',
  'fail',
  'error',
}

export class NoticeInsertResponseDto {
  status: StatusType;
  notice_id: number;
}
