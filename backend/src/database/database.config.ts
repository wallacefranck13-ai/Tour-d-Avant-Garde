/**
 * Sélection du driver de base de données par variable d'environnement.
 *
 * DB_DRIVER=sqljs (défaut) — aucune configuration requise, fichier local
 * (DB_PATH), utilisé pour le développement et cette démo.
 *
 * DB_DRIVER=postgres — bascule vers PostgreSQL sans toucher au code : soit
 * DATABASE_URL (une seule variable, format des fournisseurs managés comme
 * Supabase/Neon/Render), soit DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD/DB_NAME
 * séparément. Utilisé à la fois par AppModule (NestJS) et par le script de
 * seed (DataSource TypeORM autonome) pour éviter toute divergence.
 */
export function getDatabaseConnectionOptions(): Record<string, unknown> {
  const driver = process.env.DB_DRIVER || 'sqljs';

  if (driver === 'postgres') {
    const ssl = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;

    if (process.env.DATABASE_URL) {
      return { type: 'postgres', url: process.env.DATABASE_URL, ssl };
    }

    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'tag',
      ssl,
    };
  }

  return {
    type: 'sqljs',
    location: process.env.DB_PATH || './data/tag.sqlite',
    autoSave: true,
  };
}
