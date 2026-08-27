---
id: enterprise-architecture
title: Arquitetura Corporativa
sidebar_position: 0
description: Arquitetar acima da fronteira de um sistema — capacidades, portfólio e arquitetura-alvo.
doc_type: index
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor distingue os quatro níveis de arquitetura e constrói um
  caminho de transição entre estado atual e arquitetura-alvo.
prerequisites: [integration-architecture, data-architecture]
related: [legacy-modernization, architecture-governance, architecture-leadership]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-26
---

# Nível 06 — Arquitetura Corporativa

Aqui a unidade de análise deixa de ser o sistema e passa a ser o conjunto deles,
junto com a organização que os opera.

## O problema desta seção

Um arquiteto de solução otimiza um sistema. Isso é correto no escopo dele e
insuficiente no escopo da empresa: cinco sistemas individualmente bem projetados
podem produzir quatro implementações da mesma capacidade, três definições
incompatíveis de "cliente" e um cenário de integração que ninguém entende
inteiro.

Arquitetura corporativa trata desse nível — e opera sob restrições diferentes.
No nível de sistema, a restrição dominante é técnica. No corporativo, é
organizacional: orçamento, ciclo de planejamento, propriedade de sistemas,
resistência política e o fato de que a maior parte do que existe não pode ser
desligado.

Isso muda o instrumento. Não se decide arquitetura corporativa desenhando o
estado final; decide-se construindo um caminho viável a partir do estado atual.

## A distinção central

Esta seção ensina explicitamente a diferença entre quatro coisas frequentemente
confundidas:

```text
Arquitetura de Software    estrutura interna de um sistema
Arquitetura de Sistemas    o sistema e seu ambiente técnico
Arquitetura de Solução     um problema de negócio ponta a ponta
Arquitetura Corporativa    o portfólio e a organização
```

Cargos usam esses termos de forma inconsistente entre empresas. Saber a diferença
real é o que permite entender o escopo de uma vaga, de uma reunião e de uma
decisão.

## O que você vai encontrar aqui

**Os domínios.** Arquitetura de negócio, de aplicação, de dados e de tecnologia
— as quatro visões clássicas e o que cada uma responde.

**Mapeamento.** Capacidades de negócio, portfólio de aplicações e cenário de
integração. Como enxergar o que existe antes de propor o que deveria existir.

**Direção.** Princípios, padrões e technology radar. Como orientar decisão
distribuída sem centralizar cada escolha.

**Movimento.** Arquitetura atual, arquitetura-alvo, arquitetura de transição e
roadmaps. A arquitetura de transição é o entregável que distingue plano
executável de desejo bem desenhado.

## Ordem de leitura

Comece pela **distinção entre os quatro níveis**. É curta e reorganiza tudo.

Depois **capacidades de negócio** — o instrumento que permite discutir o
portfólio sem discutir tecnologia, e portanto o que permite conversar com quem
decide orçamento.

Deixe **arquitetura-alvo** e **transição** para o fim, e leia junto com
[Modernização de Legado](../16-legacy-modernization/index.md). Alvo sem caminho
é apresentação; caminho é o trabalho.

## Ao terminar

Você lê um cenário de aplicações e identifica capacidades duplicadas e
integrações frágeis. Constrói um caminho de transição em etapas que entregam
valor isoladamente.

E consegue apresentar isso a quem controla orçamento, em termos de capacidade e
risco em vez de tecnologia.

## Continua em

[Modernização de Legado](../16-legacy-modernization/index.md) e
[Governança](../19-architecture-governance/index.md).
