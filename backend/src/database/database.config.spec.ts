import { getDatabaseConnectionOptions } from './database.config';

describe('getDatabaseConnectionOptions', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('defaults to sql.js when DB_DRIVER is unset', () => {
    delete process.env.DB_DRIVER;
    const options = getDatabaseConnectionOptions();
    expect(options.type).toBe('sqljs');
    expect(options).toHaveProperty('location');
  });

  it('uses DATABASE_URL when DB_DRIVER=postgres and a connection string is provided', () => {
    process.env.DB_DRIVER = 'postgres';
    process.env.DATABASE_URL = 'postgres://user:pass@host:5432/db';
    const options = getDatabaseConnectionOptions();
    expect(options).toEqual({ type: 'postgres', url: 'postgres://user:pass@host:5432/db', ssl: false });
  });

  it('falls back to discrete DB_HOST/DB_PORT/... fields when no DATABASE_URL is set', () => {
    process.env.DB_DRIVER = 'postgres';
    delete process.env.DATABASE_URL;
    process.env.DB_HOST = 'db.internal';
    process.env.DB_PORT = '5433';
    process.env.DB_USERNAME = 'tag';
    process.env.DB_PASSWORD = 'secret';
    process.env.DB_NAME = 'tag_prod';
    const options = getDatabaseConnectionOptions();
    expect(options).toEqual({
      type: 'postgres',
      host: 'db.internal',
      port: 5433,
      username: 'tag',
      password: 'secret',
      database: 'tag_prod',
      ssl: false,
    });
  });

  it('enables ssl when DB_SSL=true', () => {
    process.env.DB_DRIVER = 'postgres';
    process.env.DATABASE_URL = 'postgres://user:pass@host:5432/db';
    process.env.DB_SSL = 'true';
    const options = getDatabaseConnectionOptions();
    expect(options.ssl).toEqual({ rejectUnauthorized: false });
  });
});
