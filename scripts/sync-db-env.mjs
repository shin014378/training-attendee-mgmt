/** Vercel Storage の POSTGRES_* を Prisma 用 DATABASE_* に合わせる */
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL ??
    "";
}

if (!process.env.DATABASE_URL_UNPOOLED) {
  process.env.DATABASE_URL_UNPOOLED =
    process.env.POSTGRES_URL_NON_POOLING ?? process.env.DATABASE_URL ?? "";
}
