---
id: domain-driven-design
title: Domain-Driven Design
sidebar_position: 0
description: Estruturar software a partir do domínio — e decidir onde vale o custo de fazê-lo.
doc_type: index
level: 2
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor sabe identificar o core domain de um negócio, desenhar
  bounded contexts defensáveis e reconhecer onde DDD tático não se paga.
prerequisites: [software-design]
related: [design-patterns, system-design, enterprise-architecture]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-26
---

# Domain-Driven Design

DDD é a proposta de que a estrutura do software deve espelhar a estrutura do
negócio — e de que a linguagem usada no código deve ser a mesma usada por quem
entende o problema.

## O problema desta seção

Sistemas de domínio complexo falham por uma razão específica: a tradução. O
especialista de negócio descreve uma regra; o analista converte em requisito; o
desenvolvedor converte em código. A cada conversão, nuance se perde. Meses
depois, o comportamento do sistema diverge do entendimento de todo mundo, e
ninguém sabe apontar onde a divergência entrou.

DDD ataca isso eliminando a tradução: o código usa os termos do domínio, com o
significado exato que eles têm no domínio.

O segundo problema é de escala organizacional. Um modelo único e consistente
para toda a empresa é atraente e impossível — "cliente" significa coisas
genuinamente diferentes em cobrança, logística e suporte. Forçar um modelo
comum produz um esquema que não serve bem a ninguém. DDD estratégico resolve
isso admitindo múltiplos modelos com fronteiras explícitas.

## O que você vai encontrar aqui

**DDD estratégico.** Domínio, subdomínio, core domain, supporting domain e
generic domain. Bounded context, context mapping e anti-corruption layer. Esta
é a parte de DDD que decide arquitetura — e a que mais frequentemente é pulada.

**Ubiquitous language.** O mecanismo que faz o resto funcionar. Sem isso, DDD
tático vira um conjunto de convenções de nomenclatura sem efeito.

**DDD tático.** Entity, value object, aggregate, aggregate root, domain service,
application service, domain event, repository e factory. Os blocos de construção
que implementam um modelo dentro de um contexto.

## A distinção que mais importa

**DDD estratégico e DDD tático têm perfis de custo completamente diferentes.**

O estratégico quase sempre se paga. Identificar onde estão as fronteiras reais
do negócio é útil mesmo num sistema pequeno, e essas fronteiras costumam ser as
melhores candidatas a fronteiras de serviço mais tarde.

O tático é caro. Aggregates, value objects e repositories adicionam indireção
que só se justifica quando a regra de negócio é genuinamente complexa. Aplicado
a um CRUD, DDD tático produz seiscentas linhas para fazer o que trinta fariam.

A pergunta correta nunca é "vamos usar DDD?". É "este subdomínio é core, e a
regra aqui é complexa o bastante para pagar o tático?".

## Ordem de leitura

Estratégico antes de tático, sempre. A ordem inversa — que é a ordem em que a
maior parte dos tutoriais apresenta — produz quem sabe escrever um aggregate e
não sabe decidir onde ele deveria morar.

Leia **bounded context** e **ubiquitous language** com atenção especial. São os
dois conceitos de que o resto depende, e os dois mais frequentemente reduzidos a
slogan.

## Ao terminar

Você consegue conversar com um especialista de negócio e sair com um mapa de
subdomínios. Consegue argumentar onde uma fronteira deveria estar e por quê.
Consegue reconhecer quando dois times estão usando a mesma palavra para coisas
diferentes — que é quase sempre o sintoma de um bounded context faltando.

E consegue dizer não a DDD tático sem culpa, no subdomínio em que ele não se paga.

## Continua em

[Nível 03 — Design de Sistemas](/05-system-design/index.md), onde as
fronteiras de domínio começam a virar fronteiras de processo e de implantação.
