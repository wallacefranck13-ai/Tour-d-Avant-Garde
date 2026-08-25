import { WhatsappService } from './whatsapp.service';
import { WhatsAppState } from './entities/whatsapp-session.entity';

describe('WhatsappService', () => {
  const user = { id: 'u1', fullName: 'Jean B.', phone: '+243900000006' };

  function makeService() {
    const sessionStore = new Map<string, any>();
    const sessions = {
      findOne: jest.fn(async ({ where: { phone } }: any) => sessionStore.get(phone) ?? null),
      create: jest.fn((data: any) => ({ ...data })),
      save: jest.fn(async (session: any) => {
        sessionStore.set(session.phone, session);
        return session;
      }),
    } as any;

    const users = { findOrCreateByPhone: jest.fn().mockResolvedValue(user) } as any;
    const prayerRequests = { create: jest.fn().mockResolvedValue({ subject: 'Guérison' }) } as any;
    const testimonies = { create: jest.fn().mockResolvedValue({}) } as any;
    const notifications = { send: jest.fn().mockResolvedValue({}) } as any;
    const veilleur = {
      accueillir: jest.fn().mockResolvedValue('BIENVENUE'),
      guider: jest.fn().mockReturnValue('GUIDE'),
      rejoindrePriere: jest.fn().mockResolvedValue('SESSION'),
      demanderRequete: jest.fn().mockReturnValue('DEMANDER_REQUETE'),
      confirmerRequete: jest.fn().mockReturnValue('REQUETE_CONFIRMEE'),
      afficherProgramme: jest.fn().mockResolvedValue('PROGRAMME'),
      rappelerRencontre: jest.fn().mockResolvedValue('RENCONTRE'),
      demanderTemoignage: jest.fn().mockReturnValue('DEMANDER_TEMOIGNAGE'),
      confirmerTemoignage: jest.fn().mockReturnValue('TEMOIGNAGE_CONFIRME'),
      demanderMessageResponsable: jest.fn().mockReturnValue('DEMANDER_MESSAGE'),
      confirmerMessageResponsable: jest.fn().mockReturnValue('MESSAGE_CONFIRME'),
    } as any;

    const service = new WhatsappService(sessions, users, prayerRequests, testimonies, notifications, veilleur);
    return { service, sessions, users, prayerRequests, testimonies, notifications, veilleur, sessionStore };
  }

  it('greets a first-time visitor with the welcome menu', async () => {
    const { service, veilleur } = makeService();
    const reply = await service.handleIncomingMessage('+243900000006', 'menu');
    expect(veilleur.accueillir).toHaveBeenCalledWith('Jean B.');
    expect(reply).toBe('BIENVENUE');
  });

  it('option 1 routes to rejoindrePriere without changing state', async () => {
    const { service, veilleur, sessionStore } = makeService();
    const reply = await service.handleIncomingMessage('+243900000006', '1');
    expect(veilleur.rejoindrePriere).toHaveBeenCalled();
    expect(reply).toBe('SESSION');
    expect(sessionStore.get('+243900000006').state).toBe(WhatsAppState.MENU);
  });

  it('option 2 asks for the prayer request and switches state', async () => {
    const { service, veilleur, sessionStore } = makeService();
    const reply = await service.handleIncomingMessage('+243900000006', '2');
    expect(veilleur.demanderRequete).toHaveBeenCalled();
    expect(reply).toBe('DEMANDER_REQUETE');
    expect(sessionStore.get('+243900000006').state).toBe(WhatsAppState.AWAITING_PRAYER_REQUEST);
  });

  it('the next free-text message after option 2 is captured as the prayer request', async () => {
    const { service, prayerRequests, veilleur, sessionStore } = makeService();
    await service.handleIncomingMessage('+243900000006', '2');
    const reply = await service.handleIncomingMessage('+243900000006', 'Guérison pour ma mère');

    expect(prayerRequests.create).toHaveBeenCalledWith(
      expect.objectContaining({ subject: 'Guérison pour ma mère', category: 'WhatsApp', isUrgent: false }),
    );
    expect(veilleur.confirmerRequete).toHaveBeenCalledWith('Guérison');
    expect(reply).toBe('REQUETE_CONFIRMEE');
    expect(sessionStore.get('+243900000006').state).toBe(WhatsAppState.MENU);
  });

  it('flags a prayer request as urgent when the user writes "urgent"', async () => {
    const { service, prayerRequests } = makeService();
    await service.handleIncomingMessage('+243900000006', '2');
    await service.handleIncomingMessage('+243900000006', "C'est urgent, priez pour moi");

    expect(prayerRequests.create).toHaveBeenCalledWith(expect.objectContaining({ isUrgent: true }));
  });

  it('option 6 routes the next message to a responsable via internal notification', async () => {
    const { service, notifications, veilleur } = makeService();
    await service.handleIncomingMessage('+243900000006', '6');
    const reply = await service.handleIncomingMessage('+243900000006', "J'ai besoin de parler à quelqu'un");

    expect(notifications.send).toHaveBeenCalledWith(user, 'Message pour un responsable', "J'ai besoin de parler à quelqu'un", 'internal');
    expect(veilleur.confirmerMessageResponsable).toHaveBeenCalled();
    expect(reply).toBe('MESSAGE_CONFIRME');
  });

  it('falls back to the guide message for unrecognized menu input', async () => {
    const { service, veilleur } = makeService();
    const reply = await service.handleIncomingMessage('+243900000006', 'blabla');
    expect(veilleur.guider).toHaveBeenCalled();
    expect(reply).toBe('GUIDE');
  });
});
