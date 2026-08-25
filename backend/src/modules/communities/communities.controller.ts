import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateCommunityDto } from './dto/create-community.dto';

@Controller('communities')
export class CommunitiesController {
  constructor(private readonly service: CommunitiesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RESPONSABLE')
  @Post()
  create(@Body() dto: CreateCommunityDto) {
    return this.service.create(dto);
  }
}
