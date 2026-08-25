import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

/**
 * Envoi d'e-mails via SMTP. N'envoie réellement que si SMTP_HOST est
 * configuré ; sinon journalise et ne fait rien (même pattern que
 * WhatsappApiService et StorageService — fonctionne sans configuration,
 * s'active dès que les identifiants arrivent).
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter?: nodemailer.Transporter;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.from = this.config.get<string>('SMTP_FROM', "Tour d'Avant-Garde <no-reply@tourdavantgarde.org>");
    const host = this.config.get<string>('SMTP_HOST');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('SMTP_PORT', 587),
        secure: this.config.get<string>('SMTP_SECURE') === 'true',
        auth: this.config.get<string>('SMTP_USER')
          ? { user: this.config.get<string>('SMTP_USER'), pass: this.config.get<string>('SMTP_PASSWORD') }
          : undefined,
      });
      this.logger.log(`Envoi d'e-mails : SMTP configuré (${host})`);
    } else {
      this.logger.log('Envoi d\'e-mails : SMTP_HOST non configuré — mode démo (journalisation uniquement)');
    }
  }

  async send(to: string, subject: string, text: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`SMTP_HOST non configuré — e-mail non envoyé à ${to} (mode démo). Sujet : "${subject}"`);
      return;
    }
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, text });
    } catch (err) {
      this.logger.error(`Échec envoi e-mail à ${to}`, err as Error);
    }
  }
}
