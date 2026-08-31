---
id: scalability
title: Escalabilidade
sidebar_position: 0
description: Crescer sem que o custo por unidade cresça junto — e por que a maior parte dos problemas atribuídos a escala não é de escala.
doc_type: index
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor distingue problema de desempenho de problema de escala, e
  ataca o gargalo real em vez de adicionar capacidade.
prerequisites: [system-design]
related: [distributed-systems, data-architecture, reliability]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-28
---

# Nível 05 — Escalabilidade

Esta seção trata de crescer sem que o custo cresça na mesma proporção.

## O problema desta seção

Escalabilidade é a propriedade de suportar mais carga **adicionando recursos**, com o
custo por unidade de trabalho permanecendo estável ou caindo.

Isso é diferente de desempenho, e a confusão entre os dois é a origem da maior parte
dos projetos de escala mal direcionados. Um sistema pode ser rápido e não escalar; um
sistema lento pode escalar perfeitamente.

O segundo problema é de diagnóstico. Uma fração grande dos problemas atribuídos a
escala não é de escala — é
[índice ausente](/07-data-architecture/indexing.md), consulta mal escrita, mistura
de cargas, ou contenção sobre um único recurso.

Adicionar capacidade a um desses gasta dinheiro e não resolve, porque o gargalo não é
capacidade. E, o que é pior, costuma esconder o problema por alguns meses.

O terceiro é que **escala tem limite estrutural**. Uma fração serial de 5% no
processamento limita o ganho a 20 vezes, independentemente de quantas máquinas você
adicione. Reconhecer isso muda o alvo: em vez de adicionar recursos, remover a parte
que não paraleliza.

## O que você vai encontrar aqui

**As duas direções.** Escala vertical e horizontal — com a defesa explícita da
vertical, que é subestimada e resolve mais casos do que a literatura sugere.

**O pré-requisito.** Ausência de estado, sem a qual escalar horizontalmente não
funciona.

**Os mecanismos.** Cache, particionamento, replicação e balanceamento vistos pelo
ângulo da escala — complementando o tratamento de
[design de sistemas](/05-system-design/index.md) e de
[sistemas distribuídos](/06-distributed-systems/index.md).

**Assíncrono e filas.** As duas técnicas que resolvem pico sem adicionar capacidade
proporcional. Frequentemente a resposta certa quando a intuição pede mais máquinas.

**Banco de dados.** O gargalo real da maioria dos sistemas, e o mais difícil de
escalar.

**Pontos quentes.** O modo de falha que sobrevive a qualquer quantidade de capacidade
— e que explica por que "temos dez réplicas e mesmo assim caiu".

**Planejamento de capacidade.** Como saber quando escalar, antes do incidente.

**Desempenho contra escalabilidade.** O documento que organiza toda a seção, e que
deveria ser o primeiro para quem tem pouco tempo.

## Ordem de leitura

Comece por **desempenho contra escalabilidade**. Sem essa distinção, o resto vira
catálogo de técnicas sem critério.

Depois **pontos quentes**, que explica por que capacidade adicional às vezes não faz
diferença nenhuma.

**Escala vertical** antes de **horizontal** — a ordem é deliberada, porque a vertical
é a resposta certa com mais frequência do que se imagina, e a horizontal cobra
complexidade permanente.

**Escala de banco de dados** pode ser lida a qualquer momento e é a de retorno mais
imediato para quem tem sistema em produção agora.

## Ao terminar

Você distingue um problema de desempenho de um de escala, e sabe qual medição
responde a essa pergunta.

Consegue identificar onde está o gargalo antes de decidir o que fazer, em vez de
adicionar capacidade e observar.

Reconhece que assíncrono e fila resolvem picos que capacidade não resolve, e que
ponto quente é imune a qualquer quantidade de máquinas.

E sabe defender a decisão de **não** escalar horizontalmente quando uma máquina maior
resolve — que continua sendo a resposta certa para a maioria dos sistemas.

## Continua em

[Confiabilidade](/12-reliability/index.md), onde a pergunta passa a ser o que
acontece quando as partes que você multiplicou começam a falhar.
