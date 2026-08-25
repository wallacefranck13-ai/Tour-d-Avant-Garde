import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('dashboard')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('history')
  findHistory(@Query('limit') limit?: string) {
    return this.service.findHistory(limit ? parseInt(limit, 10) : undefined);
  }

  // Capture manuelle utile en développement (le cron tourne à 23h55)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RESPONSABLE')
  @Post('history/capture')
  captureNow() {
    return this.service.buildSnapshot();
  }
}
