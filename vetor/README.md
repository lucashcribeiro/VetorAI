# VETOR — Plataforma

Plataforma multi-tenant da consultoria VETOR. **Fases 0–7 implementadas** (beta comercial). O documento mestre do projeto é o `README-VETOR.md` na pasta pai.

## O que já existe

### Fase 0 + 1 — Core multi-tenant
- **Monólito modular** (Next.js 15 + TS): módulos em `modules/<nome>/`, compartilhado em `core/`, `app/` fino.
- **Proteção de fronteiras**: ESLint (`eslint-plugin-boundaries`) **falha o build** se um módulo importar de outro ou se `core/` importar de `modules/`/`app/`. CI em `.github/workflows/ci.yml` roda lint + typecheck + testes + build em todo push/PR.
- **Banco (Prisma 7 + Postgres)**: tabelas core + módulos; migrações em `prisma/migrations/`; seed com os dois pilotos.
- **Isolamento por tenant (ADR-003)**: `tenantDb(tenantId)` injeta `tenant_id` automaticamente.
- **Auth (Auth.js)**: email/senha no próprio Postgres, papéis `SUPER_ADMIN | OWNER | MEMBER`, cookie de tenant ativo.
- **Registry de módulos** + AppShell + rota genérica `tools/[slug]/[[...path]]` + admin de tenants.
- **core/ai** + **core/events**.

### Fase 2 — Módulo Relatórios
- **UI** `/tools/relatorios`: lista, form (números + CSV), preview e download HTML.
- **Job** `gerar-relatorio` → Claude → evento `relatorio.gerado` + activity log.
- Trigger.dev opcional; fallback `after()`.

### Fase 3 — Zelo v1 assistido
- **UI** `/tools/zelo`: fila (aguardando / respondida / escalada), métrica de 1ª resposta, detalhe com thread.
- **Fluxo assistido:** mensagem chega → Claude **sugere** → secretária **aprova com um toque** (pode editar) ou **escala** para a equipe.
- **Tabelas** `zelo_conversas` / `zelo_mensagens` (migration `0003_zelo`).
- **Webhook** `GET|POST /api/webhooks/whatsapp` (verificação Meta + mensagens texto).
- **Eventos** `zelo.conversa_iniciada`, `zelo.escalada_humano`.
- **Simular mensagem** no portal (dev sem número Meta); envio real se `WHATSAPP_ACCESS_TOKEN` + `phoneNumberId` no `tenant_modules.config`.

### Fase 4 — Site público + cardápio
- **Landing** `/` em `app/(site)/` — hero, como funciona, preview do cardápio, CTA diagnóstico.
- **Cardápio** `/ferramentas` lendo o `registry` (disponíveis vs em breve).
- **Venda** `/ferramentas/[slug]` com benefícios do manifest + formulário de lead.
- **Contato** `/contato` · **Leads** na tabela `leads` (migration `0004_leads`) + log estruturado.
- **SEO:** `metadataBase`, `robots.ts`, `sitemap.xml`, `NEXT_PUBLIC_SITE_URL`.

### Fase 5 — Módulo Conteúdo
- **UI** `/tools/conteudo`: gerar calendário semanal, fila com aprovação em lote, rejeitar, exportar texto.
- **Tabela** `conteudo_posts` (migration `0006_conteudo`).
- **Job** `gerar-calendario`: dossiê + segmento → Claude (prompt com **CFO dental** / **SUSEP seguros**) → posts `pendente`.
- **Eventos** `post.aprovado`, `post.publicado` (exportação v1 = lembrete/texto, sem Instagram API ainda).

### Fase 6 — Monitor de Anúncios
- **UI** `/tools/anuncios`: import CSV → histórico → alertas em língua de dono.
- **Tabelas** `midia_metricas` / `midia_alertas` (migration `0007_midia`).
- **Regras:** CPL +30% vs janela anterior; gasto alto sem contatos; gasto sobe sem mais leads.
- **Evento** `campanha.alerta_criado` (Relatórios pode consumir depois).
- **Job** `rodarAnaliseDiariaTodosTenants` (reanalisa histórico; Meta API = etapa B).
- Card de alertas abertos no **dashboard**.

### Fase 7 — Beta comercial
- **Onboarding self-service:** criar empresa em `/selecionar-empresa` → OWNER + módulos essenciais → checklist no dashboard (`?bemvindo=1`).
- **Faturamento manual:** `/configuracoes/faturamento` (Pix via env, sem Stripe).
- **LGPD:** `/termos` e `/privacidade` no site.
- **Venda:** cada `/ferramentas/[slug]` com “o que faz” + “o que precisa de você”.

### Pós-beta (operacional)
- **Dossiê** `/configuracoes/dossie` — contexto da IA (relatórios, conteúdo, Zelo).
- **Marca** `/configuracoes/marca` — logo URL + cor no chip (white-label leve).
- **Admin leads** `/admin/leads` + contador de leads no mês na saúde.

## Subindo o ambiente

1. **Neon (Postgres serverless):** crie o projeto em [console.neon.tech](https://console.neon.tech), copie a connection string pooled (`?sslmode=require`) para `DATABASE_URL` em `.env` e `.env.local`. Depois:
   ```bash
   npm run db:migrate   # 0001–0007
   npm run db:seed      # pilotos + admin@vetor.local
   ```
2. **Auth.js:** `AUTH_SECRET` (`openssl rand -base64 32`). Seed cria `admin@vetor.local` / `vetor-admin-2026` (ou `SEED_ADMIN_*`). Sem Clerk — login no seu banco.
3. **Anthropic:** `ANTHROPIC_API_KEY` (relatórios e sugestões do Zelo).
4. **WhatsApp** (opcional para E2E real):
   - App Meta + número Cloud API
   - Callback URL: `https://<dominio>/api/webhooks/whatsapp`
   - `WHATSAPP_VERIFY_TOKEN`, opcional `WHATSAPP_APP_SECRET`
   - No admin, ative o módulo zelo e em `tenant_modules.config`:
     ```json
     { "phoneNumberId": "…", "accessToken": "EAA…" }
     ```
5. **Trigger.dev** (opcional, relatórios).
6. **Vercel (produção):** projeto `vetor` ligado na pasta `vetor/`; envs `DATABASE_URL` (Neon), `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_SITE_URL`. Deploy: `npx vercel --prod` a partir de `vetor/`.

```bash
npm run dev
npm test
npm run lint && npm run typecheck && npm run build
npx vercel --prod   # publica em vercel.app
```

**Stack de deploy:** Neon (Postgres) + Vercel (Next.js) + Auth.js (login no seu banco).

## Critérios de pronto

| Fase | Critério | Código | Contas reais |
|------|----------|--------|--------------|
| 1 | Criar tenant, ativar módulo, usuário vê só o ativo | ✓ | Postgres + Auth.js |
| 2 | Gerar relatório, baixar HTML, dono entende | ✓ | + Anthropic |
| 3 | Fila assistida: sugerir → aprovar; 1ª resposta medida | ✓ | + WhatsApp (ou simular no portal) |
| 4 | Link do site para prospect sem vergonha | ✓ | Domínio + `NEXT_PUBLIC_SITE_URL` |
| 5 | Pauta semanal + aprovação em lote | ✓ | + Anthropic |
| 6 | Alerta de anúncio antes do prejuízo | ✓ | CSV (Meta API depois) |
| 7 | Onboarding + termos + cobrança manual | ✓ | Pix opcional nas envs |

## Decisões locais

- Relatório v1 = HTML (PDF via impressão).
- Zelo v1 = **sempre humano no loop**; autônomo fica para v2/v3.
- Sem token WhatsApp, "Aprovar e enviar" grava envio **simulado** (treina a operação).
- Assinatura do webhook: se `WHATSAPP_APP_SECRET` ausente, aceita em dev (não use assim em produção).
- Site e plataforma no **mesmo app** (ADR-005): cardápio lê o registry; login leva a `/tools/<slug>`.
- Notificação de lead: log + tabela `leads` (e-mail Resend fica para depois).

## Próximas fases

- Validação real com pilotos pagantes.
- Meta Marketing API; Instagram no Conteúdo; Zelo v2; Stripe após o 5º pagante.
