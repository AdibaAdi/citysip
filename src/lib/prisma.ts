/**
 * Prisma client singleton.
 *
 * getPrismaOrNull() — returns the client when DATABASE_URL is set, otherwise
 *   null. Callers fall back to bundled mock data. Safe to call during
 *   Next.js static rendering at build time.
 *
 * getPrisma() — same but throws a descriptive error when DATABASE_URL is
 *   missing. Use this in admin/import routes that genuinely require a DB.
 *
 * Returns `any` so the codebase compiles even when the Prisma client was
 * generated from an older schema (e.g. in CI without network access to the
 * Prisma binary CDN). After running `prisma generate` the new models and
 * fields are fully type-safe.
 */

const g = globalThis as any;

export const hasDatabase = !!process.env.DATABASE_URL;

export function getPrismaOrNull(): any | null {
  if (!hasDatabase) return null;
  if (!g._prisma) {
        const { PrismaClient } = require("@prisma/client");
    g._prisma = new PrismaClient();
  }
  return g._prisma;
}

export function getPrisma(): any {
  const client = getPrismaOrNull();
  if (!client) {
    throw new Error(
      "This feature requires a database. " +
        "Set DATABASE_URL in your environment (see README → Neon setup) " +
        "and run `npm run db:push && npm run db:seed`."
    );
  }
  return client;
}
