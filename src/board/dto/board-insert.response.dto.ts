import { BoardType } from '../entities/board.entity';

export enum StatusType {
  'success',
  'notsetcuid',
  'fail',
  'error',
}

export class BoardInsertResponseDto {
  status: StatusType;
  board_id: number;
  board_type: BoardType;
}
