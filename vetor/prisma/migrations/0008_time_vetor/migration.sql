-- CreateTable
CREATE TABLE "time_entregas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "agente" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT,
    "conteudo" TEXT NOT NULL,
    "brief" TEXT,
    "status" TEXT NOT NULL DEFAULT 'rascunho',
    "versao" INTEGER NOT NULL DEFAULT 1,
    "agent_run_id" TEXT,
    "criado_por_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_entregas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "time_entregas_tenant_id_agente_criado_em_idx" ON "time_entregas"("tenant_id", "agente", "criado_em");

-- CreateIndex
CREATE INDEX "time_entregas_tenant_id_status_idx" ON "time_entregas"("tenant_id", "status");

-- AddForeignKey
ALTER TABLE "time_entregas" ADD CONSTRAINT "time_entregas_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
