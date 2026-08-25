import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThan, Repository } from 'typeorm';
import { Meeting } from './entities/meeting.entity';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { isPaginationRequested, resolvePagination, toPaginated } from '../../common/pagination';

@Injectable()
export class MeetingsService {
  constructor(@InjectRepository(Meeting) private readonly meetings: Repository<Meeting>) {}

  async findAll(pagination?: PaginationQueryDto) {
    if (!isPaginationRequested(pagination)) {
      return this.meetings.find({ order: { startAt: 'ASC' } });
    }
    const { page, limit, skip, take } = resolvePagination(pagination!);
    const [data, total] = await this.meetings.findAndCount({ order: { startAt: 'ASC' }, skip, take });
    return toPaginated(data, total, page, limit);
  }

  findNext() {
    return this.meetings.findOne({ where: { startAt: MoreThan(new Date()) }, order: { startAt: 'ASC' } });
  }

  create(data: Partial<Meeting>) {
    return this.meetings.save(this.meetings.create(data));
  }

  findUpcomingUnreminded(withinMinutes: number) {
    const now = new Date();
    const horizon = new Date(now.getTime() + withinMinutes * 60 * 1000);
    return this.meetings.find({ where: { startAt: Between(now, horizon), reminderSent: false } });
  }

  markReminded(id: string) {
    return this.meetings.update(id, { reminderSent: true });
  }
}
