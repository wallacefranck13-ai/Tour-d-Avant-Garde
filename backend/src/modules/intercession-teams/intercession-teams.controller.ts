import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { IntercessionTeamsService } from './intercession-teams.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateTeamDto } from './dto/create-team.dto';

@Controller('intercession-teams')
export class IntercessionTeamsController {
  constructor(private readonly service: IntercessionTeamsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RESPONSABLE')
  @Post()
  create(@Body() dto: CreateTeamDto) {
    return this.service.create(dto);
  }
}
