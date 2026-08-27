---
id: design-patterns
title: Design Patterns
sidebar_position: 0
description: Padrões como vocabulário de soluções recorrentes — sempre com a condição sob a qual não devem ser usados.
doc_type: index
level: 2
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor reconhece o problema que cada padrão resolve, o custo que
  cada um cobra, e sabe identificar quando aplicar um padrão piora o sistema.
prerequisites: [software-design]
related: [fundamentals, domain-driven-design]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-26
---

# Design Patterns

Padrões são soluções recorrentes com nome. O nome é metade do valor: permite
que duas pessoas discutam uma estrutura sem desenhá-la inteira.

A outra metade do valor só aparece quando se conhece o custo.

## O problema desta seção

Padrões são a parte do conhecimento de design mais fácil de aprender mal. São
concretos, têm nome bonito e cabem num exemplo de vinte linhas — o que os torna
memorizáveis sem serem compreendidos.

O resultado típico é o profissional que aplica *Strategy* onde um `if` bastava,
cria uma *Factory* para instanciar uma classe que nunca terá segunda
implementação, e coloca *Observer* num fluxo que tinha exatamente um observador.
Cada aplicação isolada parece razoável. O acúmulo produz um sistema em que
seguir um fluxo simples exige abrir nove arquivos.

Padrão aplicado sem o problema correspondente é complexidade sem contrapeso.

## O que você vai encontrar aqui

**Padrões de projeto (GoF).** Os vinte e três, organizados em criacionais,
estruturais e comportamentais. Cada um tratado a partir do problema que o
originou, não a partir da sua estrutura de classes.

**Padrões arquiteturais.** Layered, Monolito Modular, Microsserviços,
Event-Driven, Hexagonal, Clean Architecture, CQRS, Event Sourcing, Pipes and
Filters, Space-Based Architecture e SOA. Estes operam num nível diferente:
decidem como o sistema é implantado e operado, não apenas como o código é
organizado.

## Três padrões que moram no Nível 02

Layered, Hexagonal e Clean Architecture são padrões arquiteturais e são tratados
em [Design de Software](../02-software-design/index.md), porque ali eles surgem
como consequência das decisões de fronteira e direção de dependência.

Um conceito tem um único documento canônico neste material; onde reaparece, é
referenciado. Os links diretos:

- [Camadas](../02-software-design/layering.md)
- [Ports and Adapters](../02-software-design/ports-and-adapters.md)
- [Arquitetura Hexagonal](../02-software-design/hexagonal-architecture.md)
- [Arquitetura Onion](../02-software-design/onion-architecture.md)
- [Clean Architecture](../02-software-design/clean-architecture.md)

## A regra desta seção

**Nenhum padrão é apresentado sem a discussão de quando não usá-lo.**

Não é uma formalidade de estrutura. É a parte mais útil de cada documento, e é
a que falta em quase toda a literatura de padrões. Um padrão cujo custo você não
sabe enunciar é um padrão que você não sabe usar.

Para os padrões arquiteturais, a seção "Quando Não Usar" é frequentemente mais
longa que a explicação do padrão. Isso é proposital: as decisões erradas mais
caras da carreira de um arquiteto costumam ser adoções prematuras de padrões
arquiteturais corretos em contexto errado.

## Ordem de leitura

Os GoF podem ser lidos fora de ordem, por consulta. Não há progressão obrigatória
entre eles. Se for ler em sequência, comece pelos comportamentais — são os que
mais frequentemente resolvem problemas reais de código de aplicação.

Os padrões arquiteturais **têm** ordem. Leia Layered e Monolito Modular antes de
Microsserviços; leia Event-Driven antes de CQRS e Event Sourcing. A sequência
importa porque cada um só faz sentido como resposta às limitações do anterior.

Não leia os padrões arquiteturais distribuídos — Microsserviços, Event-Driven,
Space-Based — antes do [Nível 04](../06-distributed-systems/index.md). Eles são
apresentados aqui como formas; o custo real deles só fica visível depois de
entender falha parcial.

## Ao terminar

Você reconhece o problema antes do padrão. Consegue nomear a estrutura que já
está no seu código sem ter percebido. E, diante da sugestão de aplicar um
padrão, consegue perguntar qual força específica ele está aliviando — e concluir,
quando for o caso, que nenhuma.

## Continua em

[Domain-Driven Design](../04-domain-driven-design/index.md), onde a estrutura
passa a ser ditada pelo domínio em vez de por forças técnicas.
