---
id: adr-002-async-processing
title: "ADR-002 — Processamento Assíncrono da Confirmação"
sidebar_position: 11
description: Exemplo de ADR superado — assíncrono com fila no próprio banco, e a condição registrada que disparou sua substituição.
doc_type: adr
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor vê como uma decisão deliberadamente simples registra a condição que
  a substituirá, e como essa condição é depois verificada.
prerequisites: [adr-structure]
related: [adr-alternatives, superseding-decisions, adr-status]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-29
---

# ADR-002 — Processar a Confirmação de Pedido de Forma Assíncrona

:::note Exemplo didático

Segundo de cinco ADRs do sistema fictício **Verano**. Este é o exemplo de decisão
**superada** — ver [ADR-004](adr-004-kafka.md).

:::

| | |
|---|---|
| Status | **superado pelo [ADR-004](adr-004-kafka.md)** em 2025-07-31 |
| | aceito em 2023-05-22 |
| Sistema | Verano — plataforma de pedidos |
| Autores | equipe de plataforma |
| Decisores | líder técnica |

## Contexto

Em maio de 2023, a criação de pedido é totalmente síncrona: o cliente espera pela
autorização do pagamento e pela reserva de estoque antes de receber confirmação.

Medições das últimas oito semanas:

```text
p50 da criação de pedido            340 ms
p99                                 4,2 s
p99,9                               11 s
disponibilidade do parceiro de
  pagamento (12 meses)              98,7%
nossa disponibilidade medida        98,4%
requisito contratual                99,5%
```

A indisponibilidade do parceiro se propaga diretamente para nós — 78% dos nossos minutos
fora do ar em 2023 foram causados por ele.

Restrições:

- Estamos num [monólito modular](adr-001-modular-monolith.md) com PostgreSQL, sem
  infraestrutura de mensageria e sem experiência operacional com ela.
- Equipe de 12 pessoas, com o prazo de agosto de 2024 ainda vigente.
- O plantão foi criado há dois meses e ainda está amadurecendo.

O que não sabíamos: qual seria o volume real de pedidos em 2025. A projeção comercial
apontava 120/s de pico; o volume observado então era de 25/s.

## Decisão

Vamos processar a confirmação de pedido de forma **assíncrona**, usando uma **fila
implementada em tabela do próprio PostgreSQL**.

O fluxo passa a ser: o pedido é gravado como `pendente` na mesma transação em que a tarefa
de confirmação é enfileirada; o cliente recebe resposta imediata; um processo em segundo
plano autoriza o pagamento, reserva o estoque e move o pedido para `confirmado` ou
`recusado`; o cliente é notificado.

**Não vamos** adotar um sistema de mensageria dedicado neste momento. **Não vamos** tornar
assíncronas outras operações — consulta de catálogo, carrinho e rastreamento de entrega
continuam síncronos.

## Alternativas Consideradas

**Manter síncrono, com repetição e disjuntor.** Descartada porque não resolve a propagação
de indisponibilidade: com o parceiro fora, o pedido não pode ser aceito de forma alguma. O
requisito contratual de 99,5% não é atingível assim.

*Voltaria a ganhar se:* a disponibilidade do parceiro subir acima de 99,9% sustentados.

**Adotar Kafka.** Descartada pelo custo operacional: um agrupamento a operar, monitorar e
manter, com equipe sem experiência e prazo apertado. O volume atual não justifica —
25 pedidos/s cabem folgadamente numa tabela.

*Voltaria a ganhar se:* o volume passar de ~200 mensagens/s de forma sustentada, ou se
surgirem mais de três consumidores independentes dos mesmos eventos, ou se precisarmos de
retenção e reprocessamento de histórico.

**Serviço gerenciado de filas do provedor.** Descartada por um motivo específico: não
oferece gravação transacional junto com o pedido, o que exigiria caixa de saída de qualquer
forma — e, tendo a caixa de saída, a tabela já resolve.

*Voltaria a ganhar se:* precisarmos de entrega entre sistemas, e não dentro do nosso.

## Consequências

**Positivas (imediatas).** A indisponibilidade do parceiro deixa de derrubar a criação de
pedido. O p99 da resposta ao cliente cai para a faixa de 200 ms. A transação que grava
pedido e tarefa é local — sem risco de pedido sem tarefa ou tarefa sem pedido.

**Positivas (longo prazo).** O padrão de caixa de saída fica estabelecido e reaproveitável.

**Negativas (imediatas).** O cliente recebe confirmação depois, não na resposta — o que
exige mudança de produto: tela de "pedido em processamento" e notificação. Recusa de
pagamento passa a chegar por notificação, não por erro de formulário.

**Negativas (longo prazo).** A tabela de fila cresce e exige limpeza. Sondagem no banco
consome conexões. Não há retenção nem reprocessamento — uma tarefa processada some.

**Neutras.** Um processo em segundo plano a operar, com alarme próprio.

**Risco aceito.** A fila em banco tem teto de vazão. Estimamos que ela atenda
confortavelmente até ~200 mensagens/s com a configuração atual, e não fomos além disso em
teste.

## Sinal de Alerta

- Acúmulo na fila acima de **2 minutos** de forma recorrente.
- Vazão sustentada acima de **150 mensagens/s**.
- Mais de **três consumidores** distintos precisando dos mesmos eventos.
- Contenção de conexões do banco atribuída à sondagem da fila.

## Superação — 2025-07-31

Em julho de 2025, três das quatro condições do sinal de alerta tinham sido atingidas. Ver
[ADR-004](adr-004-kafka.md) para a decisão que substitui esta.

Este documento permanece como registro correto da decisão de 2023: para o contexto de
25 pedidos/s, equipe sem experiência em mensageria e prazo contratual vigente, a fila em
banco foi a escolha adequada. Ela sustentou o sistema por 26 meses.

## O que observar neste exemplo

A alternativa "adotar Kafka" foi descartada com **três condições de reversão numéricas**.
Duas anos depois, foram elas que dispararam a revisão — a decisão não precisou de
julgamento novo, apenas de medição.

O ADR registra explicitamente que a fila em banco **não foi testada acima de 200
mensagens/s**. Isso é uma incerteza declarada, e é honesta.

As consequências negativas incluem uma mudança de **produto**, não só técnica. Decisões
arquiteturais frequentemente têm essa cara, e omiti-la produz surpresa.

O status mostra a mecânica de superação: referência bidirecional, texto original intacto,
e uma nota explicando que a decisão estava certa para o contexto dela. Ver
[superação](superseding-decisions.md).

## Conceitos Relacionados

- [Status](adr-status.md) e [Superação](superseding-decisions.md).
- [Alternativas](adr-alternatives.md) — a condição de reversão em ação.
- [Processamento em Segundo Plano](../05-system-design/background-processing.md).
- [ADR-004](adr-004-kafka.md) — o sucessor.
