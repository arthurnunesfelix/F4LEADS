import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * Inicialização LAZY do banco: a conexão só é criada na primeira requisição
 * que de fato usa o banco. Isso permite que o build da Vercel (que importa
 * os módulos das rotas para coletar page data) rode sem DATABASE_URL.
 */
function createDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL não definida. Configure a variável de ambiente no projeto (Vercel → Settings → Environment Variables).",
    );
  }

  // Providers em nuvem (Neon, Supabase, RDS...) exigem SSL; localhost não.
  const isLocal = /localhost|127\.0\.0\.1/.test(databaseUrl);

  const pool = new Pool({
    connectionString: databaseUrl,
    // Limite baixo de conexões para ambientes serverless (Vercel).
    // Use sempre a connection string com "-pooler" do Neon em produção.
    max: process.env.VERCEL ? 1 : 10,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
  });

  return drizzle(pool);
}

export type Db = ReturnType<typeof createDb>;

const globalForDb = globalThis as typeof globalThis & {
  __f4LeadsDb?: Db;
};

/** Retorna o client do banco, criando-o sob demanda (reuso entre warm invocations). */
export function getDb(): Db {
  globalForDb.__f4LeadsDb ??= createDb();
  return globalForDb.__f4LeadsDb;
}
