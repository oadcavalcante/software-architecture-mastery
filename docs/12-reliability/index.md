---
id: reliability
title: Confiabilidade
sidebar_position: 0
description: Projetar para o sistema continuar útil quando partes dele falham.
doc_type: index
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor deriva arquitetura de SLO, RTO e RPO declarados e projeta
  contenção de falha em vez de tentar evitá-la.
prerequisites: [distributed-systems]
related: [observability, scalability, cloud-architecture]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-26
---

# Confiabilidade

Confiabilidade não é ausência de falha. É a propriedade de o sistema continuar
útil enquanto partes dele falham.

## O problema desta seção

A meta implícita de muitos times é que nada quebre. É uma meta inatingível e,
pior, improdutiva: leva a investir em prevenção de falhas individuais em vez de
em contenção do efeito delas.

A postura arquitetural correta parte do oposto. Componentes vão falhar. A
pergunta é o que acontece com o resto quando falham, quanto tempo leva para
voltar, e quanto dado se perde no intervalo.

Isso muda a conversa de qualitativa para quantitativa. "O sistema precisa ser
confiável" não é requisito. "99,9% de disponibilidade mensal, RTO de 15 minutos,
RPO de 5 minutos" é — e cada um desses números tem um custo arquitetural
específico que pode ser estimado e negociado.

## O que você vai encontrar aqui

**Vocabulário.** Disponibilidade, confiabilidade, tolerância a falhas e
resiliência. Quatro termos usados como sinônimos que descrevem coisas
diferentes.

**Metas.** SLI, SLO e SLA, e a relação entre eles. SLO é decisão de engenharia;
SLA é decisão comercial com consequência contratual. Confundir os dois é caro
nas duas direções.

**Continuidade.** Redundância, failover, disaster recovery, RTO e RPO. Os dois
últimos são as entradas de que toda a topologia deriva.

**Contenção.** Degradação graciosa, circuit breakers e bulkheads. Como impedir
que a falha de um componente vire falha do sistema.

**Amplificação.** Retry storms — o caso em que o mecanismo de recuperação é a
causa do colapso. É o modo de falha mais contraintuitivo desta seção.

**Verificação.** Chaos engineering. Testar a hipótese de que a contenção
funciona, em vez de assumir.

## Ordem de leitura

Comece por **SLI, SLO e SLA** e por **RTO e RPO**. São as entradas; sem números
declarados, toda decisão desta seção vira preferência.

Leia **retry storms** logo depois de circuit breakers, não separadamente. A
sequência mostra por que retry ingênuo é um problema de confiabilidade e não uma
solução.

**Chaos engineering** por último, e só faz sentido depois de existir contenção
para testar.

## Ao terminar

Você deriva topologia de números declarados em vez de escolher redundância por
sensação de segurança. Consegue apontar, num desenho, os caminhos por onde uma
falha se propaga e onde ela deveria ser contida.

E consegue argumentar que 99,99% não vale a pena para um sistema específico —
com o custo dos dois lados na mesa.

## Relacionado

[Observabilidade](../13-observability/index.md), porque não se opera o que não
se enxerga.
