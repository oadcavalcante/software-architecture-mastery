---
id: 03-scaling-ecommerce
title: "Exercício 03 — Escalar o E-commerce"
sidebar_position: 1
description: O mesmo sistema, 40 vezes maior — e a decisão do exercício 02 vira a restrição.
doc_type: exercise
level: 4
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor identifica qual recurso satura primeiro e distingue decisão errada de
  decisão com prazo de validade vencido.
prerequisites: [02-ecommerce-backend]
related: [latency, availability, partitioning, hotspots]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-29
---

# Exercício 03 — Escalar o E-commerce

:::info Continuação

Este exercício usa o sistema que você projetou no
[exercício 02](/05-system-design/exercises/02-ecommerce-backend.md). Releia as três
decisões que você registrou como difíceis de reverter antes de continuar.

:::

## Contexto

Passaram-se dois anos. A **Ponta** cresceu mais do que a previsão:

```text
                            exercício 02        hoje
pedidos/dia                 ~1 200              ~48 000
pico de campanha            ~4 000/dia          ~190 000/dia
pico instantâneo            —                   ~140/s
catálogo                    22 mil SKUs         310 mil SKUs
visitas/dia                 —                   ~2,4 milhões
equipe                      6 engenheiros       31 engenheiros
```

O sistema é o mesmo. Ele funciona — e três coisas começaram a aparecer:

```text
p95 da finalização de compra          de 900 ms para 4,2 s
indisponibilidade acumulada, 12 meses 26 horas
                                      (78% durante instabilidade
                                      do adquirente)
vendas perdidas em campanha por
  esgotamento de conexões do banco    3 episódios, ~R$ 2,1 milhões
```

## Requisitos

Os mesmos do exercício 02. Nenhuma funcionalidade nova.

## Restrições

```text
sem janela         a loja opera 24×7; não há período de parada
prazo              a próxima campanha grande é em cinco meses
equipe             31 engenheiros, mas apenas 4 com experiência
                   operacional em sistemas distribuídos
orçamento          aprovado, e o custo por pedido não pode subir
                   mais de 15%
compatibilidade    o aplicativo móvel em campo tem versões de até
                   14 meses atrás
```

## Sua Tarefa

Produza, em até 90 minutos:

1. **Qual recurso satura primeiro**, com o raciocínio que leva até ele.
2. **O que satura depois** de você corrigir o primeiro. E depois disso.
3. As correções, **na ordem em que você as faria**, com o gatilho de cada uma.
4. **Quais das suas decisões do exercício 02** você mudaria hoje — e quais você manteria.
5. O que você **não** vai fazer agora, e o número que faria você mudar de ideia.

O item 4 é o coração deste exercício.

## Perguntas que Você Deveria Fazer

```text
140 pedidos/s no pico. quantas leituras por segundo?
qual a razão entre leitura e escrita?
o p95 de 4,2 s é do nosso código ou da espera pelo adquirente?
as 26 horas foram do nosso sistema ou propagadas?
o esgotamento de conexões foi por volume de pedidos ou por
  conexões presas esperando resposta externa?
o conjunto quente do catálogo cabe em memória?
```

A quinta é a que resolve o exercício. As três medições — latência, indisponibilidade e conexões
— apontam todas para o mesmo lugar, e ele não é o volume.

## Critérios de Avaliação

Sua resposta está boa se:

- **Você identificou que o gargalo é a chamada síncrona ao adquirente**, não o volume. Os três
  sintomas convergem: latência que é espera, indisponibilidade que é propagada, e conexões
  presas.
- **Você calculou a razão leitura/escrita.** 2,4 milhões de visitas contra 48 mil pedidos é
  cerca de 50 para 1 apenas em pedidos; contando navegação, muito mais. Isso decide que a
  correção de leitura é cache, não particionamento.
- **Você não propôs particionar o banco.** 140 escritas por segundo cabem com folga; particionar
  resolveria um problema que não existe e criaria transação distribuída na operação central.
- **Você reconheceu que a decisão do exercício 02 não foi erro.** Ela foi correta para 1.200
  pedidos/dia e venceu. Tratá-la como erro leva a conclusões erradas sobre como decidir.
- **Você declarou o que não vai fazer**, com o número que mudaria a decisão.

Sua resposta é fraca se ela começa por "vamos migrar para microsserviços" sem que nenhum sintoma
aponte para acoplamento de implantação.

## Discussão

:::details Abra depois de tentar

**Os três sintomas são um sintoma.** A chamada síncrona ao adquirente, dentro da transação, está
causando os três:

```text
latência         o p95 de 4,2 s é dominado pela espera; o tempo
                 no seu código não mudou
disponibilidade  99,5% do adquirente × o resto ≈ o que você
                 observou; 78% das quedas eram dele
conexões         cada pedido segura uma conexão de banco enquanto
                 espera o adquirente; em campanha, o conjunto
                 esgota — e o banco para de atender inclusive
                 quem só está navegando
```

O terceiro é o mais instrutivo e o menos óbvio: a transação aberta durante a chamada externa
transforma uma dependência lenta em uma queda total. Ver
[timeouts](/06-distributed-systems/timeouts.md) e [falha parcial](/06-distributed-systems/partial-failure.md).

**A correção, na ordem:**

```text
1. tirar a chamada externa de dentro da transação
   → resolve o esgotamento de conexões; custa dias
2. prazo agressivo e disjuntor no adquirente
   → resolve a propagação de indisponibilidade parcial
3. cache no catálogo e na vitrine
   → resolve a leitura, que é 50× a escrita
4. réplicas de leitura
   → só depois do cache, e só se o acerto não bastar
```

Nada de particionar. Nada de dividir em serviços. As quatro correções mantêm a arquitetura e
mudam onde a espera acontece.

**O que você não vai fazer, e o gatilho:**

```text
particionar a escrita         quando passar de ~3 000 pedidos/s
                              sustentados
dividir em serviços           quando times diferentes precisarem
                              implantar independentemente, e a fila
                              de implantação for medida
multirregião                  exercício 06
```

**A decisão do exercício 02 não foi erro.** Ela foi correta para 1.200 pedidos por dia, e o
enunciado daquele exercício dizia sete meses de prazo e seis pessoas sem plataforma. Uma
arquitetura assíncrona ali teria custado o prazo e provavelmente a data comercial.

O que faltou não foi a decisão — foi **registrar o gatilho**. Se o ADR do exercício 02 tivesse
dito "reavaliar quando o pico passar de 20 pedidos/s ou quando a indisponibilidade propagada
passar de 4 h/ano", a correção teria começado antes dos três episódios de campanha.

Essa é a diferença entre uma decisão com prazo de validade e uma decisão que venceu sem que
ninguém percebesse. Ver
[alternativas em ADR](/18-architecture-decisions/adr-alternatives.md).

**O item 1 da correção é o exercício 04.** Tirar a chamada de dentro da transação parece uma
mudança técnica pequena e não é: ela cria estado intermediário, e estado intermediário é
trabalho de produto.

:::

## Conceitos Relacionados

- [Exercício 02](/05-system-design/exercises/02-ecommerce-backend.md).
- [Timeouts](/06-distributed-systems/timeouts.md) e [Falha Parcial](/06-distributed-systems/partial-failure.md).
- [Disponibilidade](/06-distributed-systems/availability.md).
- [Identificação de Gargalo](/22-system-design-interviews/bottleneck-identification.md).
