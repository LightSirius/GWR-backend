export enum StatusType {
  'success',
  'fail',
  'error',
}
export class EventInsertResponseDto {
  status: StatusType;
  event_id: number;
}
