import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RecommendService } from './recommend.service';
import { CreateRecommendDto } from './dto/create-recommend.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RecommendInsertDto } from './dto/recommend-insert.dto';

@Controller('recommend')
export class RecommendController {
  constructor(private readonly recommendService: RecommendService) {}

  @Post('create')
  create(@Body() createRecommendDto: CreateRecommendDto) {
    return this.recommendService.create(createRecommendDto);
  }

  // @Post('remove')
  // remove(@Body() createRecommendDto: CreateRecommendDto) {
  //   return this.recommendService.remove(createRecommendDto);
  // }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('insert')
  insert(@Body() recommendInsertDto: RecommendInsertDto, @Request() guard) {
    return this.recommendService.recommend_insert(
      recommendInsertDto,
      guard.user,
    );
  }
}
