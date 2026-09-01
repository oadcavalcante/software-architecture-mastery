# AGENTS.md

Como construir, testar e validar este repositório. Este arquivo é a referência
operacional — o **o quê** e o **porquê** do conteúdo estão em
[SPEC.md](SPEC.md).

## O que é este repositório

Um percurso de aprendizado em arquitetura de software, publicado como site
Docusaurus bilíngue. O produto é o **conteúdo**: documentos Markdown em `docs/`,
validados por regras que verificam qualidade de material, não formatação.

pt-BR é o idioma canônico. en-US é tradução progressiva.

## Comandos

```bash
npm install                    # dependências

npm start                      # dev server, pt-BR, :3000
npm start -- --locale en-US    # dev server, en-US
npm run build                  # build de produção, ambas as locales

npm test                       # testes dos validadores
npm run validate               # os seis validadores de conteúdo
npm run typecheck              # TypeScript da configuração

npm run plan                   # regenera specs/ e fix_plan.md
npm run roadmap                # regenera ROADMAP.md e os badges dos READMEs
npm run terminology            # regenera docs/i18n-terminology.md
```

O dev server constrói **uma locale por vez**. O build de produção gera todas.

## Portões de qualidade

Estes cinco precisam passar antes de qualquer commit. O CI roda os mesmos.

```bash
npm test          # 1. os validadores estão corretos
npm run validate  # 2. o conteúdo passa nos validadores
npm run plan      # 3. plano em dia
npm run roadmap   # 4. roadmap e badges em dia
npm run build     # 5. o site constrói nas duas locales
```

**`npm run validate` deve terminar sem erro E sem aviso.** Avisos sinalizam
conteúdo raso; tratá-los como ruído é o começo da degradação que os validadores
existem para impedir.

Depois de `plan` e `roadmap`, verifique `git status` — se eles alteraram
arquivos, esses arquivos entram no commit. O CI falha se estiverem defasados.

## Os seis validadores

| Validador | O que barra |
|---|---|
| `check-frontmatter` | Schema inválido, `id` duplicado, `id` divergente do arquivo, referência a id inexistente, ciclo no grafo de pré-requisitos, dois documentos com o mesmo `canonical_for` |
| `check-links` | Link relativo quebrado, âncora inexistente, Mermaid com tipo desconhecido ou delimitador desbalanceado |
| `check-parity` | Tradução à frente do canônico, tradução órfã |
| `check-terminology` | Alternar entre a forma PT e a EN do mesmo termo; traduzir termo da categoria B |
| `check-placeholders` | `status: complete` com pendência, sem seção obrigatória, com seção vazia, ou fora da faixa de densidade |
| `check-canonical-links` | Link para o índice de uma seção quando o texto do link é termo `canonical_for` de um documento dela (§7.4) |

Os validadores rodam contra `docs/` por padrão. `SAM_ROOT=<dir>` aponta para
outra árvore — é o que os testes usam.

## Revisão de profundidade

Os seis validadores verificam forma. Eles não distinguem um documento fundo de
um documento raso com todas as seções preenchidas — que é a coisa que
[SPEC.md](SPEC.md) §13.3 chama de revisão humana, e a razão declarada de ela
existir: *"Automação não detecta conteúdo raso."*

Essa revisão é feita pelo subagente **`revisor-de-profundidade`**, definido em
[`.claude/agents/revisor-de-profundidade.md`](.claude/agents/revisor-de-profundidade.md).

```
Agent(subagent_type: "revisor-de-profundidade",
      prompt: "Revise docs/06-distributed-systems/idempotency.md")
```

Um documento por invocação. O agente lê o documento e as seções da spec que se
aplicam ao `doc_type` dele, aplica os dez pontos de §13.3, e devolve um laudo com
veredito (`aprovado` / `ressalvas` / `reprovado`) e achados citados e localizados
por linha.

Três restrições fazem o laudo servir para alguma coisa:

| Restrição | Por quê |
|---|---|
| Todo achado cita o trecho e a linha | Achado sem evidência não é verificável, e é como um revisor automático inventa problema para parecer útil |
| Não reporta o que os validadores cobrem | Repetir o CI enterra o julgamento no ruído |
| Não reporta preferência de estilo | A voz do material é deliberada (§8.1); "eu escreveria diferente" não é defeito |

O agente **não edita**. O laudo é o produto; a correção é decisão editorial, e
quem a toma precisa do contexto que o revisor de um documento isolado não tem.

Não é portão de commit — é revisão de acervo, rodada por lote. A fase F8 do
[ROADMAP](ROADMAP.md) é o que ela fecha.

## Como adicionar um documento

1. **Pegue a tarefa.** Primeira não marcada em [`fix_plan.md`](fix_plan.md).
2. **Leia a spec da seção** em `specs/<seção>.md` — escopo e critério de
   conclusão.
3. **Leia dois documentos vizinhos** já escritos, para calibrar profundidade e
   voz. Isso importa mais que qualquer instrução de estilo.
4. **Verifique duplicação.** Procure o conceito em `canonical_for` dos
   documentos existentes. Se já é canônico em outra seção, **referencie** — não
   redefina.
5. **Escreva**, seguindo o template do `doc_type` ([SPEC.md](SPEC.md) §7.3).
6. **Rode os portões.**
7. **Commit.** Rode `npm run plan` — a tarefa sai da lista.

## Front matter

Obrigatório, validado. Schema completo em [SPEC.md](SPEC.md) §7.9.

```yaml
---
id: coupling                    # igual ao nome do arquivo
title: Acoplamento
sidebar_position: 13
description: Uma frase dizendo o que o documento resolve.
doc_type: concept               # concept | foundation | pattern | tradeoff
                                # case-study | exercise | adr | index | reference
level: 1                        # 0..7
difficulty: iniciante           # iniciante | intermediário | avançado
status: complete                # not-started | in-progress | complete
objective: >
  Ao terminar, o leitor [capacidade observável].
prerequisites: [modularity]     # ids existentes, sem ciclo
related: [cohesion]
canonical_for: [acoplamento, coupling]
content_version: 1
last_reviewed: 2026-08-26
---
```

**Índice de seção:** o `id` é o diretório sem o prefixo numérico —
`docs/01-fundamentals/index.md` usa `id: fundamentals`.

## Seções obrigatórias por tipo

| `doc_type` | Não podem faltar | Faixa de palavras |
|---|---|---|
| `concept` | Quando Não Usar · Trade-offs | 1.200 – 2.500 |
| `pattern` | Quando Não Usar · Trade-offs | 1.000 – 2.000 |
| `tradeoff` | Quando Não Usar · Trade-offs | 1.200 – 2.200 |
| `foundation` | Por Que Isso Importa · Erros Comuns | 900 – 2.200 |
| `case-study` | — (template próprio, SPEC §7.6) | 3.000 – 6.000 |
| `index` | — | 400 – 900 |
| `reference` | — | 500 – 12.000 |

Use `foundation` para documentos definicionais em que "quando não usar" é
incoerente. Use `concept` quando o tópico prescreve uma ação cujo limite importa.

## Terminologia

A política está em [`docs/i18n-terminology.md`](docs/i18n-terminology.md),
gerada de `scripts/terminology.json` — o mesmo arquivo que o linter aplica.

A regra que mais pega: **um documento nunca alterna** entre "acoplamento" e
"coupling". A forma em inglês é permitida uma vez, como glosa de primeira
ocorrência — *"acoplamento (coupling)"* — e depois só a forma em português.

Escape hatch: `terminology_exempt: [termo]` no front matter, para citação
literal.

Bibliografia e URLs de link são ignoradas pelo linter — títulos de obra e slugs
em inglês não são violação.

## Falhas comuns e o que fazer

| Erro | Causa provável |
|---|---|
| `id "x" diverge do esperado "y"` | Nome do arquivo ≠ `id`. Em índice, o id vem do diretório |
| `canonical_for "x" já reivindicado` | O conceito é canônico em outra seção — referencie |
| `aponta para id inexistente` | Referência para frente. Escreva o pré-requisito antes, ou remova o link |
| `exige a seção "Quando Não Usar"` | `doc_type` errado, ou seção faltando |
| `alterna entre "a" e "b"` | Fixe um vocabulário; glosa só na primeira ocorrência |
| `abaixo da faixa` | Conteúdo raso. Adicione o que falta — não encha linguiça |
| Build falha em link quebrado | `onBrokenLinks: 'throw'` é proposital |

## Convenções

- Diretórios: `NN-kebab-case-em-ingles/`
- Arquivos: `kebab-case-em-ingles.md`, sem prefixo numérico
- Ordem vem de `sidebar_position`, **não** do nome do arquivo — renumerar arquivo
  quebra URL, renumerar front matter não
- Slugs sempre em inglês, nos dois idiomas; só o conteúdo é traduzido
- Diagramas em Mermaid, no máximo ~12 nós
- Todo diagrama precisa de uma frase antes dizendo o que observar

## Escopo

O inventário de tópicos está em `scripts/curriculum.json` — 409 tópicos em 23
seções. Alterar esse arquivo é alterar o escopo do projeto, e exige atualizar o
Apêndice A de [SPEC.md](SPEC.md).

## Traduzir

pt-BR sempre avança primeiro. Para traduzir:

1. Copie o caminho exatamente para
   `i18n/en-US/docusaurus-plugin-content-docs/current/<mesmo caminho>`.
2. Traduza `title`, `description`, `objective` e o corpo. Mantenha `id`,
   `doc_type`, `level` e as listas de referência idênticos.
3. Troque `content_version: N` por `translated_from_version: N`.
4. Traduza os rótulos dos diagramas.

Alterou um canônico de forma **substantiva**? Incremente `content_version` — isso
marca as traduções como defasadas, que é o comportamento correto. Typo e
formatação não incrementam.
