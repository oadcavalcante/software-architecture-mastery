---
id: observability
title: Observabilidade
sidebar_position: 0
description: Conseguir responder perguntas que você não antecipou — a diferença entre monitoramento e observabilidade.
doc_type: index
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor instrumenta sistemas para responder perguntas novas, não
  apenas para exibir métricas conhecidas.
prerequisites: [distributed-systems]
related: [reliability, scalability, devops-and-platform]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-28
---

# Nível 05 — Observabilidade

Esta seção trata de saber o que está acontecendo dentro do sistema.

## O problema desta seção

Monitoramento responde perguntas que você antecipou: a CPU está alta? A taxa de erro
subiu? O disco está cheio?

Observabilidade é a capacidade de responder perguntas que você **não** antecipou: por
que essas 200 requisições específicas, de clientes de um plano específico, ficaram
lentas às 14h de ontem?

A distinção não é semântica. Ela decide se, durante um incidente, você consegue
investigar — ou apenas confirmar que algo está errado.

E ela importa porque os incidentes que causam dano são justamente os não antecipados.
Ver [resiliência](/12-reliability/resilience.md). Se todos os cenários fossem
previstos, eles teriam sido tratados por mecanismo.

O segundo problema é econômico. Telemetria custa — coleta, transporte, armazenamento,
consulta — e o custo cresce mais rápido que o sistema. Boa parte do que é coletado
nunca é consultado, e a redução ingênua remove exatamente o que faz falta na
investigação.

## O que você vai encontrar aqui

**Os três sinais.** Logs, métricas e traces — o que cada um responde bem, o que
responde mal, e por que os três são necessários.

**Rastreamento distribuído.** Como seguir uma requisição através de dezenas de
serviços, com propagação de contexto e amostragem.

**Identificadores de correlação.** A técnica mais barata da seção e o pré-requisito de
quase tudo.

**Telemetria.** Instrumentação, coleta e o custo — tratado como decisão de arquitetura,
porque é.

**Alertas.** O que merece acordar alguém, e por que a maior parte dos alertas
existentes não merece.

**Painéis.** Para que servem, e por que o painel que serve à investigação é diferente
do que serve ao acompanhamento.

**Sinais dourados.** As quatro medidas que cobrem a maior parte dos problemas.

**Conceitos de SRE.** O vocabulário e as práticas que organizam operação em escala.

**Depurabilidade.** A propriedade que se projeta no sistema, não na ferramenta.

## Ordem de leitura

Comece por **identificadores de correlação**. Sem eles, os demais sinais não se
conectam, e a investigação em sistema distribuído fica inviável.

Depois **sinais dourados**, que dão um ponto de partida concreto para instrumentar.

**Logs**, **métricas** e **traces** formam um bloco. Leia os três antes de decidir onde
investir.

**Alertas** merece atenção especial se o seu time tem sobreaviso — é o documento que
mais reduz sofrimento operacional.

Deixe **depurabilidade** para o fim. Ele reorganiza tudo o que veio antes numa
propriedade de projeto.

## Ao terminar

Você instrumenta para responder perguntas que ainda não foram feitas, em vez de para
preencher painéis.

Consegue seguir uma requisição através do sistema e dizer onde ela gastou tempo — sem
correlacionar registros à mão.

Reconhece que a maior parte dos alertas de um sistema típico não deveria existir, e
sabe qual critério aplicar.

E entende que observabilidade é uma propriedade do **sistema**, não da ferramenta: um
sistema que não emite contexto não fica observável porque alguém comprou uma
plataforma.

## Continua em

[DevOps e Plataforma](/14-devops-and-platform/index.md), onde a operação deixa de ser
reativa e passa a ser desenhada.
