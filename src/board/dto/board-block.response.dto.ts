import { BoardType } from '../entities/board.entity';

export enum Status {
  'success',
  'fail',
  'error',
}
export class BoardBlockResponseDto {
  status: Status;
  board_id: number;
  board_type: BoardType;
}
