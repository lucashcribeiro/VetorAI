-- CreateTable
CREATE TABLE "conteudo_posts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "semana_inicio" TEXT NOT NULL,
    "canal" TEXT NOT NULL DEFAULT 'instagram',
    "titulo" TEXT,
    "texto" TEXT NOT NULL,
    "hashtags" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "agendado_para" TIMESTAMP(3),
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "aprovado_por_id" TEXT,
    "aprovado_em" TIMESTAMP(3),
    "exportado_em" TIMESTAMP(3),
    "erro" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conteudo_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "conteudo_posts_tenant_id_semana_inicio_idx" ON "conteudo_posts"("tenant_id", "semana_inicio");

-- CreateIndex
CREATE INDEX "conteudo_posts_tenant_id_status_idx" ON "conteudo_posts"("tenant_id", "status");

-- AddForeignKey
ALTER TABLE "conteudo_posts" ADD CONSTRAINT "conteudo_posts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
