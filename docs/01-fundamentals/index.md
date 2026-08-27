---
id: fundamentals
title: Fundamentos
sidebar_position: 0
description: Os conceitos que precisam existir antes de qualquer conversa séria sobre arquitetura.
doc_type: index
level: 1
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor sabe dizer o que arquitetura decide, o que ela não
  decide, e por que uma decisão arquitetural é diferente de uma decisão de
  implementação.
prerequisites: []
related: [software-design]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-26
---

# Nível 01 — Fundamentos

Esta é a seção que torna o resto do percurso possível. Ela não ensina a projetar
sistemas; ensina o vocabulário e os critérios com que sistemas são julgados.

## O problema desta seção

A maior parte do material sobre arquitetura começa apresentando soluções:
camadas, microsserviços, filas, caches. Isso produz um profissional que reconhece
formas mas não sabe escolher entre elas, porque nunca aprendeu a articular o que
está tentando otimizar.

Arquitetura não é um catálogo de estruturas. É a atividade de decidir sob
restrição, sabendo que toda decisão fecha portas. Para decidir bem, é preciso
antes conseguir nomear com precisão o que está em jogo: o que o sistema precisa
fazer, quão bem precisa fazer, o que não pode ser mudado, e o que a organização
consegue sustentar.

Sem esse vocabulário, discussões arquiteturais viram disputa de preferência
estética. Com ele, viram análise.

## O que você vai encontrar aqui

**O que arquitetura é.** A distinção entre arquitetura, design e implementação —
e por que a fronteira entre elas é contextual, não absoluta. Arquitetura como
conjunto de decisões, não como conjunto de diagramas.

**O que o sistema precisa fazer.** Requisitos funcionais, requisitos
não-funcionais, atributos de qualidade e restrições. Por que confundir esses
quatro é a origem de boa parte das arquiteturas erradas.

**As propriedades estruturais.** Acoplamento, coesão, modularidade, abstração e
separação de responsabilidades. Estas são as métricas com que se avalia se uma
estrutura vai aguentar mudança.

**O custo de estar errado.** Complexidade, gestão de dependências e dívida
técnica — o que se acumula quando decisões são adiadas ou tomadas sem critério.

**O contexto.** Contexto de negócio, espaço do problema e espaço da solução.
Arquitetura que ignora o negócio otimiza a coisa errada com grande competência.

**A dimensão temporal.** Princípios de arquitetura, características arquiteturais
e evolução — porque nenhuma decisão é tomada uma vez só.

## Ordem de leitura

Leia na ordem do sidebar. Esta é a única seção do percurso em que a sequência
importa de verdade, porque cada conceito é usado para definir o próximo.

Se você já trabalha com sistemas há alguns anos, a tentação é pular. Resista a
ela em três tópicos especificamente: **atributos de qualidade**, **restrições** e
**arquitetura como conjunto de decisões**. São os que mais frequentemente estão
presentes como intuição e ausentes como vocabulário — e vocabulário ausente é o
que impede defender uma decisão diante de quem discorda.

## Ao terminar

Você consegue pegar uma descrição de sistema e separar, sem ambiguidade, o que é
requisito funcional, o que é atributo de qualidade e o que é restrição. Consegue
apontar onde há acoplamento desnecessário e argumentar por que ele custa caro.
Consegue explicar por que uma decisão é arquitetural e outra não.

Mais importante: você para de perguntar "qual é a arquitetura certa?" e passa a
perguntar "certa para quê, sob quais restrições?".

## Erros que esta seção previne

- Tratar atributos de qualidade como desejos vagos em vez de números negociados.
- Confundir restrição com preferência, e negociar o que não é negociável.
- Chamar de arquitetura o que é convenção de código, e vice-versa.
- Otimizar acoplamento sem considerar o custo da duplicação que o substitui.
- Discutir tecnologia antes de ter estabelecido o que precisa ser verdade.

## Continua em

[Nível 02 — Design de Software](../02-software-design/index.md), onde esses
conceitos deixam de ser vocabulário e passam a ser critério de estruturação
de código.
