import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly service: MeetingsService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get('next')
  findNext() {
    return this.service.findNext();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RESPONSABLE')
  @Post()
  create(@Body() dto: CreateMeetingDto) {
    return this.service.create({ ...dto, startAt: new Date(dto.startAt) });
  }
}
