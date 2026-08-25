import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { FlambeauService } from './flambeau.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateChecklistDto } from './dto/update-checklist.dto';
import { PublishEncouragementDto } from './dto/publish-encouragement.dto';

@Controller('flambeau')
export class FlambeauController {
  constructor(private readonly service: FlambeauService) {}

  @Get('today')
  findToday() {
    return this.service.findToday();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RESPONSABLE')
  @Patch('today/checklist')
  updateChecklist(@Body() dto: UpdateChecklistDto) {
    return this.service.updateChecklist(new Date().toISOString().slice(0, 10), dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RESPONSABLE')
  @Post('today/encouragement')
  publishEncouragement(@Body() dto: PublishEncouragementDto) {
    return this.service.publishEncouragement(new Date().toISOString().slice(0, 10), dto.message);
  }
}
