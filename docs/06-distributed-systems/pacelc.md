---
id: pacelc
title: PACELC
sidebar_position: 12
description: A extensão de CAP que cobre o caso comum — latência contra consistência, quando não há partição.
doc_type: foundation
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor raciocina sobre o trade-off que vale o tempo todo, e não
  apenas durante partição.
prerequisites: [cap]
related: [cap, consistency, latency]
canonical_for: [PACELC]
content_version: 1
last_reviewed: 2026-08-27
---

# PACELC

## Visão Geral

PACELC, formulado por Daniel Abadi, estende [CAP](/06-distributed-systems/cap.md) com a parte que faltava:

> **Se** houver **P**artição, escolha entre **A**vailability e **C**onsistency.
> **E**lse — quando não há partição — escolha entre **L**atency e **C**onsistency.

A segunda metade é a que importa no dia a dia, e é a que CAP omite.

## O Problema

CAP descreve um evento raro. Partições acontecem, e um sistema pode passar meses
sem uma.

Isso deixa uma lacuna: **o que explica o comportamento nos outros 99,99% do
tempo?**

A resposta é que consistência custa **coordenação**, e coordenação custa **idas e
voltas de rede** — mesmo com tudo funcionando perfeitamente.

Uma escrita que precisa ser confirmada por réplicas em outra região paga a
latência entre regiões. Não porque algo falhou, mas porque a velocidade da luz é
finita e a coordenação é obrigatória.

PACELC nomeia esse trade-off. E ele é o dominante, porque vale sempre.

## Conceitos Centrais

### A classificação

Sistemas são descritos por duas letras, uma para cada situação:

| Classe | Sob partição | Sem partição |
|---|---|---|
| **PA/EL** | Disponibilidade | Latência |
| **PA/EC** | Disponibilidade | Consistência |
| **PC/EL** | Consistência | Latência |
| **PC/EC** | Consistência | Consistência |

**PA/EL** — prioriza responder rápido, sempre. Bancos de chave-valor com
replicação assíncrona tendem a este perfil.

**PC/EC** — prioriza correção, sempre, pagando latência. Bancos com consenso
distribuído tendem a este.

**PA/EC** é a combinação incomum e existe: sistemas que preferem consistência no
caso normal e abrem mão sob partição.

### O custo é geográfico

O impacto de EC aparece com clareza em configuração multi-região:

```text
escrita linearizável, réplicas em duas regiões do mesmo continente
  → confirmação exige ida e volta: ~30 ms adicionais por escrita

réplicas intercontinentais
  → ~150 ms adicionais por escrita
```

Isso não é otimizável. É distância física.

Um sistema que exige consistência forte global e tem usuários em três continentes
paga a latência da coordenação em toda escrita, e não há código que resolva.

### O que isso decide na prática

A escolha entre EL e EC determina:

**Onde as escritas acontecem.** Consistência forte multi-região frequentemente
implica um líder único — e escritas de outras regiões pagam a viagem até ele.

**Se réplicas de leitura são utilizáveis.** Ler de réplica é EL; ler da primária é
EC.

**Qual o nível de confirmação.** Confirmar após uma réplica é EL; após a maioria é
EC.

Esses três parâmetros costumam ser configuráveis, e frequentemente estão no padrão
que ninguém escolheu.

### Por operação, de novo

Como em CAP e em [consistência](/06-distributed-systems/consistency.md), a escolha é por operação.

Um sistema pode ser EC para escrita de saldo e EL para leitura de catálogo — e
essa é a configuração correta na maioria dos casos.

Tratar como propriedade global força todas as operações ao requisito da mais
exigente.

## Por Que Isso Importa

**Porque descreve o trade-off que vale sempre.** CAP explica o caso raro; PACELC
explica o dia a dia. Times que só conhecem CAP não têm vocabulário para a decisão
que de fato tomam todo dia.

**Porque torna o custo de consistência visível.** "Consistência forte" soa
gratuito até alguém quantificar os milissegundos que ela adiciona por operação.

**Porque a decisão é frequentemente configuração.** Nível de confirmação, origem
da leitura, posição do líder — os parâmetros existem e alguém precisa escolher.

## Erros Comuns

**Conhecer apenas CAP.** Deixa sem explicação o comportamento normal do sistema.

**Tratar a classificação como propriedade do banco.** A maioria dos bancos
modernos permite escolher por operação.

**Não medir o custo de EC.** A diferença de latência entre confirmar em uma réplica
e na maioria é mensurável e raramente é medida.

**Escolher EC globalmente por precaução.** Paga latência em toda operação para
proteger as poucas que precisam.

**Ignorar a geografia.** O custo de EC depende da distância entre réplicas.

## Exemplo Real

Um sistema de reservas de hotéis operava em três regiões — América do Sul, Europa
e Ásia — com banco replicado e consistência forte global.

O tempo de resposta para criar uma reserva era de 480 ms no percentil 50. O
requisito era 300 ms.

O perfil mostrou que 340 ms eram coordenação: a escrita precisava ser confirmada
pela maioria das réplicas, e a maioria envolvia atravessar continentes.

A primeira proposta foi otimizar a aplicação. Ela não tinha o que otimizar — 71%
do tempo era espera de rede entre continentes.

A análise por operação mudou a arquitetura.

**Reserva de quarto** permaneceu EC, e foi **particionada por região do hotel**. Um
hotel em São Paulo tem sua reserva coordenada apenas entre réplicas
sul-americanas. A coordenação continua, e a distância caiu de intercontinental
para regional: de 340 ms para 18 ms.

**Consulta de disponibilidade** virou EL — lê da réplica local, com atraso aceito
de segundos. O negócio confirmou que uma disponibilidade ligeiramente desatualizada
é aceitável, porque a reserva efetiva verifica de novo.

**Perfil e histórico do usuário** viraram EL sem ressalva.

Resultado: p50 de 95 ms.

O ponto que a equipe sublinha: a consistência forte não foi abandonada. O que mudou foi
**o escopo da coordenação** — de global para regional — mais a separação das
operações que não precisavam dela.

E o insight que só apareceu com PACELC no vocabulário: o problema nunca foi
partição. Não houve nenhuma. O custo era permanente, e CAP não tinha linguagem
para nomeá-lo.

## Conceitos Relacionados

- [CAP](/06-distributed-systems/cap.md) — a metade que trata de partição.
- [Consistência](/06-distributed-systems/consistency.md) — o espectro.
- [Latência](/06-distributed-systems/latency.md) — o que se paga.
- [Replicação](/06-distributed-systems/replication.md) — onde a coordenação acontece.

## Exercício Prático

Descubra a configuração de confirmação de escrita do seu banco: ele confirma após
gravar localmente, após uma réplica, ou após a maioria?

Depois meça a diferença de latência entre os modos. O número é o preço da
consistência no seu sistema, e quase ninguém o conhece.

## Perguntas de Entrevista

- O que PACELC acrescenta a CAP?
- Por que consistência custa latência mesmo sem falha?
- Por que o trade-off do "else" é mais relevante no dia a dia?

## Para Aprofundar

- Abadi, Daniel. *Consistency Tradeoffs in Modern Distributed Database System
  Design*. IEEE Computer, 2012.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
