import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  Redirect,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';
import { UserRegistrationDto } from './dto/user-registration.dto';
import { UserModifyPasswordDto } from './dto/user-modify-password.dto';
import { UserModifyInfoDto } from './dto/user-modify-info.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CreateUserResponseDto } from './dto/create-user.response.dto';
import { UserRegisterLocalDto } from './dto/user-register-local.dto';
import { UserModifyPhoneDto } from './dto/user-modify-phone.dto';
import { UserModifyCuidDto } from './dto/user-modify-cuid.dto';

@ApiTags('User API')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '사용자 생성 (관리자용)' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: '사용자가 성공적으로 생성되었습니다.',
    type: CreateUserResponseDto,
  })
  @Post('create')
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<CreateUserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @ApiOperation({ summary: '사용자 정보 수정 (관리자용)' })
  @ApiParam({ name: 'user_uuid', description: '사용자 UUID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '사용자 정보가 수정되었습니다.',
    type: User,
  })
  @Patch(':user_uuid')
  async update(
    @Param('user_uuid') user_uuid: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(user_uuid, updateUserDto);
  }

  @ApiOperation({ summary: '사용자 삭제 (관리자용)' })
  @ApiParam({ name: 'user_uuid', description: '사용자 UUID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '사용자가 삭제되었습니다.',
  })
  @Delete(':user_uuid')
  async remove(@Param('user_uuid') user_uuid: string): Promise<DeleteResult> {
    return this.userService.remove(user_uuid);
  }

  // ============================================
  // 회원가입 및 인증
  // ============================================

  @ApiOperation({ 
    summary: '로컬 회원가입',
    description: 'NICE 본인인증을 통한 로컬 회원가입을 진행합니다.',
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: '회원가입이 완료되었습니다.',
    type: CreateUserResponseDto,
  })
  @Post('local/registration')
  async user_local_registration(
    @Body() userRegisterLocalDto: UserRegisterLocalDto,
  ) {
    return await this.userService.userLocalRegistration(userRegisterLocalDto);
  }

  @ApiOperation({ 
    summary: '아이디 중복 확인',
    description: '회원가입 시 아이디 중복 여부를 확인합니다.',
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'true: 사용 가능, false: 중복됨',
    type: Boolean,
  })
  @Post('validate/id')
  async user_validate_id_duplicate(
    @Body('auth_id') auth_id: string,
  ): Promise<boolean> {
    return await this.userService.authLocalDuplicateIdValidate(auth_id);
  }

  @ApiOperation({ 
    summary: '간단 회원가입 (테스트용)',
    description: '테스트를 위한 간단한 회원가입 엔드포인트입니다.',
  })
  @Post('registration')
  async userRegistration(@Body() userRegistrationDto: UserRegistrationDto) {
    return this.userService.userRegistration(userRegistrationDto);
  }

  // ============================================
  // 사용자 정보 수정
  // ============================================

  @ApiOperation({ 
    summary: '사용자 정보 수정 (이메일, 생년월일)',
    description: '로그인한 사용자의 기본 정보를 수정합니다.',
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '사용자 정보가 수정되었습니다.',
    type: User,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('modify/info')
  async userModifyInfo(
    @Body() userModifyInfoDto: UserModifyInfoDto,
    @Request() guard,
  ) {
    return this.userService.userModifyInfo(userModifyInfoDto, guard.user);
  }

  @ApiOperation({ 
    summary: '전화번호 수정',
    description: 'NICE 본인인증을 통한 전화번호 수정을 진행합니다.',
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '전화번호가 수정되었습니다.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('modify/phone')
  async userModifyPhone(
    @Body() userModifyPhoneDto: UserModifyPhoneDto,
    @Request() req,
  ) {
    return this.userService.userModifyPhone(userModifyPhoneDto, req.user);
  }

  @ApiOperation({ 
    summary: '비밀번호 변경',
    description: '로그인한 사용자의 비밀번호를 변경합니다. (로컬 계정만 가능)',
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '비밀번호가 변경되었습니다.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('modify/password')
  async userModifyPassword(
    @Body() userModifyPasswordDto: UserModifyPasswordDto,
    @Request() guard,
  ) {
    return await this.userService.userModifyPassword(
      userModifyPasswordDto,
      guard.user,
    );
  }

  @ApiOperation({ 
    summary: '대표 캐릭터 CUID 설정',
    description: '사용자의 대표 캐릭터를 설정합니다.',
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '대표 캐릭터가 설정되었습니다.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('modify/cuid')
  async userModifyCuid(
    @Body() userModifyCuidDto: UserModifyCuidDto,
    @Request() guard,
  ) {
    return await this.userService.userModifyCuid(userModifyCuidDto, guard.user);
  }

  // ============================================
  // 게임 캐릭터 정보 조회
  // ============================================

  @ApiOperation({ 
    summary: '모든 게임 캐릭터 정보 업데이트 (관리자용)',
    description: '게임 API에서 모든 캐릭터 정보를 가져와 Redis에 캐싱합니다.',
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '업데이트된 캐릭터 수를 반환합니다.',
    type: Number,
  })
  @Get('game/info/update/all')
  updateAllGameInfo() {
    return this.userService.updateAllGameInfo();
  }

  @ApiOperation({ 
    summary: '특정 사용자의 게임 캐릭터 정보 업데이트',
    description: '특정 사용자의 모든 캐릭터 정보를 업데이트하고 아바타를 생성합니다.',
  })
  @ApiParam({ name: 'uuid', description: '게임 멤버 UUID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '업데이트 성공 여부를 반환합니다.',
    type: Boolean,
  })
  @Get('game/info/update/self/:uuid')
  async updateSelfGameInfo(@Param('uuid') uuid: string) {
    return await this.userService.updateSelfGameInfo(uuid);
  }

  @ApiOperation({ 
    summary: '내 게임 캐릭터 정보 조회',
    description: '로그인한 사용자의 모든 게임 캐릭터 정보를 조회합니다.',
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '캐릭터 정보 목록을 반환합니다.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('game/info')
  getGameInfo(@Request() guard) {
    return this.userService.getGameInfo(guard.user);
  }

  @ApiOperation({ 
    summary: '특정 사용자의 모든 아바타 조회',
    description: '특정 사용자의 모든 캐릭터 아바타를 조회합니다.',
  })
  @ApiParam({ name: 'uuid', description: '게임 멤버 UUID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '아바타 URL 맵을 반환합니다.',
  })
  @Get('game/info/avatar/:uuid')
  getAllGameAvatars(@Param('uuid') uuid: string) {
    return this.userService.getAllGameAvatars(uuid);
  }

  @ApiOperation({ 
    summary: '특정 캐릭터의 아바타 조회',
    description: '특정 캐릭터의 아바타 이미지를 base64로 반환합니다.',
  })
  @ApiParam({ name: 'uuid', description: '게임 멤버 UUID' })
  @ApiParam({ name: 'cuid', description: '캐릭터 CUID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'base64 인코딩된 아바타 이미지를 반환합니다.',
  })
  @Get('game/info/avatar/:uuid/:cuid')
  getGameAvatar(
    @Param('uuid') uuid: string,
    @Param('cuid') cuid: string,
  ) {
    return this.userService.getGameAvatar(uuid, cuid);
  }

  @ApiOperation({ 
    summary: '특정 캐릭터 상세 정보 조회',
    description: '특정 캐릭터의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'uuid', description: '게임 멤버 UUID' })
  @ApiParam({ name: 'cuid', description: '캐릭터 CUID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '캐릭터 상세 정보를 반환합니다.',
  })
  @Get('game/info/get/:uuid/:cuid')
  getGameInfoDetail(
    @Param('uuid') uuid: string,
    @Param('cuid') cuid: string,
  ) {
    return this.userService.getGameInfoDetail(uuid, cuid);
  }

  @ApiOperation({ 
    summary: '특정 캐릭터 정보 강제 업데이트',
    description: '게임 API에서 특정 캐릭터의 최신 정보를 가져와 업데이트합니다.',
  })
  @ApiParam({ name: 'cuid', description: '캐릭터 CUID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '업데이트된 캐릭터 정보를 반환합니다.',
  })
  @Get('game/info/detail/update/:cuid')
  updateGameInfoDetail(@Param('cuid') cuid: string) {
    return this.userService.updateGameInfoDetail(cuid);
  }

  @ApiOperation({ 
    summary: '캐릭터 아바타 PNG 이미지 조회',
    description: '캐릭터 아바타를 HTML img 태그 형태로 반환합니다.',
  })
  @ApiParam({ name: 'uuid', description: '게임 멤버 UUID' })
  @ApiParam({ name: 'cuid', description: '캐릭터 CUID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'HTML img 태그를 반환합니다.',
  })
  @Get('game/info/avatar/png/:uuid/:cuid')
  getGameAvatarPng(
    @Param('uuid') uuid: string,
    @Param('cuid') cuid: string,
  ) {
    return this.userService.getGameAvatarPng(uuid, cuid);
  }
}
