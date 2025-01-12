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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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

  @Post('create')
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<CreateUserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @Post('test')
  async test(@Body('auth_id') auth_id: string) {
    return this.userService.test(auth_id);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':user_uuid')
  async findOne(@Param('user_uuid') user_uuid: string): Promise<User> {
    return this.userService.findOne(user_uuid);
  }

  @Patch(':user_uuid')
  async update(
    @Param('user_uuid') user_uuid: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(user_uuid, updateUserDto);
  }

  @Delete(':user_uuid')
  async remove(@Param('user_uuid') user_uuid: string): Promise<DeleteResult> {
    return this.userService.remove(user_uuid);
  }

  @Post('local/registration')
  async user_local_registration(
    @Body() userRegisterLocalDto: UserRegisterLocalDto,
  ) {
    return await this.userService.userLocalRegistration(userRegisterLocalDto);
  }

  @Post('validate/id')
  async user_validate_id_duplicate(
    @Body('auth_id') auth_id: string,
  ): Promise<boolean> {
    return await this.userService.authLocalDuplicateIdValidate(auth_id);
  }

  @Post('registration')
  async user_registration(@Body() userRegistrationDto: UserRegistrationDto) {
    return this.userService.user_registration(userRegistrationDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('modify/info')
  async user_modify_info(
    @Body() userModifyInfoDto: UserModifyInfoDto,
    @Request() guard,
  ) {
    return this.userService.user_modify_info(userModifyInfoDto, guard.user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('modify/phone')
  async user_modify_phone(
    @Body() userModifyPhoneDto: UserModifyPhoneDto,
    @Request() req,
  ) {
    return this.userService.userModifyPhone(userModifyPhoneDto, req.user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('modify/password')
  async user_modify_password(
    @Body() userModifyPasswordDto: UserModifyPasswordDto,
    @Request() guard,
  ) {
    return await this.userService.user_modify_password(
      userModifyPasswordDto,
      guard.user,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('modify/cuid')
  async user_modify_cuid(
    @Body() userModifyCuidDto: UserModifyCuidDto,
    @Request() guard,
  ) {
    return await this.userService.userModifyCuid(userModifyCuidDto, guard.user);
  }

  @Get('game/info/update/all')
  user_game_info_update() {
    return this.userService.user_game_info_update_all();
  }

  @Get('game/info/update/self/:uuid')
  async user_game_info_self_update(@Param('uuid') uuid: string) {
    return await this.userService.user_game_info_self_update(uuid);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('game/info')
  user_game_info(@Request() guard) {
    return this.userService.user_game_info(guard.user);
  }

  @Get('game/info/avatar/:uuid')
  user_game_info_avatar_all(@Param('uuid') uuid: string) {
    return this.userService.user_game_info_avatar_all(uuid);
  }

  @Get('game/info/avatar/:uuid/:cuid')
  user_game_info_avatar(
    @Param('uuid') uuid: string,
    @Param('cuid') cuid: string,
  ) {
    return this.userService.user_game_info_avatar(uuid, cuid);
  }

  @Get('game/info/get/:uuid/:cuid')
  user_game_info_detail(
    @Param('uuid') uuid: string,
    @Param('cuid') cuid: string,
  ) {
    return this.userService.user_game_info_detail(uuid, cuid);
  }

  @Get('game/info/detail/update/:cuid')
  user_game_info_detail_update(@Param('cuid') cuid: string) {
    return this.userService.user_game_info_detail_update(cuid);
  }

  @Get('game/info/avatar/png/:uuid/:cuid')
  user_game_info_avatar_png(
    @Param('uuid') uuid: string,
    @Param('cuid') cuid: string,
  ) {
    return this.userService.user_game_info_avatar_png(uuid, cuid);
  }

  @Get('test/migration')
  user_migration() {
    return this.userService.user_migration();
  }

  @Get('test/hmac')
  hmac_fn(@Query('login') login: string) {
    return this.userService.hmac_fn(login);
  }

  @Get('test/acc')
  nhn_acc(@Query('auth') auth: string) {
    return this.userService.nhn_acc(auth);
  }

  @Get('test/user')
  nhn_get_user(@Query('token') token: string) {
    return this.userService.nhn_get_user(token);
  }

  @Get('test/member')
  nhn_get_member(@Query('login') login: string) {
    return this.userService.nhn_get_member(login);
  }

  @Redirect('')
  @Get('nhn/registration/url')
  async nhn_registration_url() {
    return { url: await this.userService.nhn_registration_url() };
  }

  @Post('nhn/registration')
  async nhn_registration(@Body() body) {
    return this.userService.nhn_registration(body);
  }

  @Post('test/nice/result')
  async user_nice_test_result(@Body() body) {
    return await this.userService.user_nice_test_result(body);
  }
}
