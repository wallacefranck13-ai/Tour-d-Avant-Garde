import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrayerProgram } from './entities/prayer-program.entity';
import { PrayerStep } from './entities/prayer-step.entity';

@Injectable()
export class PrayerProgramsService {
  constructor(
    @InjectRepository(PrayerProgram) private readonly programs: Repository<PrayerProgram>,
    @InjectRepository(PrayerStep) private readonly steps: Repository<PrayerStep>,
  ) {}

  findAll() {
    return this.programs.find({ relations: ['steps'], order: { date: 'DESC' } });
  }

  async totalPrayerHours() {
    const programs = await this.programs.find({ relations: ['steps'] });
    const totalMinutes = programs.reduce((sum, p) => sum + (p.steps ?? []).reduce((s, step) => s + step.durationMinutes, 0), 0);
    return Math.round(totalMinutes / 60);
  }

  todayDate() {
    return new Date().toISOString().slice(0, 10);
  }

  findToday() {
    return this.programs.findOne({
      where: { date: this.todayDate(), isActive: true },
      relations: ['steps'],
      order: { steps: { orderIndex: 'ASC' } },
    });
  }

  create(data: Partial<PrayerProgram>) {
    const program = this.programs.create(data);
    return this.programs.save(program);
  }

  /**
   * Determine which step is "current" by allocating each step's durationMinutes
   * sequentially from the program's creation time. Used for the live dashboard
   * session widget (step name + time remaining).
   */
  async currentSession() {
    const program = await this.findToday();
    if (!program || !program.steps?.length) return null;
    const sorted = [...program.steps].sort((a, b) => a.orderIndex - b.orderIndex);
    const start = new Date(program.createdAt).getTime();
    const now = Date.now();
    let cursor = start;
    for (const step of sorted) {
      const end = cursor + step.durationMinutes * 60 * 1000;
      if (now < end) {
        return {
          program: program.title,
          step: step.title,
          stepIndex: step.orderIndex,
          totalSteps: sorted.length,
          remainingSeconds: Math.max(0, Math.round((end - now) / 1000)),
        };
      }
      cursor = end;
    }
    const last = sorted[sorted.length - 1];
    return {
      program: program.title,
      step: last.title,
      stepIndex: last.orderIndex,
      totalSteps: sorted.length,
      remainingSeconds: 0,
    };
  }
}
