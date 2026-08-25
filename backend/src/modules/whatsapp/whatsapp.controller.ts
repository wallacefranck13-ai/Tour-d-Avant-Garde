import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WhatsappService } from './whatsapp.service';
import { WhatsappApiService } from './whatsapp-api.service';
import { SimulateDto } from './dto/simulate.dto';

interface MetaWebhookPayload {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{ from: string; text?: { body: string }; type: string }>;
        contacts?: Array<{ profile?: { name?: string } }>;
      };
    }>;
  }>;
}

@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly whatsapp: WhatsappService,
    private readonly whatsappApi: WhatsappApiService,
    private readonly config: ConfigService,
  ) {}

  // Vérification du webhook Meta Cloud API (à brancher en Sprint 2)
  @Get('webhook')
  verify(@Query('hub.mode') mode: string, @Query('hub.verify_token') token: string, @Query('hub.challenge') challenge: string) {
    const expected = this.config.get<string>('WHATSAPP_VERIFY_TOKEN');
    if (mode === 'subscribe' && token === expected) return challenge;
    return 'forbidden';
  }

  // Réception des messages entrants (format Meta Cloud API)
  @Post('webhook')
  async receive(@Body() payload: MetaWebhookPayload) {
    const value = payload.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];
    if (!message || message.type !== 'text') return { status: 'ignored' };
    const name = value?.contacts?.[0]?.profile?.name;
    const reply = await this.whatsapp.handleIncomingMessage(message.from, message.text?.body ?? '', name);
    await this.whatsappApi.sendText(message.from, reply);
    return { status: 'ok', reply };
  }

  // Endpoint de simulation pour tester Le Veilleur sans intégration WhatsApp réelle
  @Post('simulate')
  async simulate(@Body() dto: SimulateDto) {
    const reply = await this.whatsapp.handleIncomingMessage(dto.phone, dto.text, dto.name);
    return { reply };
  }
}
