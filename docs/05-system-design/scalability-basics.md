---
id: scalability-basics
title: Estratégias Básicas de Escalabilidade
sidebar_position: 23
description: O que fazer depois de identificar o gargalo — na ordem de custo, não de reputação.
doc_type: concept
level: 3
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor aplica as estratégias de escala na ordem correta de custo
  e reconhece quando escalar não é a resposta.
prerequisites: [bottleneck-analysis]
related: [caching, load-balancing, queues, scalability]
canonical_for: [estratégias de escalabilidade]
content_version: 1
last_reviewed: 2026-08-27
---

# Estratégias Básicas de Escalabilidade

## Visão Geral

Identificado o [gargalo](/05-system-design/bottleneck-analysis.md), há um conjunto conhecido de
respostas.

Este documento as apresenta **na ordem de custo** — que é diferente da ordem em que
elas costumam ser consideradas. A tendência natural é começar pelas caras.

## Problema

"Precisamos escalar" costuma significar "vamos distribuir": mais serviços, mais
partições, mais componentes.

Essa é a resposta mais cara e frequentemente a última necessária. Antes dela há
várias que custam ordens de grandeza menos e resolvem a maior parte dos casos.

O erro não é distribuir — é distribuir **antes** de ter esgotado o que é barato.
E depois de distribuir, voltar atrás custa migração.

## Conceitos Centrais

### A ordem de custo

**1. Remover o trabalho.** O ganho mais barato: uma consulta que não precisa
existir, um campo que ninguém lê, uma chamada que pode ser eliminada. Custa quase
nada e é a menos considerada.

**2. Corrigir o que está errado.** Índice ausente, consulta que percorre tabela,
N+1. Frequentemente o gargalo inteiro está aqui, e a correção leva horas.

**3. Escalar verticalmente.** Uma máquina maior. É desprezado por não parecer
arquitetura, e resolve mais do que se admite — máquinas modernas comportam cargas
que exigiriam clusters há uma década. Custa dinheiro e nenhuma complexidade.

**4. Cachear.** Evitar recalcular. Ver [cache](/05-system-design/caching.md). Custa invalidação e um
componente.

**5. Escalar horizontalmente.** Mais instâncias sem estado atrás de um
[balanceador](/05-system-design/load-balancing.md). Custa a exigência de ausência de estado.

**6. Tornar assíncrono.** Mover trabalho para [fila](/05-system-design/queues.md). Custa consistência
eventual, duplicação e ordem.

**7. Replicar leitura.** Réplicas do banco. Custa atraso de replicação e roteamento
de consulta.

**8. Particionar.** Dividir os dados por chave. Custa muito: operações que
atravessam partições ficam caras, e a escolha da chave é difícil de reverter.

Cada degrau custa mais que o anterior. **Suba um de cada vez, medindo.**

### Escala vertical é subestimada

O reflexo é tratar escala vertical como derrota. Vale contrapor com números: uma
instância de banco atual comporta dezenas de milhares de transações por segundo e
centenas de gigabytes em memória.

A maior parte dos sistemas que adota particionamento nunca chegou perto de saturar
uma instância única — e assumiu permanentemente o custo de operações entre
partições.

Escala vertical tem limite, e o limite é mais alto do que a intuição sugere.

### Ausência de estado é o degrau que destrava

O passo 5 depende de [ausência de estado](/05-system-design/stateless-vs-stateful.md). Um componente
com estado local não escala horizontalmente sem afinidade — que desequilibra — ou
sem particionamento — que é o degrau 8.

Por isso vale investir em ausência de estado cedo: ela é barata quando o sistema é
pequeno e cara de retrofitar depois.

### Reduzir a carga é uma estratégia

O degrau 1 merece ser dito de novo, porque quase nunca aparece nas discussões.

Uma tela que carrega 40 campos e mostra 5. Um relatório calculado em tempo real
que ninguém abre. Uma sincronização que roda a cada minuto quando de hora em hora
bastaria.

Cada um desses é capacidade recuperada sem nenhum custo arquitetural.

### Escalar não conserta

Escala aumenta capacidade; ela não corrige lentidão intrínseca. Se cada requisição
leva 3 segundos por uma consulta ruim, dez instâncias atendem dez vezes mais
requisições — todas em 3 segundos.

Ver [desempenho versus escalabilidade](/11-scalability/index.md).

## Modelo Mental

**Suba um degrau por vez, medindo entre eles.** O degrau certo é o mais barato que
resolve o gargalo atual.

## Quando Usar

- O gargalo foi identificado por medição.
- O requisito não está sendo atendido.
- Há previsão de crescimento com prazo.
- Um recurso está acima de 70% de utilização.

## Quando Não Usar

**Antes de identificar o gargalo.** Escalar o que não limita não muda nada — e
escalar a aplicação quando o gargalo é o banco piora, porque mais instâncias
significam mais conexões.

**Quando o requisito já é atendido.** Capacidade ociosa é custo.

**Pulando degraus.** Particionar sem ter tentado índice, cache e escala vertical é
assumir custo permanente por um problema possivelmente temporário.

**Quando o problema é latência de uma operação.** Escala não torna nada mais
rápido.

**Sem medir depois.** Sem verificação, ninguém sabe se o degrau resolveu.

## Alternativas

- **Reduzir a carga** — o degrau 1, e o mais barato.
- **Aceitar a degradação** — se o pico é raro e a consequência é pequena, aceitar
  pode ser mais barato que dimensionar para ele.
- **Limitar a taxa** — proteger a capacidade em vez de aumentá-la. Ver
  [rate limiting](/05-system-design/rate-limiting.md).
- **Degradar** — servir versão mais barata sob pressão.

## Trade-offs

| Degrau | Ganho | Custo |
|---|---|---|
| Remover trabalho | Variável, às vezes grande | Nenhum |
| Corrigir consulta | Frequentemente ordens de grandeza | Horas |
| Escalar vertical | Linear até o limite | Dinheiro |
| Cache | Alto em leitura | Invalidação, frescor |
| Escalar horizontal | Linear | Ausência de estado |
| Assíncrono | Absorve pico | Consistência eventual |
| Réplica de leitura | Leitura escala | Atraso, roteamento |
| Particionar | Escrita escala | Operações entre partições, chave difícil |

## Modos de Falha

**Escalar a aplicação com o banco saturado.** Mais conexões, mais pressão.

**Particionar com chave errada.** Uma partição concentra a carga — um
[hotspot](/11-scalability/index.md) — e o particionamento não ajuda.

**Cache mascarando problema.** A taxa de acerto cai e o problema volta pior.

**Assíncrono escondendo incapacidade.** A fila cresce indefinidamente.

**Réplica com atraso não considerado.** Leitura logo após escrita não vê o dado.

## Erros Comuns

**Pular direto para distribuição.**

**Não considerar escala vertical.**

**Não medir entre degraus.**

**Confundir escala com desempenho.**

**Não considerar reduzir a carga.**

## Exemplo Real

Um sistema de emissão de boletos atendia 40 requisições por segundo e o requisito
era 200. A proposta inicial: particionar o banco e distribuir a aplicação em três
regiões.

A subida degrau a degrau levou seis semanas e nunca chegou ao particionamento.

**Degrau 1.** A tela de emissão carregava o histórico completo do cliente —
usado por nenhum campo exibido. Removido: 40 → 65 req/s.

**Degrau 2.** Duas consultas sem índice adequado, encontradas no perfil. Índices
criados: 65 → 140 req/s.

**Degrau 3.** A instância do banco estava num tamanho definido três anos antes.
Dobrada: 140 → 190 req/s. Custo mensal adicional equivalente a dois dias de
trabalho de um engenheiro.

**Degrau 4.** Cache na consulta de dados cadastrais do cliente, que mudavam
raramente e eram lidos em toda emissão: 190 → 310 req/s.

Parou aí, com folga de 55% sobre o requisito.

O custo total: seis semanas de trabalho, majoritariamente medição, e um aumento de
instância. O plano original — particionamento e multi-região — estava estimado em
dois trimestres e teria adicionado custo operacional permanente.

O que a equipe registrou no ADR: os degraus 1 e 2 sozinhos entregaram 250% do
ganho, e ambos eram correções de coisas erradas, não escala. Se a proposta
original tivesse sido executada, os dois problemas continuariam lá — distribuídos.

## Conceitos Relacionados

- [Análise de Gargalos](/05-system-design/bottleneck-analysis.md) — o que precede.
- [Cache](/05-system-design/caching.md), [Balanceamento](/05-system-design/load-balancing.md),
  [Filas](/05-system-design/queues.md) — degraus específicos.
- [Sem Estado vs. Com Estado](/05-system-design/stateless-vs-stateful.md) — o que destrava a escala
  horizontal.
- [Escalabilidade](/11-scalability/index.md) — o tratamento em profundidade.

## Exercício Prático

Se seu sistema tem um problema de capacidade, percorra os degraus por escrito
antes de agir: existe trabalho a remover? Consulta a corrigir? Quando a instância
foi dimensionada pela última vez?

Os três primeiros degraus resolvem a maioria dos casos e quase nunca são
tentados na ordem.

## Perguntas de Entrevista

- Qual a ordem de custo das estratégias de escala?
- Por que escalar a aplicação pode piorar um gargalo de banco?
- Por que escala vertical é subestimada?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Gregg, Brendan. *Systems Performance*. 2ª ed., 2020.
