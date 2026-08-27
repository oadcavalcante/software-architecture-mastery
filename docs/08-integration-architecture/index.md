---
id: integration-architecture
title: Arquitetura de Integração
sidebar_position: 0
description: Como sistemas conversam através de fronteiras — e por que o contrato importa mais que o protocolo.
doc_type: index
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor escolhe estilo de integração pelo acoplamento que aceita,
  e trata contrato e evolução como o problema central.
prerequisites: [distributed-systems]
related: [data-architecture, cloud-architecture, system-design]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-27
---

# Nível 05 — Arquitetura de Integração

Esta seção trata do que acontece nas fronteiras entre sistemas.

## O problema desta seção

A discussão sobre integração quase sempre começa errado: "REST ou gRPC?",
"síncrono ou assíncrono?". São perguntas sobre mecanismo, e o mecanismo é a
parte fácil.

O problema difícil é o **contrato**: o que uma ponta promete à outra, quem pode
mudar o quê, e o que acontece quando alguém muda. Uma integração morre por
contrato quebrado, não por escolha de protocolo.

O segundo problema difícil é o **acoplamento**. Toda integração acopla — a
questão é acoplar em quê. Em disponibilidade? Em formato de dado? Em modelo de
domínio? Em ritmo de implantação?

Escolher o estilo de integração é escolher qual acoplamento você aceita. É essa
a decisão, e ela é anterior à tecnologia.

## O que você vai encontrar aqui

**Os estilos síncronos.** REST, GraphQL e gRPC, comparados pelo que cada um
assume sobre quem consome. GraphQL recebe atenção específica ao que ele
transfere de custo do cliente para o servidor — que é a parte omitida na
comparação usual.

**Os estilos assíncronos.** Integração por mensageria e por eventos, apoiadas em
[sistemas distribuídos](../06-distributed-systems/index.md). Webhooks tratados
como o que são: uma integração assíncrona em que a outra ponta é um servidor
que você não controla.

**Os estilos que ninguém apresenta em conferência.** Integração em lote e por
arquivo — que movem, hoje, mais dados corporativos que todo o resto somado, e
que continuam sendo a resposta certa para uma classe grande de problemas.

**A infraestrutura de borda.** API gateways e service mesh, com a pergunta que
precede as duas: qual problema concreto isso resolve que já não está resolvido?

**Os padrões clássicos.** Enterprise Integration Patterns — o vocabulário que
descreve o que roteadores, tradutores e agregadores fazem, e que continua válido
independentemente da tecnologia da moda.

**O núcleo da seção.** Contratos de integração, evolução de esquema e
anti-corruption layer. Se você ler só três documentos daqui, sejam esses.

## Ordem de leitura

Comece por **contratos de integração**. Ele organiza todo o resto, e sem ele os
documentos de protocolo viram comparação de recursos.

Depois **evolução de esquema**, que é onde as integrações reais quebram.

Os estilos podem ser lidos em qualquer ordem, conforme a necessidade. Se você
está decidindo agora, leia o par que está considerando e vá direto aos
trade-offs.

Deixe **service mesh** por último, e leia com ceticismo — é a tecnologia desta
seção com a maior distância entre adoção e necessidade.

## Ao terminar

Você para de escolher integração por protocolo e passa a escolher por
acoplamento: o que cada ponta precisa saber sobre a outra, e o que acontece
quando uma muda.

Consegue projetar um contrato que permite evoluir sem coordenar implantações, e
reconhece quando uma integração está acoplando modelo de domínio — o acoplamento
mais caro e o menos visível.

E consegue defender integração em lote quando ela é a resposta certa, que é mais
frequente do que a literatura sugere.

## Continua em

[Arquitetura em Nuvem](../09-cloud-architecture/index.md), onde essas decisões
passam a interagir com o que a plataforma oferece e cobra.
