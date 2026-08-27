---
id: space-based-architecture
title: Space-Based Architecture
sidebar_position: 30
description: Remover o banco do caminho crítico usando memória replicada — escala extrema por um preço alto.
doc_type: pattern
level: 2
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor reconhece o gargalo específico que este estilo endereça e
  por que ele raramente é a resposta.
prerequisites: [microservices]
related: [event-driven, cqrs, scalability]
canonical_for: [space-based architecture, arquitetura baseada em espaço]
content_version: 1
last_reviewed: 2026-08-26
---

# Space-Based Architecture

## Visão Geral

Space-Based Architecture remove o banco de dados do caminho da requisição. As
unidades de processamento mantêm os dados em memória, replicados entre si, e a
persistência acontece de forma assíncrona.

O nome vem do conceito de *tuple space*. É o estilo mais especializado deste
catálogo, e existe para um gargalo específico.

## Problema

Sistemas com carga altamente variável e concorrente esbarram no mesmo limite: o
banco de dados relacional central.

Adicionar servidores de aplicação não resolve — todos convergem para o mesmo
banco. Réplicas de leitura ajudam nas consultas e não na escrita. Particionar
ajuda até que a operação precise atravessar partições.

O estilo parte de uma observação: **se o banco é o gargalo, tire-o do caminho.**

## Conceitos Centrais

### Os componentes

**Unidade de processamento** — contém a lógica e uma grade de dados em memória
com a parte dos dados de que precisa.

**Grade de dados replicada** — as unidades sincronizam entre si; uma escrita numa
delas se propaga às outras.

**Motor de persistência assíncrona** — grava no banco fora do caminho da
requisição.

**Middleware de virtualização** — distribui requisições e gerencia a entrada e
saída de unidades.

```mermaid
graph TB
  R[Requisições] --> M[Middleware]
  M --> U1[Unidade + memória] & U2[Unidade + memória] & U3[Unidade + memória]
  U1 <--> U2 <--> U3
  U1 & U2 & U3 -.assíncrono.-> DB[(Banco)]
end
```

### A escala é quase linear

Como não há recurso central no caminho, adicionar unidades adiciona capacidade —
até o limite da replicação, que cresce com o número de unidades.

Esse é o ganho, e é real: cargas que nenhum banco central sustenta ficam viáveis.

### O preço

**Consistência eventual entre unidades.** A propagação leva tempo; duas
requisições em unidades diferentes podem ver estados diferentes.

**Perda de dados na falha.** O que está em memória e ainda não foi persistido se
perde se a unidade cai antes da replicação e da gravação.

**Memória como restrição dimensionante.** O conjunto de dados ativo precisa caber.

**Complexidade operacional alta.** Entrada e saída de unidades, rebalanceamento,
particionamento da grade, diagnóstico de divergência.

## Quando Usar

- Carga extremamente variável e imprevisível, com picos de ordens de grandeza.
- O banco central é comprovadamente o gargalo, e as alternativas usuais já
  falharam.
- O conjunto de dados ativo cabe em memória distribuída.
- Consistência eventual é aceitável para o domínio.
- Perda de segundos de dados em falha é tolerável.

## Quando Não Usar

**Na esmagadora maioria dos sistemas.** É preciso dizer isso explicitamente: o
estilo endereça um gargalo que poucos sistemas atingem.

**Quando o banco não foi otimizado.** Índices ausentes, consultas ruins e ausência
de cache explicam a maior parte dos gargalos atribuídos ao banco.

**Quando a consistência forte é requisito.** Financeiro transacional não cabe.

**Quando a perda de dados em falha é inaceitável.**

**Quando o conjunto ativo não cabe em memória.**

**Quando a maturidade operacional não existe.** É o estilo mais exigente em
operação de todo o catálogo.

## Alternativas

Praticamente todas devem ser esgotadas antes:

- **Otimizar consultas e índices** — resolve a maior parte dos casos.
- **Cache distribuído** — captura boa parte do benefício com muito menos custo.
- **Réplicas de leitura** — para carga de leitura.
- **[CQRS](cqrs.md)** — separar os modelos.
- **Particionamento** — quando as operações não atravessam partições.
- **Banco distribuído moderno** — vários oferecem escala horizontal sem que a
  aplicação mude de estilo.

A última alternativa é a que mais reduziu a relevância prática deste estilo:
bancos que escalam horizontalmente resolvem o problema original sem exigir
memória replicada na aplicação.

## Trade-offs

| Space-based | Banco central |
|---|---|
| Escala quase linear | Limitada pelo banco |
| Latência de memória | Latência de rede e disco |
| Consistência eventual | Transacional |
| Risco de perda em falha | Durabilidade garantida |
| Memória como custo dominante | Armazenamento barato |
| Operação muito complexa | Bem compreendida |

## Modos de Falha

**Divergência entre unidades.** Replicação atrasada produz respostas
inconsistentes.

**Perda de dados.** Unidade cai antes de persistir.

**Cérebro dividido.** Partição de rede divide a grade; dois grupos divergem.

**Esgotamento de memória.** O conjunto ativo cresce além do previsto.

**Tempestade de replicação.** A entrada de uma unidade nova dispara sincronização
que satura a rede.

## Erros Comuns

**Adotar sem esgotar as alternativas.**

**Presumir que o banco é o gargalo sem medir.**

**Ignorar a janela de perda de dados.**

**Subestimar a operação.**

## Onde ele aparece na prática

**Plataformas de negociação financeira.** Latência de microssegundos e volume
extremo, com tolerância a reconciliação posterior.

**Sistemas de reserva de alta concorrência.** Venda de ingressos com picos de
ordens de grandeza em minutos.

**Jogos multijogador.** Estado do mundo em memória, persistência assíncrona.

**Plataformas de apostas.** Volume concentrado em janelas curtas.

O denominador comum é revelador: **picos extremos e curtos, com tolerância a
inconsistência momentânea**. Fora desse perfil, o estilo é custo sem retorno — e é
por isso que ele aparece em nichos e não em sistemas de negócio comuns.

## Exemplo Real

Uma plataforma de venda de ingressos enfrentava um problema real: na abertura das
vendas de um evento grande, 400 mil pessoas chegavam em dois minutos. O banco
central saturava em segundos, e a fila de espera crescia até o tempo limite.

Antes de considerar este estilo, a equipe esgotou o resto: índices, cache de
leitura, réplicas, fila de admissão. Cada um comprou algo, e o gargalo permaneceu
na escrita — a reserva de assento é uma escrita concorrente sobre o mesmo
conjunto de linhas.

A solução adotada foi space-based **apenas para o módulo de reserva**, durante a
janela de abertura. O inventário de assentos do evento fica em memória replicada;
reservas acontecem ali; a persistência é assíncrona.

O resto do sistema — cadastro, pagamento, emissão — permaneceu com banco central.

Duas consequências que a equipe aceitou explicitamente. Uma janela de até dois
segundos em que duas unidades podem reservar o mesmo assento, resolvida por
reconciliação com cancelamento e reembolso — que acontece em cerca de 0,01% das
reservas e é tratado como custo de negócio.

E uma janela de perda de dados de segundos, mitigada por replicação tripla.

O que torna o caso defensável não é a tecnologia. É que o escopo foi mínimo, as
alternativas foram esgotadas antes, e as duas consequências foram negociadas com
o negócio em vez de descobertas depois.

## Conceitos Relacionados

- [Microsserviços](microservices.md) — o estilo pode ser aplicado a um serviço.
- [CQRS](cqrs.md) — alternativa mais barata para separar carga.
- [Escalabilidade](../11-scalability/index.md) — as estratégias que vêm antes.
- [Sistemas Distribuídos](../06-distributed-systems/index.md) — replicação e
  consistência.

## Exercício Prático

Se seu sistema tem um gargalo atribuído ao banco, verifique nesta ordem: as
consultas têm índice adequado? Existe cache? A carga é de leitura ou de escrita?
As escritas concorrem sobre as mesmas linhas?

Só a última resposta, sendo sim, aponta na direção deste estilo.

## Perguntas de Entrevista

- Que gargalo específico este estilo endereça?
- Quais alternativas devem ser esgotadas antes?
- Quais são as duas consequências que o negócio precisa aceitar?

## Para Aprofundar

- Richards, Mark; Ford, Neal. *Fundamentals of Software Architecture*. O'Reilly,
  2020 — o capítulo sobre o estilo.
- Gelernter, David. *Generative Communication in Linda*. TOPLAS, 1985 — a origem
  do conceito de espaço de tuplas.
