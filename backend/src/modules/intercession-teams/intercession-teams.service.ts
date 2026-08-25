import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntercessionTeam } from './entities/intercession-team.entity';

@Injectable()
export class IntercessionTeamsService {
  constructor(@InjectRepository(IntercessionTeam) private readonly teams: Repository<IntercessionTeam>) {}

  findAll() {
    return this.teams.find({ relations: ['community', 'leader'] });
  }

  create(data: Partial<IntercessionTeam>) {
    return this.teams.save(this.teams.create(data));
  }
}
