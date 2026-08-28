---
id: adr-status
title: Status do ADR
sidebar_position: 8
description: O ciclo de vida de uma decisão registrada — e por que o documento nunca é editado.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor gerencia o ciclo de vida dos ADRs sem destruir o histórico de
  raciocínio.
prerequisites: [adr-structure]
related: [superseding-decisions, adr-structure, what-is-an-adr]
canonical_for: [status de ADR, imutabilidade do registro, ADR proposto]
content_version: 1
last_reviewed: 2026-08-29
---

# Status do ADR

## Visão Geral

O status é o único campo do ADR que muda depois de escrito, e a mudança é sempre
**acréscimo**, nunca reescrita.

```text
proposto           escrito, em discussão
aceito             vigente
superado por N     substituído, com referência ao sucessor
descontinuado      não vale mais, sem substituto
```

Por trás dessa lista simples está a propriedade que dá valor ao formato: **um ADR registra
um evento, não um estado.** Um evento passado não é atualizável, e é por isso que o
documento é imutável.

Times que não entendem isso acabam mantendo ADRs "atualizados" — e destroem exatamente a
informação que os justificava.

## Problema

O impulso natural, quando uma decisão muda, é editar o ADR existente. Ele parece
desatualizado, e desatualizado parece errado.

O que se perde ao editar:

```text
que a decisão anterior existiu
por que ela fazia sentido no contexto dela
o que mudou entre uma e outra
que a organização já pensou sobre isso
```

O último é o mais caro. Um ADR editado apaga a evidência de que a questão já foi analisada,
e a análise recomeça do zero na próxima vez.

E há uma perda mais sutil: sem histórico, não há como calibrar julgamento. Uma equipe que
não consegue ver suas decisões anteriores e o que aconteceu com elas não aprende com o
próprio padrão de erro.

## Conceitos Centrais

### Proposto

O ADR existe, o raciocínio está escrito, a decisão ainda está em discussão.

```text
serve para       discutir com base em documento, não em conversa
duração típica   dias a duas semanas
desfecho         aceito, ou descontinuado sem nunca ter valido
```

Esse status é subutilizado. Escrever o ADR **antes** de decidir é o que captura o efeito
mais valioso da prática — a decisão que muda durante a redação. Ver
[por que ADRs importam](why-adrs-matter.md).

Um ADR proposto que nunca é aceito não é desperdício: ele registra que a opção foi
considerada e por que não avançou.

### Aceito

A decisão vale. Com data.

```text
Status: aceito em 2024-03-12
```

A data de aceitação é distinta da data de escrita, e distingui-las importa quando a
discussão foi longa.

Nada mais muda no documento a partir daqui.

### Superado

A decisão foi substituída por outra:

```text
Status: superado pelo ADR-047 em 2026-01-20
```

E o sucessor referencia o antecessor:

```text
Status: aceito em 2026-01-20 — supera o ADR-014
```

A referência bidirecional é o que torna o histórico navegável. Ver
[superação](superseding-decisions.md).

O ADR superado **permanece no repositório**, legível, com o texto original intacto. Ele
continua sendo o registro correto de uma decisão correta para o contexto dela.

### Descontinuado

A decisão não vale mais, e nenhuma outra a substitui:

```text
Status: descontinuado em 2025-08-04 — o serviço de recomendação
        foi desativado; a decisão perdeu objeto.
```

Usado quando o objeto da decisão desapareceu — o sistema foi desligado, o problema deixou
de existir, o requisito foi removido.

A razão é obrigatória. "Descontinuado" sem explicação é pior que nada: alguém encontra a
decisão, vê que não vale, e não sabe se foi substituída, revertida ou esquecida.

### Por que não editar

```text
o ADR descreve um momento         momentos não se atualizam
o contexto era o daquele momento  editá-lo o torna falso
o histórico é o valor             sem ele, redecidimos
a evolução é informação           ver a sequência ensina
```

A exceção aceitável: correção de erro factual, tipográfico ou de link, sem alterar o
raciocínio. Correções que mudam o sentido não são correções — são decisões novas.

### Status intermediários que alguns times usam

```text
rejeitado         proposto e não aceito, mantido como registro
em revisão        aceito, mas sob reavaliação
condicional       aceito com condição a ser confirmada
```

Cada acréscimo aumenta a carga cognitiva do conjunto. `rejeitado` é o que mais se paga —
ele preserva propostas analisadas e recusadas, que sem isso desaparecem.

`em revisão` é útil em organizações grandes, para sinalizar que não se deve construir sobre
aquela decisão neste momento.

### O status precisa ser visível no índice

Um conjunto de ADRs sem índice com status obriga a abrir arquivos para saber o que vale:

```text
ADR-001  Usar PostgreSQL como banco primário       aceito       2022-04-11
ADR-014  Processar pedidos de forma síncrona       superado     2024-09-02
ADR-047  Processar pedidos de forma assíncrona     aceito       2024-09-02
ADR-032  Adotar cache distribuído                  descontinuado 2025-08-04
```

Gerado a partir dos arquivos, não mantido à mão. Ver
[documentação viva](../17-architecture-documentation/living-documentation.md).

## Modelo Mental

**O ADR é um evento, não um estado.** Mudar de ideia produz um documento novo, nunca uma
edição.

## Quando Usar

- Em todo ADR, com data em cada transição.
- Com `proposto` antes de decidir, para capturar o efeito de escrever.
- Com índice gerado, mostrando status.

## Quando Não Usar

**Editando o texto** quando a decisão muda.

**Apagando ADRs superados.**

**Sem data** nas transições.

**Com status demais** — cada um a mais precisa se pagar.

**Sem razão no `descontinuado`.**

**Sem referência bidirecional** entre superado e sucessor.

## Alternativas

- **Histórico do controle de versão** — registra as edições, e ninguém consulta o histórico
  de um arquivo para entender uma decisão.
- **Um documento vivo por tema**, com histórico interno — perde a granularidade e a
  referenciabilidade.
- **Sem status**, apenas data — funciona em conjuntos muito pequenos e falha ao crescer.

A primeira merece nota: o controle de versão preserva tecnicamente o histórico, e não o
torna acessível. "Está no histórico do repositório" é, na prática, o mesmo que não estar.

## Trade-offs

| Imutável | Editável |
|---|---|
| Preserva o raciocínio | Sempre reflete o atual |
| Exige ler o índice | Leitura direta |
| Histórico navegável | Histórico perdido |

| Poucos status | Muitos |
|---|---|
| Simples | Mais expressivo |
| Menos ambiguidade | Mais carga |
| Suficiente na maioria | Útil em escala |

## Modos de Falha

**ADR editado.** Contexto vira falso, histórico some.

**Superado sem referência.** Ninguém encontra o sucessor.

**Descontinuado sem razão.** Pior que nada.

**Sem índice.** Ninguém sabe o que vale.

**ADRs apagados.** A organização perde a memória de ter decidido.

**Status parado em `proposto`** indefinidamente — decisão tomada na prática, sem registro
formal.

## Erros Comuns

**Manter ADRs atualizados**, como se fossem documentação do sistema.

**Apagar o superado** por parecer confuso.

**Não datar transições.**

**Não referenciar o antecessor** no sucessor.

**Deixar o índice manual**, que desatualiza.

## Exemplo Real

Uma empresa de software mantinha ADRs havia quatro anos, com uma prática que parecia
razoável: quando uma decisão mudava, o ADR era editado e uma linha de histórico
acrescentada ao final.

Um episódio expôs o problema. Um time propôs migrar um serviço de comunicação síncrona para
assíncrona. Durante a análise, alguém lembrou vagamente que "isso já tinha sido discutido".

O ADR encontrado, de 2021, dizia que a comunicação era assíncrona. O histórico ao final
tinha três linhas:

```text
2021-05  criado
2022-11  atualizado após mudança de abordagem
2023-07  atualizado
```

O texto de 2021 tinha sido substituído. A decisão original — que era **síncrona**, com
razões específicas — tinha desaparecido, e as razões da mudança de 2022 também.

A reconstrução, pelo histórico do repositório, levou dois dias e mostrou que o serviço
tinha sido migrado para assíncrono em 2022 e **de volta para síncrono** em 2023, por
problemas de ordenação de eventos que a nova proposta reintroduziria exatamente.

Ninguém envolvido em 2026 sabia disso.

O que mudou:

**ADRs imutáveis.** Nenhuma edição de raciocínio, apenas correções factuais.

**Superação obrigatória** para mudança de decisão, com referência bidirecional.

**Migração do acervo.** Os 89 ADRs existentes foram examinados; 23 tinham histórico de
edição. Para esses, as versões anteriores foram recuperadas do controle de versão e
publicadas como ADRs próprios, superados, com a numeração original preservada e sufixo.
Um trabalho de três semanas.

**Índice gerado** a partir dos arquivos, com status, data e cadeia de superação visível.

**Regra de proposta**: decisões significativas começam como `proposto` e ficam abertas por
pelo menos três dias úteis antes da aceitação.

Um efeito não previsto da migração: ao recuperar as versões antigas, três decisões
apareceram como tendo ido e voltado — o mesmo padrão do caso que motivou a mudança. Isso
virou um exercício interno de calibração.

A conclusão registrada: a prática de editar com linha de histórico parecia preservar
informação. Ela preservava o registro de que algo tinha mudado, e apagava o que era —
que é a parte que importa.

## Conceitos Relacionados

- [Superação](superseding-decisions.md) — a mecânica.
- [Estrutura do ADR](adr-structure.md).
- [O Que É um ADR](what-is-an-adr.md) — a imutabilidade como característica.
- [Documentação Viva](../17-architecture-documentation/living-documentation.md) — o índice
  gerado.

## Exercício Prático

Verifique se algum ADR do seu time já foi editado depois de aceito.

Se sim, recupere a versão anterior no histórico do repositório e compare. A diferença entre
as duas é informação que estava acessível a ninguém.

## Perguntas de Entrevista

- Por que um ADR registra um evento e não um estado?
- Por que "está no histórico do repositório" não substitui um ADR superado?
- Quando `descontinuado` é o status correto em vez de `superado`?

## Para Aprofundar

- Nygard, Michael. *Documenting Architecture Decisions*. 2011.
- *MADR — Markdown Any Decision Records* — adr.github.io/madr.
- Keeling, Michael. *Design It!*. Pragmatic Bookshelf, 2017.
