---
id: queues
title: Filas
sidebar_position: 11
description: Desacoplar no tempo — e as três garantias que a fila obriga a tratar.
doc_type: concept
level: 3
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor decide quando uma fila se paga e trata duplicação, ordem e
  mensagem envenenada antes de produção.
prerequisites: [request-response]
related: [background-processing, rate-limiting, event-driven]
canonical_for: [fila, message queue]
content_version: 1
last_reviewed: 2026-08-26
---

# Filas

## Visão Geral

Uma fila recebe mensagens de um produtor e as entrega a um consumidor, que as
processa no seu próprio ritmo.

O que ela compra é **desacoplamento temporal**: o produtor não depende da
disponibilidade do consumidor. O que ela cobra são três garantias que passam a
ser responsabilidade da aplicação — e que quase sempre são descobertas em
produção.

## Problema

Chamada síncrona amarra produtor e consumidor no tempo. Se o consumidor está
fora, o produtor está fora. Se o consumidor é lento, o produtor fica lento. Um
pico no produtor vira pico no consumidor.

A fila corta isso: o produtor publica e segue; a fila absorve; o consumidor
processa quando consegue.

O erro comum não é adotar fila — é adotá-la sem reconhecer que **o canal é uma
rede**, e que rede traz duplicação, desordem e mensagens que nunca processam.

## Conceitos Centrais

### O que a fila absorve

**Indisponibilidade do consumidor.** Mensagens acumulam; nada se perde.

**Diferença de ritmo.** O produtor pode publicar mais rápido do que o consumidor
processa, por um tempo.

**Pico.** A fila cresce em vez de o sistema cair. É o mecanismo de contenção mais
barato que existe.

Nenhum dos três é infinito — a fila tem limite, e o que acontece ao atingi-lo
precisa ser decidido. Ver
[backpressure](../06-distributed-systems/index.md).

### As três garantias que você herda

**Duplicação.** Praticamente todo sistema de fila entrega ao menos uma vez. Isso
significa que a mesma mensagem pode chegar duas vezes — por retentativa, por
falha na confirmação, por rebalanceamento de consumidores.

A consequência é dura e inegociável: **o consumidor precisa ser idempotente.**
Processar duas vezes tem que ter o mesmo efeito de processar uma. Sem isso, uma
cobrança vira duas.

**Ordem.** Filas particionadas garantem ordem dentro de uma partição, não entre
elas. Se `PedidoCriado` e `PedidoCancelado` caem em partições diferentes, podem
chegar fora de ordem.

A mitigação usual é particionar pela chave da entidade — todos os eventos de um
pedido na mesma partição — o que preserva a ordem que importa ao custo de
desequilíbrio se uma chave for muito ativa.

**Mensagem envenenada.** Uma mensagem que sempre falha volta para a fila,
indefinidamente, bloqueando o processamento. É o que exige
[dead-letter queue](../06-distributed-systems/index.md): após N tentativas, a
mensagem sai para uma fila separada, com alerta.

Uma fila sem dead-letter configurada trava no primeiro dado malformado.

### Confirmação depois de processar

O consumidor confirma a mensagem **após** processá-la com sucesso, nunca antes. Se
confirmar antes e falhar, a mensagem se perde.

O tempo de visibilidade — quanto a fila espera antes de reentregar — precisa ser
maior que o tempo de processamento. Se for menor, a mensagem é reentregue enquanto
ainda está sendo processada, e o resultado é duplicação garantida.

### A fila esconde o problema até não esconder

Uma fila crescendo é sintoma, não solução. Se o consumidor é permanentemente mais
lento que o produtor, a fila só adia o colapso.

Monitorar **profundidade e idade da mensagem mais antiga** é o que transforma isso
em alerta antes de virar incidente.

## Modelo Mental

**A fila troca "falha agora" por "atraso agora, e talvez falha depois".** Isso é
bom quando o atraso é aceitável e ruim quando ele apenas esconde uma
incapacidade.

## Quando Usar

- O produtor não precisa do resultado para continuar.
- O consumidor pode processar com atraso.
- É preciso absorver pico.
- O consumidor é menos disponível que o produtor.
- O trabalho é demorado e não cabe numa requisição.

## Quando Não Usar

**Quando a resposta é necessária.** Se o chamador precisa do resultado, a fila
adiciona complexidade sem remover a espera.

**Quando o consumidor não é idempotente e não pode ser.** A duplicação vai
acontecer.

**Quando a consistência forte é requisito.** Fila implica consistência eventual.

**Para um consumidor fixo e um produtor, ambos disponíveis.** Chamada direta é mais
simples e mais rastreável.

**Sem dead-letter e sem monitoramento de profundidade.** É adotar o risco sem o
instrumento.

## Alternativas

- **Chamada síncrona** — quando a resposta importa.
- **[Processamento em background](background-processing.md) no mesmo processo** —
  para trabalho leve, sem componente adicional.
- **Tabela como fila** — para volume baixo, usar o banco que já existe evita mais
  uma peça a operar.
- **Evento publicado** — quando há vários interessados, não um consumidor. Ver
  [arquitetura orientada a eventos](../03-design-patterns/event-driven.md).

## Trade-offs

| Com fila | Chamada direta |
|---|---|
| Produtor independe do consumidor | Acoplado no tempo |
| Pico absorvido | Propagado |
| Retentativa automática | Manual |
| Duplicação e ordem a tratar | Semântica simples |
| Fluxo fragmentado | Rastreável |
| Consistência eventual | Transacional |
| Mais um componente a operar | Nenhum |

## Modos de Falha

**Consumidor não idempotente.** Efeito duplicado — cobrança, e-mail, débito.

**Sem dead-letter.** Uma mensagem ruim trava a fila.

**Confirmação antes do processamento.** Perda silenciosa.

**Visibilidade menor que o processamento.** Duplicação sistemática.

**Fila crescendo sem alerta.** Descoberto pelo usuário.

**Fila como banco de dados.** Mensagens acumuladas para consulta posterior — não é
o propósito e não tem as garantias.

## Erros Comuns

**Adotar sem idempotência.** É o erro que produz os incidentes mais caros.

**Não configurar dead-letter.**

**Não monitorar profundidade e idade.**

**Assumir ordem global.**

**Publicar dentro da transação sem outbox.** A transação falha e a mensagem já foi
publicada, ou vice-versa. Ver
[evento de domínio](../04-domain-driven-design/domain-event.md).

## Exemplo Real

Um sistema de faturamento moveu a emissão de nota fiscal para uma fila, porque o
serviço da prefeitura era instável e derrubava a confirmação de pedido.

Funcionou por três semanas. Depois, três incidentes em sequência.

**Notas duplicadas.** O serviço da prefeitura demorava mais que o tempo de
visibilidade configurado. A mensagem era reentregue enquanto ainda estava sendo
processada, e duas notas eram emitidas para o mesmo pedido. Corrigir exigiu
cancelamento junto à prefeitura, um por um.

**Fila travada.** Um pedido com caractere inválido no endereço fazia o consumidor
lançar exceção. A mensagem voltava para a fila e era reprocessada
indefinidamente, consumindo todo o consumidor. Nove horas de emissões paradas até
alguém investigar.

**Acúmulo silencioso.** A prefeitura ficou fora por um fim de semana. A fila
cresceu para 40 mil mensagens. Ninguém percebeu porque não havia alerta — o
problema apareceu na segunda-feira, quando o prazo legal de algumas notas estava
próximo.

As correções, todas conhecidas de antemão e nenhuma implementada:

Chave de idempotência por pedido, verificada antes de emitir. O tempo de
visibilidade subiu para o dobro do percentil 99 do processamento.

Dead-letter após três tentativas, com alerta. A mensagem problemática sai da fila
em minutos, e as demais seguem.

Alerta de profundidade acima de mil e de idade da mensagem mais antiga acima de 15
minutos.

A fila estava certa como decisão. O que faltou foi tratar as três garantias antes
de subir — e todas as três estavam na documentação do serviço de fila.

## Conceitos Relacionados

- [Request/Response](request-response.md) — o modelo que a fila substitui.
- [Processamento em Background](background-processing.md) — o consumidor.
- [Sistemas Distribuídos](../06-distributed-systems/index.md) — idempotência,
  ordem, dead-letter, backpressure.
- [Rate Limiting](rate-limiting.md) — controlar o ritmo de consumo.

## Exercício Prático

Para cada fila do seu sistema, responda: o consumidor é idempotente? Existe
dead-letter configurada? O tempo de visibilidade é maior que o pior tempo de
processamento? Existe alerta de profundidade?

Cada "não" é um dos três incidentes acima esperando acontecer.

## Perguntas de Entrevista

- Quais garantias uma fila obriga a tratar?
- Por que o consumidor precisa ser idempotente?
- O que acontece sem dead-letter queue?

## Para Aprofundar

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*, 2003.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
