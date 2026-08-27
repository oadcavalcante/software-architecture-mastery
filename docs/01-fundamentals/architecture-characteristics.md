---
id: architecture-characteristics
title: Características Arquiteturais
sidebar_position: 19
description: A formulação que trata atributos de qualidade como o que a arquitetura precisa suportar explicitamente.
doc_type: foundation
level: 1
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor seleciona um número pequeno de características
  arquiteturais dirigentes e sabe por que a lista precisa ser curta.
prerequisites: [quality-attributes]
related: [architecture-principles, architecture-as-decisions]
canonical_for: [características arquiteturais, architecture characteristics]
content_version: 1
last_reviewed: 2026-08-26
---

# Características Arquiteturais

## Visão Geral

Características arquiteturais são os
[atributos de qualidade](quality-attributes.md) que a arquitetura precisa
suportar explicitamente — as que efetivamente dirigem decisões estruturais.

A distinção em relação ao termo mais antigo não é de significado, e sim de uso:
"atributos de qualidade" é uma taxonomia; "características arquiteturais" é uma
seleção. A pergunta muda de "quais atributos existem?" para **"quais três ou
quatro decidem esta arquitetura?"**.

## O Problema

Um sistema tem dezenas de atributos de qualidade relevantes. Uma arquitetura não
consegue ser dirigida por dezenas de coisas.

Times que tentam produzem um documento de arquitetura que lista quinze
características como importantes, e uma arquitetura que na prática foi decidida
por duas ou três — sem que ninguém tenha declarado quais.

A consequência é que as decisões subsequentes perdem critério. Diante de uma
escolha entre duas opções, não há a que perguntar. Cada pessoa aplica a
característica que considera mais relevante, e o sistema fica internamente
inconsistente: uma parte otimizada para latência, outra para custo, sem que essa
divergência tenha sido decidida.

## Conceitos Centrais

### Poucas, explícitas, priorizadas

A prática que funciona: **escolher no máximo três a cinco características
dirigentes, ordenadas**.

Três a cinco não é um número arbitrário. É aproximadamente o que um time consegue
manter presente ao decidir, e é pequeno o suficiente para forçar a escolha —
que é o ponto. Uma lista de quinze não obriga ninguém a abrir mão de nada.

A ordenação importa mais que a lista. Quando duas características entram em
conflito — e vão entrar — a ordem é o que resolve sem nova reunião.

### Explícitas e implícitas

Algumas características são declaradas pelo negócio: disponibilidade, latência,
capacidade.

Outras são implícitas e ninguém as pede porque são pressupostas: segurança,
manutenibilidade, capacidade de ser implantado. Não pedidas não significa não
exigidas — significa que ninguém vai avisar quando faltarem, até que faltem.

Um levantamento que só captura as explícitas produz sistemas rápidos e
indisponíveis, ou disponíveis e impossíveis de mudar.

### Toda característica extra tem custo

Cada característica adicionada à lista restringe o espaço de solução e adiciona
complexidade.

Isso significa que a pergunta ao considerar incluir mais uma não é "isso é
desejável?" — quase tudo é. É **"o que estou disposto a sacrificar por isso?"**.
Se a resposta for "nada", a característica não entra na lista; ela é um desejo.

### Características mudam com o contexto

As características dirigentes de um sistema no primeiro ano — velocidade de
mudança, custo baixo — raramente são as do quinto ano — disponibilidade,
manutenibilidade.

Revisar a lista periodicamente é o que impede que a arquitetura continue
otimizada para o que importava antes. Ver
[evolução da arquitetura](architecture-evolution.md).

## Por Que Isso Importa

**Porque é o critério que resolve decisões subsequentes.** Com três
características ordenadas, uma escolha entre duas opções tem resposta: qual
serve melhor à primeira? Sem elas, a escolha vira preferência.

**Porque a seleção é decisão de negócio, e a lista curta força a conversa.**
Perguntar "o que é mais importante: latência ou custo?" produz uma resposta útil.
Perguntar "quais atributos importam?" produz uma lista de tudo.

**Porque torna a arquitetura avaliável.** Uma arquitetura pode ser julgada contra
três características declaradas. Contra quinze, sempre atende a algumas e falha
em outras, e não há veredito.

## Erros Comuns

**Listar demais.** O erro central. Quinze características priorizadas é zero
características priorizadas.

**Não ordenar.** Uma lista sem ordem não resolve conflito, e conflito é
exatamente onde a lista precisaria servir.

**Esquecer as implícitas.** Segurança e manutenibilidade quase nunca são pedidas
e quase sempre são exigidas.

**Confundir com requisitos funcionais.** "Processar pagamentos" não é
característica arquitetural; é o que o sistema faz. "Processar pagamentos com
garantia de não duplicação sob falha" contém uma característica.

**Definir uma vez e nunca revisar.** A lista envelhece junto com o contexto de
negócio, e o desalinhamento é silencioso.

**Escolher características que ninguém mede.** Uma característica sem
instrumentação é aspiracional, e degrada sem aviso.

## Exemplo Real

Duas arquiteturas na mesma empresa, decididas com listas diferentes.

**Serviço de autenticação.** Características dirigentes, em ordem:
disponibilidade, segurança, latência. Consequências diretas: replicação
multi-zona, ausência de estado local, cache agressivo de chaves públicas, e
recusa deliberada de um recurso de auditoria em tempo real que teria adicionado
uma dependência síncrona.

**Serviço de relatórios gerenciais.** Características dirigentes: custo,
manutenibilidade, correção. Consequências: instância única, processamento em
lote noturno, sem redundância, e uso de um serviço gerenciado mais caro por
transação mas muito mais barato de operar.

As duas arquiteturas não compartilham nenhuma decisão estrutural. Nenhuma das
duas é melhor — cada uma responde à sua lista.

O que vale notar: o segundo time propôs inicialmente replicação multi-zona, "por
consistência com o padrão da empresa". A pergunta que encerrou a discussão foi
qual característica isso servia — e a resposta, disponibilidade, não estava na
lista dele. O relatório podia atrasar um dia sem consequência.

A lista curta não impediu uma decisão ruim por autoridade. Impediu por critério.

## Conceitos Relacionados

- [Atributos de Qualidade](quality-attributes.md) — a taxonomia de onde as
  características são selecionadas.
- [Princípios de Arquitetura](architecture-principles.md) — como as
  características viram orientação para decisões distribuídas.
- [Trade-offs](../20-trade-offs/index.md) — o que acontece quando duas
  características entram em conflito.

## Exercício Prático

Escolha um sistema em que você trabalha e escreva as três características
arquiteturais dirigentes, ordenadas.

Depois, encontre três decisões estruturais do sistema e verifique: cada uma é
consistente com a ordem que você escreveu?

Onde não for, ou a decisão está errada ou a lista não é a real. Ambas as
descobertas são valiosas.

## Perguntas de Entrevista

- Quantas características arquiteturais um sistema deve ter, e por quê?
- Como você decide a ordem entre elas?
- Que características são exigidas mesmo quando ninguém as pede?

## Para Aprofundar

- Ford, Neal; Richards, Mark. *Fundamentals of Software Architecture*. O'Reilly,
  2020 — a formulação e a prática de seleção.
- Bass, Len; Clements, Paul; Kazman, Rick. *Software Architecture in Practice*.
  4ª ed., 2021 — cenários de atributo de qualidade.
