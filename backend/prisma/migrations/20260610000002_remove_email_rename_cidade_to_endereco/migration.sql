ALTER TABLE "Cliente" DROP COLUMN IF EXISTS "email";
ALTER TABLE "Cliente" RENAME COLUMN "cidade" TO "endereco";
