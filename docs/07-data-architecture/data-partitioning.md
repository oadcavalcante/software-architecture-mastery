---
id: data-partitioning
title: Particionamento de Dados
sidebar_position: 17
description: Dividir a tabela para que a consulta leia menos e a manutenção fique viável.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escolhe chave de partição pelo padrão de consulta e
  reconhece quando o particionamento piora em vez de melhorar.
prerequisites: [data-architecture]
related: [data-replication, indexing, data-lifecycle]
canonical_for: [partição de tabela, descarte de partição, partição por intervalo]
content_version: 2
last_reviewed: 2026-08-27
---

# Particionamento de Dados

## Visão Geral

Particionar é dividir uma tabela grande em partes menores segundo uma chave, de
forma que consultas leiam apenas as partes relevantes.

Os fundamentos distribuídos estão em
[particionamento](/06-distributed-systems/partitioning.md). Aqui o foco é o uso
dentro de um armazenamento: o benefício que quase sempre se paga não é desempenho
de consulta — é **manutenção**.

## Problema

Tabelas grandes criam problemas que não são de consulta:

**Apagar dados antigos** trava a tabela por horas e gera volume enorme de registro
de transação.

**Reconstruir índice** exige janela de manutenção que não existe.

**Alterar esquema** vira operação de risco.

**Estatísticas** ficam imprecisas, e o otimizador escolhe planos ruins.

Particionar resolve os quatro, porque cada operação passa a agir sobre uma
partição.

## Conceitos Centrais

### O descarte de partição é o ganho de consulta

Se a consulta filtra pela chave de partição, o banco ignora as demais partições
sem lê-las.

```sql
-- particionado por mês em data_venda
SELECT SUM(valor) FROM vendas WHERE data_venda >= '2025-01-01'
```

Doze partições lidas em vez de sessenta. O ganho é proporcional à fração
descartada.

E a condição é estrita: **a consulta precisa filtrar pela chave de partição**. Uma
consulta que filtra por cliente numa tabela particionada por data lê todas as
partições — e fica mais lenta que a tabela não particionada, porque agora são
sessenta acessos em vez de um.

Esse é o ponto que decide se particionar ajuda ou atrapalha.

### Apagar por partição é instantâneo

O benefício mais confiável e o menos citado.

Apagar seis meses de dados numa tabela grande é uma operação de horas, com bloqueio
e crescimento de registro de transação.

Descartar uma partição é uma operação de metadados — milissegundos, sem bloqueio,
sem crescimento.

Para qualquer tabela com política de retenção, isso sozinho justifica particionar
por tempo. Ver [ciclo de vida do dado](/07-data-architecture/data-lifecycle.md).

### As estratégias

**Por intervalo.** Tipicamente tempo. É a mais comum e a que serve à retenção.

**Por lista.** Valores discretos — região, país, tipo. Boa quando as consultas
sempre filtram por essa dimensão.

**Por hash.** Distribui uniformemente. Elimina concentração e **elimina o descarte
de partição** para consultas de intervalo, porque valores próximos caem em
partições diferentes.

A escolha entre intervalo e hash é entre poder descartar partições e distribuir a
carga uniformemente. Raramente se tem os dois.

### O particionamento precisa ser criado com antecedência

Uma tabela particionada por mês precisa que a partição do próximo mês exista antes
do dia 1º.

O modo de falha é previsível e acontece com frequência: ninguém automatizou a
criação, a partição não existe, e toda inserção falha à meia-noite.

Automatizar a criação com meses de antecedência é o primeiro item operacional de
qualquer tabela particionada.

### Chave de partição em índice único tem custo

Em vários bancos, um índice único numa tabela particionada precisa incluir a chave
de partição.

Isso significa que garantir unicidade global de um campo — um número de documento,
por exemplo — pode não ser possível se a tabela for particionada por outra coisa.

É uma restrição que costuma aparecer tarde, depois do modelo definido.

### Partições demais também custam

Cada partição tem sobrecarga de metadados, e o planejador precisa avaliá-las.

Milhares de partições degradam o tempo de planejamento das consultas, às vezes ao
ponto de dominar o tempo de execução.

Particionar por dia com sete anos de retenção dá 2.500 partições — geralmente
demais. Por mês dá 84, o que é confortável.

## Modelo Mental

**Particionar só ajuda a consulta que filtra pela chave.** Para todas as outras,
ele adiciona custo.

## Quando Usar

- A tabela é grande e cresce continuamente.
- Há política de retenção — apagar por partição é o ganho decisivo.
- As consultas filtram consistentemente por uma dimensão.
- Manutenção da tabela inteira já é inviável.
- Dados antigos podem ir para armazenamento mais barato.

## Quando Não Usar

**Quando as consultas não filtram pela chave.** Piora.

**Em tabela pequena.** Complexidade sem retorno.

**Sem automação de criação de partições.**

**Quando não há dimensão natural de partição.**

**Com granularidade fina demais.**

**Para resolver consulta lenta.** Verifique [índice](/07-data-architecture/indexing.md) antes — é a
causa mais provável.

## Alternativas

- **[Índice](/07-data-architecture/indexing.md) adequado** — resolve a maioria dos casos de consulta
  lenta.
- **Arquivamento periódico** — mover dados antigos para outra tabela.
- **[Colunar](/07-data-architecture/column-stores.md)** — descarte de bloco por valor mínimo e máximo,
  sem particionar.
- **Apagar em lotes pequenos** — resolve o problema de retenção sem particionar,
  ao custo de um processo contínuo.

## Trade-offs

| Particionado | Tabela única |
|---|---|
| Descarte de partição na consulta filtrada | Índice para tudo |
| Apagar é instantâneo | Operação longa |
| Manutenção por partição | Da tabela inteira |
| Consulta não filtrada mais lenta | Uniforme |
| Restrições de unicidade limitadas | Sem restrição |
| Operação adicional | Nenhuma |

| Por intervalo | Por hash |
|---|---|
| Descarte em consulta de período | Não descarta |
| Retenção trivial | Difícil |
| Risco de partição quente | Distribuição uniforme |

## Modos de Falha

**Partição futura ausente.** Inserções falham na virada.

**Consulta sem filtro de partição.** Lê todas.

**Partição quente.** O mês corrente recebe toda a escrita.

**Partições demais.** Planejamento domina o tempo.

**Unicidade impossível.** A restrição precisaria cruzar partições.

**Redistribuição.** Mudar a chave exige reescrever tudo.

## Erros Comuns

**Particionar sem verificar o padrão de consulta.**

**Não automatizar a criação de partições.**

**Granularidade fina demais.**

**Particionar para resolver problema de índice.**

**Não considerar a restrição de unicidade** antes de decidir a chave.

## Exemplo Real

Um sistema de monitoramento industrial guardava leituras de sensores: 44 bilhões de
linhas, crescendo 40 milhões por dia, com retenção de 3 anos — o regime em que a taxa e a
retenção já se equilibraram.

Dois problemas dominavam a operação.

**Apagar dados antigos.** O processo noturno apagava as leituras com mais de 3
anos. Levava 5 horas, gerava 200 GB de registro de transação e degradava o sistema
durante a execução.

**Reconstrução de índice.** Impossível — a janela necessária não existia.

O particionamento por mês resolveu os dois:

**Descarte de partição antiga:** de 5 horas para menos de um segundo.

**Manutenção por partição**, cada uma com volume tratável.

**Consultas por período**, que são a maioria, ficaram entre 5 e 20 vezes mais
rápidas por descarte de partição.

Dois problemas apareceram:

**Consulta por sensor sem período.** A tela de diagnóstico buscava o histórico
completo de um sensor sem filtro de data. Antes lia um índice; depois passou a
varrer 36 partições, e ficou **mais lenta**. Corrigida adicionando filtro de
período padrão de 30 dias na interface — o que, revisto com os operadores, era o
que eles queriam de qualquer forma.

**Partição não criada.** No terceiro mês, o dia 1º chegou sem a partição. A
ingestão parou às 00:00 e ficou 40 minutos fora até alguém entender. A automação
passou a criar 6 meses de antecedência, com alerta se restarem menos de 3.

A leitura que a equipe faz: o ganho que justificou o projeto não foi desempenho de
consulta — foi transformar o apagamento diário de uma operação de risco em
metadados. O ganho de consulta veio junto e foi tratado como bônus.

## Conceitos Relacionados

- [Particionamento](/06-distributed-systems/partitioning.md) — os fundamentos.
- [Indexação](/07-data-architecture/indexing.md) — verifique antes.
- [Ciclo de Vida do Dado](/07-data-architecture/data-lifecycle.md) — retenção.
- [Replicação de Dados](/07-data-architecture/data-replication.md).

## Exercício Prático

Pegue a maior tabela do seu banco e responda: como os dados antigos são apagados
hoje, e quanto tempo essa operação leva?

Se a resposta for "não são apagados", a tabela vai crescer para sempre — e essa é
uma decisão que ninguém tomou.

## Perguntas de Entrevista

- Por que particionar pode deixar uma consulta mais lenta?
- Qual o benefício mais confiável do particionamento?
- Qual o trade-off entre particionar por intervalo e por hash?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 6.
- Winand, Markus. *SQL Performance Explained*, 2012.
- Botros, Silvia; Tinley, Jeremy. *High Performance MySQL*. 4ª ed. O'Reilly, 2021.
