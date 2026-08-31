---
id: messaging
title: Mensageria
sidebar_position: 19
description: Comunicação por mensagens duráveis — os modelos, e o que o canal garante e não garante.
doc_type: concept
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor escolhe entre fila e log de eventos a partir do padrão de
  consumo, e conhece as garantias reais do canal.
prerequisites: [partial-failure]
related: [delivery-guarantees, ordering, event-driven-systems]
canonical_for: [mensageria, broker, log de eventos]
content_version: 1
last_reviewed: 2026-08-27
---

# Mensageria

## Visão Geral

Mensageria é comunicação por mensagens intermediadas por um componente durável, em
vez de chamadas diretas.

Ela desacopla produtor e consumidor no tempo. E introduz um conjunto de garantias
— e de ausências de garantia — que precisam ser conhecidas antes de adotar, não
descobertas em produção.

## Problema

Chamada direta acopla no tempo: se o destino está fora, a origem está fora.

Mensageria resolve isso, e a escolha de **qual modelo** costuma ser feita pela
ferramenta disponível em vez de pelo padrão de consumo — o que produz sistemas
onde o modelo não corresponde ao uso.

Os dois modelos têm semânticas distintas, e confundi-los gera expectativas que o
canal não cumpre.

## Conceitos Centrais

### Fila versus log de eventos

| | Fila | Log de eventos |
|---|---|---|
| Mensagem consumida | Some | Permanece |
| Consumidores | Competem pela mensagem | Cada um lê tudo |
| Reprocessar histórico | Impossível | Reposicionar e reler |
| Ordem | Frágil com vários consumidores | Garantida por partição |
| Posição de leitura | Do broker | Do consumidor |
| Uso típico | Distribuir trabalho | Distribuir fatos |

**Fila** modela trabalho: uma tarefa, um executor. Vários consumidores competem, e
escalar é adicionar consumidores.

**Log** modela fatos: o evento aconteceu e vários interessados reagem, cada um no
seu ritmo, cada um com sua posição.

A escolha errada aparece assim: usar fila quando vários sistemas precisam do mesmo
evento — e acabar criando uma fila por consumidor, com o produtor publicando N
vezes. Ou usar log para distribuir trabalho — e ter que coordenar quem processa o
quê.

### O canal é uma rede

Independentemente do modelo, o canal herda os problemas de
[falha de rede](/06-distributed-systems/network-failure.md), e isso produz três garantias que a aplicação
precisa tratar:

**[Entrega ao menos uma vez](/06-distributed-systems/delivery-guarantees.md)** — duplicação vai acontecer.

**[Ordem apenas por partição](/06-distributed-systems/ordering.md)** — não há ordem global.

**Mensagens que sempre falham** — precisam de
[dead-letter queue](/06-distributed-systems/dead-letter-queues.md).

Nenhuma dessas é opcional. Adotar mensageria sem tratá-las é adotar o risco sem o
mecanismo.

### Confirmação e visibilidade

O consumidor confirma **após** processar com sucesso. Confirmar antes perde a
mensagem se o processamento falhar.

Entre a entrega e a confirmação, a mensagem fica invisível para outros
consumidores por um tempo. Se esse tempo for menor que o processamento, a
mensagem é reentregue enquanto ainda está sendo processada — duplicação
sistemática.

Esse valor precisa ser calibrado a partir do percentil alto do tempo de
processamento, não estimado.

### O produtor também tem um problema

Publicar uma mensagem e gravar no banco não são atômicos. Pode gravar e não
publicar, ou publicar e falhar ao gravar.

A solução é o padrão **outbox**: a mensagem é gravada numa tabela na mesma
transação do dado, e um processo separado a publica. Ver
[evento de domínio](/04-domain-driven-design/domain-event.md).

Ignorar isso produz perda silenciosa de mensagem — o modo de falha mais difícil de
diagnosticar, porque não há erro em lugar nenhum.

### Push e pull

**Push** — o broker envia ao consumidor. Latência baixa, e o consumidor pode ser
sobrecarregado se não houver controle de fluxo. Ver
[backpressure](/06-distributed-systems/backpressure.md).

**Pull** — o consumidor busca quando pode. Controle natural de ritmo, ao custo de
latência de intervalo.

A maioria dos sistemas modernos usa pull com espera longa: o consumidor pede, e a
conexão fica aberta até haver mensagem ou expirar. Combina o controle do pull com
a latência do push.

## Modelo Mental

**Fila distribui trabalho. Log distribui fatos.** A pergunta é se a mensagem é uma
tarefa para alguém ou um acontecimento para quem interessar.

## Quando Usar

- O produtor não precisa da resposta.
- O consumidor pode processar com atraso.
- É preciso absorver pico.
- Vários interessados no mesmo fato — aí, log.
- O trabalho é demorado e não cabe numa requisição.

## Quando Não Usar

**Quando a resposta é necessária.** Ver
[request/response](/05-system-design/request-response.md).

**Sem idempotência no consumidor.** A duplicação vai acontecer.

**Sem dead-letter.** Uma mensagem ruim trava o consumo.

**Sem outbox, quando a mensagem representa um fato persistido.** Perda silenciosa.

**Como banco de dados.** Um log com retenção infinita usado para consulta não tem
as garantias nem os índices de um banco.

**Quando a consistência forte é requisito.** Mensageria implica consistência
eventual.

## Alternativas

- **Chamada síncrona** — quando a resposta importa.
- **Tabela como fila** — para volume baixo, usar o banco existente evita mais um
  componente a operar.
- **Chamada direta com retentativa** — quando há um consumidor e ele é confiável.
- **Processamento agendado** — quando a latência tolerada é alta.

## Trade-offs

| Com mensageria | Chamada direta |
|---|---|
| Produtor independe do consumidor | Acoplado no tempo |
| Pico absorvido | Propagado |
| Novo consumidor sem tocar o produtor | Toca |
| Duplicação, ordem, dead-letter a tratar | Semântica simples |
| Fluxo fragmentado | Rastreável |
| Mais um componente a operar | Nenhum |

## Modos de Falha

**Consumidor não idempotente.** Efeito duplicado.

**Perda por ausência de outbox.** Transação confirmada, mensagem não publicada.

**Visibilidade menor que o processamento.** Duplicação sistemática.

**Acúmulo silencioso.** A fila cresce e ninguém percebe.

**Consumidor mais lento que o produtor.** A fila só adia o colapso.

**Retenção mal configurada.** Num log, mensagens expiram antes de um consumidor
lento alcançá-las.

## Erros Comuns

**Escolher o modelo pela ferramenta disponível.**

**Não calibrar o tempo de visibilidade.**

**Não monitorar profundidade e idade da mensagem mais antiga.**

**Publicar dentro da transação sem outbox.**

**Usar o log como armazenamento de consulta.**

## Exemplo Real

Um sistema de logística usava fila para notificar quatro áreas sobre entregas
concluídas: faturamento, atendimento, análise e o cliente.

Como fila entrega a um consumidor, a solução foi o produtor publicar em quatro
filas separadas.

Três problemas apareceram.

**Acoplamento no produtor.** Adicionar um quinto interessado exigia alterar o
serviço de entregas e implantá-lo. Em dois anos, isso aconteceu três vezes.

**Publicação parcial.** Publicar em quatro filas não é atômico. Numa
indisponibilidade momentânea do broker, mensagens foram para duas filas e não para
as outras duas — e faturamento processou entregas que atendimento nunca soube que
existiam.

**Reprocessamento impossível.** Quando análise precisou recalcular métricas de seis
meses, não havia como: as mensagens tinham sido consumidas e não existiam mais.

A migração para log de eventos resolveu os três.

O produtor publica **uma vez**, num tópico. Cada consumidor lê tudo, com sua
própria posição. O quinto interessado foi adicionado sem tocar o produtor.

A publicação única com outbox eliminou a parcialidade.

E o reprocessamento virou reposicionar a leitura — a análise recalculou seis meses
em duas horas, lendo o histórico retido.

O que a equipe aprendeu: a fila não estava errada como tecnologia. Estava errada
como **modelo** — o caso era distribuição de fatos, não de trabalho, e o sintoma
de ter escolhido errado foi ter que publicar N vezes.

## Conceitos Relacionados

- [Garantias de Entrega](/06-distributed-systems/delivery-guarantees.md) — o que o canal promete.
- [Ordenação](/06-distributed-systems/ordering.md) e
  [Mensagens Duplicadas](/06-distributed-systems/duplicate-messages.md).
- [Dead-Letter Queues](/06-distributed-systems/dead-letter-queues.md).
- [Filas](/05-system-design/queues.md) — a visão de design de sistemas.

## Exercício Prático

Para cada uso de mensageria no seu sistema, responda: a mensagem é trabalho para
alguém ou fato para quem interessar?

Se for fato e você usa fila, verifique quantas filas o produtor precisa alimentar.
Mais de uma é o sintoma.

## Perguntas de Entrevista

- Qual a diferença semântica entre fila e log de eventos?
- Por que o padrão outbox é necessário?
- O que acontece se o tempo de visibilidade for menor que o de processamento?

## Para Aprofundar

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*, 2003.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 11.
