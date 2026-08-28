---
id: messaging-integration
title: Integração por Mensageria
sidebar_position: 4
description: Um intermediário entre as pontas — o que o desacoplamento resolve e o que ele transfere para a operação.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor decide entre integração síncrona e por mensageria a partir
  do acoplamento de disponibilidade que cada uma impõe.
prerequisites: [integration-architecture]
related: [event-driven-integration, webhooks, rest]
canonical_for: [integração por mensageria, fila de integração, intermediário de mensagens]
content_version: 1
last_reviewed: 2026-08-27
---

# Integração por Mensageria

## Visão Geral

Em integração por mensageria, quem envia entrega a mensagem a um intermediário e
segue adiante. Quem recebe consome quando puder.

Os fundamentos — garantias de entrega, ordenação, duplicatas — estão em
[mensageria](../06-distributed-systems/messaging.md). Aqui o foco é a decisão de
integração: **o que muda quando duas pontas param de se falar diretamente**.

O que muda é o acoplamento de disponibilidade. E isso resolve um problema real e
cria outros, todos operacionais.

## Problema

Numa integração síncrona, o chamador depende de o chamado estar disponível
**agora**. Se o destino está fora, a operação falha.

Numa cadeia de quatro serviços com 99,9% cada, a disponibilidade combinada cai
para 99,6% — e o usuário sente a falha do quarto elo mesmo quando o pedido dele
já estava validado.

Pior: um destino lento propaga a lentidão. As conexões do chamador ficam presas
esperando, e a saturação sobe a cadeia inteira. Ver
[falha parcial](../06-distributed-systems/partial-failure.md).

## Conceitos Centrais

### O intermediário absorve indisponibilidade

O ganho central: o remetente entrega ao intermediário e a operação termina. Se o
consumidor está fora por duas horas, as mensagens esperam.

Isso desacopla **disponibilidade**, não formato nem semântica — o consumidor
continua precisando entender a mensagem.

E move a dependência: agora as duas pontas dependem do intermediário. Ele passa a
ser componente crítico, com toda a operação que isso implica.

### Fila ou tópico decide a topologia

**Fila.** Uma mensagem, um consumidor. Vários processos podem consumir da mesma
fila, e cada mensagem vai para um só. É distribuição de trabalho.

**Tópico.** Uma mensagem, todos os assinantes. É notificação.

A escolha não é estética: a fila permite escalar o processamento adicionando
consumidores; o tópico permite adicionar destinos sem tocar no remetente.

Comando vai para fila. Fato vai para tópico. Ver
[integração orientada a eventos](event-driven-integration.md).

### A resposta, quando existe, é outro problema

Quando o remetente precisa saber o resultado, o desacoplamento não é gratuito:

**Fila de retorno.** A mensagem carrega o endereço da resposta e um
identificador de correlação. Funciona, e reintroduz espera.

**Consulta posterior.** O remetente recebe um identificador e consulta depois.
Mais simples de operar.

**Notificação.** O resultado vira outro evento, ou um
[webhook](webhooks.md).

Se o remetente precisa da resposta **para continuar**, provavelmente a integração
deveria ser síncrona. Mensageria com espera por resposta é o pior dos dois
mundos: a latência da fila mais o acoplamento da chamada.

### O que passa a ser responsabilidade sua

Isto é o que a comparação usual omite. Ao adotar mensageria, você assume:

```text
idempotência        entrega ao menos uma vez é o padrão realista
ordem               não é garantida entre partições
duplicatas          vão acontecer
mensagens venenosas  uma mensagem que sempre falha trava o consumo
fila de mortas      e o processo de tratá-la
atraso do consumidor monitorado, com alerta
esquema             evolução do formato da mensagem
```

Sete responsabilidades que a chamada síncrona não tinha. Cada uma está tratada em
[sistemas distribuídos](../06-distributed-systems/index.md), e todas precisam
existir antes de a primeira mensagem entrar em produção.

### O consumidor parado é o modo de falha característico

Numa integração síncrona, uma falha aparece imediatamente: o chamador recebe
erro.

Numa integração por mensageria, um consumidor que morreu não gera erro em lugar
nenhum. O remetente continua publicando com sucesso. As mensagens acumulam.
Ninguém percebe até alguém reclamar da ausência do efeito.

**Alerta de atraso de consumidor não é opcional.** É a métrica que substitui o
erro que você deixou de ter.

### Transacionalidade entre banco e fila

O problema clássico: gravar no banco e publicar a mensagem precisa ser atômico.
Se o banco confirma e a publicação falha, o efeito some.

A solução padrão é a **caixa de saída transacional**: gravar a mudança e a
mensagem na mesma transação local, e um processo separado publica a partir dali.

Isso resolve sem transação distribuída. Ver
[transações distribuídas](../06-distributed-systems/distributed-transactions.md).

## Modelo Mental

**Mensageria troca acoplamento de disponibilidade por responsabilidade
operacional.** As sete responsabilidades acima são o preço, e ele é fixo.

## Quando Usar

- O remetente não precisa da resposta para continuar.
- Picos de carga precisam ser absorvidos.
- O destino é mais lento ou menos disponível que a origem.
- O processamento pode ser retentado sem intervenção.
- Vários destinos consomem o mesmo fato.
- Times diferentes precisam evoluir em ritmos diferentes.

## Quando Não Usar

**Quando o chamador precisa da resposta.** Consulta, validação, autorização.

**Para um único destino conhecido e sempre disponível.** O indireto não paga.

**Sem monitoramento de atraso de consumidor.** Falha silenciosa.

**Sem idempotência no consumidor.** Duplicata é certa.

**Sem tratamento de mensagem venenosa.** Uma mensagem trava a fila inteira.

**Quando a ordem estrita entre entidades distintas é obrigatória.**

**Para transferência de grandes volumes.** Ver
[integração em lote](batch-integration.md) — mensagens não são o transporte
certo para gigabytes.

## Alternativas

- **[REST](rest.md)** — quando a resposta é necessária.
- **[Webhooks](webhooks.md)** — notificar sem intermediário próprio.
- **Consulta periódica** — mais simples, e suficiente quando o atraso é
  aceitável. Frequentemente descartada cedo demais.
- **[Lote](batch-integration.md)** — para volume alto e periodicidade definida.
- **Caixa de saída transacional** — resolve o caso "banco mais evento" sem
  mensageria adicional.

## Trade-offs

| Mensageria | Síncrono |
|---|---|
| Destino pode estar fora | Precisa estar disponível |
| Absorve picos | Propaga carga |
| Remetente não espera | Espera |
| Sete responsabilidades novas | Nenhuma delas |
| Falha silenciosa possível | Erro imediato |
| Intermediário a operar | Sem componente extra |
| Depurar exige rastreamento | Pilha de chamadas |

## Modos de Falha

**Consumidor parado sem alerta.**

**Mensagem venenosa travando a fila.**

**Duplicata processada.**

**Mensagem perdida.** Publicada sem confirmação, ou confirmada antes do
processamento.

**Fila crescendo sem limite.** O consumidor não acompanha o produtor. Ver
[backpressure](../06-distributed-systems/backpressure.md).

**Intermediário indisponível.** O ponto único que a integração criou.

**Formato de mensagem quebrado.** Consumidores falham em momentos diferentes.

## Erros Comuns

**Adotar sem implementar as sete responsabilidades.**

**Não monitorar atraso de consumidor.**

**Esperar resposta por fila.**

**Publicar fora da transação do banco.**

**Não tratar mensagem venenosa.**

**Tratar como decisão global** em vez de por integração.

## Exemplo Real

Uma rede varejista integrava o sistema de vendas com o de estoque por chamada
síncrona. Toda venda chamava o estoque para dar baixa.

Duas consequências recorrentes:

**Vendas bloqueadas.** Quando o estoque ficava indisponível — o que acontecia em
implantações e em picos —, as vendas paravam. Numa Black Friday, foram 40 minutos
de caixa parado por causa de um serviço que não era o caminho crítico do
pagamento.

**Lentidão propagada.** O estoque degradava sob carga, e a lentidão subia até a
tela do caixa.

A migração para fila resolveu as duas: a venda passou a publicar a baixa e
concluir. O estoque consome no ritmo dele.

Cinco problemas apareceram nos primeiros meses, e todos eram das responsabilidades
que a equipe não tinha implementado:

**Consumidor parado por 6 horas.** Uma implantação com defeito derrubou o
consumidor de madrugada. Ninguém percebeu. O estoque ficou 6 horas defasado, e
produtos esgotados continuaram sendo vendidos.

**Duplicatas.** Uma reentrega após reinício deu baixa duas vezes em cerca de 800
itens. O consumidor não era idempotente.

**Mensagem venenosa.** Uma venda com um campo inesperado fazia o consumidor
falhar e reprocessar indefinidamente. A fila parou por 90 minutos, com uma única
mensagem bloqueando tudo.

**Publicação fora da transação.** Em quedas do processo entre a gravação da venda
e a publicação, a baixa nunca acontecia. Raro, e acumulou divergência.

**Sem reconciliação.** Não havia nada comparando estoque com vendas. As
divergências dos quatro itens acima só apareceram no inventário físico.

As correções vieram todas depois do incidente, e a equipe registra a ordem que
teria evitado o desgaste:

**Alerta de atraso de consumidor** — meia hora de trabalho, teria pego o primeiro
e o terceiro.

**Idempotência por identificador de venda** — teria pego o segundo.

**Fila de mensagens mortas** com limite de tentativas — o terceiro.

**Caixa de saída transacional** — o quarto.

**Reconciliação diária** entre vendas e movimentações de estoque — a rede de
segurança para tudo.

O que a equipe aprendeu: a decisão de migrar para fila estava certa e resolveu o
problema que motivou a mudança. O erro foi tratar mensageria como "chamada
assíncrona" — uma troca de mecanismo — quando ela é um conjunto de
responsabilidades novas que precisam existir antes da primeira mensagem.

## Conceitos Relacionados

- [Mensageria](../06-distributed-systems/messaging.md) — os fundamentos.
- [Integração Orientada a Eventos](event-driven-integration.md).
- [Idempotência](../06-distributed-systems/idempotency.md).
- [Filas de Mensagens Mortas](../06-distributed-systems/dead-letter-queues.md).

## Exercício Prático

Para cada integração assíncrona do seu sistema, responda: existe alerta se o
consumidor parar?

Onde não existir, calcule quanto tempo passaria até alguém notar pela ausência do
efeito. Esse número é a sua janela de dano.

## Perguntas de Entrevista

- Que tipo de acoplamento a mensageria remove, e qual ela mantém?
- Quais responsabilidades novas ela transfere para você?
- Por que esperar resposta por fila é o pior dos dois mundos?

## Para Aprofundar

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*.
  Addison-Wesley, 2003.
- Richardson, Chris. *Microservices Patterns*. Manning, 2018 — capítulo 3.
- Stopford, Ben. *Designing Event-Driven Systems*. O'Reilly, 2018.
