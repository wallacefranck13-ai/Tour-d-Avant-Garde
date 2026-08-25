import { Controller, Get } from '@nestjs/common';
import { WorldIntentionsService } from './world-intentions.service';

@Controller('world-intentions')
export class WorldIntentionsController {
  constructor(private readonly service: WorldIntentionsService) {}

  @Get('today')
  findToday() {
    return this.service.findToday();
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
