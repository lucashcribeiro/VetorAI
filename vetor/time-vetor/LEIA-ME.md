# Time VETOR — 5 funcionários de IA

Skills do Claude Code que formam o time de operações da VETOR. Cada pasta é um funcionário com cargo e responsabilidade única.

| Funcionário | Skill | Cargo |
|---|---|---|
| Órbita | `vetor-orquestrador` | Diretor — recebe brief, coordena e consolida |
| Atlas | `vetor-estrategista` | Estrategista — nicho, funil, GTM |
| Lumen | `vetor-copywriter` | Copywriter — copy com compliance CFO/SUSEP |
| Vetor Mídia | `vetor-gestor-midia` | Gestor de tráfego — campanhas Meta Ads |
| Prisma | `vetor-analista-bi` | Analista de BI — relatórios mensais |

(Os nomes são sugestões — renomeie à vontade no título de cada SKILL.md.)

## Instalação (5 minutos)

1. Crie a pasta do projeto de operações (separada do código da plataforma):
   ```bash
   mkdir -p ~/vetor-operacoes/clientes/{dra-mirilaini,milu-seguros}/entregas
   cd ~/vetor-operacoes
   ```
2. Copie as 5 pastas de skills para dentro de `.claude/skills/` do projeto:
   ```bash
   mkdir -p .claude/skills
   cp -r /caminho/do/download/vetor-* .claude/skills/
   ```
3. Abra o Claude Code na pasta (`claude`) e confirme que as skills aparecem.

## Roteiro de domingo — primeira entrega real

**Objetivo do dia:** sair com o Mapa de Nicho + Mecanismo + Plano GTM da clínica prontos para apresentar à Dra. Mirilaini.

1. **(30 min) Prepare o brief.** Escreva num arquivo `clientes/dra-mirilaini/brief.md`: procedimentos e ticket médio, região, capacidade de agenda, verba mensal de mídia, o que já foi feito de marketing e diferenciais reais. Quanto melhor o brief, melhor tudo que vem depois.
2. **(5 min) Acione o diretor.** No Claude Code:
   > "Órbita, brief novo da Dra. Mirilaini em clientes/dra-mirilaini/brief.md. Estruturação completa: mapa de nicho, mecanismo e plano de GTM. Checkpoint comigo a cada etapa."
3. **(1–2h) Revise cada checkpoint.** O Orquestrador vai rodar o Estrategista e parar para sua aprovação. Você é o dono — corrija, peça ajustes, aprove.
4. **(opcional) Siga para a copy.** Se o mapa ficar bom, deixe o Lumen gerar as primeiras copies de anúncio já no domingo.

## Regras da casa (resumo)

- Todo entregável nasce com status `rascunho` — nada vai para o cliente sem sua revisão.
- Saúde: gate de compliance CFO obrigatório em toda peça. Seguros: cuidados SUSEP.
- Convenção de arquivos com cabeçalho YAML em tudo — é isso que permitirá importar o histórico para a plataforma VETOR na Fase 2.

## Evolução

Cada skill é a especificação viva de um futuro módulo da plataforma:
`vetor-analista-bi` → Módulo Reports · `vetor-copywriter` → Módulo Content · `vetor-gestor-midia` → Módulo Ads Monitor.
Use o serviço por algumas semanas, anote o que ajustar nas skills, e só então porte para código.
