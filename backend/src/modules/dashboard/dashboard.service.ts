import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrayerRequestsService } from '../prayer-requests/prayer-requests.service';
import { PrayerProgramsService } from '../prayer-programs/prayer-programs.service';
import { WorldIntentionsService } from '../world-intentions/world-intentions.service';
import { FlambeauService } from '../flambeau/flambeau.service';
import { TestimoniesService } from '../testimonies/testimonies.service';

/**
 * Agrège les données live du tableau de bord (Tache 4 du Sprint 1) :
 * participants, demandes reçues, urgentes, intercesseurs connectés, session en cours.
 */
@Injectable()
export class DashboardService {
  constructor(
    private readonly users: UsersService,
    private readonly prayerRequests: PrayerRequestsService,
    private readonly prayerPrograms: PrayerProgramsService,
    private readonly worldIntentions: WorldIntentionsService,
    private readonly flambeau: FlambeauService,
    private readonly testimonies: TestimoniesService,
  ) {}

  async overview() {
    const [participants, demandesRecues, urgentes, intercesseursConnectes, session, intention, flambeauDuJour] = await Promise.all([
      this.users.countAll(),
      this.prayerRequests.countToday(),
      this.prayerRequests.countUrgentToday(),
      this.users.countOnlineIntercessors(),
      this.prayerPrograms.currentSession(),
      this.worldIntentions.findToday(),
      this.flambeau.findToday(),
    ]);

    return {
      today: {
        participants,
        demandesRecues,
        urgentes,
        intercesseursConnectes,
      },
      session,
      worldIntention: intention,
      flambeau: flambeauDuJour,
    };
  }

  async stats() {
    const [totalPrayerRequests, totalTestimonies, totalIntercessors, totalPrayerHours] = await Promise.all([
      this.prayerRequests.countAll(),
      this.testimonies.countAll(),
      this.users.countAllIntercessors(),
      this.prayerPrograms.totalPrayerHours(),
    ]);
    return { totalPrayerRequests, totalTestimonies, totalIntercessors, totalPrayerHours };
  }
}
