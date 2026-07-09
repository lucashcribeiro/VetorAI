# VETOR — Documento Mestre do Projeto

> **O que é este documento:** a fonte única de verdade do projeto VETOR. Contém contexto, visão, arquitetura, decisões técnicas com justificativa, plano de execução por fases e roadmap futuro.
>
> **Como usar com LLMs:** este arquivo foi escrito para ser colado (inteiro ou por seção) como contexto em qualquer LLM — Claude, Claude Code, ChatGPT, Gemini. Cada seção é autocontida. Ao pedir ajuda com uma tarefa específica, cole a seção relevante + a tarefa.
>
> **Versão:** 1.0 · Julho de 2026
> **Autor:** Lucas · **Status:** pré-desenvolvimento (Fase 0)

---

## Índice

1. [Contexto e origem](#1-contexto-e-origem)
2. [Visão e posicionamento](#2-visão-e-posicionamento)
3. [Modelo de negócio](#3-modelo-de-negócio)
4. [Os clientes-piloto](#4-os-clientes-piloto)
5. [Catálogo de ferramentas (módulos)](#5-catálogo-de-ferramentas-módulos)
6. [Os agentes de IA](#6-os-agentes-de-ia)
7. [Arquitetura técnica](#7-arquitetura-técnica)
8. [Decisões de arquitetura (ADRs)](#8-decisões-de-arquitetura-adrs)
9. [Estrutura de pastas](#9-estrutura-de-pastas)
10. [Modelo de dados](#10-modelo-de-dados)
11. [Identidade visual e design system](#11-identidade-visual-e-design-system)
12. [Plano de execução por fases](#12-plano-de-execução-por-fases)
13. [Roadmap futuro](#13-roadmap-futuro)
14. [Riscos, limites e conformidade](#14-riscos-limites-e-conformidade)
15. [Glossário](#15-glossário)
16. [Anexo: prompts prontos](#16-anexo-prompts-prontos)

---

## 1. Contexto e origem

### De onde veio a ideia

Recebi uma proposta comercial da **V4 Company** chamada "Estruturação Estratégica": uma auditoria produtizada de 4 semanas (mídia paga, criativos, ambientes digitais, processo comercial, análise competitiva), seguida de um pacote de implementações e um plano de crescimento de 12 meses.

Ao analisar o documento, ficou claro que:

- **Quase todas as entregas são trabalho de análise, síntese e produção de documentos e ativos digitais** — exatamente o que agentes de IA fazem bem hoje.
- **O plano de 12 meses é isca comercial.** O texto da própria proposta diz que depois "você pode decidir se vai executá-lo com seu time, ou com um time de especialistas da V4". A auditoria é o *test drive*; a receita real está no contrato recorrente.
- **As entregas são padronizadas em escala.** Uma franquia que atende de XP Inc. a clínicas odontológicas trabalha com playbooks. As "Implementações do Método V4" são templates aplicados por analistas.

**Decisão:** declinar a proposta e usar o PDF deles como **especificação gratuita** do produto que eu vou construir.

### Por que construir em vez de contratar

| Critério | Contratar a V4 | Construir com IA |
|---|---|---|
| Custo | Valor da proposta + recorrência implícita depois | Assinatura de LLM + custo marginal de API (centavos por análise) |
| Prazo | 4 semanas, uma vez | 4–6 semanas de construção; depois cada auditoria roda em dias e se repete |
| Propriedade | Relatório entregue; método fica com eles | Sistema, prompts, integrações e dados ficam comigo |
| Reuso | Zero — cada cliente novo exige nova contratação | Mesmo pipeline atende dental, seguros e futuros nichos |
| Contexto | Analista externo conhecendo o negócio em 4 semanas | Contexto total do negócio, acumulado ao longo do tempo |
| Continuidade | Termina na semana 4 (ou vira contrato) | Agentes rodam continuamente: monitoram, alertam, atualizam |
| Efeito | Despesa | Vira produto vendável — a mesma oferta que a V4 vende |

**Honestidade intelectual:** a V4 tem duas coisas que IA não replica — **marca/credibilidade** (cases como XP e iFood abrem portas) e **experiência humana acumulada** de milhares de contas. Compenso a primeira com resultados documentados nos pilotos; a segunda, com benchmarks públicos, dados reais e iteração rápida. É importante saber o que se está trocando.

### O que a proposta da V4 entrega (usada como spec)

| Semana | Frente | Entregas |
|---|---|---|
| 1 | Kick Off Estratégico | Coleta de informação e acessos, definição de cronograma, formulário de kick off |
| 2 | Análise de Mídia Paga | Visão técnica das campanhas Meta/Google Ads, avaliação de eficiência dos investimentos |
| 2 | Diagnóstico de Criativos | Análise do processo criativo, benchmarking, análise e descoberta de perfil |
| 2 | Diagnóstico de Ambientes | Análise de design e usabilidade, performance e métricas de engajamento, estudo de narrativa |
| 3 | Diagnóstico Comercial | Avaliação técnica do time de vendas, cliente oculto |
| 3 | Análise Competitiva | 4 P's do Marketing (Kotler), SWOT, definição de mídia social, mapa estratégico do negócio |
| 3 | Estratégia de Marketing | Estruturação de: Oferta, Aquisição, Engajamento, Monetização, Retenção, Conteúdo |
| 4 | Entregas Operacionais | Landing page, Google Meu Negócio, pack de criativos, réguas de CRM |
| 4 | Planejamento | Manual de copywriting, manual de identidade visual, plano de crescimento de 12 meses |

Cada linha dessa tabela está mapeada para um agente ou módulo neste documento.

---

## 2. Visão e posicionamento

### O que é o VETOR

**VETOR é uma consultoria de IA para pequenas empresas brasileiras** (clínicas, corretoras, comércio local), com uma plataforma própria onde as ferramentas construídas para cada cliente vivem.

O nome vem de *vetor*: **direção + intensidade**.

### O que o VETOR NÃO é

- ❌ Não é agência de marketing (não opero o marketing do cliente)
- ❌ Não é serviço gerenciado (o cliente opera sozinho, pelo próprio login)
- ❌ Não é SaaS horizontal genérico (cada empresa recebe o que resolve o problema dela)

### O ciclo de trabalho

```
1. DIAGNÓSTICO      → entendo o problema real da empresa
2. FERRAMENTA       → construo a solução sob medida (ou indico uma de terceiros
                      quando não compensa construir)
3. ENTREGA          → a empresa recebe acesso e opera sozinha
4. ASSINATURA       → a ferramenta vive na plataforma; eu evoluo e dou suporte
```

### Posicionamento em uma frase

> Técnico que fala a língua de dono de negócio: ferramentas de IA sob medida que o próprio cliente opera.

### Princípio central de produto

**O cliente comanda, eu defino os trilhos.**

O cliente aperta botões de alto nível ("rodar auditoria", "aprovar os posts da semana", "assumir esta conversa"). Quem define o que cada botão faz por baixo sou eu. Isso:

- Protege o cliente de si mesmo (ninguém edita prompt e quebra a conformidade do CFO)
- Protege meu know-how (prompts, custos e método nunca aparecem no portal)
- Cria trilha de auditoria (aprovação de verba com data, hora e autor)

### Linguagem do produto

Toda a interface fala **língua de dono de negócio**, nunca jargão de marketing.

- ✅ "R$ 74 por paciente novo", "23 agendamentos este mês", "pausar 1 anúncio de baixo retorno"
- ❌ "CPL R$ 74", "CTR 2,3%", "ROAS 4.2x" (isso fica no relatório detalhado, não na tela inicial)

---

## 3. Modelo de negócio

### Estrutura de receita

| Componente | O que é | Quando cobra |
|---|---|---|
| **Projeto** | Diagnóstico + desenvolvimento da ferramenta sob medida | Valor fechado, uma vez |
| **Assinatura** | Acesso à plataforma + módulos ativos + evolução e suporte | Mensal recorrente |

O cliente que não quer a plataforma paga só o projeto e leva a ferramenta standalone. **A plataforma é upsell, não pré-requisito.**

### Efeito da plataforma na retenção

Sem plataforma, a oferta é "consultoria de R$ X/mês" — cancelável a qualquer momento. Com plataforma, o cliente que pensa em cancelar não está cancelando um serviço; está perdendo o painel onde vê a empresa funcionando. É a mesma retenção que a V4 constrói com contrato, construída com produto.

### Capacidade de atendimento

**O gargalo não é técnico — sou eu.**

| Fase | Clientes | O que muda | Custo de infra |
|---|---|---|---|
| Validação | 2–5 | Reviso quase tudo (autonomia nível 1) | ~R$ 0 (tiers gratuitos) |
| Operação solo | 10–20 | Agentes maduros, clientes em nível 2–3, trato exceções | ~R$ 300–800/mês total |
| Com 1 pessoa de CS | 30–50 | Alguém cuida do relacionamento | Irrisório perto da receita |
| Teto da arquitetura | 500+ | Só aí repensaria infra | — |

**Custo variável de IA por cliente:** ~R$ 30–100/mês em API. Cobrando R$ 800–2.000/mês, a margem é de software, não de serviço.

**Alavanca de crescimento:** quantos clientes consigo manter no **nível 3 de autonomia**. Cada aprovação que deixa de precisar de mim é capacidade nova de atendimento.

### Modelo de autonomia (aplicável a todo módulo)

| Nível | Comportamento |
|---|---|
| 0 | Manual — a IA sugere, humano executa fora da plataforma |
| 1 | Aprovação item a item — nada sai sem "sim" do dono |
| 2 | Aprovação em lote — o dono aprova o pacote da semana |
| 3 | Autônomo com kill switch — a IA executa, o dono acompanha e pode desligar |

Esse nível é configurado **por tenant, por módulo** (campo `config` em `tenant_modules`).

---

## 4. Os clientes-piloto

### Piloto 1 — Consultório odontológico (Dra. Mirilaini)

- **Relação:** minha namorada, dentista — acesso total, feedback honesto, risco baixo
- **Vantagem:** já construí o site, plano de Meta Ads e calendário de conteúdo dela
- **Dores prováveis:** conteúdo consistente no Instagram, agendamento/atendimento de WhatsApp, entender se o anúncio dá retorno
- **Conformidade crítica:** publicidade odontológica segue o **Código de Ética Odontológica (CFO)** — sem promessa de resultado, sem antes/depois sem contexto clínico, sem preço em destaque como chamariz

### Piloto 2 — Corretora de seguros (Milu Seguros)

- **Relação:** minha corretora — controle total dos dados
- **Vantagem:** conheço o negócio por dentro (background de corretor licenciado)
- **Dores prováveis:** reativação de carteira, follow-up de cotação, relatório de origem de lead
- **Conformidade crítica:** publicidade de seguros segue regras da **SUSEP** — sem promessa de cobertura não contratada, identificação da corretora e do produto

### Por que esses dois

1. **Risco zero de relacionamento** — posso errar, quebrar e refazer
2. **Dois nichos verticais diferentes** — prova que o mesmo pipeline atende segmentos distintos
3. **Dois níveis de conformidade regulatória** — se funciona para dental e seguros, funciona para quase todo SMB brasileiro
4. **Cases documentados** — são a resposta ao "a V4 tem cases da XP, e você?"

---

## 5. Catálogo de ferramentas (módulos)

Cada ferramenta é um **módulo plugável** ativável por empresa. O cardápio no site público é gerado lendo o registry de módulos.

| Módulo | O que faz | Status | Prioridade |
|---|---|---|---|
| **Relatórios** | Relatório mensal em linguagem de dono, gerado por IA | A construir | Fase 2 (primeiro) |
| **Zelo** | Recepcionista de IA no WhatsApp: atende, qualifica, agenda | Conceito | Fase 3 |
| **Conteúdo** | Calendário e posts gerados por IA, com fluxo de aprovação | Engine existe | Fase 4 |
| **Monitor de Anúncios** | Vigia campanhas Meta/Google e alerta antes do prejuízo | A construir | Fase 5 |
| **Branding** | Logo, identidade, manual e materiais | Serviço manual | Vira módulo depois de 3 repetições |
| **Sob medida** | O problema específico do cliente vira ferramenta | Sempre | Por demanda |

### Regra de criação de módulo

> Uma ferramenta sob medida construída para o cliente A vira, com ajustes, módulo de catálogo vendido ao cliente B.

Um módulo entra no catálogo quando o mesmo processo se repetiu **3 vezes** manualmente. Antes disso, é serviço.

### Sobre o Zelo (nota importante)

O Zelo **ainda não existe** — é conceito. É o módulo **mais arriscado** do catálogo, não pela IA, mas pela operação: WhatsApp é tempo real, paciente esperando às 22h, número oficial com aprovação da Meta. Erro em relatório é constrangimento; erro no WhatsApp é paciente perdido.

**Construir em degraus:**

| Versão | Comportamento | Risco |
|---|---|---|
| v1 assistido | Zelo sugere a resposta, a secretária aprova com um toque | Zero — já economiza tempo dela |
| v2 semiautônomo | Autônomo em horário comercial, com botão de escalar para humano | Baixo |
| v3 autônomo | 24h, com kill switch e alerta de casos complexos | Médio |

---

## 6. Os agentes de IA

Os agentes replicam a auditoria da V4. Todos leem e escrevem no **Dossiê do Cliente** — um documento estruturado único por tenant. Sem ele, cada agente vira uma conversa isolada e o resultado perde consistência.

### Pipeline

```
                    ORQUESTRADOR (kick off)
                            ↓
                   DOSSIÊ DO CLIENTE
                  (contexto compartilhado)
                            ↓
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
   Ag. Mídia          Ag. Criativos       Ag. Ambientes      ← diagnóstico
        ↓                   ↓                   ↓
   Ag. Comercial     Ag. Competitivo     Ag. Estrategista    ← estratégia
        └───────────────────┼───────────────────┘
                            ↓
                    Ag. de Entregas                          ← materialização
                            ↓
              Relatórios HTML + ativos publicados
```

### Detalhamento

#### Agente 0 — Orquestrador
- **Equivale a:** Semana 1 da V4 (Kick Off Estratégico)
- **Faz:** conduz o formulário de kickoff, coleta acessos, cria e mantém o Dossiê, dispara os demais agentes, consolida resultados
- **Ferramentas:** formulário próprio → Claude estrutura → Dossiê (Markdown/JSON no banco/Drive)
- **Entrega:** dossiê inicial + cronograma
- **Nota:** é o **primeiro a construir** — tudo depende dele

#### Agente 1 — Mídia Paga
- **Equivale a:** Semana 2 (Análise para Mídia Paga)
- **Faz:** puxa campanhas via Meta Marketing API e Google Ads API, calcula CPL, CAC, ROAS e frequência, identifica desperdício e oportunidades de realocação
- **Ferramentas:** APIs oficiais + Claude para o parecer
- **Entrega:** relatório de eficiência com recomendações priorizadas por impacto financeiro
- **Atalho de v1:** começar com **CSV exportado** das plataformas em vez de API

#### Agente 2 — Criativos
- **Equivale a:** Semana 2 (Diagnóstico de Criativos)
- **Faz:** coleta anúncios ativos do cliente e concorrentes na **Meta Ad Library** (pública e gratuita), analisa ganchos, formatos, ofertas e ângulos; cruza com o perfil do dossiê
- **Ferramentas:** Ad Library + Claude com visão + engine de conteúdo
- **Entrega:** benchmarking + diretrizes de criativo por persona

#### Agente 3 — Ambientes
- **Equivale a:** Semana 2 (Diagnóstico de Ambientes)
- **Faz:** audita site e landing pages — performance técnica, usabilidade, narrativa, coerência da jornada (anúncio → página → conversão)
- **Ferramentas:** Lighthouse via CLI + Claude lendo o HTML (heurísticas de Nielsen, análise de copy) + GA4 quando houver acesso
- **Entrega:** auditoria com lista priorizada de correções (quick wins primeiro)

#### Agente 4 — Comercial (cliente oculto) ⭐ MAIOR DIFERENCIAL
- **Equivale a:** Semana 3 (Diagnóstico Comercial)
- **Faz:** simula um lead real via WhatsApp — mede tempo de primeira resposta, qualidade da qualificação, condução ao agendamento, follow-up nos dias seguintes; repete em horários diferentes
- **Ferramentas:** infraestrutura do Zelo + roteiro de persona + rubric comercial avaliado por Claude
- **Entrega:** relatório de cliente oculto com jornada registrada e nota por critério
- **Por que é o diferencial:** a V4 faz isso manualmente, uma vez. Eu faço automatizado e repetível.
- **⚠️ Ética:** usar apenas nas contas piloto ou **com autorização escrita** do dono do negócio auditado. **Nunca contra concorrentes.**

#### Agente 5 — Inteligência Competitiva
- **Equivale a:** Semana 3 (Análise Competitiva)
- **Faz:** pesquisa concorrentes locais e nacionais, monta 4 Ps, SWOT, posicionamento de preço, presença digital e mapa estratégico
- **Ferramentas:** Claude com web search + Google Maps/GMN dos concorrentes + Ad Library
- **Entrega:** documento de análise competitiva com mapa estratégico

#### Agente 6 — Estrategista
- **Equivale a:** Semana 3 (Estratégia de Marketing — 6 frentes)
- **Faz:** lê o dossiê inteiro (já enriquecido pelos agentes 1–5) e produz as seis estruturações: **Oferta, Aquisição, Engajamento, Monetização, Retenção, Conteúdo** — com metas trimestrais e responsáveis
- **Ferramentas:** Claude com dossiê completo + um template/skill por frente
- **Entrega:** estratégia integrada + **Plano de Crescimento de 12 meses** (o documento-âncora que a V4 usa para fechar contrato)

#### Agente 7 — Entregas Operacionais
- **Equivale a:** Semana 4 (Entregas + Planejamento)
- **Faz:** materializa a estratégia — landing page (código), Google Meu Negócio (API), pack de criativos, réguas de CRM (sequências), manuais de copywriting e identidade visual
- **Entrega:** ativos publicados + documentação
- **Diferença central:** a V4 entrega e vai embora; meus agentes continuam rodando

#### Agente 8 — Branding
- **Equivale a:** Semana 4 (manual de identidade visual), expandido
- **Etapas e grau de automação:**

| Etapa | O que é | IA faz |
|---|---|---|
| Estratégia de marca | Posicionamento, arquétipo, personalidade, tom de voz, naming | ~90% |
| Logo | Conceitos + wordmark/símbolo vetorial (SVG) | ~60–70% |
| Manual de identidade | Paleta (HEX/CMYK), tipografia, grid, usos corretos/incorretos | ~95% |
| Aplicações e merch | Caneca, camiseta, boné, cartão, papelaria, capas | Canva (templates) |

- **Refino humano necessário:** kerning do wordmark, alinhamento óptico, versões de aplicação → Figma
- **Valor estratégico:** é a entrega de **maior valor percebido por real de custo**. Cliente pequeno não distingue auditoria de mídia boa de mediana, mas vê o logo, a caneca e o site na hora. Excelente porta de entrada comercial.

---

## 7. Arquitetura técnica

### Stack escolhida

| Camada | Tecnologia | Por quê |
|---|---|---|
| App (front + back) | **Next.js 15** (App Router) + TypeScript | Um projeto só; o produto é 70% interface |
| UI | Tailwind + shadcn/ui | Velocidade + tokens do design system |
| Banco | **Postgres (Neon)** + Prisma | Serverless, multi-tenant, migrations versionadas |
| Auth | **Clerk** (Organizations) | Papéis e convites prontos; cliente gerencia a própria equipe |
| Jobs | **Trigger.dev** | Agentes são tarefas longas; não podem rodar em request |
| Storage | Blob (Vercel Blob ou S3) | Relatórios, criativos, assets de marca |
| IA | Anthropic API (Claude) | Cliente único em `core/ai` com log de custo por tenant |
| Deploy | **Vercel** | Preview por PR, rollback em 1 clique |
| E-mail | Resend | Convites, alertas |

### Por que Next.js e não Java/Spring

Meu background é Java (pós em arquitetura Java na FIAP). Mas:

1. **Velocidade até o primeiro cliente pagante** — Next.js full-stack põe o portal no ar em dias; com Spring seriam dois projetos, dois deploys, CORS, DTOs duplicados
2. **O produto é 70% interface** — seria React de qualquer jeito; com Next o backend vem na mesma base, uma linguagem só
3. **Ecossistema resolve meus problemas** — Clerk (auth com papéis em dias), Trigger.dev (jobs de IA de longa duração), SDK Anthropic em TS é cidadão de primeira classe
4. **Já vivo em JS/TS** — meus engines e ferramentas de consultoria já são desse ecossistema

**Separação de objetivos (crítico):**

| Projeto | Objetivo | Stack |
|---|---|---|
| Plataforma VETOR | Gerar receita rápido | Next.js + TS |
| FIAP Tech Challenges | Formação e portfólio Java | Spring Boot |
| Carreira CLT | Mercado corporativo BR | Java continua valendo |

O erro clássico seria construir a plataforma em Spring "para treinar Java" — misturar objetivo de aprendizado com objetivo de receita atrasa os dois. **Os conceitos transferem:** Clean Architecture, DDD, separação de camadas se aplicam ao projeto Next (domínio isolado, use cases, repositórios via Prisma).

**Quando Java voltaria:** worker específico com carga de CPU alta. Aí extraio só ele como serviço separado. Não é decisão para agora.

### Fluxo de execução

```
Navegador / WhatsApp
        ↓
Next.js na Vercel  (UI + server actions + webhooks + Clerk)
        ↓
Postgres (Neon)  ←→  Blob storage
        ↑
Trigger.dev (workers dos 8 agentes: cron + retry)
        ↓
APIs externas: Anthropic, Meta Ads, Google Ads, GMN, WhatsApp Cloud
```

**Regra crítica:** ações demoradas (rodar auditoria, gerar relatório, analisar campanha) **nunca rodam na request**. O server action só enfileira o job; o worker executa e grava; a UI atualiza. Essa separação request-rápida / job-lento é a única decisão de arquitetura realmente crítica. O resto é CRUD.

---

## 8. Decisões de arquitetura (ADRs)

### ADR-001: Monólito modular, não microserviços

**Contexto:** cada ferramenta nova entra no mesmo sistema. Isso pesa? Aumenta risco de quebrar? Prejudica comunicação?

**Decisão:** **um único app Next.js**, com cada ferramenta isolada em `modules/<nome>/`.

**Justificativa:**

*"Fica pesado?"* — No frontend, code splitting é por rota: quem abre `/tools/conteudo` baixa só aquele bundle. No servidor, cada rota vira função serverless isolada — não existe "processo gordo com tudo carregado" (imagem mental vinda do mundo JAR). O que cresce é tempo de build e schema do Prisma — incomoda lá pelos 30–40 módulos, não nos primeiros 8.

*"Risco de quebrar?"* — Separar dois riscos:
- **Acoplamento** (mexi em A, quebrou B): não vem do repo compartilhado, vem de **imports cruzados**. Resolve-se com ferramenta: regra de ESLint que **falha o build** se `modules/midia` importar de `modules/conteudo`. A fronteira que no microserviço é a rede, no monólito modular é o linter — mais barata e igualmente rígida.
- **Deploy** (subi versão ruim, derrubei tudo): mitigado por preview deploy por PR, rollback em 1 clique e **feature flag por tenant** (código vai para produção desligado; ativa no tenant de teste, depois num piloto, depois no resto; quebrou → desliga a flag, sem deploy).

*"Prejudica comunicação?"* — É o contrário. Módulos no mesmo processo conversam por chamada de função tipada, compartilham transação, e erro aparece na mesma stack trace. Em microserviços, comunicação é o problema central (HTTP/fila, consistência eventual, timeout, contrato versionado).

**Contraponto assumido:** microserviços não removem risco — **trocam risco de acoplamento por risco operacional** (N pipelines, N versões, falhas parciais, observabilidade distribuída). Esse risco é pago em horas de operação, e eu sou um. Para time de um, o monólito modular é objetivamente a opção de **menor risco total**. Shopify e GitHub rodam monólitos modulares gigantes; o Prime Video voltou de microserviços para monólito cortando 90% do custo.

**Quando eu mudaria de ideia (gatilhos objetivos):**
- Um módulo com carga 10× maior que os outros → extrai só ele
- Necessidade de runtime diferente (worker Python de visão) → serviço separado
- Mais de um time se atropelando no mesmo repo
- Build passando de ~10 min e criando medo de deployar

Nenhum existe hoje. E o desenho modular garante que, quando existir, extrair é **recortar uma pasta com fronteiras**, não desembaraçar um novelo.

> Arquitetura boa não é a que elimina risco; é a que escolhe os riscos que você tem capacidade de pagar.

### ADR-002: Comunicação entre módulos

**Decisão:** módulos **nunca** importam uns dos outros. Dois canais permitidos:
1. **Serviços do `core/`** — o que todos usam (auth, db, ai, ui)
2. **Tabela de eventos** — `modules/midia` publica `campanha.alerta_criado`; `modules/relatorios` consome

**Bônus:** esse padrão de eventos custa uma tabela e entrega, de graça, exatamente as costuras onde eu cortaria o sistema se um dia precisar extrair um serviço.

### ADR-003: Multi-tenancy por `tenant_id` + middleware do Prisma

**Decisão:** `tenant_id` em toda tabela + extensão do Prisma que injeta o filtro automaticamente em toda query.

**Justificativa:** isolamento à prova de esquecimento. É impossível um bug vazar dados da clínica para a corretora, porque o filtro não depende do desenvolvedor lembrar.

### ADR-004: Privacidade — eu não vejo os dados operacionais do cliente

**Decisão:** por padrão, meu painel admin mostra **saúde do tenant** (módulos ativos, uso, faturamento, erros de job) — **não** conversas, leads ou números. Para dar suporte, botão de "conceder acesso de suporte" que o **cliente autoriza**.

**Justificativa:** argumento de venda ("seus dados são seus") + proteção jurídica (LGPD: viro operador com escopo mínimo, não controlador da operação alheia).

### ADR-005: Cardápio → clique → já logado

**Decisão:** o cardápio é a mesma aplicação; clicar numa ferramenta ativa leva a `/tools/<slug>` com a sessão existente. **Não existe SSO para resolver.**

Se um dia uma ferramenta virar app separado (venda standalone, runtime diferente, isolamento exigido por cliente), basta apontar o segundo app Next para a **mesma instância do Clerk** → login compartilhado automático.

> A decisão de separar não precisa ser tomada agora, e o padrão de módulo garante que continue possível depois. Essa é a resposta de arquitetura mais barata que existe: **adiar a decisão cara mantendo a porta aberta.**

### ADR-006: Ordem de construção — agentes antes da plataforma

**Decisão:** Fase 1 = agentes como scripts/skills soltos + dossiê. Fase 2 = backend. Fase 3 = frontend bonito.

**Justificativa:** a tentação de dev é construir a casca primeiro, e aí se passam dois meses em CRUD e autenticação sem nenhum agente rodando. Quando o frontend chegar, eu saberei exatamente quais telas importam, porque usei o sistema manualmente por meses.

---

## 9. Estrutura de pastas

```
vetor/
├─ .env.local                        # Clerk, Neon, Trigger, Anthropic
├─ next.config.ts
├─ package.json
├─ tsconfig.json
├─ tailwind.config.ts                # tokens vindos do design system
├─ eslint.config.mjs                 # ★ regra de fronteiras entre módulos
├─ middleware.ts                     # Clerk: protege (platform), resolve sessão
│
├─ brand/                            # fonte da verdade da marca
│  ├─ logo/                          # SVG/PNG, claro, escuro, mono
│  ├─ palette.md                     # hex + uso de cada cor
│  ├─ soft-rules.md                  # ★ regras subjetivas da marca
│  └─ tokens.css                     # variáveis CSS exportadas
│
├─ prisma/
│  ├─ schema.prisma                  # core + tabelas de cada módulo
│  ├─ migrations/
│  └─ seed.ts                        # tenants de teste (Mirilaini, Milu)
│
├─ trigger/
│  └─ index.ts                       # registra jobs de todos os módulos
│
├─ public/
│  ├─ logo.svg
│  └─ tools/                         # ícones/ilustrações do cardápio
│
├─ app/
│  ├─ layout.tsx                     # html raiz, fontes, ClerkProvider
│  ├─ globals.css
│  │
│  ├─ (site)/                        # ── PÚBLICO ──
│  │  ├─ layout.tsx
│  │  ├─ page.tsx                    # landing do VETOR
│  │  ├─ ferramentas/
│  │  │  ├─ page.tsx                 # CARDÁPIO (lê o registry)
│  │  │  └─ [slug]/page.tsx          # página de venda de 1 ferramenta
│  │  └─ contato/page.tsx
│  │
│  ├─ (auth)/                        # ── LOGIN ──
│  │  ├─ sign-in/[[...rest]]/page.tsx
│  │  └─ sign-up/[[...rest]]/page.tsx
│  │
│  ├─ (platform)/                    # ── LOGADO ──
│  │  ├─ layout.tsx                  # AppShell: sidebar dinâmica + tenant
│  │  ├─ dashboard/page.tsx          # home da empresa
│  │  ├─ tools/
│  │  │  └─ [slug]/
│  │  │     ├─ layout.tsx            # guard: módulo ativo? + error boundary
│  │  │     └─ [[...path]]/page.tsx  # delega para modules/<slug>/ui
│  │  ├─ configuracoes/
│  │  │  ├─ equipe/page.tsx          # dono convida/remove usuários
│  │  │  ├─ modulos/page.tsx         # ativa/solicita ferramentas
│  │  │  └─ faturamento/page.tsx
│  │  └─ suporte/page.tsx
│  │
│  ├─ (admin)/                       # ── SÓ EU ──
│  │  ├─ layout.tsx                  # guard: SUPER_ADMIN
│  │  └─ admin/
│  │     ├─ page.tsx                 # saúde dos tenants, uso, erros de job
│  │     ├─ tenants/page.tsx         # provisionar empresa
│  │     └─ tenants/[id]/page.tsx    # módulos, plano, acesso-suporte
│  │
│  └─ api/
│     ├─ webhooks/
│     │  ├─ clerk/route.ts           # sync usuário/organização → banco
│     │  ├─ whatsapp/route.ts        # eventos do Zelo
│     │  └─ trigger/route.ts
│     └─ health/route.ts
│
├─ modules/                          # ★ UMA PASTA POR FERRAMENTA
│  ├─ registry.ts                    # lista todos os módulos instalados
│  ├─ types.ts                       # contrato: ModuleManifest, ModuleJob
│  │
│  ├─ relatorios/
│  │  ├─ manifest.ts                 # id, nome, ícone, slug, permissões, plano
│  │  ├─ index.ts                    # exporta manifest + entradas públicas
│  │  ├─ ui/                         # telas e componentes DESTE módulo
│  │  ├─ server/
│  │  │  ├─ actions.ts               # server actions
│  │  │  └─ service.ts               # regra de negócio pura (testável)
│  │  ├─ jobs/                       # tasks do Trigger.dev
│  │  ├─ prompts/                    # ★ prompts versionados no git
│  │  └─ db.ts                       # queries só nas tabelas relatorios_*
│  │
│  ├─ zelo/
│  ├─ conteudo/
│  ├─ midia/
│  └─ branding/
│
├─ core/                             # compartilhado — muda RARAMENTE
│  ├─ auth/
│  │  ├─ roles.ts                    # SUPER_ADMIN | OWNER | MEMBER
│  │  └─ guards.ts                   # requireRole(), requireModule()
│  ├─ tenant/
│  │  ├─ context.ts                  # tenant da sessão atual
│  │  └─ modules.ts                  # lê tenant_modules (feature flags)
│  ├─ db/
│  │  └─ client.ts                   # Prisma + extensão que injeta tenant_id
│  ├─ ai/
│  │  ├─ anthropic.ts                # cliente único, retry, log de custo
│  │  └─ usage.ts                    # tokens/custo por tenant (margem real)
│  ├─ events/
│  │  └─ bus.ts                      # publica/consome tabela `events`
│  ├─ billing/
│  │  └─ plans.ts
│  ├─ notifications/
│  │  └─ email.ts                    # Resend
│  └─ ui/                            # design system em código
│     ├─ AppShell.tsx                # sidebar + topbar (lê o registry)
│     ├─ MetricCard.tsx
│     ├─ ApprovalList.tsx
│     └─ ...
│
└─ tests/
   ├─ core/
   └─ modules/
```

### Três regras que sustentam a estrutura

1. **Módulo só toca no que é dele.** Telas, actions, jobs e tabelas de `midia` vivem em `modules/midia/` e em tabelas prefixadas (`midia_campanhas`), sempre com `tenant_id`. Um módulo **nunca importa de outro** — se dois precisam da mesma coisa, ela sobe para `core/`.

2. **`app/` é fino de propósito.** A rota `tools/[slug]/[[...path]]` é **genérica para todas as ferramentas**: checa se o módulo está ativo e renderiza a UI do módulo. Módulo novo **não cria rota nova**.

3. **O manifest é o contrato.** Cada módulo declara id, nome, ícone, rota, permissões e plano. O `registry.ts` junta todos. Sidebar, cardápio e guard são **genéricos** — leem registry + `tenant_modules` e se montam sozinhos. **Adicionar ferramenta = criar pasta + registrar manifest + migration. Zero edição no código existente.**

### Detalhes que valem ouro

- **`prompts/` dentro de cada módulo**: meu ativo de consultoria vivendo no git como código versionado
- **`core/ai/usage.ts` desde o dia 1**: é o que me diz a margem real por cliente
- **`brand/soft-rules.md`**: regras subjetivas da marca, alimentam o design system

---

## 10. Modelo de dados

### Tabelas core

| Tabela | Campos principais | Função |
|---|---|---|
| `tenants` | id, nome, slug, logo_url, cor_primaria, plano, status | A empresa cliente |
| `tenant_modules` | tenant_id, module_id, ativo, config (jsonb) | Feature flags + nível de autonomia |
| `users` | id, clerk_id, email, nome | Sincronizado do Clerk |
| `memberships` | tenant_id, user_id, papel | OWNER / MEMBER |
| `activity_log` | tenant_id, user_id, acao, detalhe (jsonb), criado_em | Trilha de auditoria |
| `events` | tenant_id, tipo, payload (jsonb), processado, criado_em | Comunicação entre módulos |
| `ai_usage` | tenant_id, module_id, tokens_in, tokens_out, custo, criado_em | Margem por cliente |
| `dossies` | tenant_id, versao, conteudo (jsonb), atualizado_em | Contexto compartilhado dos agentes |
| `agent_runs` | tenant_id, agente, status, iniciado_em, terminado_em, erro | Execuções dos agentes |

### Tabelas por módulo (prefixadas)

- `relatorios_*` — `relatorios_gerados` (tenant_id, mes, arquivo_url, status)
- `conteudo_*` — `conteudo_posts` (tenant_id, texto, imagem_url, status, agendado_para)
- `midia_*` — `midia_metricas`, `midia_alertas`
- `zelo_*` — `zelo_conversas`, `zelo_mensagens`, `zelo_agendamentos`
- `branding_*` — `branding_assets`

### Papéis

| Papel | Quem | Vê e faz |
|---|---|---|
| `SUPER_ADMIN` | Eu | Todos os tenants, prompts, custos, configuração dos agentes. **Não** dados operacionais sem autorização |
| `OWNER` | Dono da empresa | Só o tenant dele: métricas, aprovações, relatórios, comandos, gestão da equipe |
| `MEMBER` | Secretária, atendente | Subconjunto: fila de trabalho e agenda; sem financeiro nem configurações |

---

## 11. Identidade visual e design system

### Arquitetura de marca

**Zelo nasce como produto endossado pelo VETOR** ("Zelo · by VETOR"), não como marca solta.

- **Herda:** tipografia, construção geométrica do símbolo, assinatura
- **Difere:** personalidade — o VETOR fala com dono de empresa (preciso, direto); o Zelo fala com paciente e secretária (caloroso, cuidadoso)
- **Benefício:** cada ferramenta nova fortalece o VETOR; o VETOR dá credibilidade à ferramenta nova

### Fluxo no Claude Design

```
1. PLANEJAR NO CHAT COMUM (grátis)   → briefing pronto, decisões tomadas
2. PROJETO "VETOR — Identidade"      → alta fidelidade, sem design system ainda
3. 3 BRAND BOARDS                    → logo, paleta, tipografia, aplicações
4. ITERAR                            → uma variável por vez; comentário inline
5. FECHAR                            → folha de logo + tokens CSS
6. PUBLICAR DESIGN SYSTEM            → org settings → upload assets + soft-rules.md
7. PROJETO "Zelo — marca"            → já herda tudo
8. PROJETO "Dashboard"               → já herda tudo → handoff p/ Claude Code
```

### Passos exatos para publicar o design system

1. Nome da organização (canto inferior esquerdo do seletor de projetos) → **configurações da organização → design systems → onboarding**
2. **Suba os assets:** folha de logo final, paleta, mini manual, template de relatório — **só o aprovado, nada de rascunho** (menos é mais)
3. **Suba junto o `soft-rules.md`** ⭐ — Claude extrai bem hex e fontes, mas erra as partes subjetivas. Escreva como se briefasse um estagiário talentoso porém muito literal:
   - "acento em no máximo 10% de qualquer tela"
   - "títulos confiantes, corpo de texto calmo"
   - "geométrico e preciso, nunca lúdico"
4. **Revise o UI kit gerado** (paleta, tipografia, componentes, layout) — é o cérebro de todo projeto futuro; corrija aqui, não projeto a projeto
5. **Crie um projeto de teste** para validar
6. **Ligue o toggle "Published"**
7. Para editar depois: org settings → "Open" → "Remix"

**Quando a plataforma existir:** sincronize o design system direto do repo com `/design-sync` no Claude Code — fidelidade máxima, ele lê os componentes reais.

### Um design system por cliente

Times podem manter mais de um design system. **VETOR** como padrão da organização; um sistema separado por cliente de branding (Dra. Mirilaini, Milu). Todo material futuro daquele cliente sai automaticamente na marca dele. É o módulo Branding funcionando antes de existir como código.

### Regras de tipografia

- **Google Fonts sempre** (licença comercial clara, sem dor de cabeça em material impresso)
- **Máximo duas famílias:** uma para títulos, uma para texto
- Esse par vira os design tokens do site e da plataforma

### Divisão de ferramentas

| Ferramenta | Papel |
|---|---|
| Claude Design | Decide **o quê** — exploração, direção, protótipos, design system |
| Figma | Finaliza **o como** — kerning, alinhamento óptico, versões do logo |
| Canva | Produz **as aplicações** — merch, papelaria, posts (export direto do Design) |
| Claude Code | Transforma em **produto** — recebe o handoff bundle |

### Economia de créditos (importante)

- Claude Design roda em modelo caro e consome do **mesmo pool de uso** do resto do Claude
- **Planeje no chat comum antes** (não consome orçamento do Design) — economiza 20–30%
- Arrastar/redimensionar no canvas **não gasta crédito**; chat gasta
- Comentário inline para mudanças pontuais; chat só para mudanças estruturais
- Feedback específico: "espaçamento de 8px entre os cards" funciona; "não ficou bom" não

---

## 12. Plano de execução por fases

**Premissas:** trabalho solo, ~8–12h/semana (noites e fins de semana, competindo com CLT e duas pós). 12 semanas de calendário. Se render menos, a ordem não muda — só estica.

**Regra de ouro:** cada fase termina com algo **rodando em produção**, mesmo que feio. Nunca duas fases abertas ao mesmo tempo.

**Trilha paralela:** design (identidade, site) roda em paralelo ao código — é trabalho de Claude Design, não de repositório. Não bloqueia nem é bloqueado.

---

### Fase 0 — Fundações (1 fim de semana)

**Objetivo:** repositório de pé, deploy funcionando, proteções de arquitetura ativas desde o commit 1.

```bash
npx create-next-app@latest vetor --typescript --tailwind --app --src-dir=false
cd vetor
npx shadcn@latest init
npm i @clerk/nextjs @prisma/client @trigger.dev/sdk @anthropic-ai/sdk
npm i -D prisma eslint-plugin-boundaries
npx prisma init
mkdir -p modules core/{auth,tenant,db,ai,events,ui} trigger brand
git init && git add . && git commit -m "chore: fundacao vetor"
```

**Checklist:**
- [ ] Repo `vetor` no GitHub
- [ ] Next.js 15 + TypeScript + App Router + Tailwind
- [ ] shadcn/ui com o tema do design system
- [ ] Contas conectadas: Vercel, Neon, Clerk, Trigger.dev
- [ ] Prisma conectado ao Neon, primeira migration
- [ ] Estrutura de pastas criada (mesmo vazia)
- [ ] **Proteção 1 — fronteiras:** ESLint `no-restricted-imports` proibindo `modules/X` importar `modules/Y`
- [ ] **Proteção 2 — CI:** GitHub Action rodando lint + typecheck + build em todo PR
- [ ] Deploy na Vercel com preview por PR

**Pronto quando:** a URL de produção abre; um PR gera preview; um import cruzado entre módulos **falha o build**.

---

### Fase 1 — Core multi-tenant (semanas 1–2)

**Objetivo:** o esqueleto que todos os módulos vão usar. Fase "invisível" — resista à tentação de pular para as ferramentas.

**Banco:**
- [ ] `tenants`, `tenant_modules`, `users`, `memberships`
- [ ] `activity_log`, `events`, `ai_usage`, `dossies`, `agent_runs`

**Auth:**
- [ ] Clerk Organizations: tenant = organização; dono = admin da org
- [ ] Webhook Clerk → sincroniza usuários/orgs no banco
- [ ] `core/auth/guards.ts`: `requireRole()`, `requireModule()`
- [ ] `SUPER_ADMIN` via metadata do Clerk

**Núcleo:**
- [ ] `core/db/client.ts` — Prisma com extensão que injeta `tenant_id`
- [ ] `core/ai/anthropic.ts` — cliente único com retry + gravação em `ai_usage`
- [ ] `core/events/bus.ts` — publica/consome eventos
- [ ] `modules/types.ts` + `modules/registry.ts` — o contrato `ModuleManifest`
- [ ] `core/ui/AppShell.tsx` — sidebar gerada do registry × `tenant_modules` (usar o handoff do Claude Design)
- [ ] Rota genérica `tools/[slug]/[[...path]]` com guard + delegação
- [ ] **Proteção 3:** error boundary no layout de `tools/[slug]`
- [ ] `(admin)/admin/tenants` — provisionar empresa, ligar/desligar módulos

**Pronto quando:** eu crio o tenant "Dra. Mirilaini" pelo admin, ativo um módulo fake, convido um usuário, ele loga e vê a sidebar só com o que está ativo. Módulo inativo → página "solicitar ativação".

---

### Fase 2 — Módulo Relatórios (semanas 3–4)

**Por que primeiro:** é o módulo mais simples que exercita o padrão **inteiro** — manifest, UI, server action, job no Trigger.dev, chamada ao Claude, arquivo no blob, evento, activity log. É o "hello world" da arquitetura.

- [ ] `modules/relatorios/manifest.ts` registrado no registry
- [ ] Input: **CSV manual** (exportado do Meta/Google) + números digitados — API fica para a Fase 5
- [ ] Job `gerar-relatorio`: dados do tenant → prompt versionado → Claude gera em linguagem de dono → HTML/PDF no blob
- [ ] Tela: lista por mês + botão gerar + download
- [ ] Publica evento `relatorio.gerado` + registra em `activity_log`
- [ ] **Validação real:** relatório de junho da Dra. Mirilaini com dados reais, entregue a ela

**Pronto quando:** a Dra. Mirilaini (usuária real, não eu) loga, clica em "gerar", espera o job, baixa o PDF e **entende o que leu**.

---

### Fase 3 — Módulo Zelo v1 assistido (semanas 5–7)

**Por que agora:** é a ferramenta de maior impacto percebido nos dois pilotos. Mas entra na **versão assistida**, de risco zero.

- [ ] WhatsApp Cloud API: número, app aprovado na Meta, webhook
- [ ] `zelo_conversas` / `zelo_mensagens` alimentadas pelo webhook
- [ ] Claude gera **sugestão de resposta**; a secretária aprova com um toque
- [ ] Fila de conversas no portal, com estado (aguardando, respondida, escalada)
- [ ] Registro de tempo de primeira resposta (métrica que já vira valor)
- [ ] Eventos: `zelo.conversa_iniciada`, `zelo.escalada_humano`
- [ ] **Validação real:** uma semana operando no consultório com a secretária

**Só depois (v2):** autônomo em horário comercial, com botão de escalar. **v3:** 24h com kill switch.

**Bônus:** a infraestrutura do Zelo é o que habilita o **Agente 4 — cliente oculto**, o maior diferencial competitivo.

---

### Fase 4 — Site público + cardápio (semana 8)

Agora que existem 2 módulos reais, a vitrine tem o que mostrar. (Fazer o site antes seria vender prateleira vazia.)

- [ ] Landing `(site)/` — handoff do protótipo do Claude Design
- [ ] `/ferramentas` — cardápio lendo o registry
- [ ] Página de venda por ferramenta (`/ferramentas/[slug]`) com CTA "agendar diagnóstico"
- [ ] Botão "tenho interesse" nos `coming_soon` → grava lead + me notifica (validação de demanda)
- [ ] SEO básico + domínio próprio

**Pronto quando:** eu mando o link para um prospect sem vergonha.

---

### Fase 5 — Módulo Conteúdo (semanas 9–10)

Maior uso recorrente; primeiro módulo com fluxo de aprovação em lote.

- [ ] Migrar o engine de conteúdo existente para `modules/conteudo/`
- [ ] Job `gerar-calendario` — pauta semanal a partir do dossiê (**conformidade CFO embutida no prompt** para dental; SUSEP para seguros)
- [ ] Fila de aprovação com níveis de autonomia via `tenant_modules.config`
- [ ] Publicação: começar com "aprovado → exportação/lembrete"; Instagram Graph API se o piloto pedir
- [ ] Eventos: `post.aprovado`, `post.publicado`
- [ ] **Validação real:** um mês inteiro de conteúdo operado pela cliente

---

### Fase 6 — Módulo Monitor de Anúncios (semanas 11–12)

Primeiro módulo com integração externa pesada — vem depois do padrão maduro.

- [ ] Etapa A: upload de CSV → análise → alertas na tela
- [ ] Etapa B: Meta Marketing API com token por tenant
- [ ] Job diário: coleta → compara com histórico → alerta se desvio (ex.: CPL +30% em 3 dias)
- [ ] Alerta → card no dashboard + e-mail ao dono + evento `campanha.alerta_criado` (consumido pelo módulo Relatórios)
- [ ] **Validação real:** 2 semanas rodando nas contas dos dois pilotos

**Pronto quando:** um alerta verdadeiro chega ao e-mail de um piloto **antes** de ele perceber o problema sozinho. Essa é a killer feature: a auditoria da V4 acontece uma vez; meus agentes rodam todo dia.

---

### Fase 7 — Beta e comercial (semana 13+)

- [ ] Onboarding self-service: provisionar → convidar equipe → primeiro valor em < 15 min
- [ ] Cobrança **manual** (Pix/boleto + planilha). Stripe/Pagar.me só depois do 5º pagante
- [ ] Termos de uso + política de privacidade (LGPD)
- [ ] Uma página por ferramenta ("o que faz, o que precisa de você")
- [ ] **Meta:** 2 pilotos convertidos em pagantes + 1 cliente novo de diagnóstico

---

### O que fica explicitamente FORA (por enquanto)

Anotar o que **não** fazer vale tanto quanto o roadmap:

- ❌ Agentes 2, 3, 5 (Criativos, Ambientes, Competitivo) automatizados — rodam **semi-manuais** (prompt + web search) até haver demanda
- ❌ Módulo Branding como código — continua serviço manual (Claude Design + Canva) até repetir 3×
- ❌ Stripe/billing automático — manual até doer
- ❌ App mobile, white-label por tenant, i18n
- ❌ Microserviços, filas externas, Kubernetes
- ❌ Testes E2E completos — unitários só no `core/` e nos services; E2E depois do primeiro pagante

---

### Ritmo semanal sugerido

| Dia | Bloco | Foco |
|---|---|---|
| Ter e Qui (noite) | 2 × 1,5h | Tarefas pequenas: telas, ajustes, revisão |
| Sáb (manhã) | 1 × 4h | O bloco pesado da fase (schema, job, integração) |
| Dom (opcional) | 1–2h | Deploy, validação com piloto, planejar a semana |

Sextas e véspera de prova das pós: **não codar**. Constância > intensidade.

---

## 13. Roadmap futuro

Pensando no documento da V4 como mapa do que ainda falta cobrir.

### Curto prazo (3–6 meses após o beta)

| Item | Origem na proposta V4 | Nota |
|---|---|---|
| Agente 5 — Competitivo automatizado | Semana 3 (SWOT, 4 Ps, mapa estratégico) | Prompt + web search; fácil de automatizar |
| Agente 3 — Ambientes | Semana 2 (design, usabilidade, narrativa) | Lighthouse CLI + Claude lendo HTML |
| Agente 2 — Criativos | Semana 2 (benchmarking) | Meta Ad Library é pública e gratuita |
| Zelo v2/v3 | — | Autonomia crescente com kill switch |
| Módulo Branding | Semana 4 (manual de identidade visual) | Depois de 3 repetições manuais |

### Médio prazo (6–12 meses)

| Item | Origem na proposta V4 | Nota |
|---|---|---|
| **Agente 4 — Cliente oculto automatizado** | Semana 3 (Diagnóstico Comercial) | ⭐ Maior diferencial. Depende do Zelo maduro |
| **Agente 6 — Estrategista + Plano de 12 meses** | Semana 3 e 4 | O documento-âncora de venda |
| Réguas de CRM | Semana 4 | Sequências que o Zelo executa |
| Google Meu Negócio via API | Semana 4 | Entrega operacional |
| Landing pages geradas | Semana 4 | Já faço por código; virar módulo |
| Pack de criativos | Semana 4 | Engine de conteúdo + Canva |
| Manual de copywriting | Semana 4 | Gerado pelo Agente 6 a partir do dossiê |

### Longo prazo (12+ meses)

- **Auditoria completa como produto de entrada** — a "Estruturação Estratégica" do VETOR, vendida como a V4 vende o test drive dela
- **Novos nichos verticais** — replicar o par dental/seguros em barbearia, pet shop, academia
- **Marketplace de módulos** — ferramentas de terceiros integradas ao portal (o que eu não construo, eu indico e integro)
- **Cerne** — a camada de "cérebro da empresa" (conhecimento centralizado do SMB) como módulo transversal
- **White-label** — portal com a marca do cliente (a arquitetura já suporta: `logo_url` e `cor_primaria` no tenant)
- **Extração de serviços** — só se os gatilhos do ADR-001 dispararem

### Ferramentas de terceiros (o que NÃO construir)

Regra: construo o que é **diferencial**; indico o que é **commodity**.

| Necessidade | Indico | Por quê |
|---|---|---|
| Emissão de NF | Serviço local/contador | Regulado, chato, sem diferencial |
| Agenda/prontuário | Software odontológico do mercado | Domínio profundo, já resolvido |
| CRM completo | Pipedrive/RD | Só integro via API |
| E-mail marketing | Brevo/Resend | Commodity |

---

## 14. Riscos, limites e conformidade

### Limites técnicos e como contornar

| Risco | Mitigação |
|---|---|
| **APIs têm burocracia** — Meta Marketing e Google Ads exigem apps aprovados e tokens por cliente | Começar com exportações CSV alimentando os agentes; automatizar depois |
| **WhatsApp Cloud API** — limite inicial de conversas iniciadas/dia por número; sobe com uso | Cada cliente tem o próprio número → limite é por cliente, não da plataforma |
| **Rate limits de LLM** — tier inicial | Comporta dezenas de clientes; subir de tier é problema bom de ter |
| **Custo de IA** | `core/ai/usage.ts` desde o dia 1; alerta se um tenant estourar o esperado |

### Riscos de produto

| Risco | Mitigação |
|---|---|
| **IA não substitui julgamento de negócio** | Agentes produzem análise e material; decisão final (preço, posicionamento, verba) é humana. **Revisar toda recomendação de investimento em mídia** |
| **Erro no WhatsApp custa paciente** | Zelo em degraus: assistido → semiautônomo → autônomo |
| **Construir plataforma antes de validar agente** | ADR-006: agentes primeiro, casca depois |
| **Escopo infinito** | A lista "o que fica FORA" é revisada a cada fase |

### Conformidade

| Área | Regra |
|---|---|
| **Odontologia** | Código de Ética do CFO: sem promessa de resultado, sem antes/depois descontextualizado, sem preço como chamariz. **Embutir no prompt do módulo Conteúdo** |
| **Seguros** | Regras SUSEP para publicidade: sem promessa de cobertura não contratada, identificação da corretora e do produto |
| **Cliente oculto** | Usar **apenas** nas contas piloto ou com **autorização escrita** do dono do negócio auditado. **Nunca contra concorrentes** |
| **LGPD** | Dados do tenant pertencem ao tenant. Eu não acesso dados operacionais sem autorização (ADR-004). Trilha de auditoria em `activity_log` |
| **Tipografia** | Google Fonts (licença comercial clara) em todo material de cliente |

### Decisão sobre a proposta da V4

**Declinar educadamente e guardar o material.** O PDF deles é, na prática, um **blueprint gratuito** do produto que estou construindo — estrutura de oferta, sequência de diagnósticos, formato de entrega e até o argumento de venda ("test drive", plano de 12 meses como âncora).

> Usar como especificação, não como orçamento.

---

## 15. Glossário

| Termo | Significado |
|---|---|
| **Tenant** | Uma empresa cliente na plataforma. Isolamento total de dados |
| **Módulo** | Uma ferramenta plugável (Relatórios, Zelo, Conteúdo...) |
| **Manifest** | Arquivo que declara id, nome, ícone, rota, permissões e plano de um módulo |
| **Registry** | Lista de todos os módulos instalados; alimenta sidebar e cardápio |
| **Dossiê** | Documento estruturado com todo o contexto de um cliente. Alimenta todos os agentes |
| **Nível de autonomia** | 0 (manual) a 3 (autônomo com kill switch). Por tenant, por módulo |
| **Cardápio** | Vitrine pública de ferramentas; clicar numa ativa leva direto à ferramenta se já logado |
| **Cliente oculto** | Simulação de lead real para auditar o atendimento comercial |
| **Soft rules** | Regras subjetivas da marca, escritas em markdown, que o Claude Design não infere sozinho |
| **Handoff bundle** | Pacote exportado do Claude Design com design, tokens e intenção, consumido pelo Claude Code |
| **VETOR** | A consultoria e a plataforma |
| **Zelo** | Recepcionista de IA no WhatsApp. Produto endossado: "Zelo · by VETOR" |
| **Cerne** | Conceito futuro: camada de conhecimento centralizado do SMB |

---

## 16. Anexo: prompts prontos

### A. Briefing de identidade visual (Claude Design)

```
Crie a identidade visual do VETOR, consultoria de IA para pequenas
empresas brasileiras (clínicas, corretoras, comércio local). O nome
vem de "vetor": direção + intensidade. Fundador é engenheiro de
software; a promessa é "ferramentas de IA sob medida que o próprio
cliente opera". Personalidade: preciso, direto, confiável — técnico
que fala língua de dono de negócio, próximo sem ser informal.
Público vê a marca em: portal web, relatórios PDF, propostas
comerciais e LinkedIn.

Gere 3 brand boards distintos, cada um com: wordmark + símbolo
(explorar seta/direção/movimento de forma geométrica e minimalista),
paleta de 4-5 cores com códigos hex, par tipográfico do Google Fonts
(títulos + texto), e o logo aplicado em cartão de visita, avatar
redondo pequeno e cabeçalho de relatório. Mostre cada board em fundo
claro e escuro. Importante: o símbolo precisa funcionar sozinho em
32px (favicon e avatar).

Restrições: nada de gradientes chamativos, nada de azul-genérico de
startup, nada de robôs/cérebros como símbolo de IA.
```

### B. Briefing da marca Zelo (Claude Design, com design system publicado)

```
Crie a marca Zelo, produto do VETOR: recepcionista de IA no WhatsApp
para clínicas e corretoras. Deve HERDAR do sistema VETOR: tipografia,
construção geométrica do símbolo e assinatura "Zelo · by VETOR".
Deve DIFERIR em personalidade: caloroso, cuidadoso, acessível — é a
marca que a secretária e o paciente veem. Nome vem de "zelar/cuidado".
Explore 3 símbolos e uma cor própria de destaque que conviva com a
paleta VETOR. Aplique em: avatar de WhatsApp (uso principal!, precisa
funcionar a 40px), tela de conversa e card do produto no site do VETOR.
```

### C. Briefing do dashboard (Claude Design)

```
Crie o dashboard principal da plataforma VETOR — a tela que o dono de
uma pequena empresa (ex.: clínica odontológica) vê ao logar. Desktop
primeiro, mas responsivo para mobile.

Estrutura:
- Sidebar fixa à esquerda: logo VETOR, nome da empresa do cliente,
  navegação (Início, Conteúdo, Anúncios, Relatórios, divisória,
  Equipe, Ajustes)
- Topo: saudação com nome do dono + resumo ("3 itens aguardam sua
  aprovação"), avatares da equipe e botão Convidar
- Grade de cards das ferramentas ativas: cada card com ícone, nome,
  badge de status ("4 p/ aprovar", "saudável", "novo") e uma métrica
  em linguagem de dono ("R$ 74 por paciente novo")
- Abaixo, duas colunas: "Atividade recente" (quem aprovou o quê, o
  que a IA gerou, alertas) e um card tracejado de upsell da ferramenta
  não contratada (Zelo) com botão "Tenho interesse"

Tom do conteúdo: linguagem de dono de negócio, nunca jargão de
marketing (nada de CPL/ROAS na tela inicial). Dados de exemplo
realistas de uma clínica.

Estados a mostrar: tudo saudável; variação com alerta em Anúncios;
estado vazio (empresa recém-criada, nenhuma ferramenta gerou nada);
estado de carregando (job rodando); versão mobile.
```

### D. Handoff para Claude Code

```
Estou anexando o handoff bundle do Claude Design com o dashboard do
VETOR. Por favor:

1. Converta o design nos componentes React do projeto, respeitando a
   estrutura modules/ e core/ui/ descrita no README mestre
2. Coloque os design tokens no tailwind.config.ts
3. O AppShell (sidebar + topbar) deve ler modules/registry.ts cruzado
   com tenant_modules — nada hardcoded
4. Use os componentes do shadcn/ui já instalados
5. Totalmente responsivo, mobile incluído
6. Não crie rotas novas: a rota genérica tools/[slug] já existe

Comece mostrando a estrutura de arquivos que você vai criar, antes de
escrever código.
```

### E. Prompt de contexto para qualquer LLM

```
Estou construindo o VETOR: uma consultoria de IA para pequenas
empresas brasileiras, com plataforma própria multi-tenant em Next.js
15 + TypeScript + Prisma + Postgres (Neon) + Clerk + Trigger.dev,
deployada na Vercel.

Arquitetura: monólito modular. Cada ferramenta é um módulo em
modules/<nome>/ com manifest, ui/, server/, jobs/, prompts/ e db.go
Módulos nunca importam uns dos outros — só de core/ ou via tabela de
eventos. Toda tabela tem tenant_id, injetado automaticamente por uma
extensão do Prisma.

Pilotos: um consultório odontológico e uma corretora de seguros.

[COLE AQUI A SEÇÃO RELEVANTE DO README MESTRE]

Minha tarefa agora: [DESCREVA A TAREFA]
```

---

## Próxima ação concreta

> **Reserve um sábado de manhã, abra a Fase 0 e execute o checklist até o deploy verde na Vercel.**

Tudo o mais neste documento depende disso existir.
