---
id: rto
title: RTO
sidebar_position: 8
description: Quanto tempo até voltar — uma decisão de negócio com preço, não uma estimativa técnica.
doc_type: foundation
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor define RTO com o negócio e reconhece o que ele exige da
  arquitetura.
prerequisites: [reliability]
related: [rpo, disaster-recovery-planning, failover]
canonical_for: [RTO, objetivo de tempo de recuperação, tempo de retomada]
content_version: 1
last_reviewed: 2026-08-28
---

# RTO

## Visão Geral

RTO — objetivo de tempo de recuperação — é **quanto tempo o serviço pode ficar
indisponível** antes de voltar a operar.

Ele é uma decisão de negócio, não uma estimativa de engenharia. A pergunta que o define
é: quanto custa cada hora parada?

E ele tem um par inseparável: [RPO](rpo.md), que responde quanto dado pode ser perdido.
Os dois juntos definem a estratégia de recuperação e o seu custo.

## Por Que Isso Importa

Sem RTO definido, três coisas acontecem.

**Não há critério de investimento.** Não se sabe se a estratégia atual é suficiente,
excessiva ou insuficiente.

**Não há critério durante o incidente.** A pressão é sempre "o mais rápido possível", o
que leva a decisões apressadas — restaurar sem verificar, promover sem isolar.

**A arquitetura é escolhida sem alvo.** Multi-região, espera quente, piloto aceso e
cópias de segurança entregam RTOs muito diferentes, com preços muito diferentes. Sem
alvo, a escolha vira preferência.

## Conceitos Centrais

### O RTO define a estratégia

```text
RTO           estratégia típica               custo relativo
dias          cópias, restauração manual      muito baixo
horas         cópias com automação            baixo
dezenas de min piloto aceso                   médio
minutos       espera quente                   alto
segundos      ativo-ativo                     muito alto
```

Ver [recuperação de desastre](../09-cloud-architecture/disaster-recovery.md) e
[multi-região](../09-cloud-architecture/multi-region.md).

A escolha é mecânica depois que o número existe. É o número que é difícil.

### O relógio começa antes do que se imagina

O RTO é medido do **início da indisponibilidade**, não do momento em que alguém começa
a agir.

```text
falha ocorre           → 0
alerta dispara         → 4 min
pessoa responde        → 9 min
diagnóstico            → 25 min
decisão de acionar     → 32 min
execução               → 48 min
verificação            → 55 min
```

Neste exemplo, a execução levou 16 minutos e o RTO real foi 55. As três primeiras
etapas — detecção, resposta e diagnóstico — costumam dominar, e são as menos
consideradas quando se estima o tempo de recuperação.

Reduzir RTO frequentemente significa investir em detecção e em clareza de decisão, não
em tecnologia de recuperação.

### RTO por função, não por sistema

Nem tudo precisa voltar junto. Definir um RTO único para o sistema inteiro leva a
dimensionar tudo pelo requisito mais rigoroso.

```text
aceitar pedidos        RTO 15 min
consultar histórico    RTO 4 h
relatórios gerenciais  RTO 24 h
```

Isso permite priorizar durante a recuperação, e reduz substancialmente o custo. Ver
[degradação graciosa](graceful-degradation.md).

E a priorização precisa estar decidida antes: durante o incidente, ninguém tem
serenidade para negociá-la.

### O RTO precisa ser verificado

Um RTO declarado e nunca medido é uma intenção.

A verificação é o exercício de recuperação, cronometrado. Ver
[engenharia do caos](chaos-engineering.md) e
[failover](failover.md).

Times que exercitam descobrem que o tempo real é várias vezes o estimado — na primeira
execução. E que ele cai substancialmente com a prática.

### RTO e a expectativa do usuário são coisas diferentes

Vale separar duas medidas que costumam ser confundidas na comunicação com o negócio.

**RTO** é quando o serviço volta a operar. **Tempo até normalização** é quando a
operação volta ao ritmo anterior — o que inclui processar o acumulado, reconciliar
divergências e reprocessar o que ficou pendente.

```text
serviço restaurado         → 30 min   ← o RTO
fila de pendências drenada → 2 h
conciliação concluída      → 6 h      ← quando o negócio sente que normalizou
```

Prometer RTO de 30 minutos e o negócio esperar normalização em 30 minutos é um
desalinhamento que gera desgaste em todo incidente.

A prática que resolve: declarar as duas medidas separadamente, e estimar a segunda a
partir da capacidade de processamento acumulado. Ver
[escala dirigida por fila](../11-scalability/queue-based-scaling.md).

## Erros Comuns

**Estimado pela engenharia**, sem o custo da parada na mesa.

**Um RTO único** para todo o sistema.

**Medido a partir do início da execução**, ignorando detecção e decisão.

**Nunca verificado** por exercício cronometrado.

**Definido sem considerar dependências.** O RTO do sistema não pode ser menor que o do
fornecedor crítico.

**Confundido com [RPO](rpo.md).** São perguntas diferentes.

## Exemplo Real

Uma operadora de saúde declarava RTO de 4 horas para o sistema de autorização de
procedimentos, número herdado de um documento de conformidade escrito anos antes.

Ninguém tinha verificado, e ninguém sabia de onde vinha.

Duas descobertas mudaram tudo:

**O custo real da parada.** A conversa com a operação revelou que, sem autorização, os
hospitais parceiros suspendem procedimentos eletivos. Quatro horas de parada
significavam procedimentos remarcados, e o custo era muito maior do que qualquer
pessoa da engenharia supunha.

**O tempo real de recuperação.** O primeiro exercício cronometrado levou **11 horas** —
quase três vezes o RTO declarado. O procedimento estava desatualizado, a cota na região
secundária era insuficiente, e ninguém da equipe atual o havia executado.

O RTO foi renegociado com a diretoria, por função:

```text
autorizar procedimento      30 min
consultar autorização       2 h
histórico e relatórios      12 h
```

A mudança de 4 horas para 30 minutos na função crítica exigiu passar de cópias com
automação para piloto aceso, com custo significativo — aprovado sem discussão depois
que o custo da parada foi apresentado.

E, dos 30 minutos, o exercício mostrou que 18 eram detecção e decisão. O investimento
maior acabou indo para monitoramento e para um critério de acionamento claro, não para
infraestrutura.

Após seis exercícios trimestrais, o tempo medido estabilizou em 22 minutos.

O que a equipe registra: o número de 4 horas nunca tinha sido uma decisão. Era um valor
copiado de um modelo de documento, e ele sustentava — no papel — uma estratégia que
levaria 11 horas.

## Conceitos Relacionados

- [RPO](rpo.md) — o par.
- [Planejamento de Recuperação](disaster-recovery-planning.md).
- [Failover](failover.md) — o mecanismo.
- [Métricas de Disponibilidade](availability-metrics.md) — o tempo de recuperação
  medido.

## Exercício Prático

Descubra o RTO declarado do seu sistema mais crítico e de onde ele veio.

Depois cronometre um exercício de recuperação. A diferença entre os dois números é a
sua exposição real.

## Perguntas de Entrevista

- Por que RTO é decisão de negócio?
- Por que o relógio começa antes da execução?
- Por que definir RTO por função em vez de por sistema?

## Para Aprofundar

- ISO 22301 — gestão de continuidade de negócios.
- NIST SP 800-34 — planejamento de contingência.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
