-- CreateTable
CREATE TABLE "zelo_conversas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "wa_id" TEXT NOT NULL,
    "nome_contato" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aguardando',
    "primeira_msg_em" TIMESTAMP(3) NOT NULL,
    "ultima_msg_em" TIMESTAMP(3) NOT NULL,
    "primeira_resposta_em" TIMESTAMP(3),
    "tempo_primeira_resposta_ms" INTEGER,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zelo_conversas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zelo_mensagens" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "conversa_id" TEXT NOT NULL,
    "direcao" TEXT NOT NULL,
    "corpo" TEXT NOT NULL,
    "wa_message_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'recebida',
    "aprovada_por_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zelo_mensagens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "zelo_conversas_tenant_id_status_ultima_msg_em_idx" ON "zelo_conversas"("tenant_id", "status", "ultima_msg_em");

-- CreateIndex
CREATE UNIQUE INDEX "zelo_conversas_tenant_id_wa_id_key" ON "zelo_conversas"("tenant_id", "wa_id");

-- CreateIndex
CREATE INDEX "zelo_mensagens_tenant_id_conversa_id_criado_em_idx" ON "zelo_mensagens"("tenant_id", "conversa_id", "criado_em");

-- CreateIndex
CREATE INDEX "zelo_mensagens_tenant_id_status_idx" ON "zelo_mensagens"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "zelo_mensagens_wa_message_id_key" ON "zelo_mensagens"("wa_message_id");

-- AddForeignKey
ALTER TABLE "zelo_conversas" ADD CONSTRAINT "zelo_conversas_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zelo_mensagens" ADD CONSTRAINT "zelo_mensagens_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zelo_mensagens" ADD CONSTRAINT "zelo_mensagens_conversa_id_fkey" FOREIGN KEY ("conversa_id") REFERENCES "zelo_conversas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
