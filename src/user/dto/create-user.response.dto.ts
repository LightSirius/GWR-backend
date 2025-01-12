export enum Status {
  created,
  id_duplicated,
  acc_not_created,
  auth_not_created,
  user_not_created,
}

export class CreateUserResponseDto {
  user_uuid?: string;
  status: Status;
}
