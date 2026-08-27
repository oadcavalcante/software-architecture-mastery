---
id: scalability
title: Escalabilidade
sidebar_position: 0
description: Como um sistema absorve crescimento — e por que escalabilidade não é a mesma coisa que desempenho.
doc_type: index
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor identifica o gargalo real antes de escalar e escolhe a
  estratégia a partir da dimensão que cresce, não do recurso mais visível.
prerequisites: [system-design, distributed-systems]
related: [data-architecture, reliability, cloud-architecture]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-26
---

# Escalabilidade

Escalabilidade é a capacidade de absorver crescimento adicionando recursos. Não
é a mesma coisa que desempenho, e confundir as duas leva a otimizar a coisa
errada com competência.

## O problema desta seção

Desempenho é quanto tempo uma operação leva com a carga atual. Escalabilidade é
como esse tempo se comporta quando a carga multiplica. Um sistema pode ser
rápido e não escalar; pode escalar bem e ser lento.

A confusão produz um padrão previsível: alguém otimiza uma consulta, ganha 30%,
e o sistema cai de novo três meses depois — porque o problema nunca foi a
consulta, e sim o fato de que toda requisição passa por um recurso que não se
multiplica.

O trabalho arquitetural aqui é identificar **qual dimensão cresce** — usuários,
dados, escritas, leituras, conexões simultâneas, tamanho de payload — e qual
recurso satura primeiro nessa dimensão. Escalar sem essa análise é caro e
frequentemente ineficaz.

## O que você vai encontrar aqui

**As duas direções.** Escala vertical e horizontal, com o ponto em que a
primeira deixa de ser a resposta certa — que é mais tarde do que se costuma
supor.

**A precondição.** Ausência de estado no processamento. É o que torna a escala
horizontal possível; sem isso, o resto não se aplica.

**Distribuição de carga.** Balanceamento de carga, particionamento e replicação
sob a ótica de crescimento.

**Absorção.** Cache, processamento assíncrono e escala baseada em fila. Como
converter picos em atraso em vez de em falha.

**O ponto difícil.** Escala de banco de dados e hotspots. O banco é o gargalo
final da maior parte dos sistemas, e hotspot é o motivo pelo qual particionar
nem sempre resolve.

**Antecipação.** Planejamento de capacidade e a distinção entre desempenho e
escalabilidade.

## Ordem de leitura

Leia **desempenho versus escalabilidade** primeiro. É curto e reorganiza tudo o
que vem depois.

Depois **planejamento de capacidade** e **hotspots**, nessa ordem — a análise
antes das soluções. Cache e fila são fáceis de aplicar e por isso são aplicados
antes da análise com frequência demais.

## Ao terminar

Você identifica o gargalo real de um sistema com um argumento quantitativo, e
não pela intuição de onde "parece lento". Escolhe entre cache, fila,
particionamento e réplica a partir da dimensão que cresce.

E reconhece o caso em que a resposta correta é reduzir a carga em vez de
aumentar a capacidade.

## Relacionado

[Confiabilidade](../12-reliability/index.md) — sistemas escalam até o ponto em
que falham, e o que acontece nesse ponto é decisão de projeto.
