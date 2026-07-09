-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "nome" TEXT,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "empresa" TEXT,
    "origem" TEXT NOT NULL,
    "module_id" TEXT,
    "mensagem" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leads_criado_em_idx" ON "leads"("criado_em");

-- CreateIndex
CREATE INDEX "leads_origem_module_id_idx" ON "leads"("origem", "module_id");
