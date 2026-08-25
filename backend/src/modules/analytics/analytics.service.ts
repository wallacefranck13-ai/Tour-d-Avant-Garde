import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { DailySnapshot } from './entities/daily-snapshot.entity';
import { DashboardService } from '../dashboard/dashboard.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(DailySnapshot) private readonly snapshots: Repository<DailySnapshot>,
    private readonly dashboard: DashboardService,
  ) {}

  private today() {
    return new Date().toISOString().slice(0, 10);
  }

  // Capture un instantané des statistiques du jour, juste avant minuit,
  // pour bâtir un historique persistant (le dashboard live recalcule tout
  // à la volée et ne conserve rien dans le temps).
  @Cron('55 23 * * *')
  async captureToday() {
    const snapshot = await this.buildSnapshot();
    this.logger.log(`Instantané quotidien enregistré (${snapshot?.date})`);
    return snapshot;
  }

  async buildSnapshot() {
    const [overview, stats] = await Promise.all([this.dashboard.overview(), this.dashboard.stats()]);
    const date = this.today();
    const data = {
      date,
      participants: overview.today.participants,
      demandesRecues: overview.today.demandesRecues,
      urgentes: overview.today.urgentes,
      intercesseursConnectes: overview.today.intercesseursConnectes,
      totalPrayerRequests: stats.totalPrayerRequests,
      totalTestimonies: stats.totalTestimonies,
      totalIntercessors: stats.totalIntercessors,
      totalPrayerHours: stats.totalPrayerHours,
    };
    await this.snapshots.upsert(data, ['date']);
    return this.snapshots.findOne({ where: { date } });
  }

  findHistory(limit = 30) {
    return this.snapshots.find({ order: { date: 'DESC' }, take: limit });
  }
}
