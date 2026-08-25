import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimony } from './entities/testimony.entity';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { isPaginationRequested, resolvePagination, toPaginated } from '../../common/pagination';

@Injectable()
export class TestimoniesService {
  constructor(@InjectRepository(Testimony) private readonly testimonies: Repository<Testimony>) {}

  async findAll(pagination?: PaginationQueryDto) {
    if (!isPaginationRequested(pagination)) {
      return this.testimonies.find({ order: { createdAt: 'DESC' } });
    }
    const { page, limit, skip, take } = resolvePagination(pagination!);
    const [data, total] = await this.testimonies.findAndCount({ order: { createdAt: 'DESC' }, skip, take });
    return toPaginated(data, total, page, limit);
  }

  countAll() {
    return this.testimonies.count();
  }

  create(data: Partial<Testimony>) {
    return this.testimonies.save(this.testimonies.create(data));
  }

  setPhoto(id: string, photoPath: string) {
    return this.testimonies.update(id, { photoPath });
  }
}
