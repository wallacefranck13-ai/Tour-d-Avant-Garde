import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlambeauAssignment, FlambeauChecklist } from './entities/flambeau-assignment.entity';
import { User } from '../users/entities/user.entity';

const EMPTY_CHECKLIST: FlambeauChecklist = {
  programmeLance: false,
  intercesseursEncourages: false,
  situationsImportantesTraitees: false,
  messagePublie: false,
};

@Injectable()
export class FlambeauService {
  constructor(@InjectRepository(FlambeauAssignment) private readonly assignments: Repository<FlambeauAssignment>) {}

  private today() {
    return new Date().toISOString().slice(0, 10);
  }

  findToday() {
    return this.assignments.findOne({ where: { date: this.today() }, relations: ['guardian'] });
  }

  async assign(date: string, guardian: User) {
    const existing = await this.assignments.findOne({ where: { date } });
    if (existing) {
      existing.guardian = guardian;
      return this.assignments.save(existing);
    }
    return this.assignments.save(this.assignments.create({ date, guardian, checklist: { ...EMPTY_CHECKLIST } }));
  }

  async updateChecklist(date: string, patch: Partial<FlambeauChecklist>) {
    const assignment = await this.assignments.findOne({ where: { date } });
    if (!assignment) throw new NotFoundException('Aucun Gardien du Flambeau désigné pour cette date');
    assignment.checklist = { ...assignment.checklist, ...patch };
    return this.assignments.save(assignment);
  }

  async publishEncouragement(date: string, message: string) {
    const assignment = await this.assignments.findOne({ where: { date } });
    if (!assignment) throw new NotFoundException('Aucun Gardien du Flambeau désigné pour cette date');
    assignment.encouragementMessage = message;
    assignment.checklist = { ...assignment.checklist, messagePublie: true };
    return this.assignments.save(assignment);
  }
}
