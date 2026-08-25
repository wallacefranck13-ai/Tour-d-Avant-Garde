import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorldPrayerIntention } from './entities/world-prayer-intention.entity';

const DEFAULT_ITEMS = ['la paix dans les nations', 'les familles', 'les malades', 'les missionnaires', 'les autorités', 'les jeunes'];

@Injectable()
export class WorldIntentionsService {
  constructor(@InjectRepository(WorldPrayerIntention) private readonly intentions: Repository<WorldPrayerIntention>) {}

  private today() {
    return new Date().toISOString().slice(0, 10);
  }

  async findToday() {
    const date = this.today();
    let intention = await this.intentions.findOne({ where: { date } });
    if (!intention) {
      intention = await this.intentions.save(
        this.intentions.create({ date, title: "Aujourd'hui, toute la Tour prie pour :", items: DEFAULT_ITEMS }),
      );
    }
    return intention;
  }

  findAll() {
    return this.intentions.find({ order: { date: 'DESC' } });
  }

  upsertForDate(date: string, title: string, items: string[]) {
    return this.intentions.upsert({ date, title, items }, ['date']);
  }
}
