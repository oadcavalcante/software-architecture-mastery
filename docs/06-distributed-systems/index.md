---
id: distributed-systems
title: Sistemas Distribuídos
sidebar_position: 0
description: Por que sistemas distribuídos são difíceis — falha parcial, ordem, duplicação e os limites do que é possível garantir.
doc_type: index
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor raciocina sobre falha parcial como caso normal, e
  consegue justificar garantias de entrega, ordenação e consistência a partir
  de requisitos em vez de reputação de ferramenta.
prerequisites: [system-design]
related: [data-architecture, reliability, integration-architecture]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-26
---

# Nível 04 — Sistemas Distribuídos

Esta é a seção mais profunda do percurso, e a que mais muda a forma de projetar.

## O problema desta seção

Num sistema de processo único, uma chamada de função ou executa ou não executa.
Se o processo morre, morre inteiro. Isso é uma simplificação tão confortável que
raramente notamos que estamos usando.

Distribuir o sistema remove essa simplificação. Uma chamada de rede tem três
resultados possíveis, não dois: sucesso, falha, e **não sei**. O terceiro é o
que torna tudo difícil. Quando o timeout estoura, você não sabe se a operação
aconteceu. Repetir pode duplicar; não repetir pode perder.

Toda a complexidade desta seção deriva daí. Idempotência existe por causa disso.
Sagas existem por causa disso. Consenso existe por causa disso.

O objetivo aqui não é decorar CAP. É internalizar que **falha parcial é o caso
normal**, não a exceção — e projetar assumindo isso desde o início, porque
adicionar tolerância a falhas depois exige refazer o modelo de dados.

## O que você vai encontrar aqui

**Os fundamentos.** Falha de rede, falha parcial, latência, timeouts, retries e
backoff. A base física de que tudo o mais depende.

**Idempotência.** Tratada como tópico central, não como detalhe. É a propriedade
que torna retry seguro, e sem ela nada acima funciona.

**Os limites teóricos.** CAP e PACELC, apresentados pelo que de fato afirmam —
que é bem menos do que costumam citar. PACELC recebe mais espaço que CAP, porque
descreve melhor o dilema real: o custo em latência que se paga por consistência
mesmo quando não há partição.

**Distribuição de dados.** Replicação, particionamento, sharding e resolução de
conflitos. Consistência eventual e consistência forte, com o que cada uma
significa para quem escreve a aplicação.

**Coordenação.** Eleição de líder, consenso e locks distribuídos. Inclui a
pergunta que precede as três: dá para não coordenar?

**Mensageria.** Entrega no máximo uma vez, ao menos uma vez e exatamente uma vez
— e por que a terceira é uma propriedade de ponta a ponta, não um recurso de
ferramenta. Ordenação, mensagens duplicadas, poison messages, dead-letter queues
e backpressure.

**Padrões distribuídos.** Sistemas orientados a eventos, event sourcing, CQRS,
sagas e transações distribuídas.

## Ordem de leitura

Esta seção tem ordem obrigatória nos primeiros tópicos. Leia **falha parcial**,
depois **timeouts e retries**, depois **idempotência**. Nada mais faz sentido
antes desses três.

Depois disso há dois caminhos, e você pode escolher: o de dados (replicação,
particionamento, consistência) ou o de mensagens (entrega, ordenação, filas).
Ambos convergem em sagas e event sourcing, que dependem dos dois.

Deixe **consenso** para o fim. É o tópico mais denso e o menos frequentemente
implementado à mão — na prática você vai consumir consenso, não escrevê-lo.

## Ao terminar

Você para de perguntar "esse sistema é consistente?" e passa a perguntar
"consistente em relação a quê, observado por quem, sob qual atraso aceitável?".

Consegue olhar um fluxo e apontar onde a mensagem pode chegar duas vezes, onde
pode chegar fora de ordem e o que acontece em cada caso. Consegue justificar a
escolha entre uma saga e uma transação a partir do requisito, não da moda.

E consegue argumentar contra distribuir, que é a decisão correta com muito mais
frequência do que a literatura sugere.

## Continua em

[Nível 05 — Arquitetura](../07-data-architecture/index.md), onde essas
propriedades passam a interagir com dados, integração, nuvem, segurança e custo.
