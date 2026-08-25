import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrayerProgram } from './entities/prayer-program.entity';
import { PrayerStep } from './entities/prayer-step.entity';
import { PrayerProgramsService } from './prayer-programs.service';
import { PrayerProgramsController } from './prayer-programs.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([PrayerProgram, PrayerStep]), AuthModule],
  controllers: [PrayerProgramsController],
  providers: [PrayerProgramsService],
  exports: [PrayerProgramsService, TypeOrmModule],
})
export class PrayerProgramsModule {}
