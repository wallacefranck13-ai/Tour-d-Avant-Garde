import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { isPaginationRequested, resolvePagination, toPaginated } from '../../common/pagination';

@Injectable()
export class CampaignsService {
  constructor(@InjectRepository(Campaign) private readonly campaigns: Repository<Campaign>) {}

  async findAll(pagination?: PaginationQueryDto) {
    if (!isPaginationRequested(pagination)) {
      return this.campaigns.find({ order: { createdAt: 'DESC' } });
    }
    const { page, limit, skip, take } = resolvePagination(pagination!);
    const [data, total] = await this.campaigns.findAndCount({ order: { createdAt: 'DESC' }, skip, take });
    return toPaginated(data, total, page, limit);
  }

  create(data: Partial<Campaign>) {
    return this.campaigns.save(this.campaigns.create(data));
  }
}
