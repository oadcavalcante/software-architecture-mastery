---
id: architecture-decisions
title: Decisões de Arquitetura
sidebar_position: 0
description: Registrar o porquê de uma decisão, incluindo as alternativas descartadas e sob que condição voltariam.
doc_type: index
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escreve ADRs que preservam o contexto e permitem que uma
  decisão seja reavaliada com informação, não refeita do zero.
prerequisites: [architecture-documentation]
related: [trade-offs, architecture-governance, legacy-modernization]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-26
---

# Decisões de Arquitetura

Diagramas registram o que o sistema é. ADRs registram por que ele é assim — e
essa é a informação que se perde primeiro.

## O problema desta seção

Toda base de código tem decisões cuja razão ninguém lembra. Por que este serviço
é separado? Por que este campo é desnormalizado? Por que não usamos a biblioteca
óbvia?

Sem a resposta, restam duas opções ruins. Manter a decisão por medo, sem saber
se a razão ainda vale. Ou revertê-la sem saber, e redescobrir a razão original
por meio de um incidente.

O custo real não é o esquecimento em si — é que a decisão deixa de ser
reavaliável. Uma decisão cujo contexto foi registrado pode ser revista quando o
contexto mudar. Uma decisão sem contexto só pode ser obedecida ou quebrada.

## O que você vai encontrar aqui

**O formato.** O que é um ADR, por que ADRs importam e a estrutura padrão:
contexto, decisão, alternativas, consequências e status.

**As partes que importam.** Contexto e alternativas são as duas seções que
carregam quase todo o valor, e as duas que costumam ser escritas mal. Contexto
precisa incluir as restrições vigentes no momento; alternativas precisam incluir
sob que condição cada opção descartada voltaria a ganhar.

**Ciclo de vida.** Status e superação. ADR não é apagado nem editado quando muda
de ideia — é superado por outro, preservando o histórico do raciocínio.

**Exemplos realistas.** Cinco ADRs completos de um sistema fictício, escritos
para demonstrar raciocínio:

```text
ADR-001  Escolher Monolito Modular em vez de Microsserviços
ADR-002  Introduzir Processamento Assíncrono
ADR-003  Escolher PostgreSQL como Banco Primário
ADR-004  Introduzir Kafka
ADR-005  Adotar Arquitetura Hexagonal
```

Pelo menos um deles aparece com status `superseded`, para mostrar a mecânica de
superação — que é o que a maior parte dos exemplos de ADR omite.

**Os ADRs deste repositório.** As decisões estruturais do próprio projeto,
registradas no mesmo formato. O repositório pratica o que ensina.

## Ordem de leitura

Leia a **estrutura** e depois vá direto aos exemplos. ADR é um formato simples;
o que se aprende é o padrão de raciocínio, e isso se aprende por exemplo.

Preste atenção específica na seção de alternativas de cada exemplo. É onde o
raciocínio arquitetural fica visível.

## Ao terminar

Você escreve um ADR que alguém consegue ler em dois anos e entender não só o que
foi decidido, mas se a razão ainda vale. Reconhece quando uma decisão merece ADR
— nem toda merece.

E consegue superar uma decisão sua sem apagar o registro de tê-la tomado.

## Relacionado

[Trade-offs](../20-trade-offs/index.md), que é o material de que a seção de
alternativas é feita.
