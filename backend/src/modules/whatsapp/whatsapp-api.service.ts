import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Client pour l'API Meta Cloud (WhatsApp Business). N'envoie réellement un
 * message que si WHATSAPP_ACCESS_TOKEN et WHATSAPP_PHONE_NUMBER_ID sont
 * configurés dans .env ; sinon journalise et ne fait rien (mode démo/local).
 */
@Injectable()
export class WhatsappApiService {
  private readonly logger = new Logger(WhatsappApiService.name);

  constructor(private readonly config: ConfigService) {}

  private isConfigured() {
    return Boolean(this.config.get<string>('WHATSAPP_ACCESS_TOKEN') && this.config.get<string>('WHATSAPP_PHONE_NUMBER_ID'));
  }

  async sendText(to: string, body: string): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.warn(`WHATSAPP_ACCESS_TOKEN/WHATSAPP_PHONE_NUMBER_ID non configurés — message non envoyé à ${to} (mode démo).`);
      return;
    }

    const phoneNumberId = this.config.get<string>('WHATSAPP_PHONE_NUMBER_ID');
    const accessToken = this.config.get<string>('WHATSAPP_ACCESS_TOKEN');
    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } }),
      });
      if (!res.ok) {
        const errorBody = await res.text();
        this.logger.error(`Échec envoi WhatsApp vers ${to}: ${res.status} ${errorBody}`);
      }
    } catch (err) {
      this.logger.error(`Erreur réseau lors de l'envoi WhatsApp vers ${to}`, err as Error);
    }
  }
}
