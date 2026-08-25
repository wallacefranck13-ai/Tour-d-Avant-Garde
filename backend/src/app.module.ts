import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { getDatabaseConnectionOptions } from './database/database.config';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { CommunitiesModule } from './modules/communities/communities.module';
import { PrayerProgramsModule } from './modules/prayer-programs/prayer-programs.module';
import { PrayerRequestsModule } from './modules/prayer-requests/prayer-requests.module';
import { IntercessionTeamsModule } from './modules/intercession-teams/intercession-teams.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TestimoniesModule } from './modules/testimonies/testimonies.module';
import { ActionOfFaithModule } from './modules/action-of-faith/action-of-faith.module';
import { WorldIntentionsModule } from './modules/world-intentions/world-intentions.module';
import { FlambeauModule } from './modules/flambeau/flambeau.module';
import { VeilleurModule } from './modules/veilleur/veilleur.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 100 }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (): TypeOrmModuleOptions =>
        ({
          ...getDatabaseConnectionOptions(),
          autoLoadEntities: true,
          // À désactiver (DB_SYNCHRONIZE=false) dès que de vraies migrations
          // TypeORM existent pour la cible Postgres de production.
          synchronize: process.env.DB_SYNCHRONIZE !== 'false',
        }) as TypeOrmModuleOptions,
    }),
    HealthModule,
    UsersModule,
    CommunitiesModule,
    PrayerProgramsModule,
    PrayerRequestsModule,
    IntercessionTeamsModule,
    MeetingsModule,
    NotificationsModule,
    TestimoniesModule,
    ActionOfFaithModule,
    WorldIntentionsModule,
    FlambeauModule,
    VeilleurModule,
    WhatsappModule,
    AuthModule,
    DashboardModule,
    CampaignsModule,
    RemindersModule,
    AnalyticsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
