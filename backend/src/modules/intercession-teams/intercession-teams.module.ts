import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntercessionTeam } from './entities/intercession-team.entity';
import { IntercessionTeamsService } from './intercession-teams.service';
import { IntercessionTeamsController } from './intercession-teams.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([IntercessionTeam]), AuthModule],
  controllers: [IntercessionTeamsController],
  providers: [IntercessionTeamsService],
  exports: [IntercessionTeamsService, TypeOrmModule],
})
export class IntercessionTeamsModule {}
