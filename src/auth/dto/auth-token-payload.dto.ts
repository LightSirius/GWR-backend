import { AuthType } from '../../user/entities/user-auth.entity';

export class AuthTokenPayloadDto {
  uuid: string;
  cuid: number;
  type: AuthType;
}
