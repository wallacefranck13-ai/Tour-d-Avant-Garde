import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsAppSession, WhatsAppState } from './entities/whatsapp-session.entity';
import { UsersService } from '../users/users.service';
import { PrayerRequestsService } from '../prayer-requests/prayer-requests.service';
import { TestimoniesService } from '../testimonies/testimonies.service';
import { NotificationsService } from '../notifications/notifications.service';
import { VeilleurService } from '../veilleur/veilleur.service';

const GREETINGS = ['bonjour', 'salut', 'menu', 'bonsoir', 'hello', 'coucou', ''];

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    @InjectRepository(WhatsAppSession) private readonly sessions: Repository<WhatsAppSession>,
    private readonly users: UsersService,
    private readonly prayerRequests: PrayerRequestsService,
    private readonly testimonies: TestimoniesService,
    private readonly notifications: NotificationsService,
    private readonly veilleur: VeilleurService,
  ) {}

  private async getSession(phone: string) {
    let session = await this.sessions.findOne({ where: { phone } });
    if (!session) {
      session = await this.sessions.save(this.sessions.create({ phone, state: WhatsAppState.MENU }));
    }
    return session;
  }

  private async setState(session: WhatsAppSession, state: WhatsAppState) {
    session.state = state;
    return this.sessions.save(session);
  }

  async handleIncomingMessage(phone: string, text: string, profileName?: string) {
    const trimmed = (text ?? '').trim();
    const user = await this.users.findOrCreateByPhone(phone, profileName || phone);
    const session = await this.getSession(phone);

    let reply: string;

    switch (session.state) {
      case WhatsAppState.AWAITING_PRAYER_REQUEST: {
        const request = await this.prayerRequests.create({
          user,
          authorName: user.fullName,
          phone,
          subject: trimmed.slice(0, 120),
          description: trimmed,
          category: 'WhatsApp',
          isUrgent: /urgent/i.test(trimmed),
        });
        reply = this.veilleur.confirmerRequete(request.subject);
        await this.setState(session, WhatsAppState.MENU);
        break;
      }
      case WhatsAppState.AWAITING_TESTIMONY: {
        await this.testimonies.create({ user, authorName: user.fullName, title: trimmed.slice(0, 80), content: trimmed });
        reply = this.veilleur.confirmerTemoignage();
        await this.setState(session, WhatsAppState.MENU);
        break;
      }
      case WhatsAppState.AWAITING_RESPONSABLE_MESSAGE: {
        await this.notifications.send(user, 'Message pour un responsable', trimmed, 'internal');
        reply = this.veilleur.confirmerMessageResponsable();
        await this.setState(session, WhatsAppState.MENU);
        break;
      }
      default: {
        reply = await this.routeMenu(trimmed, user, session);
      }
    }

    this.logger.log(`WhatsApp <- ${phone}: "${trimmed}" | -> "${reply.slice(0, 60)}..."`);
    return reply;
  }

  private async routeMenu(trimmed: string, user: Awaited<ReturnType<UsersService['findOrCreateByPhone']>>, session: WhatsAppSession) {
    if (GREETINGS.includes(trimmed.toLowerCase())) {
      return this.veilleur.accueillir(user.fullName);
    }

    switch (trimmed) {
      case '1':
        return this.veilleur.rejoindrePriere();
      case '2':
        await this.setState(session, WhatsAppState.AWAITING_PRAYER_REQUEST);
        return this.veilleur.demanderRequete();
      case '3':
        return this.veilleur.afficherProgramme();
      case '4':
        return this.veilleur.rappelerRencontre();
      case '5':
        await this.setState(session, WhatsAppState.AWAITING_TESTIMONY);
        return this.veilleur.demanderTemoignage();
      case '6':
        await this.setState(session, WhatsAppState.AWAITING_RESPONSABLE_MESSAGE);
        return this.veilleur.demanderMessageResponsable();
      default:
        return this.veilleur.guider();
    }
  }
}
