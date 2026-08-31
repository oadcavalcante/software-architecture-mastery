---
id: 07-multi-region
title: "Exercício 07 — Disponibilidade Multi-região"
sidebar_position: 1
description: A consistência forte escolhida no exercício 02 agora custa latência em toda escrita — e a conta é diária.
doc_type: exercise
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor decide o modelo de replicação por operação e reconhece o custo diário
  da coordenação entre regiões.
prerequisites: [06-partial-failure]
related: [disaster-recovery-planning, graceful-degradation, availability, pacelc]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-29
---

# Exercício 07 — Disponibilidade Multi-região

:::info Continuação e último do arco

Este é o último exercício sobre o sistema que você projetou no
[exercício 02](/05-system-design/exercises/03-ecommerce-backend.md). A decisão que ele
testa é a mais antiga das três que você registrou lá.

:::

## Contexto

A **Ponta** vai operar no México e na Colômbia. A operação brasileira continua como está.

```text
Brasil       ~48 000 pedidos/dia, região sa-east
México       previsão de ~9 000/dia no primeiro ano
Colômbia     previsão de ~4 000/dia
```

Duas coisas motivam a discussão de região:

**Latência.** O p95 de navegação medido a partir da Cidade do México, contra a região
brasileira, é de 340 ms. Testes de produto indicam queda de conversão perceptível acima de
250 ms.

**Continuidade.** A operação brasileira teve, no último ano, um incidente de 3h40 causado por
falha na região. O requisito contratual com os maiores parceiros passou a exigir plano de
continuidade regional.

## Requisitos

```text
navegação e busca      p95 abaixo de 250 ms na região do cliente
finalização de compra  disponibilidade de 99,95%
estoque                um centro de distribuição por país;
                       não há venda cruzada entre países
pedido                 histórico consultável pelo cliente,
                       de qualquer região
continuidade           a queda de uma região não pode derrubar
                       as outras
regulatório            dado de cliente mexicano tem exigência de
                       residência no país
```

## Restrições

```text
equipe             31 engenheiros, 4 com experiência operacional
                   em sistemas distribuídos
orçamento          o custo de infraestrutura por pedido não pode
                   mais que dobrar
prazo              12 meses até a operação mexicana
sem janela         a operação brasileira não pode parar
modelo atual       banco relacional único, transação local,
                   consistência forte — decisão do exercício 02
```

## Sua Tarefa

Produza, em até 90 minutos:

1. **O que é replicado entre regiões**, e o que não é.
2. Para cada operação, o **modelo de consistência** e a razão.
3. O que acontece quando **uma região cai**, por operação.
4. Quanto a decisão do **exercício 02** está custando hoje, e se você a mudaria.
5. O que você **não** vai fazer, com o gatilho.

## Perguntas que Você Deveria Fazer

```text
o cliente mexicano compra do estoque mexicano — os dois países
  competem por algum recurso compartilhado?
o catálogo é o mesmo nos três países?
o pedido precisa ser visível fora da região onde foi feito?
com que atraso?
o cadastro de cliente é único ou por país?
a exigência de residência de dado impede replicar o quê,
  exatamente?
qual operação de fato precisa de coordenação entre regiões?
```

A primeira e a última decidem o exercício. Se os países não compartilham estoque, a maior parte
do sistema não precisa coordenar nada.

## Critérios de Avaliação

Sua resposta está boa se:

- **Você percebeu que quase nada precisa ser coordenado.** Estoque é por país, pedido é por
  país, cliente é por país por exigência regulatória. Cada região opera quase independente — o
  que é a resposta mais barata e a mais disponível.
- **O catálogo é replicado e o pedido não.** Catálogo é leitura pesada e tolera atraso; pedido é
  escrita local com consulta cruzada rara.
- **A decisão do exercício 02 não precisa mudar.** A consistência forte é local a cada região,
  onde ela é barata. Ela só custaria se você replicasse pedidos entre regiões.
- **Você tratou a residência de dado como restrição de arquitetura**, não como detalhe legal.
- **A queda de uma região é descrita por operação**, não como "temos redundância".

Sua resposta é fraca se ela propõe um banco global com escrita em qualquer região, sem que
nenhum requisito peça isso.

## Discussão

:::details Abra depois de tentar

**A resposta certa é quase nenhuma coordenação**, e chegar nela exige resistir à pergunta errada.

A pergunta errada é "como replicamos o banco entre regiões?". A certa é "o que de fato precisa
ser visto da outra região?".

```text
estoque      por país, sem venda cruzada  → nada a coordenar
pedido       criado e servido na região do cliente
             consulta cruzada é rara      → replicação assíncrona,
                                            atraso de minutos aceitável
cliente      residência exigida no México → não replica; cadastro
                                            por região, com
                                            identificador global
catálogo     mesmo produto, preço por país → replicado, leitura
                                             pesada, atraso de
                                             minutos aceitável
promoção     por país                      → local
```

Nenhuma operação de escrita atravessa região. Isso significa que a consistência forte do
exercício 02 continua sendo **local**, e o custo de coordenação entre regiões é zero.

Se você tivesse desenhado no exercício 02 um modelo com estoque global e venda cruzada, a
resposta aqui seria outra e muito mais cara — cada reserva exigiria coordenação intercontinental,
com ~120 ms por confirmação. A decisão de dois anos atrás está pagando dividendo, e não custo.

**Isso é o ponto do arco inteiro.** A decisão do exercício 02 causou dor no 03, exigiu trabalho
de produto no 04, criou um estado ambíguo no 05 — e aqui ela é gratuita. Decisões arquiteturais
não são boas ou ruins; elas são adequadas a um conjunto de restrições, e as restrições mudam em
direções diferentes.

**A queda de uma região**, por operação:

```text
navegação          serve do cache de borda; degrada para catálogo
                   possivelmente desatualizado
finalização        indisponível naquele país; os outros seguem
consulta de pedido a réplica assíncrona nas outras regiões serve
                   o histórico, com atraso
operação interna   despacho e nota fiscal daquele país param
```

Ninguém tenta atender clientes mexicanos a partir do Brasil durante a queda — o estoque está
fisicamente no México, e vender de lá seria vender o que não pode ser despachado.

**O que não fazer, com gatilho:**

```text
banco global com escrita multirregião
  → só se surgir venda cruzada entre países
replicação síncrona de pedido
  → só se a consulta cruzada virar caminho crítico
região ativa-ativa no Brasil
  → quando a indisponibilidade regional custar mais que
    o dobro do custo de infraestrutura
```

**O que quase todo mundo erra:** tratar multirregião como um problema de banco de dados. Ele é
um problema de fronteira de negócio — e neste enunciado o negócio já respondeu, ao dizer que não
há venda cruzada. A arquitetura só precisou não contrariar isso.

:::

## Conceitos Relacionados

- [Exercício 06](/06-distributed-systems/exercises/06-partial-failure.md).
- [Recuperação de Desastre](/12-reliability/disaster-recovery-planning.md).
- [Degradação Graciosa](/12-reliability/graceful-degradation.md).
- [PACELC](/06-distributed-systems/pacelc.md).
