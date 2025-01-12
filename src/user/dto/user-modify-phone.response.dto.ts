export enum Status {
  'success',
  'fail',
  'notsameCI',
  'error',
}

export class UserModifyPhoneResponseDto {
  status: Status;
}
