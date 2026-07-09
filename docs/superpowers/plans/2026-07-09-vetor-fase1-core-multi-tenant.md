# VETOR — Fase 0 + Fase 1 (Core multi-tenant) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Colocar de pé o esqueleto multi-tenant do VETOR (Fase 0 + Fase 1 do README-VETOR.md): app Next.js 15 com Prisma/Postgres, Clerk, registry de módulos, AppShell com a identidade visual do brand book, rota genérica de ferramentas e admin de tenants.

**Architecture:** Monólito modular (ADR-001): um app Next.js; cada ferramenta é uma pasta em `modules/<nome>/` que nunca importa de outro módulo (ESLint boundaries falha o build). `core/` concentra auth, tenant, db (extensão Prisma que injeta `tenant_id`), ai, events e o design system em código. `app/` é fino: a rota `tools/[slug]/[[...path]]` é genérica e delega para a UI do módulo via registry.

**Tech Stack:** Next.js 15 (App Router) + TypeScript, Tailwind v4, Prisma + Postgres (Neon), Clerk (Organizations), @anthropic-ai/sdk, Vitest, eslint-plugin-boundaries.

## Global Constraints

- Next.js **15** (App Router, sem `src/`), import alias `@/*`.
- Paleta exata do brand book: carvão `#171717`, vermelho-vetor `#E04A1F` (máx ~10% de qualquer tela), pedra `#7A756C`, areia `#C9C4B8`, osso `#F0EEE8`, branco `#FFFFFF`, erro `#B3261E`. Hover do accent: `#C43F18`.
- Tipografia: Space Grotesk (títulos, weights 500/700), Work Sans (corpo, 400/500/600), JetBrains Mono (dados/meta-labels, 400/500). Woff2 variáveis autohospedadas (extraídas do bundle do brand book; licença OFL/Google Fonts).
- Radii: 12/10/8/999. Sombra card: `0 3px 12px rgba(0,0,0,.08)`.
- Copy da UI em PT-BR, **língua de dono de negócio** (nunca CPL/ROAS na tela inicial).
- Módulo nunca importa de outro módulo; `core/` nunca importa de `modules/` — regra ESLint que falha o build.
- Toda tabela de módulo/operacional tem `tenant_id`.
- Ações demoradas nunca rodam na request (Fase 1 não tem jobs; contrato fica pronto).
- Repo em `/Users/lucashr/Developer/VetorAI/vetor` (git próprio). Commits em português, estilo conventional.
- Sem contas externas nesta sessão: `.env.local` com placeholders de formato válido (build passa); migração/seed rodam quando o Neon existir. Documentar em `vetor/README.md`.
- Assets extraídos do handoff (fontes, DS source, template do dashboard) estão em `/private/tmp/claude-501/-Users-lucashr-Developer-VetorAI/6feac251-03d1-44e9-ac1b-e91caa21023f/scratchpad/dash/` (`dash/` e `brand/`).

---

### Task 1: Fase 0 — Scaffold do repo

**Files:**
- Create: `vetor/` via create-next-app; `vetor/.env.local`, `vetor/.env.example`; pastas `modules core/{auth,tenant,db,ai,events,ui} trigger brand prisma tests/{core,modules}`.

**Interfaces:**
- Produces: repo git iniciado, deps instaladas: `@clerk/nextjs @prisma/client @anthropic-ai/sdk @trigger.dev/sdk svix`; dev: `prisma eslint-plugin-boundaries eslint-import-resolver-typescript vitest`.

- [ ] **Step 1:** `cd /Users/lucashr/Developer/VetorAI && npx create-next-app@15 vetor --typescript --tailwind --app --eslint --no-src-dir --import-alias "@/*" --use-npm --yes`
- [ ] **Step 2:** `cd vetor && npm i @clerk/nextjs @prisma/client @anthropic-ai/sdk @trigger.dev/sdk svix && npm i -D prisma eslint-plugin-boundaries eslint-import-resolver-typescript vitest`
- [ ] **Step 3:** `npx prisma init --datasource-provider postgresql` e `mkdir -p modules core/auth core/tenant core/db core/ai core/events core/ui trigger brand/fonts brand/logo tests/core tests/modules .github/workflows`
- [ ] **Step 4:** `.env.example` + `.env.local` (placeholders Clerk com formato válido `pk_test_Y2xlcmsuZXhhbXBsZS5jb20k` / `sk_test_...`, `DATABASE_URL` local placeholder, `ANTHROPIC_API_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`). Ajustar `.gitignore` para permitir `.env.example`.
- [ ] **Step 5:** scripts no `package.json`: `"typecheck": "tsc --noEmit"`, `"test": "vitest run"`, `"db:migrate": "prisma migrate deploy"`, `"db:seed": "tsx prisma/seed.ts"` (adicionar dev-dep `tsx`).
- [ ] **Step 6:** `npm run build` → Expected: sucesso. `git init && git add -A && git commit -m "chore: fundação vetor (fase 0)"`

### Task 2: Marca — brand/, fontes e tokens

**Files:**
- Create: `brand/tokens.css`, `brand/palette.md`, `brand/soft-rules.md`, `brand/fonts/{space-grotesk,work-sans,jetbrains-mono}-var.woff2` (+ README de licença), `brand/logo/vetor-logo.svg`, `public/logo.svg`, `app/fonts.ts`, `app/icon.svg`
- Modify: `app/globals.css`, `app/layout.tsx`

**Interfaces:**
- Produces: variáveis CSS `--carvao --vermelho-vetor --pedra --areia --osso --branco --erro --accent --accent-hover --text-* --surface-* --radius-* --shadow-card --space-*`; fontes via `next/font/local` com variáveis `--font-display --font-body --font-mono`; Tailwind v4 `@theme inline` expõe `bg-carvao`, `text-pedra`, `bg-osso`, `text-vermelho`, `font-display`, `font-body`, `font-mono` etc.

- [ ] **Step 1:** copiar woff2 do scratchpad (dash: `42b6c33b.bin`→space-grotesk, `45c8082f.bin`→work-sans, `fa78f9fb.bin`→jetbrains-mono; subset latin cobre PT-BR).
- [ ] **Step 2:** `brand/tokens.css` com os 3 blocos `:root` extraídos do handoff (cores/semânticos, radii/sombras/espacos; tipografia SEM redefinir `--font-display/body/mono` — essas vêm do next/font).
- [ ] **Step 3:** `app/fonts.ts`:

```ts
import localFont from 'next/font/local'
export const spaceGrotesk = localFont({ src: '../brand/fonts/space-grotesk-var.woff2', weight: '300 700', variable: '--font-display', display: 'swap' })
export const workSans = localFont({ src: '../brand/fonts/work-sans-var.woff2', weight: '100 900', variable: '--font-body', display: 'swap' })
export const jetbrainsMono = localFont({ src: '../brand/fonts/jetbrains-mono-var.woff2', weight: '100 800', variable: '--font-mono', display: 'swap' })
```

- [ ] **Step 4:** `app/globals.css`: `@import "tailwindcss";` + `@import "../brand/tokens.css";` + `@theme inline { --color-carvao: var(--carvao); --color-vermelho: var(--vermelho-vetor); --color-pedra: var(--pedra); --color-areia: var(--areia); --color-osso: var(--osso); --color-erro: var(--erro); --font-display: var(--font-display); --font-body: var(--font-body); --font-mono: var(--font-mono); }` + body base (`background: var(--surface-page); color: var(--text-primary); font-family: var(--font-body)`).
- [ ] **Step 5:** logo SVG oficial (símbolo = polígono `9,5 25,16 9,27 9,21.4 17,16 9,10.6` rotacionado −45° + círculo `6.5,25.5 r3` vermelho; wordmark "vetor" Space Grotesk 700, tracking 0.02em). Gerar `brand/logo/vetor-logo.svg` (positivo), `public/logo.svg`, `app/icon.svg` (favicon = só o polígono).
- [ ] **Step 6:** `layout.tsx` raiz: classes das 3 fontes no `<html lang="pt-BR">`, metadata "VETOR — plataforma". `brand/palette.md` e `brand/soft-rules.md` (regras: acento ≤10%, títulos confiantes/corpo calmo, geométrico e preciso nunca lúdico, mono para meta-labels em minúsculas).
- [ ] **Step 7:** `npm run build` → sucesso. Commit `feat: identidade visual — tokens, fontes e logo`.

### Task 3: Proteções — ESLint boundaries + CI

**Files:**
- Modify: `eslint.config.mjs`
- Create: `.github/workflows/ci.yml`, `modules/.gitkeep`

- [ ] **Step 1:** adicionar ao `eslint.config.mjs`:

```js
import boundaries from 'eslint-plugin-boundaries'
// ...append config object:
{
  plugins: { boundaries },
  settings: {
    'import/resolver': { typescript: { alwaysTryTypes: true } },
    'boundaries/include': ['modules/**/*', 'core/**/*', 'app/**/*'],
    'boundaries/elements': [
      { type: 'module', pattern: 'modules/*', capture: ['moduleName'] },
      { type: 'modules-contract', pattern: 'modules/*.(ts|tsx)', mode: 'file' },
      { type: 'core', pattern: 'core/**' },
      { type: 'app', pattern: 'app/**' },
    ],
  },
  rules: {
    'boundaries/element-types': ['error', {
      default: 'allow',
      rules: [
        { from: ['module'], disallow: [['module', { moduleName: '!${from.moduleName}' }]],
          message: 'Módulo não importa de outro módulo (ADR-002). Suba para core/ ou use a tabela events.' },
        { from: ['core'], disallow: ['module', 'app'], message: 'core/ não conhece modules/ nem app/.' },
        { from: ['modules-contract'], disallow: ['app'], message: 'contrato de módulos não importa de app/.' },
      ],
    }],
  },
}
```
(`modules/registry.ts` importa todos os módulos por design — é `modules-contract`, não `module`.)

- [ ] **Step 2:** teste da proteção: criar `modules/a/index.ts` importando `modules/b`, rodar `npm run lint` → Expected: **erro boundaries**; apagar arquivos de teste.
- [ ] **Step 3:** `.github/workflows/ci.yml`: on push/PR → npm ci, prisma generate, lint, typecheck, test, build (env dummy).
- [ ] **Step 4:** lint limpo + commit `chore: proteção de fronteiras entre módulos + CI`.

### Task 4: Banco — schema Prisma, migração e seed

**Files:**
- Create: `prisma/schema.prisma` (9 tabelas core), `prisma/migrations/0001_init/migration.sql`, `prisma/migrations/migration_lock.toml`, `prisma/seed.ts`

**Interfaces:**
- Produces (modelos → tabelas): `Tenant→tenants` (id cuid, nome, slug unique, segmento?, logoUrl?, corPrimaria?, plano="essencial", status="ativo", clerkOrgId? unique, criadoEm), `TenantModule→tenant_modules` (tenantId+moduleId unique, ativo bool, config Json "{}"), `User→users` (clerkId unique, email unique, nome), `Membership→memberships` (tenantId+userId unique, papel="MEMBER"), `ActivityLog→activity_log` (tenantId, userId?, acao, detalhe Json, criadoEm; index tenantId+criadoEm), `Event→events` (tenantId, tipo, payload Json, processado=false, criadoEm; index processado+tipo), `AiUsage→ai_usage` (tenantId, moduleId, modelo, tokensIn, tokensOut, custoBrl Decimal(10,4), criadoEm), `Dossie→dossies` (tenantId+versao unique, conteudo Json, atualizadoEm), `AgentRun→agent_runs` (tenantId, agente, status="rodando", iniciadoEm, terminadoEm?, erro?). Campos snake_case via `@map`/`@@map`.

- [ ] **Step 1:** escrever `schema.prisma` completo. `npx prisma format && npx prisma validate` → OK.
- [ ] **Step 2:** gerar migração sem banco: `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0001_init/migration.sql` + `migration_lock.toml` (`provider = "postgresql"`).
- [ ] **Step 3:** `prisma/seed.ts`: tenants "dra-mirilaini" (segmento odontologia, módulos conteudo+relatorios ativos) e "milu-seguros" (segmento seguros, relatorios ativo), upsert idempotente.
- [ ] **Step 4:** `npx prisma generate` → OK. Commit `feat(db): schema core multi-tenant + migração inicial + seed`.

### Task 5: core/db — extensão que injeta tenant_id (TDD)

**Files:**
- Create: `core/db/tenant-filter.ts`, `core/db/client.ts`, `tests/core/tenant-filter.test.ts`, `vitest.config.ts`

**Interfaces:**
- Produces: `scopeArgs(model: string, operation: string, args: Record<string, unknown>, tenantId: string)` — injeta `where.tenantId` em findMany/findFirst/count/aggregate/groupBy/updateMany/deleteMany e `data.tenantId` em create/createMany/upsert, para modelos tenant-scoped (`TenantModule, Membership, ActivityLog, Event, AiUsage, Dossie, AgentRun`); `db` (PrismaClient cru, singleton, para core/admin) e `tenantDb(tenantId)` (client estendido).

- [ ] **Step 1:** `vitest.config.ts` com alias `@` → raiz. Escrever testes: injeta em findMany vazio, preserva where existente via AND, injeta em create.data, ignora modelo não-scoped (Tenant), injeta em cada linha de createMany.
- [ ] **Step 2:** `npx vitest run` → FAIL (módulo não existe).
- [ ] **Step 3:** implementar `tenant-filter.ts` (pure) e `client.ts`:

```ts
// client.ts (essência)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
export const db = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
export function tenantDb(tenantId: string) {
  return db.$extends({ query: { $allModels: { $allOperations({ model, operation, args, query }) {
    return query(scopeArgs(model, operation, args as Record<string, unknown>, tenantId))
  } } } })
}
```

- [ ] **Step 4:** `npx vitest run` → PASS. Commit `feat(core): prisma com injeção automática de tenant_id`.

### Task 6: core/auth — papéis e guards (TDD)

**Files:**
- Create: `core/auth/roles.ts`, `core/auth/guards.ts`, `tests/core/roles.test.ts`

**Interfaces:**
- Produces: `type Role = 'MEMBER'|'OWNER'|'SUPER_ADMIN'`; `atLeast(role, min): boolean`; `papelFromClerkRole(clerkRole: string): Role` (`org:admin→OWNER`, resto MEMBER); guards server-only: `requireUser()` (Clerk auth → redirect sign-in), `requireTenant()` (orgId → Tenant no banco; sem org → página de seleção), `requireRole(min)`, `isSuperAdmin()` / `requireSuperAdmin()` (Clerk `sessionClaims.metadata.role === 'SUPER_ADMIN'` via publicMetadata), `requireModule(slug)` (usa core/tenant/modules; retorna `{ tenant, ativo }`).

- [ ] **Step 1:** testes de `atLeast` (hierarquia MEMBER<OWNER<SUPER_ADMIN) e `papelFromClerkRole`. Rodar → FAIL.
- [ ] **Step 2:** implementar roles.ts → PASS.
- [ ] **Step 3:** implementar guards.ts (usa `auth()` de `@clerk/nextjs/server`, `db` e `redirect`). Typecheck OK. Commit `feat(core): papéis e guards de auth`.

### Task 7: core/events — bus (TDD)

**Files:**
- Create: `core/events/bus.ts`, `tests/core/events-bus.test.ts`

**Interfaces:**
- Produces: `publish(tenantId, tipo, payload, dbc = db)`, `fetchUnprocessed({ tipo?, limit = 50 }, dbc = db)`, `markProcessed(ids: string[], dbc = db)` — client injetável para teste com fake.

- [ ] **Step 1:** testes com fake db (objeto com `event.create/findMany/updateMany` espiões): publish grava tipo/payload/tenantId; fetch filtra `processado: false` (+tipo); markProcessed seta true por ids. FAIL → implementar → PASS.
- [ ] **Step 2:** Commit `feat(core): bus de eventos entre módulos`.

### Task 8: core/ai — cliente Anthropic + custo (TDD)

**Files:**
- Create: `core/ai/usage.ts`, `core/ai/anthropic.ts`, `tests/core/ai-usage.test.ts`

**Interfaces:**
- Produces: `custoBrl(modelo, tokensIn, tokensOut): number` (tabela de preços USD/MTok × câmbio `USD_BRL` env, default 5.5); `gerar({ tenantId, moduleId, system?, prompt, maxTokens?, modelo? }): Promise<string>` — chama Messages API com retry/backoff (3 tentativas em 429/5xx/overloaded), grava `ai_usage` com tokens reais da resposta.

- [ ] **Step 0:** consultar a skill `claude-api` para model ids/preços vigentes antes de escrever a tabela.
- [ ] **Step 1:** testes de `custoBrl` (aritmética conhecida) → FAIL → implementar → PASS.
- [ ] **Step 2:** `anthropic.ts` com `@anthropic-ai/sdk` (singleton, `maxRetries` do SDK + gravação de uso; falha de gravação não derruba a geração). Typecheck. Commit `feat(core): cliente anthropic com log de custo por tenant`.

### Task 9: Contrato de módulos + registry + módulos stub

**Files:**
- Create: `modules/types.ts`, `modules/registry.ts`, `modules/{relatorios,conteudo,midia,zelo}/{manifest.ts,index.ts,ui/index.tsx}`, `core/tenant/modules.ts`, `core/ui/icons.tsx`, `tests/modules/registry.test.ts`

**Interfaces:**
- Produces:

```ts
// modules/types.ts
import type { ComponentType } from 'react'
export type ModuleStatus = 'disponivel' | 'beta' | 'em_breve'
export interface ModuleManifest {
  id: string; slug: string; nome: string; descricao: string
  icone: ComponentType<{ size?: number }>
  status: ModuleStatus
  planoMinimo: 'essencial' | 'completo'
}
export interface ModuleUiProps { path: string[]; tenantId: string }
export interface RegisteredModule { manifest: ModuleManifest; Ui: ComponentType<ModuleUiProps> }
```

`modules/registry.ts`: `registry: RegisteredModule[]`, `getModuleBySlug(slug)`, `getModuleById(id)`. Módulos: relatorios (Relatórios), conteudo (Conteúdo), midia (id midia, slug anuncios, nome Anúncios), zelo (Zelo). `core/tenant/modules.ts`: `getActiveModuleIds(tenantId)`, `isModuleActive(tenantId, moduleId)` lendo `tenant_modules`.
- Consumes: ícones em `core/ui/icons.tsx` (SVGs 20×20 stroke 1.5 extraídos do dashboard: Inicio, Conteudo, Anuncios, Relatorios, Equipe, Ajustes + Zelo bubble).

- [ ] **Step 1:** teste registry: slugs e ids únicos, todo módulo tem manifest.nome e Ui. FAIL → implementar types/registry/manifests/stub UIs → PASS.
- [ ] **Step 2:** stub UI por módulo: card branco (radius 10, borda sutil), eyebrow mono `ferramenta · <nome>`, título Space Grotesk, descrição, badge `em construção` — usando componentes da Task 10 (se ainda não existirem, inline styles com tokens).
- [ ] **Step 3:** lint (fronteiras) + typecheck. Commit `feat(modules): contrato, registry e módulos stub`.

### Task 10: core/ui — design system portado do handoff

**Files:**
- Create: `core/ui/Logo.tsx`, `core/ui/Badge.tsx`, `core/ui/Button.tsx`, `core/ui/Card.tsx`, `core/ui/EyebrowLabel.tsx`, `core/ui/Input.tsx`

**Interfaces:**
- Produces (fiel ao source do bundle `76e7dd25.bin`): `Logo({ variant: 'full'|'symbol'|'wordmark'|'favicon', tone: 'positive'|'negative'|'mono'|'onRed', size })`; `Badge({ tone: 'neutral'|'dark'|'accent'|'outline' })`; `Button({ variant: 'primary'|'secondary'|'dark'|'ghost', size: 'sm'|'md'|'lg' })` (client); `Card({ tone: 'white'|'osso'|'dark', elevated, padding, radius })`; `EyebrowLabel({ tone: 'accent'|'muted'|'inverse' })`; `Input({ label, hint, ... })` (client).

- [ ] **Step 1:** portar os 6 componentes JSX→TSX com tipos, `'use client'` onde há estado, usando `var(--…)` como no source. Typecheck + build. Commit `feat(core/ui): design system VETOR em código`.

### Task 11: Clerk — middleware, páginas de auth e webhook de sync

**Files:**
- Create: `middleware.ts`, `app/(auth)/sign-in/[[...rest]]/page.tsx`, `app/(auth)/sign-up/[[...rest]]/page.tsx`, `app/api/webhooks/clerk/route.ts`, `app/api/health/route.ts`
- Modify: `app/layout.tsx` (ClerkProvider + ptBR de `@clerk/localizations`)

**Interfaces:**
- Produces: rotas protegidas `/dashboard /tools /admin /configuracoes /suporte`; webhook sincroniza `user.created|updated→users`, `organization.created|updated→tenants` (upsert por clerkOrgId, slug do org), `organizationMembership.created|updated|deleted→memberships` (papel via `papelFromClerkRole`). Verificação com `verifyWebhook` (`@clerk/nextjs/webhooks`).

- [ ] **Step 1:** middleware com `clerkMiddleware` + `createRouteMatcher`; páginas `<SignIn/>`/`<SignUp/>` centradas em fundo osso com Logo.
- [ ] **Step 2:** webhook route (retorna 400 se assinatura inválida; upserts no banco). `/api/health` → `{ ok: true }`.
- [ ] **Step 3:** build passa com chaves placeholder. Commit `feat(auth): clerk organizations + sync via webhook`.

### Task 12: core/tenant/context + AppShell + dashboard

**Files:**
- Create: `core/tenant/context.ts`, `core/ui/AppShell.tsx`, `app/(platform)/layout.tsx`, `app/(platform)/dashboard/page.tsx`, `app/(platform)/configuracoes/equipe/page.tsx`, `app/(platform)/configuracoes/modulos/page.tsx`, `app/(platform)/suporte/page.tsx`

**Interfaces:**
- Produces: `currentTenant()` (Clerk orgId → Tenant; null se sem org) e `requireTenantContext()` (redirect se null). `AppShell({ tenant, modulosAtivos, children })` — sidebar 236px carvão sticky (fiel ao template): Logo tone negative 24px, chip da empresa (inicial + nome + `segmento` mono 10.5px), nav Início + módulos ativos (ícones do manifest, hover `rgba(240,238,232,.08)`, item ativo com fundo e barra), divisória `rgba(240,238,232,.14)`, nav Equipe/Ajustes, rodapé mono `vetor · plataforma` + `suporte: oi@vetor.com.br`.
- Dashboard: saudação por hora do dia + nome (Clerk `currentUser().firstName`), data pt-BR, resumo de pendências (count `events` não processados do tenant), grade de cards das ferramentas ativas (ícone, nome, badge status, descrição), "Atividade recente" (últimos 8 de `activity_log`, com estado vazio "Tudo em dia"), card tracejado de upsell do primeiro módulo inativo com botão "Tenho interesse" (server action → `activity_log` + `events` `modulo.interesse`).

- [ ] **Step 1:** implementar context + AppShell (server component; links `next/link`; item ativo via `usePathname` num subcomponente client `NavLink`).
- [ ] **Step 2:** layout `(platform)` chama `requireTenantContext()` + `getActiveModuleIds` e monta AppShell; sem org → tela "escolha sua empresa" com `<OrganizationList/>`.
- [ ] **Step 3:** dashboard/page.tsx conforme spec acima; configuracoes/equipe renderiza `<OrganizationProfile/>` (Clerk gerencia convites); configuracoes/modulos lista registry × ativos com botão "solicitar ativação" (mesma server action de interesse); suporte: card com e-mail.
- [ ] **Step 4:** build + lint + typecheck. Commit `feat(platform): appshell e dashboard na identidade vetor`.

### Task 13: Rota genérica tools/[slug]/[[...path]]

**Files:**
- Create: `app/(platform)/tools/[slug]/layout.tsx`, `app/(platform)/tools/[slug]/error.tsx`, `app/(platform)/tools/[slug]/[[...path]]/page.tsx`, `core/ui/ModuloInativo.tsx`

**Interfaces:**
- Consumes: `getModuleBySlug`, `isModuleActive`, `requireTenantContext`, server action `solicitarAtivacao(moduleId)`.
- Produces: slug fora do registry → `notFound()`; módulo inativo → `<ModuloInativo manifest={…}/>` (página "solicitar ativação": eyebrow `ferramenta · não contratada`, descrição, botão dark "Solicitar ativação" que grava evento + activity_log e mostra confirmação); ativo → renderiza `Ui` do módulo com `{ path, tenantId }`. `error.tsx`: card de erro em língua de dono ("Algo deu errado nesta ferramenta — o resto da plataforma segue funcionando") + botão tentar de novo.

- [ ] **Step 1:** implementar layout (guard) + page (delegação) + error boundary + ModuloInativo.
- [ ] **Step 2:** build/lint/typecheck. Commit `feat(platform): rota genérica de ferramentas com guard e error boundary`.

### Task 14: Admin — provisionar tenants e ligar módulos

**Files:**
- Create: `app/(admin)/layout.tsx`, `app/(admin)/admin/page.tsx`, `app/(admin)/admin/tenants/page.tsx`, `app/(admin)/admin/tenants/[id]/page.tsx`, `app/(admin)/admin/actions.ts`

**Interfaces:**
- Consumes: `requireSuperAdmin`, `db`, registry.
- Produces: layout guard SUPER_ADMIN (403 amigável se não). `/admin`: cards de saúde (nº tenants ativos, módulos ativos, eventos não processados, custo IA do mês — soma `ai_usage`). `/admin/tenants`: tabela (nome, slug, segmento, plano, status, módulos ativos) + form "Provisionar empresa" (nome, slug, segmento) → server action `criarTenant` (tenta criar Clerk org via `clerkClient`; se Clerk indisponível, cria só no banco) + activity_log. `/admin/tenants/[id]`: dados do tenant + toggle por módulo do registry → `alternarModulo(tenantId, moduleId, ativo)` (upsert tenant_modules + activity_log). Admin usa `db` cru (visão cross-tenant de saúde — ADR-004: sem dados operacionais).

- [ ] **Step 1:** implementar páginas + actions com `revalidatePath`.
- [ ] **Step 2:** build/lint/typecheck. Commit `feat(admin): provisionamento de tenants e módulos`.

### Task 15: Verificação final + documentação de setup

**Files:**
- Create: `vetor/README.md`
- Modify: nada além de correções que a verificação apontar.

- [ ] **Step 1:** rodar tudo: `npm run lint && npm run typecheck && npm test && npm run build` → Expected: verde.
- [ ] **Step 2:** repetir o teste de fronteira (import cruzado → lint falha → remover).
- [ ] **Step 3:** `vetor/README.md`: o que existe, variáveis de ambiente, passo a passo para conectar Neon (migrate deploy + seed), Clerk (Organizations on, webhook, metadata SUPER_ADMIN), Vercel; critérios de "pronto" da Fase 1 e o que fica para Fase 2.
- [ ] **Step 4:** commit final `docs: guia de setup da fase 1` e resumo ao usuário (o que roda já, o que depende de contas externas).

## Self-Review

- **Cobertura da spec (Fase 0):** repo ✓(T1), Next+TS+Tailwind ✓(T1), shadcn — *adiado deliberadamente*: o design system do handoff é custom e completo; shadcn entra quando um componente dele for necessário (YAGNI; documentado no README). Contas externas — impossível nesta sessão; documentado (T15). Prisma+migração ✓(T4), pastas ✓(T1), Proteção 1 ✓(T3), Proteção 2 CI ✓(T3), deploy Vercel — depende de conta; documentado (T15).
- **Cobertura da spec (Fase 1):** tabelas ✓(T4), Clerk orgs+webhook+guards+SUPER_ADMIN ✓(T6,T11), client.ts com injeção ✓(T5), anthropic+usage ✓(T8), events ✓(T7), types+registry ✓(T9), AppShell do handoff ✓(T12), rota genérica+error boundary ✓(T13), admin tenants ✓(T14). "Pronto quando" (fluxo com login real) — verificável só com Clerk/Neon reais; documentado.
- **Placeholders:** nenhum "TBD"; código dos pontos sutis está inline; UI usa fontes de referência extraídas (paths fixados nas Global Constraints).
- **Consistência de tipos:** `ModuleManifest.id` é a chave de `tenant_modules.module_id`; `slug` é a rota. `papelFromClerkRole` usado no webhook (T11) definido em T6. `scopeArgs` (T5) usado só via `tenantDb`.
