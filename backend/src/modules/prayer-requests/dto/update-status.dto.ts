import { IsEnum } from 'class-validator';
import { PrayerRequestStatus } from '../entities/prayer-request.entity';

export class UpdateStatusDto {
  @IsEnum(PrayerRequestStatus)
  status: PrayerRequestStatus;
}
