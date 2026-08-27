---
id: adr-003-postgresql
title: "ADR-003 — PostgreSQL como Banco Primário Único"
sidebar_position: 12
description: Exemplo de ADR de decisão de não fazer — recusar um segundo banco, com o custo do descarte nomeado.
doc_type: adr
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor vê como registrar uma decisão de não adotar algo, e por que essas
  são as que mais se perdem sem ADR.
prerequisites: [adr-structure]
related: [adr-decision, adr-alternatives, adr-consequences]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-29
---

# ADR-003 — Manter PostgreSQL como Banco Primário Único

:::note Exemplo didático

Terceiro de cinco ADRs do sistema fictício **Verano**. Este é um exemplo de **decisão de
não fazer** — o tipo que fica invisível no código e é redecidido repetidamente sem
registro.

:::

| | |
|---|---|
| Status | aceito em 2023-09-18 |
| Sistema | Verano — plataforma de pedidos |
| Autores | equipe de plataforma |
| Decisores | líder técnica, engenheiro responsável pelo módulo de catálogo |
| Consultados | time de produto de catálogo |

## Contexto

O módulo de catálogo tem uma proposta em aberto: migrar para um banco de documentos. A
motivação é concreta e não é preferência estética.

O catálogo modela produtos com atributos que variam por categoria — um vinho tem safra e
uva; um detergente tem volume e fragrância. Hoje isso é resolvido com uma coluna `jsonb` e
tabelas de atributo, e a equipe considera o modelo desconfortável.

Situação em setembro de 2023:

```text
produtos no catálogo             ~180 mil
categorias                       340
consultas de catálogo            ~800/s em pico
p99 da busca por filtro          210 ms
requisito de produto             abaixo de 300 ms
equipe                           14 engenheiros
                                 0 com experiência operacional em banco de documentos
bancos em produção               1 (PostgreSQL)
```

Restrições:

- Somos uma equipe única, com um plantão. Cada armazenamento novo é mais um a operar,
  monitorar, atualizar, fazer cópia de segurança e restaurar.
- Não há plataforma interna de dados; cada banco novo exige ferramental construído por nós.
- O requisito de latência **está sendo atendido** com o modelo atual.

O que não sabíamos: se a variedade de atributos continuaria crescendo no ritmo de 2023, ou
se estabilizaria com a maturação do catálogo.

## Decisão

Vamos **manter PostgreSQL como banco primário único** de toda a plataforma Verano.

**Não vamos** adotar um banco de documentos para o catálogo. O modelo atual — colunas
tipadas para o que é comum, `jsonb` com índices GIN para o que varia por categoria —
permanece.

Esta decisão vale para armazenamento primário. Cache e índice de busca dedicado não são
armazenamento primário e não são afetados por ela.

## Alternativas Consideradas

**Banco de documentos para o catálogo.** Descartada porque o problema que ela resolveria —
modelagem desconfortável — não está causando dano mensurável: a latência atende ao
requisito, e não há incidente atribuído ao modelo. O custo é concreto e imediato: um
armazenamento a operar, com equipe sem experiência.

*Voltaria a ganhar se:* o p99 da busca por filtro passar de 300 ms e a otimização em
PostgreSQL se esgotar, **ou** se o catálogo passar de ~2 milhões de produtos, **ou** se
surgir um segundo caso de uso independente que também precise de modelo de documento.

**Índice de busca dedicado para o catálogo**, mantendo PostgreSQL como fonte de verdade.
Descartada agora por não ser necessária — a latência atende. Mas é considerada a próxima
opção natural, e preferível ao banco de documentos, porque não move a fonte de verdade.

*Voltaria a ganhar se:* a busca facetada virar requisito de produto, ou o p99 passar de
300 ms.

**Migrar toda a plataforma para banco de documentos.** Descartada — pedidos e pagamentos
exigem transações e integridade referencial que não queremos implementar na aplicação.

## Consequências

**Positivas (imediatas).** Um armazenamento a operar. Transações entre módulos permanecem
locais. Uma competência a manter na equipe, não duas. Cópia de segurança, restauração e
atualização com um procedimento só.

**Positivas (longo prazo).** A pressão por otimizar dentro do PostgreSQL produziu
conhecimento que se aplica a todos os módulos.

**Negativas (imediatas).** O modelo do catálogo continua desconfortável. Atributos por
categoria exigem código de mapeamento que ninguém gosta de manter, e a equipe de catálogo
convive com uma solução que considera inferior.

**Negativas (longo prazo).** Se a escala do catálogo crescer muito além do previsto,
faremos a migração sob pressão em vez de com calma.

**Neutras.** A decisão precisa ser reavaliada — foi registrada uma revisão para 12 meses.

**Risco aceito.** Podemos estar adiando uma migração que ficará mais cara depois. A aposta
é que o custo de operar dois bancos, agora, é maior que o custo do adiamento.

## Sinal de Alerta

- p99 da busca por filtro acima de **300 ms** por duas semanas consecutivas.
- Catálogo acima de **2 milhões de produtos**.
- Mais de **três incidentes por trimestre** atribuídos ao modelo de dados do catálogo.
- Tempo de desenvolvimento em código de mapeamento de atributos acima de **10%** do esforço
  do módulo.

## Revisão — 2024-10-02

Bloco acrescentado 12 meses depois, sem alteração do texto original.

```text
produtos                    ~410 mil
p99 da busca por filtro     260 ms
incidentes atribuídos ao
  modelo do catálogo        1 em 12 meses
esforço em mapeamento       estimado em 6%
```

Nenhuma condição atingida. Decisão mantida.

A equipe de catálogo reformulou o mapeamento de atributos em abril de 2024, o que reduziu o
desconforto sem mudar de banco. A busca facetada entrou no roteiro de produto para 2025 —
quando isso se confirmar, a alternativa de índice dedicado será reavaliada, e não a de
banco de documentos.

## O que observar neste exemplo

A decisão é **não fazer algo**. Sem este ADR, a proposta de banco de documentos voltaria a
cada seis meses, com a mesma discussão — que é exatamente o custo que ADRs evitam. Ver
[por que ADRs importam](why-adrs-matter.md).

As consequências negativas incluem algo desconfortável de escrever: **a equipe do módulo
discorda e vai conviver com uma solução que considera inferior**. Registrar isso é mais
honesto que apresentar consenso. Ver
[decisão](adr-decision.md).

Uma das alternativas foi descartada **agora**, mas explicitamente marcada como a próxima
opção natural — o que orienta quem vier depois sobre para onde a decisão tende.

O sinal de alerta tem quatro condições, todas medíveis, e a revisão de 2024 pôde ser feita
em minutos.

## Conceitos Relacionados

- [Decisão](adr-decision.md) — decisões de não fazer.
- [Consequências](adr-consequences.md).
- [Bancos Relacionais](../07-data-architecture/relational-databases.md).
- [Bancos de Documentos](../07-data-architecture/document-databases.md).
