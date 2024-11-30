export enum StatusType {
  'success',
  'notsetcuid',
  'fail',
  'error',
}

export class BoardInsertResponseDto {
  status: StatusType;
  board_id: number;
}
