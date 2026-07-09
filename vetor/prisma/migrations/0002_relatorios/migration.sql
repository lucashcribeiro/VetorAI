-- CreateTable
CREATE TABLE "relatorios_gerados" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "mes" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processando',
    "dados_entrada" JSONB NOT NULL DEFAULT '{}',
    "conteudo_html" TEXT,
    "arquivo_url" TEXT,
    "resumo" TEXT,
    "erro" TEXT,
    "criado_por_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "relatorios_gerados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "relatorios_gerados_tenant_id_mes_idx" ON "relatorios_gerados"("tenant_id", "mes");

-- CreateIndex
CREATE INDEX "relatorios_gerados_tenant_id_criado_em_idx" ON "relatorios_gerados"("tenant_id", "criado_em");

-- AddForeignKey
ALTER TABLE "relatorios_gerados" ADD CONSTRAINT "relatorios_gerados_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
