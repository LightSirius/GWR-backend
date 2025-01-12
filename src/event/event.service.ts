import { Injectable, Logger } from '@nestjs/common';
import { Event } from './entities/event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EventInsertDto } from './dto/event-insert.dto';
import {
  EventInsertResponseDto,
  StatusType,
} from './dto/event-insert.response.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    private readonly entityManager: EntityManager,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  create(createEventDto: any) {
    const event = new Event(createEventDto);
    return this.entityManager.save(event);
  }

  async eventInsert(
    eventInsertDto: EventInsertDto,
  ): Promise<EventInsertResponseDto> {
    const event = await this.create({
      ...eventInsertDto,
    });

    if (!event) {
      return { status: StatusType.error, event_id: 0 };
    }

    const es_result = await this.elasticsearchService.create({
      index: 'event',
      id: event.event_id.toString(),
      document: {
        event_id: event.event_id,
        event_title: event.event_title,
        event_contents: eventInsertDto.event_contents_es,
        event_thumbnail: event.event_thumbnail,
        event_url: event.event_url,
        event_type: event.event_type,
        event_start: event.event_start,
        event_end: event.event_end,
        info_delete: false,
        create_date: event.create_date,
        comment_count: 0,
        view_count: 0,
        recommend_count: 0,
      },
    });
    if (!es_result) {
      Logger.error(`eventInsert elastic generation failed`, `Event`);
      return { status: StatusType.error, event_id: 0 };
    }
  }

  async eventSearch() {}

  // create(createEventDto: EventInsertDto) {
  //   return 'This action adds a new event';
  // }
  //
  // findAll() {
  //   return `This action returns all event`;
  // }
  //
  // findOne(id: number) {
  //   return `This action returns a #${id} event`;
  // }
  //
  // update(id: number, updateEventDto: UpdateEventDto) {
  //   return `This action updates a #${id} event`;
  // }
  //
  // remove(id: number) {
  //   return `This action removes a #${id} event`;
  // }
}
