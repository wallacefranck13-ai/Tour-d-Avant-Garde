import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActionOfFaith } from './entities/action-of-faith.entity';

@Injectable()
export class ActionOfFaithService {
  constructor(@InjectRepository(ActionOfFaith) private readonly actions: Repository<ActionOfFaith>) {}

  findAll() {
    return this.actions.find({ order: { createdAt: 'DESC' } });
  }

  create(data: Partial<ActionOfFaith>) {
    return this.actions.save(this.actions.create(data));
  }
}
