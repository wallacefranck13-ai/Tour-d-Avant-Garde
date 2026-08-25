import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PrayerProgramsService } from './prayer-programs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreatePrayerProgramDto } from './dto/create-prayer-program.dto';

@Controller('prayer-programs')
export class PrayerProgramsController {
  constructor(private readonly service: PrayerProgramsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('today')
  findToday() {
    return this.service.findToday();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RESPONSABLE')
  @Post()
  create(@Body() dto: CreatePrayerProgramDto) {
    return this.service.create(dto as any);
  }
}
