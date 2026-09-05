---
id: network-failure
title: Falha de Rede
sidebar_position: 2
description: A rede perde, atrasa, duplica e reordena — e nenhuma dessas falhas é distinguível das outras.
doc_type: concept
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor reconhece os modos de falha de rede e por que o
  diagnóstico correto é frequentemente impossível a partir de um dos lados.
prerequisites: [distributed-fundamentals]
related: [partial-failure, timeouts, failure-detection]
canonical_for: [falha de rede, partição de rede]
content_version: 2
last_reviewed: 2026-08-27
---

# Falha de Rede

## Visão Geral

A rede é o meio pelo qual sistemas distribuídos se coordenam, e ela é não
confiável por natureza — não por defeito de implementação.

O que torna isso difícil não é que a rede falhe. É que **os modos de falha são
indistinguíveis entre si** a partir de um dos lados.

## Problema

Você envia uma requisição e não recebe resposta. As explicações possíveis:

A requisição não chegou. Chegou e o destino caiu antes de processar. Foi
processada e a resposta se perdeu. Está sendo processada, devagar. O destino está
íntegro e a rede entre vocês está partida.

**Do seu lado, as cinco são idênticas.** Você observa a mesma coisa: silêncio.

Isso não é limitação de ferramenta — é propriedade do problema. Nenhum protocolo
resolve, porque distinguir exigiria informação que não atravessa a rede partida.

Todo o resto deste nível é consequência disso.

## Conceitos Centrais

### Os modos de falha

**Perda.** Pacotes descartados por congestionamento, buffer cheio ou erro de
transmissão. TCP retransmite, o que resolve a perda e aumenta a latência.

**Atraso.** O pacote chega, tarde. Sob congestionamento, a latência sobe por
ordens de grandeza — e um atraso suficientemente longo é operacionalmente igual a
perda.

**Duplicação.** Retransmissões podem produzir entrega dupla em camadas acima.

**Reordenação.** Pacotes tomam caminhos diferentes e chegam fora de ordem. TCP
reordena dentro de uma conexão; entre conexões, não há garantia.

**Partição.** Um grupo de nós fica isolado de outro. Ambos continuam funcionando e
cada um acredita que o outro caiu.

### Partição é o modo que decide arquitetura

Partição é o mais raro e o mais consequente, porque durante ela **os dois lados
continuam operando**.

Se ambos aceitam escritas, os estados divergem e alguém resolve o conflito depois.
Se apenas um aceita, é preciso decidir qual — e o outro fica indisponível.

Esse é literalmente o dilema de [CAP](/06-distributed-systems/cap.md), e ele existe por causa de partição.

O erro comum é tratar partição como hipótese teórica. Ela acontece: falha de
comutador, erro de configuração, atualização de firmware, zona de disponibilidade
isolada, cabo submarino rompido.

### Partição parcial e assimétrica

Nem toda partição é limpa. Duas variantes traiçoeiras:

**Assimétrica.** A mensagem vai de A para B e não volta. A acha que B caiu; B
recebe requisições e responde no vazio.

**Parcial.** A alcança B, B alcança C, e A não alcança C. Não há dois grupos — há
uma topologia inconsistente, em que nós diferentes têm visões diferentes de quem
está vivo.

Algoritmos de consenso lidam bem com partições limpas e mal com as parciais, e
vários incidentes públicos de sistemas distribuídos têm essa causa.

### Falha lenta é pior que falha total

Um nó que caiu é detectado e removido. Um nó **lento** continua respondendo às
verificações de saúde, continua recebendo tráfego e continua entregando devagar.

Isso propaga a lentidão para quem depende dele, e é a origem de boa parte das
cascatas. Ver [circuit breakers](/12-reliability/circuit-breakers.md).

Detectar degradação exige medir latência, não apenas disponibilidade — e é por
isso que verificação de saúde binária é insuficiente.

## Modelo Mental

**Silêncio não é informação.** Ele é compatível com sucesso, com falha e com
lentidão — e projetar assumindo qualquer uma delas produz defeito.

## Quando Usar

Este documento não descreve uma técnica a aplicar. As decisões que ele informa:

- Calibrar [timeouts](/06-distributed-systems/timeouts.md) sabendo que atraso e perda são indistinguíveis.
- Projetar [idempotência](/06-distributed-systems/idempotency.md), porque duplicação vai acontecer.
- Escolher entre disponibilidade e consistência sob partição.
- Detectar degradação além de indisponibilidade.

## Quando Não Usar

**Presumir rede confiável dentro do datacenter.** É mais confiável; não é
confiável. Partições dentro de uma zona acontecem.

**Tratar partição como cenário improvável.** Sistemas de longa duração a
encontram.

**Confiar em verificação de saúde binária.** Ela não detecta lentidão.

**Assumir que TCP resolve.** Ele resolve perda e reordenação **dentro de uma
conexão**. Não resolve partição, não garante entrega à aplicação, e não impede
duplicação em camadas acima.

## Alternativas

Não há alternativa a lidar com falha de rede num sistema distribuído. Há a
alternativa de **não distribuir** — ver
[monolito modular](/03-design-patterns/modular-monolith.md).

Dentro do distribuído, o que varia é a estratégia: tolerar e reconciliar, ou
recusar operar durante a falha.

## Trade-offs

Durante uma partição, a escolha é entre continuar aceitando escritas — com
divergência a resolver — e recusar — com indisponibilidade.

| Aceitar escritas | Recusar |
|---|---|
| Sistema continua disponível | Indisponível durante a partição |
| Estados divergem | Estado sempre consistente |
| Conflito a resolver | Sem conflito |
| Adequado a domínios que toleram | Adequado a domínios que não toleram |

Ver [CAP](/06-distributed-systems/cap.md) para o tratamento completo.

## Modos de Falha

**Cascata por lentidão.** Um nó lento consome as conexões de quem o chama.

**Cérebro dividido.** Os dois lados de uma partição se consideram autoritativos.

**Duplicação por retransmissão.** Sem idempotência, efeito duplicado.

**Detecção falsa.** Um nó lento é declarado morto, removido, e volta — gerando
rebalanceamento desnecessário e instabilidade.

**Partição assimétrica não detectada.** Um lado remove o outro; o outro continua
achando que está no grupo.

## Erros Comuns

**Assumir que timeout significa falha do destino.**

**Não tratar duplicação.**

**Verificação de saúde que só testa se o processo responde.**

**Ignorar partição no projeto.** Ela vai acontecer; a pergunta é o que o sistema
faz.

**Retransmitir agressivamente sob congestionamento.** Piora exatamente a condição
que causou a perda. Ver [backoff](/06-distributed-systems/backoff.md).

## Exemplo Real

Um cluster de banco com três nós — um líder e duas réplicas — em zonas de
disponibilidade diferentes.

Uma manutenção de rede isolou a zona do líder das outras duas por 90 segundos.

As duas réplicas pararam de receber sinal do líder. Após o tempo de detecção,
elegeram uma nova líder entre si e passaram a aceitar escritas.

O líder original continuava íntegro, alcançável pela aplicação que rodava na mesma
zona, e continuou aceitando escritas — sem saber que havia perdido a liderança.

Por 90 segundos houve **dois líderes**, ambos aceitando escritas, cada um
convencido de ser o único.

Ao fim da partição, 1 200 escritas precisaram ser reconciliadas manualmente. 40
eram conflitantes — o mesmo registro alterado nos dois lados.

O que a equipe descobriu na análise: o cluster tinha proteção contra isso —
exigência de maioria para aceitar escrita — e ela estava desabilitada, porque
habilitá-la tornava o sistema indisponível quando uma zona caía.

Alguém havia trocado disponibilidade por consistência sem registrar a decisão, e
sem que o negócio soubesse. Para um sistema de saldo, era a troca errada.

A correção foi reabilitar a exigência de maioria e aceitar 90 segundos de
indisponibilidade em vez de divergência de saldo — desta vez com a decisão
registrada em [ADR](/18-architecture-decisions/what-is-an-adr.md), e com o negócio na
conversa.

## Conceitos Relacionados

- [Falha Parcial](/06-distributed-systems/partial-failure.md) — a consequência para o projeto.
- [CAP](/06-distributed-systems/cap.md) — a escolha sob partição.
- [Detecção de Falha](/06-distributed-systems/failure-detection.md) — por que declarar morto é heurística.
- [Timeouts](/06-distributed-systems/timeouts.md) — a única ferramenta disponível.

## Exercício Prático

Para o seu sistema: o que acontece se a rede entre a aplicação e o banco ficar
partida por 60 segundos?

Depois a versão mais difícil: e se ficar partida **parcialmente** — a aplicação
alcança o banco, o banco não alcança a réplica?

## Perguntas de Entrevista

- Por que os modos de falha de rede são indistinguíveis de um dos lados?
- Por que falha lenta é pior que falha total?
- O que TCP resolve e o que não resolve?

## Para Aprofundar

- Bailis, Peter; Kingsbury, Kyle. *The Network is Reliable*. ACM Queue, 2014 — o
  levantamento de partições reais em produção.
- Kingsbury, Kyle. *Jepsen* — análises de sistemas sob partição.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
