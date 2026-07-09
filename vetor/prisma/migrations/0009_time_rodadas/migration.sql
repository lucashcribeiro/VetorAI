-- CreateTable
CREATE TABLE "time_rodadas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'rodando',
    "etapa_atual" TEXT NOT NULL DEFAULT 'orquestrador',
    "log" JSONB NOT NULL DEFAULT '[]',
    "tentativas_qa" INTEGER NOT NULL DEFAULT 0,
    "erro" TEXT,
    "criado_por_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_rodadas_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "time_entregas" ADD COLUMN IF NOT EXISTS "rodada_id" TEXT;

-- CreateIndex
CREATE INDEX "time_rodadas_tenant_id_criado_em_idx" ON "time_rodadas"("tenant_id", "criado_em");

-- CreateIndex
CREATE INDEX "time_rodadas_tenant_id_status_idx" ON "time_rodadas"("tenant_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "time_entregas_rodada_id_idx" ON "time_entregas"("rodada_id");

-- AddForeignKey
ALTER TABLE "time_rodadas" ADD CONSTRAINT "time_rodadas_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "time_entregas" ADD CONSTRAINT "time_entregas_rodada_id_fkey" FOREIGN KEY ("rodada_id") REFERENCES "time_rodadas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
