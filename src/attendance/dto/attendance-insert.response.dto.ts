export enum Status {
  'success',
  'already',
  'fail',
  'error',
}

export class AttendanceInsertResponseDto {
  status: Status;
}
