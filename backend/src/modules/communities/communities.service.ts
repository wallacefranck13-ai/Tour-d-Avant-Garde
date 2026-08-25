import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community } from './entities/community.entity';

@Injectable()
export class CommunitiesService {
  constructor(@InjectRepository(Community) private readonly communities: Repository<Community>) {}

  findAll() {
    return this.communities.find();
  }

  create(data: Partial<Community>) {
    return this.communities.save(this.communities.create(data));
  }
}
