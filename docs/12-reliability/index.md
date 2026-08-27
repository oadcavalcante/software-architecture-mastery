---
id: reliability
title: Confiabilidade
sidebar_position: 0
description: Continuar funcionando quando as partes falham — com um alvo definido, não com "o máximo possível".
doc_type: index
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor define alvos de confiabilidade com o negócio e projeta para
  contenção de falha, não para ausência dela.
prerequisites: [distributed-systems]
related: [scalability, cloud-architecture, observability]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-28
---

# Nível 05 — Confiabilidade

Esta seção trata de continuar funcionando quando as partes falham — porque elas falham.

## O problema desta seção

A pergunta errada é "como evitamos falhas?". Elas não são evitáveis: hardware quebra,
rede particiona, dependências ficam fora, implantações introduzem defeitos, pessoas
erram.

A pergunta certa é: **quando algo falhar, o que acontece?**

Isso muda o alvo do trabalho. Em vez de perseguir ausência de falha — que não existe —
o esforço vai para **contenção**: que a falha de uma parte não vire falha do todo, que
a degradação seja parcial em vez de total, e que a recuperação seja rápida.

O segundo problema é de definição. "Máxima confiabilidade possível" não é um alvo — é
uma intenção sem custo associado. Cada nove adicional custa desproporcionalmente mais,
e a decisão de quantos noves perseguir é do negócio, com o preço na mesa.

Sem um alvo numérico acordado, duas coisas ruins acontecem: investe-se demais onde não
importa, e de menos onde importa. E ninguém consegue dizer se o sistema está bom.

## O que você vai encontrar aqui

**As medidas.** Métricas de disponibilidade e os fundamentos de confiabilidade — o que
os números significam e o que eles escondem.

**Os alvos.** SLI, SLO e SLA — três coisas frequentemente confundidas, com o orçamento
de erro como o mecanismo que transforma um alvo em decisão operacional.

**As técnicas de tolerância.** Tolerância a falhas, resiliência, redundância e
failover. Redundância recebe atenção específica ao que a anula: correlação.

**Os padrões de contenção.** Circuit breaker, bulkhead e degradação graciosa. São eles
que impedem que uma falha localizada se propague.

**O modo de falha que a própria proteção causa.** Tempestades de retentativa — o caso
em que a defesa amplifica o problema.

**Recuperação.** Planejamento de recuperação de desastre, com RTO e RPO tratados como
o que são: decisões de negócio com preço.

**Verificação.** Engenharia do caos — a prática que responde "isso realmente funciona?"
antes do incidente.

## Ordem de leitura

Comece por **SLI, SLO e SLA**, nessa ordem. Sem alvo definido, todo o resto é esforço
sem critério de parada.

Depois **degradação graciosa**, que é a técnica de maior retorno e a menos aplicada.

**Circuit breaker**, **bulkhead** e **tempestades de retentativa** formam um bloco e
devem ser lidos juntos — os dois primeiros existem por causa do terceiro.

Deixe **engenharia do caos** para o fim, e leia-a como verificação do que os anteriores
prometeram, não como prática independente.

## Ao terminar

Você define alvos de confiabilidade em números acordados com o negócio, e sabe o que
cada nove adicional custa.

Consegue apontar, num desenho, onde uma falha se propaga e onde ela é contida — e
adicionar contenção onde falta.

Reconhece que redundância sem independência não é redundância, e que um plano de
recuperação nunca exercitado não é um plano.

E entende que a confiabilidade de um sistema é verificada, não presumida — o que
significa provocar falhas de propósito, em janela controlada, antes que elas aconteçam
sozinhas.

## Continua em

[Observabilidade](../13-observability/index.md), onde a pergunta passa a ser como você
sabe o que está acontecendo enquanto acontece.
