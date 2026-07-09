-- Auth.js: remove Clerk, senha e papel no próprio banco.

-- User: troca clerk_id por password_hash + role
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_clerk_id_key";
ALTER TABLE "users" DROP COLUMN IF EXISTS "clerk_id";
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'MEMBER';

-- Tenants: remove clerk_org_id
DROP INDEX IF EXISTS "tenants_clerk_org_id_key";
ALTER TABLE "tenants" DROP COLUMN IF EXISTS "clerk_org_id";

-- Usuários legados sem senha (se houver) precisam recriar conta.
-- password_hash fica NULL-able na migration se a coluna já existia com dados;
-- o schema Prisma exige NOT NULL — em banco limpo o seed cria usuários válidos.
UPDATE "users" SET "password_hash" = '' WHERE "password_hash" IS NULL;
ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL;
