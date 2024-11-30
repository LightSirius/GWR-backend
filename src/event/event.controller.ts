import { Controller, Post, Body } from '@nestjs/common';
import { EventService } from './event.service';
import { EventInsertDto } from './dto/event-insert.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Event API')
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('insert')
  event_insert(@Body() eventInsertDto: EventInsertDto) {
    return this.eventService.eventInsert(eventInsertDto);
  }

  // @Post()
  // create(@Body() createEventDto: EventInsertDto) {
  //   return this.eventService.create(createEventDto);
  // }
  //
  // @Get()
  // findAll() {
  //   return this.eventService.findAll();
  // }
  //
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.eventService.findOne(+id);
  // }
  //
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
  //   return this.eventService.update(+id, updateEventDto);
  // }
  //
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.eventService.remove(+id);
  // }
}
