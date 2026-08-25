import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly service: CampaignsService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RESPONSABLE')
  @Post()
  create(@Body() dto: CreateCampaignDto) {
    return this.service.create(dto);
  }
}
