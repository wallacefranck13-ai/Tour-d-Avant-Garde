import { VeilleurService } from './veilleur.service';

describe('VeilleurService', () => {
  const makeService = (overrides: { session?: any; program?: any; meeting?: any; intention?: any } = {}) => {
    const prayerPrograms = {
      currentSession: jest.fn().mockResolvedValue(overrides.session ?? null),
      findToday: jest.fn().mockResolvedValue(overrides.program ?? null),
    } as any;
    const meetings = {
      findNext: jest.fn().mockResolvedValue(overrides.meeting ?? null),
    } as any;
    const worldIntentions = {
      findToday: jest.fn().mockResolvedValue(overrides.intention ?? { title: "Aujourd'hui, toute la Tour prie pour :", items: ['les familles'] }),
    } as any;
    return new VeilleurService(prayerPrograms, meetings, worldIntentions);
  };

  it('accueillir() includes the 6 menu options and the visitor name', async () => {
    const service = makeService();
    const message = await service.accueillir('Jean B.');
    expect(message).toContain('Jean B.');
    expect(message).toContain('Rejoindre la prière en cours');
    expect(message).toContain('6️⃣');
  });

  it('rejoindrePriere() explains there is no active session when none is running', async () => {
    const service = makeService({ session: null });
    const message = await service.rejoindrePriere();
    expect(message).toMatch(/pas de session de prière active/i);
  });

  it('rejoindrePriere() reports the current step and remaining time when a session is active', async () => {
    const service = makeService({
      session: { program: 'Programme du jour', step: 'Louange & Adoration', stepIndex: 1, totalSteps: 4, remainingSeconds: 136 },
    });
    const message = await service.rejoindrePriere();
    expect(message).toContain('Louange & Adoration');
    expect(message).toContain('2:16');
  });

  it('afficherProgramme() falls back gracefully when no program is published today', async () => {
    const service = makeService({ program: null });
    const message = await service.afficherProgramme();
    expect(message).toMatch(/Aucun programme n'est publié/);
    expect(message).toContain('les familles');
  });

  it('rappelerRencontre() falls back gracefully when no meeting is scheduled', async () => {
    const service = makeService({ meeting: null });
    const message = await service.rappelerRencontre();
    expect(message).toMatch(/Aucune rencontre n'est programmée/);
  });

  it('rappelerRencontre() reports the next meeting title and location', async () => {
    const service = makeService({ meeting: { title: 'Réunion de prière générale', startAt: new Date(), location: 'Salle principale' } });
    const message = await service.rappelerRencontre();
    expect(message).toContain('Réunion de prière générale');
    expect(message).toContain('Salle principale');
  });
});
