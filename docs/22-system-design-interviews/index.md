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
content_version: 4
last_reviewed: 2026-08-26
---

# Entrevistas de System Design

Esta seção não ensina respostas. Ensina a conduzir a conversa.

## O problema desta seção

A entrevista de system design avalia algo específico: como você raciocina sob
ambiguidade, com informação incompleta e tempo curto. O enunciado é vago de
propósito ("projete o Twitter") porque a primeira coisa avaliada é se você
percebe que ele é vago.

O erro mais comum não é técnico. É começar a desenhar. Quem desenha primeiro
está respondendo a um problema que inventou, e o avaliador vê isso imediatamente.

O segundo erro é o oposto do que a preparação tradicional produz: candidatos que
decoraram uma arquitetura de referência e a recitam independentemente do
enunciado. Funciona até a primeira pergunta de acompanhamento.

## O que você vai encontrar aqui

**Estrutura da conversa.** Como distribuir o tempo entre clarificação,
estimativa, desenho e aprofundamento. Ter estrutura é metade da avaliação:
mostra que você já fez isso antes.

**Clarificação.** Que perguntas fazer e em que ordem. Separar requisitos
funcionais de não-funcionais em voz alta.

**Estimativa.** Cálculos de guardanapo: volume, armazenamento, banda, conexões.
Não para acertar o número, e sim para que a arquitetura tenha uma escala
declarada. Sem isso, toda decisão fica sem critério.

**Desenho.** Design de API, modelagem de dados e arquitetura de alto nível.

**Aprofundamento.** Identificação de gargalos, escala e tratamento de falhas. É
onde a entrevista de fato diferencia candidatos.

**Comunicação.** Como enunciar um trade-off em voz alta enquanto desenha. O
avaliador só pontua o raciocínio que você verbaliza. Essa é a parte que a
preparação por leitura não alcança.

**Erros comuns.** Os padrões que fazem entrevistas darem errado, com o que fazer
em vez disso.

## A ordem que a seção treina

```text
Problema → Requisitos → Perguntas a Fazer → Estimativas de Capacidade
→ Arquiteturas Possíveis → Trade-offs → Abordagem Recomendada
```

Note que **Perguntas a Fazer** vem antes de qualquer arquitetura. É a ordem da
entrevista real, e é o hábito que esta seção treina.

Cada documento traz um **Exemplo de Entrevista**: o diálogo com o avaliador, com as
perguntas de acompanhamento que ele faria. Os exercícios longos do percurso ficam nas
outras seções; aqui o treino é a ordem, não o enunciado.

## Uma nota sobre preparação

Decorar arquiteturas de referência falha pelo motivo já descrito, e vale nomear
o mecanismo: essa preparação otimiza o reconhecimento do enunciado, enquanto a
entrevista mede a condução de um enunciado que você não reconhece.

O que transfere é o método: clarificar, estimar, decompor, identificar gargalo,
declarar trade-off. Ele não depende de reconhecer o enunciado, e sim de tempo
para as fases, e em entrevistas de 30 minutos reduz-se a três, como mostra
[Estrutura da Entrevista](/22-system-design-interviews/interview-structure.md).

## Ao terminar

Você conduz a conversa em vez de reagir a ela. Faz as perguntas certas antes de
desenhar. Declara premissas em voz alta, o que permite ao avaliador corrigir o
rumo cedo.

E consegue dizer "eu escolheria X, mas se o requisito de consistência fosse
outro, escolheria Y". É exatamente o que a entrevista procura.

## Relacionado

[Case Studies](/21-case-studies/index.md) para a versão sem pressão de tempo, e
[Trade-offs](/20-trade-offs/index.md) para o material de argumentação.
