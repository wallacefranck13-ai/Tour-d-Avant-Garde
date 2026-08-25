import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
  ) {}

  findAll() {
    return this.users.find({ relations: ['role', 'community'], order: { createdAt: 'DESC' } });
  }

  findByPhone(phone: string) {
    return this.users.findOne({ where: { phone }, relations: ['role', 'community'] });
  }

  findByEmail(email: string) {
    return this.users.findOne({ where: { email }, relations: ['role'], select: ['id', 'fullName', 'email', 'passwordHash'] as any });
  }

  async findOrCreateByPhone(phone: string, fullName: string) {
    let user = await this.findByPhone(phone);
    if (!user) {
      user = this.users.create({ phone, fullName, isOnline: true, lastSeenAt: new Date() });
      user = await this.users.save(user);
    } else {
      user.isOnline = true;
      user.lastSeenAt = new Date();
      await this.users.save(user);
    }
    return user;
  }

  countOnlineIntercessors() {
    return this.users.count({ where: { isIntercessor: true, isOnline: true } });
  }

  countAllIntercessors() {
    return this.users.count({ where: { isIntercessor: true } });
  }

  countAll() {
    return this.users.count();
  }

  async create(data: Partial<User>) {
    const user = this.users.create(data);
    return this.users.save(user);
  }

  async findRoleByName(name: string) {
    return this.roles.findOne({ where: { name } });
  }

  findByRoleName(name: string) {
    return this.users.find({ where: { role: { name } }, relations: ['role'] });
  }
}
