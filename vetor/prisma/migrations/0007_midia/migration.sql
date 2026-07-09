-- CreateTable
CREATE TABLE "midia_metricas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "campanha" TEXT NOT NULL,
    "plataforma" TEXT NOT NULL DEFAULT 'meta',
    "gasto" DECIMAL(12,2) NOT NULL,
    "impressoes" INTEGER NOT NULL DEFAULT 0,
    "cliques" INTEGER NOT NULL DEFAULT 0,
    "leads" INTEGER NOT NULL DEFAULT 0,
    "conversoes" INTEGER NOT NULL DEFAULT 0,
    "cpl" DECIMAL(12,2),
    "origem" TEXT NOT NULL DEFAULT 'csv',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "midia_metricas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "midia_alertas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "campanha" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "severidade" TEXT NOT NULL DEFAULT 'atencao',
    "mensagem" TEXT NOT NULL,
    "valor_atual" DECIMAL(12,2),
    "valor_baseline" DECIMAL(12,2),
    "status" TEXT NOT NULL DEFAULT 'aberto',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvido_em" TIMESTAMP(3),

    CONSTRAINT "midia_alertas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "midia_metricas_tenant_id_data_idx" ON "midia_metricas"("tenant_id", "data");

-- CreateIndex
CREATE INDEX "midia_metricas_tenant_id_campanha_data_idx" ON "midia_metricas"("tenant_id", "campanha", "data");

-- CreateIndex
CREATE INDEX "midia_alertas_tenant_id_status_criado_em_idx" ON "midia_alertas"("tenant_id", "status", "criado_em");

-- AddForeignKey
ALTER TABLE "midia_metricas" ADD CONSTRAINT "midia_metricas_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "midia_alertas" ADD CONSTRAINT "midia_alertas_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
