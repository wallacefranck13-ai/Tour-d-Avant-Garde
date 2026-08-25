import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { existsSync, unlinkSync } from 'fs';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { Role } from '../src/modules/users/entities/role.entity';
import { User } from '../src/modules/users/entities/user.entity';

/**
 * Tests d'intégration bout-en-bout : app NestJS réelle, vraies requêtes HTTP
 * (supertest), base sql.js dédiée et jetable (isolée de la base de
 * développement). Complète les tests unitaires (mocks) en vérifiant que tout
 * le câblage réel — guards, pipes, filtres, TypeORM — fonctionne ensemble.
 */
const TEST_DB_PATH = './data/e2e-test.sqlite';

function cleanupTestDb() {
  if (existsSync(TEST_DB_PATH)) unlinkSync(TEST_DB_PATH);
}

describe("Tour d'Avant-Garde API (e2e)", () => {
  let app: INestApplication;
  let responsableToken: string;

  beforeAll(async () => {
    cleanupTestDb();
    process.env.DB_DRIVER = 'sqljs';
    process.env.DB_PATH = TEST_DB_PATH;
    process.env.JWT_SECRET = 'e2e-test-secret';

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new AllExceptionsFilter());
    app.setGlobalPrefix('api/v1');
    await app.init();

    const roleRepo = moduleRef.get(getRepositoryToken(Role), { strict: false });
    const userRepo = moduleRef.get(getRepositoryToken(User), { strict: false });
    const role = await roleRepo.save(roleRepo.create({ name: 'RESPONSABLE' }));
    await userRepo.save(
      userRepo.create({
        fullName: 'Test Responsable',
        phone: '+000000000',
        email: 'e2e@test.org',
        passwordHash: await bcrypt.hash('secret123', 4),
        role,
      }),
    );
  });

  afterAll(async () => {
    await app.close();
    cleanupTestDb();
  });

  it('GET /api/v1/health renvoie ok avec le statut de la base', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database.ok).toBe(true);
  });

  it('une route inconnue renvoie une forme d\'erreur 404 cohérente', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/route-inconnue').expect(404);
    expect(res.body).toMatchObject({ statusCode: 404, path: '/api/v1/route-inconnue' });
    expect(res.body.timestamp).toBeDefined();
  });

  it('POST /api/v1/auth/login rejette de mauvais identifiants', async () => {
    await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'e2e@test.org', password: 'wrong' }).expect(401);
  });

  it('POST /api/v1/auth/login réussit et renvoie un JWT utilisable', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'e2e@test.org', password: 'secret123' })
      .expect(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.role).toBe('RESPONSABLE');
    responsableToken = res.body.accessToken;
  });

  it('POST /api/v1/prayer-requests rejette une entrée invalide avec le détail des erreurs', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/prayer-requests')
      .set('Authorization', `Bearer ${responsableToken}`)
      .send({})
      .expect(400);
    expect(Array.isArray(res.body.message)).toBe(true);
  });

  it('parcours complet : le simulateur WhatsApp crée un membre et une requête de bout en bout', async () => {
    const phone = '+243900000777';
    await request(app.getHttpServer()).post('/api/v1/whatsapp/simulate').send({ phone, text: 'menu', name: 'E2E Testeur' }).expect(201);
    await request(app.getHttpServer()).post('/api/v1/whatsapp/simulate').send({ phone, text: '2' }).expect(201);
    const reply = await request(app.getHttpServer())
      .post('/api/v1/whatsapp/simulate')
      .send({ phone, text: 'Guérison pour ma famille' })
      .expect(201);
    expect(reply.body.reply).toContain('Guérison pour ma famille');

    const list = await request(app.getHttpServer()).get('/api/v1/prayer-requests').expect(200);
    expect(list.body.some((r: { subject: string }) => r.subject.includes('Guérison pour ma famille'))).toBe(true);
  });

  it('RBAC : une requête non authentifiée ne peut pas changer le statut d\'une requête', async () => {
    const list = await request(app.getHttpServer()).get('/api/v1/prayer-requests').expect(200);
    const id = list.body[0].id;
    await request(app.getHttpServer()).patch(`/api/v1/prayer-requests/${id}/status`).send({ status: 'ANSWERED' }).expect(401);
  });

  it('GET /api/v1/prayer-requests?page=1&limit=1 renvoie un objet paginé sans casser la forme par défaut', async () => {
    const raw = await request(app.getHttpServer()).get('/api/v1/prayer-requests').expect(200);
    expect(Array.isArray(raw.body)).toBe(true);

    const paginated = await request(app.getHttpServer()).get('/api/v1/prayer-requests?page=1&limit=1').expect(200);
    expect(Array.isArray(paginated.body)).toBe(false);
    expect(paginated.body.data.length).toBe(1);
    expect(paginated.body.meta).toMatchObject({ page: 1, limit: 1 });
    expect(paginated.body.meta.total).toBe(raw.body.length);
  });

  it('GET /api/v1/campaigns?page=1&limit=1 renvoie aussi un objet paginé', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/campaigns')
      .set('Authorization', `Bearer ${responsableToken}`)
      .send({ title: 'Campagne E2E', description: 'Test pagination' })
      .expect(201);

    const raw = await request(app.getHttpServer()).get('/api/v1/campaigns').expect(200);
    expect(Array.isArray(raw.body)).toBe(true);

    const paginated = await request(app.getHttpServer()).get('/api/v1/campaigns?page=1&limit=1').expect(200);
    expect(paginated.body.data.length).toBe(1);
    expect(paginated.body.meta).toMatchObject({ page: 1, limit: 1, total: raw.body.length });
  });

  it('RBAC : le responsable connecté peut changer le statut d\'une requête', async () => {
    const list = await request(app.getHttpServer()).get('/api/v1/prayer-requests').expect(200);
    const id = list.body[0].id;
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/prayer-requests/${id}/status`)
      .set('Authorization', `Bearer ${responsableToken}`)
      .send({ status: 'ANSWERED' })
      .expect(200);
    expect(res.body.affected).toBe(1);
  });
});
