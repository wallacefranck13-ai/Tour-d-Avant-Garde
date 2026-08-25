import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
loadEnv();

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { getDatabaseConnectionOptions } from './database.config';
import { Role } from '../modules/users/entities/role.entity';
import { User } from '../modules/users/entities/user.entity';
import { Community } from '../modules/communities/entities/community.entity';
import { PrayerProgram } from '../modules/prayer-programs/entities/prayer-program.entity';
import { PrayerStep } from '../modules/prayer-programs/entities/prayer-step.entity';
import { PrayerRequest } from '../modules/prayer-requests/entities/prayer-request.entity';
import { IntercessionTeam } from '../modules/intercession-teams/entities/intercession-team.entity';
import { Meeting } from '../modules/meetings/entities/meeting.entity';
import { Notification } from '../modules/notifications/entities/notification.entity';
import { Testimony } from '../modules/testimonies/entities/testimony.entity';
import { ActionOfFaith } from '../modules/action-of-faith/entities/action-of-faith.entity';
import { WorldPrayerIntention } from '../modules/world-intentions/entities/world-prayer-intention.entity';
import { FlambeauAssignment } from '../modules/flambeau/entities/flambeau-assignment.entity';
import { WhatsAppSession } from '../modules/whatsapp/entities/whatsapp-session.entity';
import { Campaign } from '../modules/campaigns/entities/campaign.entity';

const dataSource = new DataSource({
  ...(getDatabaseConnectionOptions() as any),
  synchronize: true,
  entities: [
    Role,
    User,
    Community,
    PrayerProgram,
    PrayerStep,
    PrayerRequest,
    IntercessionTeam,
    Meeting,
    Notification,
    Testimony,
    ActionOfFaith,
    WorldPrayerIntention,
    FlambeauAssignment,
    WhatsAppSession,
    Campaign,
  ],
});

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function seed() {
  await dataSource.initialize();

  const roleRepo = dataSource.getRepository(Role);
  const userRepo = dataSource.getRepository(User);
  const communityRepo = dataSource.getRepository(Community);
  const programRepo = dataSource.getRepository(PrayerProgram);
  const requestRepo = dataSource.getRepository(PrayerRequest);
  const teamRepo = dataSource.getRepository(IntercessionTeam);
  const meetingRepo = dataSource.getRepository(Meeting);
  const testimonyRepo = dataSource.getRepository(Testimony);
  const actionRepo = dataSource.getRepository(ActionOfFaith);
  const intentionRepo = dataSource.getRepository(WorldPrayerIntention);
  const flambeauRepo = dataSource.getRepository(FlambeauAssignment);
  const campaignRepo = dataSource.getRepository(Campaign);

  const roleNames = ['RESPONSABLE', 'INTERCESSEUR', 'MEMBRE'];
  const roles: Record<string, Role> = {};
  for (const name of roleNames) {
    const existingRole = await roleRepo.findOne({ where: { name } });
    roles[name] = existingRole ?? (await roleRepo.save(roleRepo.create({ name })));
  }

  async function getOrCreateCommunity(): Promise<Community> {
    const name = "Tour d'Avant-Garde — Communauté Principale";
    const existing = await communityRepo.findOne({ where: { name } });
    if (existing) return existing;
    return communityRepo.save(communityRepo.create({ name, city: 'Kinshasa', timezone: 'Africa/Kinshasa' }));
  }
  const community = await getOrCreateCommunity();

  async function upsertUser(fullName: string, phone: string, roleKey: string, extra: Partial<User> = {}): Promise<User> {
    const existing = await userRepo.findOne({ where: { phone } });
    if (existing) return existing;
    return userRepo.save(userRepo.create({ fullName, phone, role: roles[roleKey], community, ...extra }));
  }

  const responsable = await upsertUser('Jonathan M.', '+243900000001', 'RESPONSABLE', {
    email: 'responsable@tourdavantgarde.org',
    passwordHash: await bcrypt.hash('password123', 10),
    isIntercessor: true,
    isOnline: true,
    lastSeenAt: new Date(),
  });

  const intercessorNames: [string, string][] = [
    ['Marie L.', '+243900000002'],
    ['Pierre K.', '+243900000003'],
    ['Sarah T.', '+243900000004'],
    ['David R.', '+243900000005'],
  ];
  const intercessors: User[] = [];
  for (const [name, phone] of intercessorNames) {
    intercessors.push(await upsertUser(name, phone, 'INTERCESSEUR', { isIntercessor: true, isOnline: true, lastSeenAt: new Date() }));
  }

  const marie = intercessors[0];
  if (!marie.email) {
    marie.email = 'marie@tourdavantgarde.org';
    marie.passwordHash = await bcrypt.hash('password123', 10);
    await userRepo.save(marie);
  }

  const member = await upsertUser('Jean B.', '+243900000006', 'MEMBRE');

  async function getOrCreateTeam(): Promise<IntercessionTeam> {
    const name = 'Intercesseurs du matin';
    const existing = await teamRepo.findOne({ where: { name } });
    if (existing) return existing;
    return teamRepo.save(teamRepo.create({ name, community, leader: responsable }));
  }
  const team = await getOrCreateTeam();

  async function getOrCreateProgram(): Promise<PrayerProgram> {
    const date = today();
    const existing = await programRepo.findOne({ where: { date } });
    if (existing) return existing;
    return programRepo.save(
      programRepo.create({
        community,
        title: 'Programme du jour — Tour de veille',
        date,
        description: 'Temps collectif de louange, repentance et intercession.',
        isActive: true,
        steps: [
          { orderIndex: 1, title: 'Louange & Adoration', durationMinutes: 15, description: 'Entrer dans la présence de Dieu' },
          { orderIndex: 2, title: 'Confession & Repentance', durationMinutes: 10, description: 'Se présenter en vérité' },
          { orderIndex: 3, title: 'Intercession pour les nations', durationMinutes: 20, description: 'Intentions mondiales' },
          { orderIndex: 4, title: 'Intercession pour les requêtes personnelles', durationMinutes: 20, description: 'Requêtes de la communauté' },
        ] as PrayerStep[],
      }),
    );
  }
  await getOrCreateProgram();

  if ((await requestRepo.count()) === 0) {
    await requestRepo.save([
      requestRepo.create({ user: member, authorName: 'Jean B.', phone: member.phone, subject: 'Guérison complète', category: 'Guérison', status: 'NEW' as any }),
      requestRepo.create({ user: intercessors[0], authorName: 'Marie L.', phone: intercessors[0].phone, subject: 'Protection pour ma famille', category: 'Protection', status: 'IN_PROGRESS' as any }),
      requestRepo.create({ user: intercessors[1], authorName: 'Pierre K.', phone: intercessors[1].phone, subject: 'Percée financière', category: 'Percée', status: 'ASSIGNED' as any, assignedTeam: team, isUrgent: true }),
      requestRepo.create({ user: intercessors[2], authorName: 'Sarah T.', phone: intercessors[2].phone, subject: 'Délivrance et paix', category: 'Délivrance', status: 'ANSWERED' as any, isUrgent: true }),
      requestRepo.create({ user: intercessors[3], authorName: 'David R.', phone: intercessors[3].phone, subject: 'Réussite aux examens', category: 'Autre', status: 'ARCHIVED' as any }),
    ]);
  }

  const nextMeeting = await meetingRepo.findOne({ where: { title: 'Réunion de prière générale' } });
  if (!nextMeeting) {
    const startAt = new Date();
    startAt.setHours(19, 0, 0, 0);
    if (startAt.getTime() < Date.now()) startAt.setDate(startAt.getDate() + 1);
    await meetingRepo.save(
      meetingRepo.create({ community, title: 'Réunion de prière générale', type: 'prayer', startAt, location: 'Salle principale + WhatsApp' }),
    );
  }

  if ((await testimonyRepo.count()) === 0) {
    await testimonyRepo.save(
      testimonyRepo.create({ user: intercessors[0], authorName: 'Marie L.', title: 'Délivrance miraculeuse', content: 'Dieu a répondu à notre prière collective cette semaine.', status: 'PUBLISHED' }),
    );
  }

  if ((await actionRepo.count()) === 0) {
    await actionRepo.save(
      actionRepo.create({ user: member, authorName: 'Jean B.', description: "J'ai pardonné et appelé la personne pour me réconcilier." }),
    );
  }

  await intentionRepo.upsert(
    {
      date: today(),
      title: "Aujourd'hui, toute la Tour prie pour :",
      items: ['la paix dans les nations', 'les familles', 'les malades', 'les missionnaires', 'les autorités', 'les jeunes'],
    },
    ['date'],
  );

  const flambeauExisting = await flambeauRepo.findOne({ where: { date: today() } });
  if (!flambeauExisting) {
    await flambeauRepo.save(
      flambeauRepo.create({
        date: today(),
        guardian: responsable,
        checklist: {
          programmeLance: true,
          intercesseursEncourages: false,
          situationsImportantesTraitees: false,
          messagePublie: false,
        },
      }),
    );
  }

  if ((await campaignRepo.count()) === 0) {
    await campaignRepo.save([
      campaignRepo.create({ community, title: '21 jours de jeûne et de prière', description: 'Un temps consacré de recherche de Dieu.', targetParticipants: 500, currentParticipants: 320 }),
      campaignRepo.create({ community, title: 'Le mois de la faveur divine', description: 'Un mois entier pour proclamer la faveur de Dieu.', targetParticipants: 450, currentParticipants: 180 }),
      campaignRepo.create({ community, title: 'Campagne pour les nations', description: 'Intercession soutenue pour les nations du monde.', targetParticipants: 880, currentParticipants: 220 }),
    ]);
  }

  // eslint-disable-next-line no-console
  console.log('Seed terminé.');
  console.log(`Connexion responsable -> email: ${responsable.email} / mot de passe: password123`);
  console.log(`Connexion intercesseur -> email: ${marie.email} / mot de passe: password123`);
  await dataSource.destroy();
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Erreur pendant le seed', err);
  process.exit(1);
});
