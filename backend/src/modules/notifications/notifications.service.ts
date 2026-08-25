import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { isPaginationRequested, resolvePagination, toPaginated } from '../../common/pagination';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(@InjectRepository(Notification) private readonly notifications: Repository<Notification>) {}

  async findAll(pagination?: PaginationQueryDto) {
    if (!isPaginationRequested(pagination)) {
      return this.notifications.find({ order: { createdAt: 'DESC' } });
    }
    const { page, limit, skip, take } = resolvePagination(pagination!);
    const [data, total] = await this.notifications.findAndCount({ order: { createdAt: 'DESC' }, skip, take });
    return toPaginated(data, total, page, limit);
  }

  /**
   * Sprint 1 stub: logs the notification and marks it SENT. Real WhatsApp/Email/Push
   * dispatch will be wired in once provider credentials are configured (see .env.example).
   */
  async send(user: User | undefined, title: string, body: string, channel = 'whatsapp') {
    const notification = this.notifications.create({ user, title, body, channel, status: 'SENT', sentAt: new Date() });
    this.logger.log(`[${channel}] -> ${user?.phone ?? 'inconnu'}: ${title}`);
    return this.notifications.save(notification);
  }
}
