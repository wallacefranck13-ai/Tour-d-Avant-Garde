import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsAppSession } from './entities/whatsapp-session.entity';
import { WhatsappService } from './whatsapp.service';
import { WhatsappApiService } from './whatsapp-api.service';
import { WhatsappController } from './whatsapp.controller';
import { UsersModule } from '../users/users.module';
import { PrayerRequestsModule } from '../prayer-requests/prayer-requests.module';
import { TestimoniesModule } from '../testimonies/testimonies.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { VeilleurModule } from '../veilleur/veilleur.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WhatsAppSession]),
    UsersModule,
    PrayerRequestsModule,
    TestimoniesModule,
    NotificationsModule,
    VeilleurModule,
  ],
  controllers: [WhatsappController],
  providers: [WhatsappService, WhatsappApiService],
})
export class WhatsappModule {}
