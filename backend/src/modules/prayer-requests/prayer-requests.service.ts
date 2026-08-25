import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThan, Repository } from 'typeorm';
import { PrayerRequest, PrayerRequestStatus } from './entities/prayer-request.entity';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { isPaginationRequested, resolvePagination, toPaginated } from '../../common/pagination';

@Injectable()
export class PrayerRequestsService {
  constructor(@InjectRepository(PrayerRequest) private readonly requests: Repository<PrayerRequest>) {}

  async findAll(pagination?: PaginationQueryDto) {
    if (!isPaginationRequested(pagination)) {
      return this.requests.find({ order: { createdAt: 'DESC' } });
    }
    const { page, limit, skip, take } = resolvePagination(pagination!);
    const [data, total] = await this.requests.findAndCount({ order: { createdAt: 'DESC' }, skip, take });
    return toPaginated(data, total, page, limit);
  }

  countAll() {
    return this.requests.count();
  }

  create(data: Partial<PrayerRequest>) {
    const request = this.requests.create(data);
    return this.requests.save(request);
  }

  updateStatus(id: string, status: PrayerRequestStatus) {
    return this.requests.update(id, { status });
  }

  private todayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  countToday() {
    const { start, end } = this.todayRange();
    return this.requests.count({ where: { createdAt: Between(start, end) } });
  }

  countUrgentToday() {
    const { start, end } = this.todayRange();
    return this.requests.count({ where: { createdAt: Between(start, end), isUrgent: true } });
  }

  findStaleUnflagged(olderThanHours: number) {
    const threshold = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    return this.requests.find({ where: { status: PrayerRequestStatus.NEW, followUpSent: false, createdAt: LessThan(threshold) } });
  }

  markFollowUpSent(id: string) {
    return this.requests.update(id, { followUpSent: true });
  }
}
