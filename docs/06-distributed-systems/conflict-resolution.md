---
id: conflict-resolution
title: Resolução de Conflitos
sidebar_position: 33
description: Duas escritas concorrentes no mesmo dado — e por que "último a escrever vence" descarta dados em silêncio.
doc_type: concept
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor escolhe estratégia de resolução consciente do que ela
  descarta, e reconhece quando o modelo pode evitar o conflito.
prerequisites: [eventual-consistency]
related: [replication, clock-and-time, eventual-consistency]
canonical_for: [resolução de conflitos, último a escrever vence, CRDT]
content_version: 1
last_reviewed: 2026-08-27
---

# Resolução de Conflitos

## Visão Geral

Quando duas escritas concorrentes alteram o mesmo dado em réplicas diferentes, o
sistema precisa decidir qual valor prevalece.

A estratégia padrão da maioria dos sistemas — **último a escrever vence** — é
simples, é o que a maioria usa sem saber, e **descarta dados silenciosamente**.

## Problema

Conflitos surgem sempre que mais de um lugar pode aceitar escrita para o mesmo
dado: replicação com múltiplos líderes, replicação sem líder, aplicações com
operação offline, ou qualquer sistema que continue aceitando escritas durante uma
[partição](/06-distributed-systems/network-failure.md).

O caso concreto: dois usuários editam o mesmo registro ao mesmo tempo, em réplicas
diferentes. Ambas as escritas são aceitas. Ao convergir, uma delas some.

Ninguém é avisado. O usuário cuja escrita foi descartada acredita que ela foi
gravada, porque o sistema respondeu com sucesso.

## Conceitos Centrais

### Último a escrever vence, e o problema dele

A estratégia compara marcas de tempo e mantém a mais recente.

Dois problemas, e ambos são graves.

**Relógios divergem.** A "mais recente" segundo o relógio da máquina pode não ser a
mais recente de fato. Ver [relógio e tempo](/06-distributed-systems/clock-and-time.md). Uma máquina com o
relógio 2 segundos adiantado sempre vence.

**Perda silenciosa.** A escrita descartada some sem registro. Não há erro, não há
alerta, não há como recuperar.

Ela é adequada quando os dados são de fato descartáveis — telemetria, cache,
posição atual de um veículo. É inadequada para dados de negócio, e é o padrão em
vários sistemas.

### As alternativas

**Detectar e preservar ambas.** O sistema guarda as duas versões e devolve as duas
na leitura, para que a aplicação ou o usuário resolva. É o que sistemas como
Dynamo fazem com vetores de versão.

Preserva tudo, e transfere a decisão para quem consome — o que exige interface
para isso.

**Mesclar por regra de domínio.** Um carrinho de compras pode unir os itens das duas
versões. Um contador pode somar os incrementos. A regra vem do negócio.

**Estruturas que convergem sozinhas.** Tipos de dados projetados para que operações
concorrentes sempre convirjam sem coordenação — CRDTs. Contadores, conjuntos,
mapas e até texto colaborativo.

Elegante e limitado ao que pode ser expresso como operação comutativa.

**Evitar o conflito.** Garantir que cada dado tenha um único ponto de escrita —
por [particionamento](/06-distributed-systems/partitioning.md) ou por líder único.

A última é a que a maioria dos sistemas deveria escolher, e a menos discutida.

### Detectar conflito exige versionamento

Comparar marcas de tempo não detecta conflito — detecta ordem, mal.

Para saber que duas escritas foram **concorrentes** — nenhuma soube da outra — é
preciso um vetor de versões: cada réplica mantém um contador, e a comparação dos
vetores revela se uma escrita descendeu da outra ou se foram paralelas.

Sem isso, o sistema não distingue "B substituiu A" de "A e B foram feitas ao mesmo
tempo".

### Operações em vez de valores

Uma mudança de modelagem que elimina muitos conflitos: registrar **o que foi
feito** em vez de **o resultado**.

```text
valor:    saldo = 150        ← duas escritas conflitam
operação: saldo -= 50        ← duas operações compõem
```

Operações comutativas — somar, adicionar a um conjunto — não conflitam. É a base
dos CRDTs e uma técnica aplicável sem eles.

### O conflito pode não ter resolução automática

Alguns conflitos exigem julgamento humano: dois editores alteraram o mesmo
parágrafo de formas incompatíveis.

Nesses casos, a resposta correta é **preservar ambas e apresentar** — não escolher
uma. O sistema que escolhe sozinho está descartando informação que não tem como
avaliar.

## Modelo Mental

**Toda estratégia de resolução escolhe o que perder.** A pergunta é se você
escolheu, ou se o padrão escolheu por você.

## Quando Usar

Estratégia de resolução é necessária sempre que houver mais de um ponto de
escrita. A escolha entre elas:

- **Último a escrever vence** — dados descartáveis, onde perder é aceitável.
- **Preservar ambas** — dados de negócio onde a perda é inaceitável.
- **Mesclar por regra** — quando o domínio define uma união natural.
- **CRDT** — quando as operações são comutativas.
- **Evitar** — sempre que possível.

## Quando Não Usar

**Último a escrever vence para dado de negócio.** Descarte silencioso.

**Resolução automática quando o julgamento é humano.** Escolher por conta produz
perda que ninguém consegue reverter.

**Múltiplos líderes sem estratégia definida.** O padrão vai decidir.

**Comparar marcas de tempo entre máquinas.** Não é confiável.

**CRDT quando a operação não é comutativa.** A estrutura não se aplica.

## Alternativas

- **Líder único por dado** — elimina o conflito. Ver
  [replicação](/06-distributed-systems/replication.md).
- **Particionamento por chave** — cada chave escrita num lugar só.
- **Transação com bloqueio** — serializa as escritas concorrentes.
- **Reserva com prazo** — quem reservou escreve; os outros esperam.

## Trade-offs

| Último a escrever vence | Preservar ambas | CRDT |
|---|---|---|
| Trivial | Exige interface de resolução | Exige modelagem específica |
| Descarta silenciosamente | Nada se perde | Nada se perde |
| Sem estado extra | Versões guardadas | Metadados de convergência |
| Depende de relógio | Não depende | Não depende |
| Qualquer dado | Qualquer dado | Só operações comutativas |

## Modos de Falha

**Perda silenciosa.** A escrita descartada nunca é reportada.

**Relógio adiantado sempre vencendo.** Uma máquina dessincronizada domina.

**Versões acumulando.** Preservar ambas sem interface de resolução faz o número de
versões crescer.

**Mesclagem que produz estado inválido.** Unir dois carrinhos pode exceder o limite
de itens.

**Conflito não detectado.** Sem vetor de versões, o sistema não sabe que houve
concorrência.

## Erros Comuns

**Aceitar o padrão sem saber qual é.**

**Adotar múltiplos líderes sem estratégia.**

**Não registrar quando um conflito ocorre.** Sem métrica, ninguém sabe a
frequência.

**Assumir que conflitos são raros sem medir.**

**Não considerar evitar o conflito.** É a solução mais robusta.

## Exemplo Real

Um aplicativo de vendas de campo funcionava offline: o vendedor registrava pedidos
sem conexão e sincronizava depois.

O servidor usava último a escrever vence, comparando a marca de tempo do
dispositivo.

Dois problemas.

**Relógios de dispositivo.** Alguns aparelhos tinham o relógio errado — um estava
3 horas adiantado. Toda sincronização dele sobrescrevia alterações feitas por
outros vendedores depois, porque a marca de tempo "vencia".

**Perda de itens.** Dois vendedores da mesma conta adicionavam itens ao mesmo
pedido offline. Ao sincronizar, a segunda sincronização substituía o pedido
inteiro — os itens do primeiro sumiam.

Nenhum dos dois gerava erro. Os vendedores descobriam pela reclamação do cliente.

A reformulação mudou o modelo, não só a estratégia.

**Operações em vez de estado.** O dispositivo passou a enviar "adicionou item X",
"removeu item Y" — em vez do pedido completo. Adições de vendedores diferentes
compõem naturalmente.

**Vetor de versões** para detectar concorrência real, em vez de comparar marcas de
tempo.

**Resolução por domínio** para os casos que restam: alteração de quantidade do
mesmo item por dois vendedores gera conflito explícito, apresentado ao supervisor
para decidir.

**Métrica de conflito.** Passou a haver contagem. Descobriu-se que conflitos reais
eram raros — cerca de 0,3% das sincronizações — e que a perda anterior vinha
majoritariamente do problema de relógio, não de concorrência genuína.

Esse último número é o que a equipe registrou como mais revelador: elas estavam
perdendo dados com frequência muito maior do que a concorrência real justificava,
e a causa era a estratégia, não o cenário.

## Conceitos Relacionados

- [Consistência Eventual](/06-distributed-systems/eventual-consistency.md) — onde conflitos surgem.
- [Replicação](/06-distributed-systems/replication.md) — múltiplos líderes e sem líder.
- [Relógio e Tempo](/06-distributed-systems/clock-and-time.md) — por que marca de tempo não decide.
- [Ordenação](/06-distributed-systems/ordering.md).

## Exercício Prático

Se seu sistema tem mais de um ponto de escrita para o mesmo dado, descubra qual a
estratégia de resolução configurada.

Depois pergunte: existe métrica de quantos conflitos acontecem? Se não existir,
você não sabe quanto está sendo descartado.

## Perguntas de Entrevista

- Por que "último a escrever vence" é problemático?
- Como detectar que duas escritas foram concorrentes?
- O que torna uma operação adequada a CRDT?

## Para Aprofundar

- DeCandia, Giuseppe et al. *Dynamo: Amazon's Highly Available Key-value Store*.
  SOSP, 2007.
- Shapiro, Marc et al. *Conflict-Free Replicated Data Types*, 2011.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 5.
