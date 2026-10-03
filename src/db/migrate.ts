import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

/**
 * Aplica as migrações SQL da pasta ./drizzle no banco de dados.
 * Executa automaticamente no boot do servidor na Vercel (ver src/instrumentation.ts).
 * É idempotente: migrações já aplicadas são ignoradas.
 */
export async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("[db] DATABASE_URL não definida — migrações ignoradas.");
    return;
  }

  const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);
  const migrationPool = new Pool({
    connectionString,
    max: 1,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
  });

  try {
    const migrationDb = drizzle(migrationPool);
    await migrate(migrationDb, { migrationsFolder: "./drizzle" });
    console.log("[db] Migrações verificadas/aplicadas com sucesso.");
  } catch (error) {
    // Não derruba o boot: a rota /api/health continua reportando o status do banco.
    console.error("[db] Falha ao aplicar migrações:", error);
  } finally {
    await migrationPool.end().catch(() => undefined);
  }
}
