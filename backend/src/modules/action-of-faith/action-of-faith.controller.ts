import { Body, Controller, Get, Post } from '@nestjs/common';
import { ActionOfFaithService } from './action-of-faith.service';
import { CreateActionOfFaithDto } from './dto/create-action-of-faith.dto';

@Controller('action-of-faith')
export class ActionOfFaithController {
  constructor(private readonly service: ActionOfFaithService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateActionOfFaithDto) {
    return this.service.create(dto);
  }
}
