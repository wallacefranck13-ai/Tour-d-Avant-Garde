import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MeetingsService } from '../meetings/meetings.service';
import { PrayerRequestsService } from '../prayer-requests/prayer-requests.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../notifications/email.service';
import { UsersService } from '../users/users.service';

/**
 * Remplace Redis/BullMQ pour le Sprint 1 : aucun serveur Redis disponible ici,
 * donc les rappels planifiés utilisent @nestjs/schedule (in-process). À migrer
 * vers BullMQ si le volume de rappels ou un déploiement multi-instance l'exige.
 */
@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    private readonly meetings: MeetingsService,
    private readonly prayerRequests: PrayerRequestsService,
    private readonly notifications: NotificationsService,
    private readonly email: EmailService,
    private readonly users: UsersService,
  ) {}

  // Vérifie toutes les 5 minutes les rencontres qui commencent dans l'heure
  @Cron(CronExpression.EVERY_5_MINUTES)
  async remindUpcomingMeetings() {
    const meetings = await this.meetings.findUpcomingUnreminded(60);
    for (const meeting of meetings) {
      await this.notifications.send(
        undefined,
        `Rappel : ${meeting.title}`,
        `La rencontre "${meeting.title}" commence bientôt${meeting.location ? ` (${meeting.location})` : ''}.`,
        'reminder',
      );
      await this.meetings.markReminded(meeting.id);
      this.logger.log(`Rappel envoyé pour la rencontre "${meeting.title}"`);
    }
  }

  // Vérifie toutes les heures les requêtes non traitées depuis plus de 6h
  @Cron(CronExpression.EVERY_HOUR)
  async followUpStaleRequests() {
    const stale = await this.prayerRequests.findStaleUnflagged(6);
    if (stale.length === 0) return;

    const responsables = await this.users.findByRoleName('RESPONSABLE');
    for (const request of stale) {
      const subject = 'Requête de prière en attente';
      const body = `La requête "${request.subject}" de ${request.authorName} est toujours NOUVELLE depuis plus de 6h.`;
      for (const responsable of responsables) {
        await this.notifications.send(responsable, subject, body, 'reminder');
        if (responsable.email) await this.email.send(responsable.email, subject, body);
      }
      await this.prayerRequests.markFollowUpSent(request.id);
      this.logger.log(`Relance envoyée pour la requête "${request.subject}"`);
    }
  }
}
