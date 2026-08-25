import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrayerRequest } from './entities/prayer-request.entity';
import { PrayerRequestsService } from './prayer-requests.service';
import { PrayerRequestsController } from './prayer-requests.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([PrayerRequest]), AuthModule],
  controllers: [PrayerRequestsController],
  providers: [PrayerRequestsService],
  exports: [PrayerRequestsService, TypeOrmModule],
})
export class PrayerRequestsModule {}
