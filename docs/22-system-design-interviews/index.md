---
id: system-design-interviews
title: Entrevistas de System Design
sidebar_position: 0
description: O mesmo raciocínio arquitetural, sob restrição de tempo e com um avaliador na sala.
doc_type: index
level: 0
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor conduz uma entrevista de system design com estrutura
  própria, explicitando premissas e trade-offs enquanto desenha.
prerequisites: [system-design]
related: [case-studies, trade-offs]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-26
---

# Entrevistas de System Design

Esta seção não ensina respostas. Ensina a conduzir a conversa.

## O problema desta seção

A entrevista de system design avalia algo específico: como você raciocina sob
ambiguidade, com informação incompleta e tempo curto. O enunciado é vago de
propósito — "projete o Twitter" — porque a primeira coisa avaliada é se você
percebe que ele é vago.

O erro mais comum não é técnico. É começar a desenhar. Quem desenha primeiro
está respondendo a um problema que inventou, e o avaliador vê isso imediatamente.

O segundo erro é o oposto do que a preparação tradicional produz: candidatos que
decoraram uma arquitetura de referência e a recitam independentemente do
enunciado. Funciona até a primeira pergunta de acompanhamento.

## O que você vai encontrar aqui

**Estrutura da conversa.** Como distribuir o tempo entre clarificação,
estimativa, desenho e aprofundamento. Ter estrutura é metade da avaliação —
mostra que você já fez isso antes.

**Clarificação.** Que perguntas fazer e em que ordem. Separar requisitos
funcionais de não-funcionais em voz alta.

**Estimativa.** Cálculos de guardanapo: volume, armazenamento, banda, conexões.
Não para acertar o número, e sim para que a arquitetura tenha uma escala
declarada — sem isso, toda decisão fica sem critério.

**Desenho.** Design de API, modelagem de dados e arquitetura de alto nível.

**Aprofundamento.** Identificação de gargalos, escala e tratamento de falhas. É
onde a entrevista de fato diferencia candidatos.

**Comunicação.** Como enunciar um trade-off em voz alta enquanto desenha. Esta é
a competência mais valorizada e a menos treinada.

**Erros comuns.** Os padrões que fazem entrevistas darem errado, com o que fazer
em vez disso.

## O formato dos exercícios

```text
Problema → Requisitos → Perguntas a Fazer → Estimativas de Capacidade
→ Arquiteturas Possíveis → Trade-offs → Abordagem Recomendada
→ Perguntas de Acompanhamento
```

Note que **Perguntas a Fazer** vem antes de qualquer arquitetura. É a ordem da
entrevista real, e é o hábito que os exercícios treinam.

Cada exercício apresenta mais de uma arquitetura possível, porque numa entrevista
boa você propõe uma alternativa e explica por que não a escolheu.

## Uma nota sobre preparação

Decorar arquiteturas de referência é a forma mais popular de se preparar e uma
das menos eficazes. Funciona enquanto o enunciado coincide com o que foi
decorado, e colapsa na primeira variação — que o avaliador vai introduzir
justamente para testar isso.

O que transfere é o método: clarificar, estimar, decompor, identificar gargalo,
declarar trade-off. Esse método funciona em qualquer enunciado, inclusive nos que
você nunca viu.

## Ao terminar

Você conduz a conversa em vez de reagir a ela. Faz as perguntas certas antes de
desenhar. Declara premissas em voz alta, o que permite ao avaliador corrigir o
rumo cedo.

E consegue dizer "eu escolheria X, mas se o requisito de consistência fosse
outro, escolheria Y" — que é exatamente o que a entrevista procura.

## Relacionado

[Case Studies](../21-case-studies/index.md) para a versão sem pressão de tempo, e
[Trade-offs](../20-trade-offs/index.md) para o material de argumentação.
