# VETOR — Plataforma

Plataforma multi-tenant da consultoria VETOR. **Fases 0–3 implementadas**. O documento mestre do projeto é o `README-VETOR.md` na pasta pai.

## O que já existe

### Fase 0 + 1 — Core multi-tenant
- **Monólito modular** (Next.js 15 + TS): módulos em `modules/<nome>/`, compartilhado em `core/`, `app/` fino.
- **Proteção de fronteiras**: ESLint (`eslint-plugin-boundaries`) **falha o build** se um módulo importar de outro ou se `core/` importar de `modules/`/`app/`. CI em `.github/workflows/ci.yml` roda lint + typecheck + testes + build em todo push/PR.
- **Banco (Prisma 7 + Postgres)**: tabelas core + módulos; migrações em `prisma/migrations/`; seed com os dois pilotos.
- **Isolamento por tenant (ADR-003)**: `tenantDb(tenantId)` injeta `tenant_id` automaticamente.
- **Auth (Clerk Organizations)**: middleware, webhook, papéis `SUPER_ADMIN | OWNER | MEMBER`.
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

## Subindo o ambiente

1. **Neon:** `DATABASE_URL` → `npm run db:migrate` (0001–0003) → `npm run db:seed` (pilotos com relatorios + zelo).
2. **Clerk:** Organizations, webhook, `SUPER_ADMIN`.
3. **Anthropic:** `ANTHROPIC_API_KEY` (relatórios e sugestões do Zelo).
4. **WhatsApp** (opcional para E2E real):
   - App Meta + número Cloud API
   - Callback URL: `https://<dominio>/api/webhooks/whatsapp`
   - `WHATSAPP_VERIFY_TOKEN`, opcional `WHATSAPP_APP_SECRET`
   - No admin, ative o módulo zelo e em `tenant_modules.config`:
     ```json
     { "phoneNumberId": "…", "accessToken": "EAA…" }
     ```
     (ou `WHATSAPP_ACCESS_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID` globais em dev)
5. **Trigger.dev** (opcional, relatórios).

```bash
npm run dev
npm test
npm run lint && npm run typecheck && npm run build
```

## Critérios de pronto

| Fase | Critério | Código | Contas reais |
|------|----------|--------|--------------|
| 1 | Criar tenant, ativar módulo, usuário vê só o ativo | ✓ | Neon + Clerk |
| 2 | Gerar relatório, baixar HTML, dono entende | ✓ | + Anthropic |
| 3 | Fila assistida: sugerir → aprovar; 1ª resposta medida | ✓ | + WhatsApp (ou simular no portal) |

## Decisões locais

- Relatório v1 = HTML (PDF via impressão).
- Zelo v1 = **sempre humano no loop**; autônomo fica para v2/v3.
- Sem token WhatsApp, "Aprovar e enviar" grava envio **simulado** (treina a operação).
- Assinatura do webhook: se `WHATSAPP_APP_SECRET` ausente, aceita em dev (não use assim em produção).

## Próximas fases

- **Fase 4:** site público + cardápio.
- **Fase 5+:** Conteúdo, Monitor de Anúncios; Zelo v2 semiautônomo.
