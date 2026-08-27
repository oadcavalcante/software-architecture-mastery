---
id: event-driven-systems
title: Sistemas Orientados a Eventos
sidebar_position: 37
description: Comunicação por fatos publicados — o desacoplamento que se ganha e a rastreabilidade que se perde.
doc_type: concept
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor decide entre comunicação por evento e por chamada com base
  no acoplamento desejado, e reconhece o custo operacional de cada uma.
prerequisites: [messaging]
related: [sagas, distributed-event-sourcing, ordering]
canonical_for: [orientado a eventos, notificação de evento, evento com estado]
content_version: 1
last_reviewed: 2026-08-27
---

# Sistemas Orientados a Eventos

## Visão Geral

Num sistema orientado a eventos, componentes publicam **fatos que aconteceram** em
vez de chamar uns aos outros pedindo ações.

Quem produz não sabe quem consome. Quem consome reage quando puder.

O ganho é desacoplamento real: adicionar um consumidor não toca no produtor. O
custo é que o fluxo de negócio deixa de existir em algum lugar legível — ele
emerge das reações.

## Problema

Comunicação por chamada direta acopla: o chamador precisa saber quem chamar, e
precisa que o chamado esteja disponível agora.

Quando uma ação de negócio dispara cinco consequências, a chamada direta produz um
serviço que conhece cinco outros e falha se qualquer um estiver fora.

Eventos invertem isso — e trocam um conjunto de problemas por outro.

## Conceitos Centrais

### Evento é fato passado, comando é pedido

A distinção que organiza tudo:

```text
comando: "processe o pagamento"   → dirigido, pode ser recusado
evento:  "pagamento processado"   → fato, não se recusa o passado
```

Nomear no passado não é convenção estética. Um evento nomeado como comando —
`EnviarEmail` publicado num tópico — revela que o produtor sabe o que deve
acontecer, o que anula o desacoplamento.

### Dois tipos de evento, com implicações opostas

**Notificação.** Carrega o mínimo: identificador e tipo. O consumidor consulta o
produtor para obter detalhes.

Payload pequeno e acoplamento de disponibilidade de volta — o consumidor precisa
que o produtor responda.

**Evento com estado.** Carrega os dados necessários. O consumidor não consulta
ninguém.

Desacoplamento completo, e o evento passa a ser contrato: mudar seu formato quebra
consumidores que você não conhece.

A escolha entre os dois é a decisão mais consequente do projeto. Notificação
mantém o acoplamento temporal; evento com estado transfere o problema para
versionamento de contrato.

### O fluxo desaparece

Numa arquitetura orientada a eventos madura, ninguém consegue apontar onde o
processo de "criar pedido" está descrito. Ele é a soma de reações espalhadas.

Isso é consequência direta do desacoplamento, não um defeito de implementação. E
tem custo operacional real:

- Entender o efeito de uma mudança exige saber quem consome.
- Depurar exige rastreamento distribuído.
- Um consumidor que parou de funcionar não gera erro em lugar nenhum — só a
  ausência de efeito.

A terceira é a mais perigosa. Ver [monitoramento de atraso de
consumidor](backpressure.md).

### Ordem e entrega não são dadas

Ver [ordenação](ordering.md) e [garantias de
entrega](delivery-guarantees.md).

Eventos podem chegar fora de ordem, duplicados, ou muito depois. Todo consumidor
precisa ser [idempotente](idempotency.md), e a maioria precisa tolerar eventos
fora de ordem.

Consumidores escritos assumindo ordem e entrega única funcionam nos testes e falham
em produção sob repetição ou rebalanceamento.

### O evento é contrato público

Quando o produtor não sabe quem consome, ele também não sabe quem quebra ao mudar
o formato.

Isso exige disciplina: versionamento, mudanças aditivas, período de convivência
entre versões, e registro de esquema.

Times que tratam eventos como estrutura interna descobrem o problema quando um
campo removido quebra três consumidores.

### Não é tudo ou nada

O erro de adoção mais comum é tratar "orientado a eventos" como escolha global.

Sistemas bem projetados misturam: chamada direta onde o chamador precisa da
resposta para continuar, evento onde a consequência é assíncrona.

Consultar saldo é chamada. "Pedido criado" é evento.

## Modelo Mental

**Evento desacopla quem produz de quem consome, e distribui o fluxo de negócio.**
O que se ganha em independência se paga em rastreabilidade.

## Quando Usar

- Uma ação tem múltiplas consequências independentes.
- Os consumidores mudam com frequência maior que o produtor.
- O produtor não deve conhecer as consequências.
- O processamento pode ser assíncrono.
- Times diferentes precisam evoluir independentemente.
- Absorver picos importa. Ver [mensageria](messaging.md).

## Quando Não Usar

**Quando o chamador precisa da resposta.** Consulta, validação, autorização.

**Para um único consumidor conhecido e estável.** O indireto não paga.

**Quando a ordem estrita entre entidades diferentes é obrigatória.**

**Sem rastreamento distribuído.** Depurar fica inviável.

**Sem monitoramento de consumidor.** Falha silenciosa.

**Sem estratégia de versionamento.** Mudar o evento vai quebrar alguém.

**Como escolha global.** A mistura é o desenho correto.

## Alternativas

- **Chamada direta** — quando a resposta é necessária.
- **Fila ponto a ponto** — assíncrono sem múltiplos consumidores.
- **Orquestração explícita** — fluxo legível com passos assíncronos. Ver
  [sagas](sagas.md).
- **Consulta periódica** — mais simples, e suficiente quando o atraso é aceitável.

## Trade-offs

| Orientado a eventos | Chamada direta |
|---|---|
| Produtor não conhece consumidores | Conhece |
| Consumidor pode estar fora | Precisa estar disponível |
| Adicionar consumidor não toca o produtor | Toca |
| Fluxo distribuído | Explícito no código |
| Rastreamento obrigatório | Pilha de chamadas |
| Idempotência obrigatória | Frequentemente dispensável |
| Absorve picos | Propaga carga |

| Notificação | Evento com estado |
|---|---|
| Payload pequeno | Grande |
| Consumidor consulta o produtor | Autossuficiente |
| Acoplamento temporal permanece | Desacoplado |
| Contrato pequeno | Contrato amplo a versionar |

## Modos de Falha

**Consumidor parado sem alerta.** Ninguém percebe a ausência de efeito.

**Evento perdido.** Publicado e não persistido, ou consumido e descartado.

**Duplicata processada.** Sem idempotência.

**Ordem quebrada.** Consumidor assume sequência.

**Contrato quebrado.** Campo removido; consumidores desconhecidos falham.

**Cascata de eventos.** Um evento gera outro, que gera outro — e ninguém tem o
mapa. Ciclos são possíveis.

**Tempestade.** Uma operação em lote publica milhões de eventos e afoga os
consumidores.

## Erros Comuns

**Nomear evento como comando.**

**Tratar o evento como estrutura interna.**

**Não implementar idempotência.**

**Adotar globalmente.**

**Não monitorar atraso de consumidor.**

**Não ter rastreamento distribuído desde o início.** Adicionar depois é muito mais
caro.

## Exemplo Real

Um sistema de comércio eletrônico migrou de chamadas diretas para eventos. O
serviço de pedidos chamava sete outros; passou a publicar `PedidoCriado`.

Os ganhos foram reais: adicionar o serviço de recomendação como consumidor não
exigiu mudança no serviço de pedidos, e o pedido passou a ser aceito mesmo com o
serviço de e-mail fora.

Três problemas apareceram.

**Consumidor parado por nove dias.** O consumidor de nota fiscal falhou após uma
implantação, com erro de desserialização. Não havia alerta de atraso. A descoberta
veio do setor fiscal no fechamento do mês — nove dias de notas não emitidas.

**Cascata inesperada.** `PedidoCriado` disparava `EstoqueReservado`, que disparava
`ReposicaoNecessaria`, que em certas condições disparava um pedido de compra que
publicava `PedidoCriado`. Um ciclo real, descoberto numa madrugada em que o volume
explodiu.

**Contrato quebrado.** Um campo renomeado no evento quebrou dois consumidores de
outros times, que ninguém sabia que existiam.

As correções, na ordem em que a equipe considera que deveriam ter vindo:

**Monitoramento de atraso por consumidor,** com alerta. É a correção mais barata e
foi a última a ser feita.

**Registro de esquema** com compatibilidade obrigatória. Renomear campo passou a
ser rejeitado na publicação.

**Catálogo de eventos** — quem publica, quem consome. Tornou visíveis os
consumidores desconhecidos e permitiu detectar o ciclo.

**Rastreamento distribuído** obrigatório em todo evento.

**Reversão parcial.** Duas das sete integrações voltaram a ser chamadas diretas,
porque o chamador precisava da resposta e o evento tinha adicionado indireção sem
benefício.

Essa reversão é o ponto que a equipe registra como mais instrutivo: a migração
tinha sido tratada como decisão global, quando a resposta certa era por
integração.

## Conceitos Relacionados

- [Mensageria](messaging.md) — a infraestrutura.
- [Sagas](sagas.md) — coordenação sobre eventos.
- [Ordenação](ordering.md) e [Garantias de Entrega](delivery-guarantees.md).
- [Idempotência](idempotency.md) — requisito.

## Exercício Prático

Liste as integrações do seu sistema. Para cada uma pergunte: o chamador precisa da
resposta para continuar?

Onde a resposta for não, evento é candidato. Onde for sim, chamada direta.

Depois: existe alerta se um consumidor parar? Se não, essa é a lacuna mais urgente.

## Perguntas de Entrevista

- Qual a diferença entre evento e comando, e por que ela importa?
- Notificação ou evento com estado — o que muda?
- Como um consumidor parado é detectado?

## Para Aprofundar

- Fowler, Martin. *What do you mean by "Event-Driven"?*, 2017.
- Stopford, Ben. *Designing Event-Driven Systems*. O'Reilly, 2018.
- Richardson, Chris. *Microservices Patterns*. Manning, 2018 — capítulo 3.
