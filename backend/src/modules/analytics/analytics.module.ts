import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailySnapshot } from './entities/daily-snapshot.entity';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { DashboardModule } from '../dashboard/dashboard.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([DailySnapshot]), DashboardModule, AuthModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
