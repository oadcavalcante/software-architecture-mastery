---
id: latency
title: Latência
sidebar_position: 4
description: O tempo entre pedir e receber — e por que a média esconde exatamente o que importa.
doc_type: concept
level: 4
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor raciocina sobre latência em percentis, entende como ela se
  compõe numa cadeia, e sabe por que a cauda domina a experiência.
prerequisites: [distributed-fundamentals]
related: [timeouts, network-failure, bottleneck-analysis]
canonical_for: [latência, percentil, cauda de latência]
content_version: 1
last_reviewed: 2026-08-27
---

# Latência

## Visão Geral

Latência é o tempo entre enviar uma requisição e receber a resposta.

Duas propriedades tornam o raciocínio sobre ela contraintuitivo: **ela é uma
distribuição, não um número**, e **numa cadeia de chamadas, a cauda domina**.

## Problema

A forma padrão de relatar latência é a média, e ela é quase sempre a métrica
errada.

Um sistema com média de 200 ms pode ter 5% das requisições acima de 3 segundos.
Esses 5% são usuários reais, e a média nunca os revela — porque a distribuição de
latência não é simétrica. Ela tem uma cauda longa à direita, produzida por
retentativa de rede, coleta de lixo, cache frio, contenção e todas as
irregularidades de um sistema real.

Reportar média num sistema com cauda longa é reportar o número que descreve
ninguém.

## Conceitos Centrais

### Percentis, sempre

O percentil 99 significa: 99% das requisições foram mais rápidas que isto.

```text
p50  = 80 ms    ← metade das requisições
p95  = 240 ms
p99  = 1 400 ms  ← 1 em 100
p999 = 4 200 ms  ← 1 em 1 000
```

O p50 e o p99 do mesmo sistema costumam diferir por uma ordem de grandeza.

Qual percentil monitorar depende do volume. Com um milhão de requisições por dia,
o p999 são mil requisições — pessoas suficientes para gerar reclamação.

E percentis **não somam**. O p99 de uma cadeia não é a soma dos p99 de cada elo —
é preciso medir de ponta a ponta.

### A cauda domina em cadeia

O resultado mais importante deste documento, e o menos intuitivo.

Se uma requisição do usuário dispara N chamadas paralelas e precisa de todas, a
latência percebida é a do **mais lento** dos N.

```text
1 chamada com p99 de 1 s   → ~1% das requisições acima de 1 s
100 chamadas paralelas     → ~63% das requisições têm ao menos uma acima de 1 s
```

Com cem chamadas, a probabilidade de nenhuma cair no percentil 99 é
`0,99¹⁰⁰ ≈ 0,37`. Ou seja: **o p99 de um serviço vira o caso comum de uma página
que o consulta cem vezes.**

Isso é o que Jeff Dean chamou de *tail at scale*, e é a razão pela qual reduzir a
cauda importa mais que reduzir a média em sistemas com muitas chamadas.

### De onde a latência vem

| Componente | Ordem de grandeza |
|---|---|
| Referência de memória | ~100 ns |
| Ida e volta na mesma zona | ~0,5 ms |
| Leitura aleatória em disco de estado sólido | ~100 µs |
| Ida e volta entre regiões, mesmo continente | ~30 ms |
| Ida e volta intercontinental | ~150 ms |

A última linha é física — a velocidade da luz em fibra dá cerca de 200 km/ms, e o
caminho nunca é reto. Nenhuma otimização de código compensa distância, e é por isso
que [CDN](/05-system-design/cdn.md) e multi-região existem.

### Latência sob carga não é linear

Um recurso responde de forma estável até cerca de 70% de utilização e degrada
rapidamente depois, porque o tempo de espera na fila cresce de forma não linear
conforme a utilização se aproxima de 100%.

A consequência prática: um sistema que responde bem a 60% de carga pode ficar
inutilizável a 90% — não porque algo quebrou, mas porque a fila cresceu.

### Latência variável é pior que latência alta

Um sistema que responde consistentemente em 500 ms é mais fácil de projetar do que
um que responde entre 50 ms e 3 segundos.

Latência previsível permite calibrar [timeouts](/06-distributed-systems/timeouts.md), dimensionar pools e
prometer prazos. Latência variável obriga a dimensionar para o pior caso, e o pior
caso é desconhecido.

## Modelo Mental

**Latência é uma distribuição.** A pergunta nunca é "quanto demora", é "quanto
demora para quantos".

## Quando Usar

Este documento informa:

- Definir requisitos de desempenho em percentil, não em média.
- Calibrar [timeouts](/06-distributed-systems/timeouts.md) a partir do percentil real.
- Decidir se paralelizar chamadas ajuda ou piora.
- Avaliar se uma arquitetura multi-região é necessária.

## Quando Não Usar

**Otimizar latência que já atende ao requisito.** Capacidade gasta onde não rende.

**Perseguir a média.** Ela raramente é o que os usuários percebem.

**Ignorar a cauda porque "é só 1%".** Em cadeia, esse 1% vira o caso comum.

**Paralelizar sem considerar a cauda.** Dividir uma operação em dez chamadas
paralelas reduz a latência média e piora o percentil alto.

## Alternativas

Para reduzir latência percebida, quando otimizar não basta:

- **Cache** — evitar a operação. Ver
  [cache](/05-system-design/caching.md).
- **Proximidade** — CDN, réplica regional.
- **Assíncrono** — responder antes de completar. Ver
  [request/response](/05-system-design/request-response.md).
- **Requisição de reserva** — enviar a mesma requisição a duas réplicas e usar a
  primeira resposta. Reduz a cauda ao custo de trabalho duplicado.
- **Degradar** — servir resposta parcial em vez de esperar a lenta.

## Trade-offs

| Reduzir a cauda | Reduzir a média |
|---|---|
| Melhora a experiência percebida | Melhora o número reportado |
| Difícil: exige achar irregularidades | Mais direto |
| Domina em sistemas com muitas chamadas | Domina com poucas |

| Paralelizar | Sequencial |
|---|---|
| Latência total menor no caso típico | Soma dos tempos |
| Exposição à cauda multiplicada | Uma exposição |
| Mais carga simultânea | Distribuída |

## Modos de Falha

**Requisito em média.** O sistema "atende" e os usuários reclamam.

**Cauda ignorada.** O p99 degrada e a média não muda.

**Timeout calibrado pela média.** Ele corta o caso legítimo do percentil alto.

**Paralelização que piora.** Dez chamadas paralelas, cada uma com p99 de 1 s,
produzem uma resposta acima de 1 s em cerca de 10% dos casos.

**Latência medida do lado errado.** Medir no servidor esconde o tempo de rede e de
fila, que é o que o usuário sente.

## Erros Comuns

**Relatar e monitorar média.**

**Não medir de ponta a ponta.**

**Assumir que percentis somam.**

**Ignorar a variabilidade.** Latência instável custa mais que latência alta e
estável.

**Medir só em condição normal.** A cauda aparece sob carga.

## Exemplo Real

Uma página de resultados de busca consultava seis serviços em paralelo e
aguardava todos.

Cada serviço tinha p99 de 800 ms e média de 90 ms. O painel mostrava média de
110 ms e o time considerava o desempenho excelente.

As reclamações de lentidão não paravam.

A medição de ponta a ponta, do lado do cliente, mostrou outra realidade: p50 de
180 ms, p95 de 1,2 s, p99 de 2,4 s.

A causa é aritmética. Com seis chamadas paralelas de p99 de 800 ms, a chance de
nenhuma cair no percentil alto é `0,99⁶ ≈ 0,94` — ou seja, **6% das páginas tinham
ao menos uma chamada lenta**, e a página inteira esperava por ela.

Duas correções.

Três dos seis serviços eram enriquecimento — avaliações, recomendações, histórico.
Passaram a ter prazo próprio de 200 ms, e a página é renderizada sem eles se
estourarem. Degradação em vez de espera.

E o serviço com a pior cauda ganhou requisição de reserva: a chamada vai para duas
réplicas e a primeira resposta vence. O trabalho duplicado custa cerca de 5% mais
carga e cortou o p99 daquele serviço para 240 ms.

Resultado de ponta a ponta: p95 de 310 ms, p99 de 520 ms.

A média nunca tinha sido o problema, e por isso o painel nunca mostrou nada.

## Conceitos Relacionados

- [Timeouts](/06-distributed-systems/timeouts.md) — calibrados a partir da distribuição.
- [Falha de Rede](/06-distributed-systems/network-failure.md) — a origem da variabilidade.
- [Análise de Gargalos](/05-system-design/bottleneck-analysis.md).
- [Observabilidade](/13-observability/index.md) — como medir.
- [Requisitos Não-Funcionais](/01-fundamentals/non-functional-requirements.md) — onde
  a distribuição vira requisito com número.

## Exercício Prático

Pegue a operação mais importante do seu sistema e obtenha o p50, o p95 e o p99,
medidos de ponta a ponta.

Se você só tem a média, essa é a descoberta. Se a razão entre p99 e p50 for maior
que dez, você tem uma cauda que domina a experiência.

## Perguntas de Entrevista

- Por que reportar latência em média é problemático?
- Por que a cauda domina em sistemas com muitas chamadas?
- Como paralelizar pode piorar a latência percebida?

## Para Aprofundar

- Dean, Jeff; Barroso, Luiz André. *The Tail at Scale*. CACM, 2013.
- Gregg, Brendan. *Systems Performance*. 2ª ed., 2020.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
