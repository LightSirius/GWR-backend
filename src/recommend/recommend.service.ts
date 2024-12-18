import { Injectable } from '@nestjs/common';
import { CreateRecommendDto } from './dto/create-recommend.dto';
import { UpdateRecommendDto } from './dto/update-recommend.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Recommend } from './entities/recommend.entity';
import { EntityManager, Repository } from 'typeorm';
import { RecommendInsertDto } from './dto/recommend-insert.dto';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { RecommendDeleteDto } from './dto/recommend-delete.dto';

@Injectable()
export class RecommendService {
  constructor(
    @InjectRepository(Recommend)
    private recommendRepository: Repository<Recommend>,
    private readonly entityManager: EntityManager,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}
  create(createRecommendDto: CreateRecommendDto) {
    const recommend = new Recommend(createRecommendDto);
    return this.entityManager.save(recommend);
  }

  findAll() {
    return this.recommendRepository.find();
  }

  findOne(recommend_id: number) {
    return this.recommendRepository.findOneBy({ recommend_id });
  }

  async update(recommend_id: number, updateRecommendDto: UpdateRecommendDto) {
    const recommend = await this.findOne(recommend_id);
    return this.recommendRepository.save({
      ...recommend,
      ...updateRecommendDto,
    });
  }

  async remove(recommend_id: number) {
    return this.entityManager.remove(await this.findOne(recommend_id));
  }

  recommend_count(board_id: number) {
    return this.recommendRepository.count({
      where: {
        board_id: board_id,
      },
    });
  }

  recommend_list(guard: { uuid: string }) {
    return this.recommendRepository.find({ where: { user_uuid: guard.uuid } });
  }

  async recommend_insert(
    recommendInsertDto: RecommendInsertDto,
    guard: { uuid: string },
  ) {
    if (
      (
        await this.recommendRepository.find({
          where: {
            board_id: recommendInsertDto.board_id,
            user_uuid: guard.uuid,
          },
        })
      ).length
    ) {
      return 0;
    }
    const recommend = await this.create({
      user_uuid: guard.uuid,
      ...recommendInsertDto,
    });

    await this.elasticsearchService.update({
      index: 'board_community',
      id: recommendInsertDto.board_id.toString(),
      script: {
        source: 'ctx._source.recommend_count += 1',
      },
    });
    return recommend;
  }

  async recommend_delete(
    recommendDeleteDto: RecommendDeleteDto,
    guard: { uuid: string },
  ) {
    if (
      await this.recommendRepository.remove(
        await this.recommendRepository.find({
          where: {
            board_id: recommendDeleteDto.board_id,
            user_uuid: guard.uuid,
          },
        }),
      )
    ) {
      await this.elasticsearchService.update({
        index: 'board_community',
        id: recommendDeleteDto.board_id.toString(),
        script: {
          source: 'ctx._source.recommend_count -= 1',
        },
      });
    }
  }
}
