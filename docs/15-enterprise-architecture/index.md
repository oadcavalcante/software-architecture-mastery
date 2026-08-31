---
id: enterprise-architecture
title: Arquitetura Corporativa
sidebar_position: 0
description: Decisões que atravessam sistemas e times — e por que a disciplina tem a reputação que tem.
doc_type: index
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor exerce arquitetura corporativa como habilitação de decisões,
  não como controle sobre elas.
prerequisites: [devops-and-platform]
related: [legacy-modernization, architecture-governance, architecture-leadership]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-28
---

# Nível 06 — Arquitetura Corporativa

Esta seção trata das decisões que atravessam sistemas, times e anos.

## O problema desta seção

Arquitetura corporativa tem má reputação entre engenheiros, e parte dela é merecida.

A caricatura existe porque o padrão existe: arquitetos distantes do código produzindo
diagramas que ninguém consulta, comitês que aprovam o que já foi construído, padrões
escritos por quem não os vai usar, e um estado-alvo que envelhece antes de ser
alcançado.

Este material parte de reconhecer isso. A disciplina resolve um problema real — decisões
que nenhum time isolado consegue tomar bem —, e a forma tradicional de exercê-la
frequentemente cria mais atrito do que valor.

O problema real é este: numa organização com dezenas de sistemas e times, algumas
decisões têm alcance maior que qualquer time. Qual sistema é dono de qual dado. Como os
sistemas se integram. O que é comum e o que é específico. Onde investir e o que
aposentar.

Sem alguém olhando para o conjunto, cada time otimiza localmente — e o resultado
agregado é pior que a soma das partes: dados duplicados em seis sistemas, quatro
integrações fazendo a mesma coisa de formas diferentes, e ninguém capaz de responder o
que acontece se aquele sistema sair do ar.

## O que você vai encontrar aqui

**Os fundamentos e as camadas.** O que a disciplina é, e as quatro camadas —
negócio, aplicação, dados, tecnologia — que organizam a conversa.

**Capacidades de negócio.** O mapa que permite discutir sistemas sem falar de sistemas,
e que é a ferramenta mais útil da seção.

**Portfólio e paisagem.** O inventário do que existe: aplicações, integrações, e o que
elas custam.

**Princípios e padrões.** As regras que orientam decisões distribuídas — e por que a
maioria delas não orienta nada.

**Governança e revisão.** Como decisões atravessam a organização sem virar comitê que
aprova o inevitável.

**Radar tecnológico.** O mecanismo que substitui a lista de tecnologias aprovadas.

**Estratégia e estados.** Estado atual, estado-alvo, arquitetura de transição e roteiro —
com atenção especial ao terceiro, que é o que costuma faltar.

**Níveis de arquitetura.** Como as decisões se distribuem entre corporativo, de solução
e de sistema.

## Ordem de leitura

Comece por **fundamentos** e **níveis de arquitetura** — eles delimitam o que pertence a
esta seção e o que pertence às anteriores.

Depois **capacidades de negócio**, que é a ferramenta de maior retorno prático.

**Estado atual**, **estado-alvo** e **arquitetura de transição** formam um bloco e devem
ser lidos em sequência. O terceiro é o que transforma a intenção em caminho.

Deixe **governança** e **revisão de arquitetura** para o fim, e leia-os como desenho de
processo, não como estrutura de poder.

## Ao terminar

Você distingue as decisões que pertencem ao time das que atravessam a organização — e
sabe que empurrar as primeiras para cima é a causa mais comum de gargalo.

Consegue mapear capacidades de negócio e usar esse mapa para discutir investimento,
duplicação e risco sem que a conversa vire disputa entre sistemas.

Reconhece que um estado-alvo sem arquitetura de transição é uma aspiração, e que um
roteiro sem entrega intermediária não sobrevive à primeira mudança de prioridade.

E entende que a autoridade que sustenta esse trabalho vem de utilidade, não de posição —
um arquiteto corporativo que só pode bloquear tem uma ferramenta e nenhuma influência.

## Continua em

[Modernização de Legado](/16-legacy-modernization/index.md), onde o estado atual
encontra a realidade do que já existe.
