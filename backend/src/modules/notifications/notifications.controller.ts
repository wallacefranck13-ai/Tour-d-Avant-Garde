import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RESPONSABLE', 'INTERCESSEUR')
  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }
}
