import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { MeetingsModule } from '../meetings/meetings.module';
import { PrayerRequestsModule } from '../prayer-requests/prayer-requests.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [MeetingsModule, PrayerRequestsModule, NotificationsModule, UsersModule],
  providers: [RemindersService],
})
export class RemindersModule {}
