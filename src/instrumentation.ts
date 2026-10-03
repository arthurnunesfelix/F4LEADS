/**
 * Hook de boot do Next.js (roda uma vez na inicialização do servidor).
 * Na Vercel, aplica as migrações do banco automaticamente antes de servir
 * as primeiras requisições — basta configurar DATABASE_URL no projeto.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.VERCEL === "1") {
    const { runMigrations } = await import("@/db/migrate");
    await runMigrations();
  }
}
