ALTER TABLE "Cliente" ADD COLUMN "email" TEXT;
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_email_key" UNIQUE ("email");
ALTER TABLE "Cliente" RENAME COLUMN "endereco" TO "cidade";
ALTER TABLE "Cliente" ADD COLUMN "estado" TEXT;
ALTER TABLE "Cliente" ADD COLUMN "pais" TEXT;
