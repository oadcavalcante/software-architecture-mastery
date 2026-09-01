---
id: 05-async-processing
title: "Exercício 05 — Introduzir Processamento Assíncrono"
sidebar_position: 2
description: Tirar a chamada externa do caminho síncrono é fácil; o que ela deixa para trás é trabalho de produto.
doc_type: exercise
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor desenha um fluxo assíncrono com o estado intermediário e as
  consequências de produto explicitadas.
prerequisites: [04-scaling-ecommerce]
related: [messaging, delivery-guarantees, idempotency, eventual-consistency]
canonical_for: []
content_version: 2
last_reviewed: 2026-08-29
---

# Exercício 05 — Introduzir Processamento Assíncrono

:::info Continuação

Este exercício executa a primeira correção que você identificou no
[exercício 04](/06-distributed-systems/exercises/04-scaling-ecommerce.md): tirar a chamada ao adquirente de dentro da transação.

:::

## Contexto

A decisão está tomada: a autorização de pagamento sai do caminho síncrono da finalização de
compra.

O ganho é conhecido — a disponibilidade do checkout deixa de depender dos 99,5% do adquirente, o
p95 volta para a faixa de centenas de milissegundos, e as conexões param de ficar presas.

O que ninguém dimensionou ainda é o custo.

## Requisitos

O cliente finaliza a compra e recebe resposta imediata. A autorização acontece em seguida. E:

```text
o cliente precisa saber o que aconteceu com o pedido dele
o pedido recusado precisa liberar o estoque reservado
a operação não pode separar um pedido não autorizado
o cliente não pode ser cobrado duas vezes se repetir a compra
o pedido não pode ficar em estado intermediário indefinidamente
```

## Restrições

```text
adquirente        API síncrona, sem idempotência garantida;
                  responde entre 400 ms e 3 s, com tempo esgotado
                  em ~0,2% das chamadas
reserva de
  estoque         expira em 30 minutos, do exercício 03
aplicativo        versões de até 14 meses em campo; a tela de
                  confirmação atual mostra "pedido confirmado"
                  imediatamente
atendimento       equipe de 40 pessoas, sem treinamento no
                  fluxo novo
volume            ~140 pedidos/s no pico
```

## Sua Tarefa

Produza, em até 90 minutos:

1. O **fluxo novo**, passo a passo, do carrinho até o pedido autorizado.
2. Os **estados** do pedido, e as transições permitidas entre eles.
3. O que o cliente **vê** em cada estado, e quando ele é avisado.
4. O que acontece com a **reserva de estoque** em cada desfecho.
5. A lista de trabalho **fora de engenharia** que esta mudança gera.

O item 5 costuma ser esquecido e é metade do custo.

## Perguntas que Você Deveria Fazer

```text
"pedido confirmado" na tela atual significa o quê, agora?
quanto tempo o cliente tolera esperar pela confirmação real?
o que acontece se ele fechar o aplicativo antes?
se a autorização demora 4 horas, o que ele vê?
a reserva expira em 30 minutos — e se a autorização levar 40?
o cliente pode tentar de novo? o que impede a cobrança dupla?
o atendimento vai receber qual tipo de chamado novo?
```

A primeira é a que a maioria não faz, e ela é uma mudança de contrato com o cliente.

## Critérios de Avaliação

Sua resposta está boa se:

- **A gravação do pedido e a emissão do evento estão na mesma transação.** Se elas puderem
  divergir, você criou pedidos sem autorização e autorizações sem pedido.
- **A chave de idempotência é do cliente, e o identificador de requisição ao adquirente é
  outro.** Confundi-los impede a retentativa legítima. Ver
  [idempotência](/06-distributed-systems/idempotency.md).
- **A reserva de estoque tem prazo maior que o prazo máximo de autorização**, ou você desenhou o
  que acontece quando ela expira antes.
- **Você listou o trabalho de produto**: tela de acompanhamento, texto novo, notificação,
  procedimento de atendimento, e o que dizer ao cliente cujo pedido foi recusado depois de ele
  ter visto "confirmado".
- **Existe prazo máximo para o estado intermediário**, com o que acontece ao vencer.

Sua resposta é fraca se ela descreve uma fila e um consumidor e termina aí.

## Discussão

:::details Abra depois de tentar

**A parte técnica é a menor.** O fluxo é conhecido:

```text
1. valida carrinho e reserva estoque
2. grava o pedido como "em autorização" e enfileira o evento,
   na mesma transação
3. responde ao cliente com o número do pedido
4. consumidor autoriza junto ao adquirente
5a. autorizado    → pedido "confirmado", cliente notificado
5b. recusado      → pedido "recusado", reserva liberada,
                    cliente notificado com o motivo
5c. sem resposta  → pedido "em verificação" — ver exercício 06
```

O passo 2 é o que impede pedido sem evento e evento sem pedido. Sem ele, a fila e o banco
divergem sob falha.

**O passo 5c é onde o exercício 06 começa.** Se você o resolveu aqui assumindo recusa, releia:
0,2% de 48 mil pedidos por dia são 96 casos diários em que você não sabe se cobrou.

**A parte que custa é a de produto:**

```text
tela                "pedido confirmado" vira "pedido recebido",
                    com estado visível e prazo declarado
notificação         canal, texto, e o que fazer se o cliente
                    não abrir
recusa tardia       o cliente viu "recebido" e agora recebe
                    "recusado"; qual o texto, e o que ele faz
atendimento         categoria nova de chamado, com procedimento
                    e treinamento para 40 pessoas
aplicativo antigo   versões de 14 meses mostram "confirmado";
                    elas continuam em campo e você não controla
                    a atualização
```

A última linha é a mais desconfortável e a mais comum em produtos móveis: parte da sua base vai
ver uma mensagem que deixou de ser verdadeira, e você não pode corrigi-la. As saídas são
degradar o comportamento para versões antigas — mantê-las no fluxo síncrono, por exemplo — ou
forçar atualização, que tem custo próprio.

**A reserva de 30 minutos** contra uma autorização que raramente passa de 3 segundos parece
folgada, e não é: quando o adquirente degrada, a fila acumula, e a autorização pode levar horas.
Nesse cenário, a reserva expira antes, e o pedido é autorizado sobre estoque que já foi vendido
para outra pessoa.

A correção: ou a reserva é estendida enquanto o pedido está em autorização, ou a autorização
verifica a reserva antes de confirmar. A segunda é mais simples e cria um desfecho novo —
"autorizado, sem estoque" — que precisa de tratamento e de estorno.

**O que quase todo mundo erra:** tratar prazo do estado intermediário como detalhe. Um pedido
"em autorização" há três dias é um cliente com dinheiro possivelmente bloqueado e nenhuma
informação. O prazo precisa existir, ser curto, e ter ação ao vencer.

:::

## Conceitos Relacionados

- [Exercício 04](/06-distributed-systems/exercises/04-scaling-ecommerce.md) e [Exercício 06](/06-distributed-systems/exercises/06-partial-failure.md).
- [Mensageria](/06-distributed-systems/messaging.md) e [Garantias de Entrega](/06-distributed-systems/delivery-guarantees.md).
- [Idempotência](/06-distributed-systems/idempotency.md).
- [Síncrono vs. Assíncrono](/20-trade-offs/sync-vs-async.md).
