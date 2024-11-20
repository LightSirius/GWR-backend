import { AuthType } from '../../user/entities/user-auth.entity';

export enum StatusType {
  'success',
  'unregistered',
  'fail',
  'error',
  'transfer_account',
}

export class AuthLoginResponseDto {
  authType: AuthType;
  status: StatusType;
  access_token?: string;
}
