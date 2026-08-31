---
id: strategic-ddd
title: DDD Estratégico
sidebar_position: 10
description: A parte do DDD que decide arquitetura — e a que quase sempre é pulada.
doc_type: foundation
level: 2
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor conduz uma análise estratégica de domínio e entende por
  que ela precede e condiciona qualquer decisão tática.
prerequisites: [bounded-context, context-mapping]
related: [tactical-ddd, subdomain, enterprise-architecture]
canonical_for: [DDD estratégico, strategic design]
content_version: 1
last_reviewed: 2026-08-26
---

# DDD Estratégico

## Visão Geral

DDD estratégico é a parte que decide **onde as fronteiras ficam** e **onde
investir**. Ele opera antes de qualquer decisão sobre agregados ou repositórios.

É também a parte que quase sempre é pulada — a maior parte do que se chama de
"adotar DDD" começa e termina no tático.

## O Problema

A ordem em que DDD costuma ser aprendido é invertida.

Alguém lê sobre agregados, entidades e objetos de valor, aplica os padrões, e
conclui que DDD é um estilo de escrever classes. O sistema ganha `Aggregate`,
`Repository` e `ValueObject` no nome, e mantém as mesmas fronteiras erradas de
antes.

O resultado é o pior dos dois mundos: o custo do tático — indireção, cerimônia,
mais tipos — sem o benefício do estratégico, que é o que de fato muda a
arquitetura.

A ordem correta é a inversa. **As fronteiras vêm primeiro.** Elas decidem onde os
módulos ficam, onde os serviços serão extraídos, quem fala com quem, e onde vale
aplicar o tático.

## Conceitos Centrais

### O que compõe o estratégico

Cinco conceitos, na ordem em que se aplicam:

**[Domínio](/04-domain-driven-design/domain.md) e [subdomínio](/04-domain-driven-design/subdomain.md).** Entender o negócio e
dividi-lo em áreas.

**Classificação** em [core](/04-domain-driven-design/core-domain.md),
[supporting](/04-domain-driven-design/supporting-domain.md) e [generic](/04-domain-driven-design/generic-domain.md). Decidir onde
investir, onde simplificar e o que comprar.

**[Bounded context](/04-domain-driven-design/bounded-context.md).** Definir as fronteiras do modelo — a
decisão de maior consequência arquitetural.

**[Ubiquitous language](/04-domain-driven-design/ubiquitous-language.md).** Estabelecer o vocabulário
dentro de cada fronteira.

**[Context mapping](/04-domain-driven-design/context-mapping.md).** Nomear os relacionamentos entre
contextos, incluindo a dimensão organizacional.

### Ele produz decisões de arquitetura

O estratégico não é análise para relatório. Cada conceito produz uma decisão
concreta:

| Análise | Decisão que produz |
|---|---|
| Classificação de subdomínio | Onde alocar engenheiros; o que comprar |
| Bounded context | Onde ficam os módulos, e depois os serviços |
| Context mapping | Como integrar; onde construir anti-corruption layer |
| Ubiquitous language | O vocabulário do código |

A segunda linha é a mais importante: **as fronteiras de contexto são as melhores
candidatas a fronteiras de serviço.** Ver
[microsserviços](/03-design-patterns/microservices.md).

### Ele quase sempre se paga

Diferente do tático, o estratégico tem custo baixo e retorno alto mesmo em
sistemas pequenos.

Identificar onde o vocabulário muda de significado é trabalho de conversas, não
de código. Saber qual subdomínio diferencia a empresa muda a alocação de pessoas.
Nenhum dos dois exige adotar padrão nenhum.

Um time pode aplicar DDD estratégico integralmente e escrever código sem um único
agregado — e frequentemente isso é a decisão certa.

### O instrumento principal é a conversa

*Event storming*, sessões de modelagem colaborativa, entrevistas com
especialistas. O estratégico é feito com pessoas do negócio na sala.

Isso é o que o torna desconfortável em organizações estruturadas por camadas de
comunicação — e é o pré-requisito real, mais que qualquer conhecimento técnico.

## Por Que Isso Importa

**Porque as fronteiras são as decisões de maior custo de reversão.** Uma fronteira
de contexto errada custa anos; um agregado mal desenhado custa uma refatoração.

**Porque decide onde o tático se paga.** Sem a classificação de subdomínios, DDD
tático é aplicado uniformemente — e desperdiçado em quatro quintos do sistema.

**Porque conecta arquitetura a negócio.** É a ponte entre
[contexto de negócio](/01-fundamentals/business-context.md) e estrutura de
software, e o vocabulário que permite discutir uma com quem entende a outra.

## Erros Comuns

**Pular direto para o tático.** O erro estruturante, e o mais comum.

**Fazer a análise sem especialistas de domínio.** Produz fronteiras inventadas
pela engenharia.

**Tratar como exercício de documentação.** Um mapa de contextos que não muda
nenhuma decisão não valeu o esforço.

**Definir fronteiras por estrutura organizacional sem verificar o vocabulário.** A
organização é pista, não resposta — e às vezes a organização é que está errada.

**Fazer uma vez e nunca revisar.** O negócio muda, e as fronteiras envelhecem.

**Confundir subdomínio com bounded context.** Problema versus solução.

## Exemplo Real

Uma empresa de gestão de condomínios adotou DDD depois de dois anos de
dificuldade crescente. A equipe começou pelo tático: agregados, repositórios,
objetos de valor.

Seis meses depois, o sistema tinha vocabulário de DDD e os mesmos problemas: toda
mudança atravessava três módulos, e dois times bloqueavam um ao outro
constantemente.

A análise estratégica, feita depois, levou três semanas — duas sessões de *event
storming* com síndicos, administradores e a equipe.

O que ela revelou: o sistema estava dividido por entidade — `Condominio`,
`Unidade`, `Morador`, `Cobranca` — e o negócio operava por três capacidades
distintas com vocabulários próprios.

**Gestão predial** — manutenção, ativos, ordens de serviço. "Unidade" ali é um
espaço físico.

**Financeiro** — rateio, cobrança, inadimplência. "Unidade" é uma fração ideal com
titular e histórico de débito.

**Convivência** — reservas, assembleias, comunicados. "Unidade" é um grupo de
moradores com direito a voto.

Três significados de "unidade", três bounded contexts, e o sistema tinha uma
classe `Unidade` com 60 campos servindo aos três.

A reorganização por contexto levou quatro meses. Os agregados e repositórios já
construídos foram redistribuídos — a maior parte do trabalho tático foi
aproveitada, mas dentro das fronteiras certas.

A conclusão que a equipe registrou: o tático não estava errado. Estava aplicado
sobre uma divisão que a análise estratégica teria corrigido em três semanas, se
tivesse vindo primeiro.

## Conceitos Relacionados

- [Bounded Context](/04-domain-driven-design/bounded-context.md) — a decisão central.
- [Subdomínio](/04-domain-driven-design/subdomain.md) — a divisão do problema.
- [Context Mapping](/04-domain-driven-design/context-mapping.md) — os relacionamentos.
- [DDD Tático](/04-domain-driven-design/tactical-ddd.md) — o que vem depois.
- [Arquitetura Corporativa](/15-enterprise-architecture/index.md) — o mesmo
  raciocínio acima do sistema.

## Exercício Prático

Reúna duas pessoas do negócio e mapeie, numa linha do tempo, os eventos que
acontecem no seu domínio — do início ao fim de um fluxo importante.

Observe onde os eventos se agrupam e onde o vocabulário muda de dono.

Compare os agrupamentos com a estrutura de módulos do sistema. As diferenças são o
resultado.

## Perguntas de Entrevista

- Por que o estratégico deve preceder o tático?
- Que decisões de arquitetura a análise estratégica produz?
- Por que DDD estratégico se paga mesmo em sistemas pequenos?

## Para Aprofundar

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003 — a parte IV.
- Vernon, Vaughn. *Domain-Driven Design Distilled*. Addison-Wesley, 2016.
- Brandolini, Alberto. *EventStorming*, 2013.
