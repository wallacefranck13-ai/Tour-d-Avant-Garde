import { Module } from '@nestjs/common';
import { VeilleurService } from './veilleur.service';
import { PrayerProgramsModule } from '../prayer-programs/prayer-programs.module';
import { MeetingsModule } from '../meetings/meetings.module';
import { WorldIntentionsModule } from '../world-intentions/world-intentions.module';

@Module({
  imports: [PrayerProgramsModule, MeetingsModule, WorldIntentionsModule],
  providers: [VeilleurService],
  exports: [VeilleurService],
})
export class VeilleurModule {}
