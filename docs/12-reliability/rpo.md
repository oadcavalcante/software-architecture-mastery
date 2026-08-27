---
id: rpo
title: RPO
sidebar_position: 9
description: Quanto dado pode ser perdido — e por que a resposta "nenhum" quase nunca é verdadeira.
doc_type: foundation
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor define RPO com o negócio e conhece o que cada valor exige da
  replicação.
prerequisites: [reliability]
related: [rto, disaster-recovery-planning, failover]
canonical_for: [RPO, objetivo de ponto de recuperação, perda aceitável de dados]
content_version: 1
last_reviewed: 2026-08-28
---

# RPO

## Visão Geral

RPO — objetivo de ponto de recuperação — é **quanto dado pode ser perdido** numa
recuperação.

Se a cópia mais recente utilizável é de uma hora atrás, o RPO é de uma hora: tudo o que
aconteceu depois se perde.

Como o [RTO](rto.md), é decisão de negócio. E, diferente dele, tem uma resposta
reflexiva que quase nunca se sustenta: "nenhum dado pode ser perdido".

## Por Que Isso Importa

RPO zero exige replicação síncrona — cada escrita confirmada em mais de um lugar antes
de responder ao usuário.

Isso custa latência em **toda** operação de escrita, permanentemente. Ver
[PACELC](../06-distributed-systems/pacelc.md).

```text
síncrono na mesma zona     +1 a 2 ms
síncrono entre zonas       +2 a 5 ms
síncrono entre regiões     +30 a 150 ms
```

A última linha inviabiliza a maioria dos sistemas transacionais. RPO zero entre regiões
é raro, caro, e frequentemente prometido sem que ninguém tenha feito a conta.

E há um segundo custo: replicação síncrona acopla disponibilidade. Se a cópia síncrona
não responde, a escrita não confirma — o sistema fica indisponível para preservar o
RPO.

## Conceitos Centrais

### O RPO define o mecanismo de replicação

```text
RPO          mecanismo                        custo
24 h         cópia diária                     mínimo
1 h          cópia horária, ou log contínuo   baixo
minutos      replicação assíncrona            médio
segundos     replicação assíncrona próxima    médio-alto
zero         replicação síncrona              alto, com latência permanente
```

Ver [replicação de dados](../07-data-architecture/data-replication.md).

O salto de custo entre "segundos" e "zero" é o maior da tabela, e é onde a conversa com
o negócio precisa acontecer com números.

### RPO por tipo de dado

Como o RTO, ele não precisa ser único:

```text
transações financeiras   zero ou segundos
cadastro de cliente      minutos
preferências de interface horas
registros de acesso      dia
```

Isso permite aplicar replicação síncrona apenas onde ela se justifica, mantendo o
restante assíncrono. Frequentemente é a diferença entre viável e inviável.

### O RPO real pode ser pior que o configurado

Três situações em que a perda excede o objetivo:

**Atraso de replicação acima do normal.** Sob carga alta, a réplica fica mais atrás. O
RPO efetivo é o atraso no momento da falha, não o atraso médio.

**Cópia corrompida.** Se a cópia mais recente não restaura, o RPO é o da anterior. Isso
torna o teste de restauração parte da garantia de RPO, não um detalhe operacional.

**Corrupção lógica.** Se o dado foi corrompido antes da cópia, restaurá-la restaura a
corrupção. O RPO relevante passa a ser o da última cópia **anterior ao problema** — que
pode ser dias.

O terceiro caso é o que justifica reter várias gerações e manter uma
[réplica atrasada](../07-data-architecture/data-replication.md).

### Replicação não garante RPO contra erro humano

Um comando destrutivo replica em segundos. O RPO contra falha de hardware pode ser de
segundos, e contra erro humano ser de horas — o intervalo até a cópia anterior.

Declarar um único RPO sem distinguir o cenário é o erro conceitual mais comum aqui.

### O RPO precisa contemplar o que está em trânsito

Além do que foi gravado, um sistema tem trabalho em andamento que a discussão de RPO
costuma ignorar.

```text
mensagens em fila não consumidas
requisições aceitas e não processadas
trabalho em memória de processos
arquivos em transferência
transações abertas
```

Se a fila é durável e replicada, ela entra no mesmo cálculo do banco. Se ela é em
memória, ou se as requisições foram aceitas e ainda não persistidas, esse trabalho se
perde independentemente do RPO do banco.

Ver [processamento assíncrono](../11-scalability/async-processing.md) — aceitar e não
persistir é a forma mais comum de perder trabalho sem que nenhuma métrica registre.

A verificação: some o que está em trânsito no momento típico de pico. Se esse volume
importa, ele precisa ser tratado com o mesmo rigor que o banco.

## Erros Comuns

**Prometer RPO zero** sem calcular o custo de latência.

**RPO único** para todos os tipos de dado.

**Não medir o atraso de replicação real** no percentil alto.

**Não testar restauração**, o que torna o RPO uma hipótese.

**Não distinguir o cenário.** RPO contra falha de hardware e contra erro humano são
diferentes.

**Confundir com [RTO](rto.md).**

## Exemplo Real

Uma corretora declarava RPO zero para o sistema de ordens, com replicação síncrona
entre duas zonas.

A verificação encontrou três problemas.

**O RPO zero era parcial.** A replicação síncrona cobria o banco de ordens. O sistema
de conciliação, que registrava as confirmações da bolsa, usava replicação assíncrona
com atraso típico de 4 segundos. Numa falha, ordens existiriam sem a confirmação
correspondente — o pior estado possível para uma corretora.

**O atraso real era pior que o típico.** No horário de abertura, o atraso da replicação
assíncrona chegava a 40 segundos. O RPO efetivo naquele componente era 40 segundos, não
4.

**Erro humano não estava coberto.** As cópias eram diárias. Um comando destrutivo às
14h significaria perder o dia inteiro — RPO de até 24 horas contra esse cenário, apesar
do "RPO zero" declarado.

A reformulação:

**RPO por tipo de dado**, com o sistema de conciliação passando a síncrono junto com o
de ordens — a latência adicional de 3 ms foi aceita depois de medida.

**RPO por cenário**, declarado explicitamente:

```text
falha de instância ou zona   zero
erro humano ou corrupção     15 minutos
desastre regional            5 minutos
```

**Réplica atrasada de 15 minutos**, cobrindo o cenário de erro humano — o mais barato
dos três controles e o que não existia.

**Cópias a cada 15 minutos** por log contínuo, substituindo a diária.

**Teste mensal de restauração**, com o RPO efetivo medido e registrado.

O que a equipe registra: "RPO zero" era verdade para um componente e falso para o
sistema. E o cenário mais provável — erro humano — era o menos coberto, com uma
exposição de até 24 horas que ninguém tinha notado.

## Conceitos Relacionados

- [RTO](rto.md) — o par.
- [Planejamento de Recuperação](disaster-recovery-planning.md).
- [Replicação de Dados](../07-data-architecture/data-replication.md).
- [PACELC](../06-distributed-systems/pacelc.md) — o custo do síncrono.

## Exercício Prático

Meça o atraso de replicação do seu banco no percentil 99 da última semana, não a média.

Esse número é o seu RPO real contra falha de infraestrutura. Compare com o declarado.

## Perguntas de Entrevista

- Por que RPO zero custa latência permanente?
- Por que o RPO real pode ser pior que o configurado?
- Por que RPO contra erro humano é diferente do RPO contra falha de hardware?

## Para Aprofundar

- ISO 22301 — gestão de continuidade de negócios.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- NIST SP 800-34 — planejamento de contingência.
