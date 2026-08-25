import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { UsersModule } from '../users/users.module';
import { PrayerRequestsModule } from '../prayer-requests/prayer-requests.module';
import { PrayerProgramsModule } from '../prayer-programs/prayer-programs.module';
import { WorldIntentionsModule } from '../world-intentions/world-intentions.module';
import { FlambeauModule } from '../flambeau/flambeau.module';
import { TestimoniesModule } from '../testimonies/testimonies.module';

@Module({
  imports: [UsersModule, PrayerRequestsModule, PrayerProgramsModule, WorldIntentionsModule, FlambeauModule, TestimoniesModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
