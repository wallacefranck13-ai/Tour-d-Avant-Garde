import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PrayerRequestsService } from './prayer-requests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreatePrayerRequestDto } from './dto/create-prayer-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Controller('prayer-requests')
export class PrayerRequestsController {
  constructor(private readonly service: PrayerRequestsService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RESPONSABLE', 'INTERCESSEUR')
  @Post()
  create(@Body() dto: CreatePrayerRequestDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RESPONSABLE', 'INTERCESSEUR')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }
}
