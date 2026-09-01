---
id: 03-ecommerce-backend
title: "Exercício 03 — Backend de E-commerce"
sidebar_position: 1
description: O sistema que você vai carregar pelos próximos quatro exercícios — e as decisões que vai pagar neles.
doc_type: exercise
level: 3
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor projeta um backend completo sob restrições modestas e registra as
  decisões que os exercícios seguintes vão testar.
prerequisites: [system-decomposition]
related: [service-boundaries, apis, state-management, queues]
canonical_for: []
content_version: 2
last_reviewed: 2026-08-29
---

# Exercício 03 — Backend de E-commerce

:::info Este exercício tem sequência

O sistema que você projetar aqui reaparece nos exercícios **04**, **05**, **06** e **07**, cada
vez sob uma restrição nova. As decisões que você tomar agora não são descartáveis — você vai
conviver com elas.

Registre suas decisões por escrito. Você vai precisar delas.

:::

## Contexto

A **Ponta**, uma loja online de artigos esportivos, vende hoje por um marketplace e quer ter
canal próprio.

```text
faturamento previsto no primeiro ano   R$ 90 milhões
pedidos/dia, previsão                  ~1 200
pico esperado (campanhas)              ~4 000/dia
catálogo                               22 mil SKUs
equipe                                 6 engenheiros, um deles com
                                       plantão
prazo                                  7 meses até a primeira venda
infraestrutura                         nuvem, sem plataforma interna
```

Não há legado. É construção do zero.

## Requisitos

Para o **cliente**: navegar e buscar no catálogo; montar carrinho; finalizar compra com cartão
ou Pix; acompanhar o pedido; solicitar troca ou devolução.

Para a **operação**: receber os pedidos pagos para separação; dar baixa no estoque; emitir nota
fiscal; despachar e informar rastreio.

Para a **loja**: cadastrar produto e preço; aplicar promoção; acompanhar vendas e ruptura.

## Restrições

```text
estoque            um centro de distribuição; a quantidade
                   disponível precisa estar correta na finalização
pagamento          um adquirente contratado, com API síncrona
                   e disponibilidade contratual de 99,5%
fiscal             emissão de nota integrada a um serviço de
                   terceiro; obrigatória antes do despacho
equipe             seis pessoas, um plantão, sem experiência
                   operacional em sistemas distribuídos
prazo              sete meses, com data comercial
```

## Sua Tarefa

Produza, em até 90 minutos:

1. As **unidades implantáveis** do sistema e a razão de cada separação — se houver.
2. O **modelo de dados** de pedido, item, estoque e pagamento.
3. O **fluxo de finalização de compra**, do carrinho ao pedido pago, com a ordem das operações.
4. Onde está a **transação**, e o que ela cobre.
5. As **três decisões** que você considera mais difíceis de reverter depois.

O item 5 é o que você vai reler nos próximos exercícios.

## Perguntas que Você Deveria Fazer

```text
a quantidade em estoque precisa ser exata na vitrine, ou só
  na finalização?
o cliente pode finalizar sem o pagamento ter sido autorizado?
o que acontece se o adquirente não responder?
a nota fiscal é emitida antes ou depois do pagamento confirmado?
o que acontece se a emissão falhar?
promoção é calculada no carrinho ou no pedido?
o pedido pode ser cancelado depois de pago? por quem?
```

A segunda e a terceira decidem a arquitetura inteira. Se você não as fez, provavelmente
respondeu à terceira sem perceber.

## Critérios de Avaliação

Sua resposta está boa se:

- **O número de unidades implantáveis é pequeno.** Com 1.200 pedidos/dia e seis engenheiros sem
  plataforma, mais de duas ou três é custo sem retorno. Ver
  [monólito vs. microsserviços](/20-trade-offs/monolith-vs-microservices.md).
- **A reserva de estoque tem consistência forte.** Vender o que não existe é o erro caro deste
  domínio, e o volume permite transação local.
- **Você declarou o que acontece quando o adquirente não responde.** Não "vai dar erro" —
  o estado em que o pedido fica, e quem resolve.
- **A nota fiscal não está no caminho síncrono** da finalização. Ela é obrigatória antes do
  despacho, não antes da confirmação ao cliente.
- **Você nomeou as três decisões difíceis de reverter**, e elas são de fato difíceis — modelo de
  dados, fronteira de serviço, formato exposto ao cliente — e não escolha de biblioteca.

Sua resposta é fraca se ela tem seis serviços, uma fila entre cada dois, e nenhuma justificativa
ligada a um número do enunciado.

## Discussão

:::details Abra depois de tentar

**A resposta proporcional** para 1.200 pedidos/dia com seis engenheiros é um monólito modular,
com um banco relacional, transação local, e no máximo um processo em segundo plano.

Não é a resposta empolgante. É a que cabe no prazo de sete meses com uma equipe sem plataforma —
e é o que o enunciado descreve.

**A decisão que vai doer** é a do fluxo de finalização. A sequência natural, e correta para este
volume, é:

```text
uma transação:
  valida carrinho
  reserva estoque
  cria pedido
  chama o adquirente e espera
  confirma ou desfaz tudo
```

Isso é simples, correto, e tem duas propriedades que vão aparecer depois: a disponibilidade do
seu checkout fica presa aos 99,5% do adquirente, e a vazão fica presa ao tempo de resposta dele.

**Não é erro.** Com 4.000 pedidos por dia no pico — cerca de um a cada 20 segundos — essas duas
propriedades são irrelevantes. A decisão é correta agora e tem prazo de validade.

Registre isso: você está trocando disponibilidade e vazão futuras por simplicidade presente, e a
troca vale.

**A nota fiscal fora do caminho síncrono** é a decisão que a maioria acerta por instinto e poucos
justificam. Ela é obrigatória antes do despacho, e o despacho acontece horas depois. Colocá-la na
finalização adiciona uma dependência externa ao caminho crítico, sem nenhum ganho.

**O que quase todo mundo erra:** modelar a reserva de estoque como decremento direto da
quantidade. Isso funciona até o primeiro pagamento que falha, e aí o estoque foi consumido por um
pedido que não existe. Reserva precisa ser uma entidade com prazo, não uma subtração.

**As três decisões difíceis de reverter**, para este desenho:

```text
1. modelo do pedido e do item, que vira histórico e não se apaga
2. a transação única cobrindo estoque, pedido e pagamento
3. o formato exposto ao cliente na consulta de pedido
```

A segunda é a que os exercícios 04, 05 e 06 vão atacar. Guarde-a.

:::

## Conceitos Relacionados

- [Decomposição de Sistemas](/05-system-design/system-decomposition.md).
- [Fronteiras de Serviço](/05-system-design/service-boundaries.md).
- [Gestão de Estado](/05-system-design/state-management.md).
- [Monólito vs. Microsserviços](/20-trade-offs/monolith-vs-microservices.md).
