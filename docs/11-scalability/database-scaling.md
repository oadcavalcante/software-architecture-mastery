---
id: database-scaling
title: Escala de Banco de Dados
sidebar_position: 10
description: O gargalo real da maioria dos sistemas — e a ordem de escalada que evita distribuir cedo demais.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor segue uma ordem de escalada do banco, esgotando as opções
  baratas antes das caras.
prerequisites: [scalability]
related: [scaling-replication, scaling-partitioning, hotspots]
canonical_for: [escala de banco de dados, pool de conexões, contenção de escrita, escada de escalada]
content_version: 3
last_reviewed: 2026-08-28
---

# Escala de Banco de Dados

## Visão Geral

O banco de dados é o gargalo real da maioria dos sistemas, e o componente mais difícil
de escalar — porque é onde o estado mora, e estado não se multiplica de graça.

Existe uma ordem de escalada, do mais barato para o mais caro. Segui-la evita a
decisão que mais custa nesta seção: **distribuir o banco antes de necessário**.

## Problema

Quando o sistema fica lento e o banco aparece como limitante, a discussão pula para
particionamento — a solução mais cara e mais irreversível disponível.

Antes dela há uma sequência de intervenções que, juntas, costumam entregar uma ou duas
ordens de grandeza. Cada uma custa dias ou semanas; o particionamento custa meses e
complexidade permanente.

O problema não é o particionamento. É a ordem.

## Conceitos Centrais

### A escada de escalada

Do mais barato para o mais caro:

```text
1. índice e consulta        dias — o ganho mais frequente
2. pool de conexões         dias — resolve saturação por concorrência
3. cache                    semanas — remove leitura repetida
4. máquina maior            horas — compra tempo sem complexidade
5. réplica de leitura       semanas — separa leitura de escrita
6. separar cargas           semanas — analítico sai do transacional
7. arquivar dados frios     semanas — tabelas menores, tudo mais rápido
8. particionar tabelas      semanas — dentro do mesmo banco
9. dividir por domínio      meses — bancos separados por contexto
10. particionar entre nós   meses — a última opção
```

A regra: **não pule degraus**. Cada um resolve uma classe diferente de problema, e o
degrau 10 não conserta o que o degrau 1 resolveria.

O erro característico é ir do 1 direto ao 10, porque o 10 é o que aparece nas
conferências.

### Leitura e escrita têm limites diferentes

```text
leitura   escala bem — réplicas, cache. Limite alto.
escrita   escala mal — precisa ir para o primário. Limite baixo.
```

A maioria dos sistemas tem proporção de 10 para 1 ou mais a favor da leitura. Isso
significa que réplicas e cache resolvem a maior parte do problema.

Quando o gargalo é genuinamente de escrita, as opções encolhem: particionar, ou
reduzir a escrita — em lote, assíncrona, ou eliminando a que não é necessária.

Distinguir os dois casos antes de decidir é o que evita construir a solução errada.

### Conexões saturam antes da CPU

O gargalo mais comum e o menos suspeitado.

Cada conexão consome memória e um processo ou fio de execução no banco. O limite
prático é de algumas centenas — muito abaixo do que uma camada de aplicação escalada
horizontalmente vai abrir.

Ver [escala horizontal](/11-scalability/horizontal-scaling.md) e a lei de Little em
[desempenho versus escalabilidade](/11-scalability/performance-vs-scalability.md).

Um **intermediário de conexões** multiplexa muitas conexões de aplicação em poucas de
banco. É uma das intervenções de melhor relação entre esforço e resultado, e
frequentemente entra tarde.

### Contenção de escrita não é resolvida por capacidade

Quando muitas transações disputam o mesmo registro, elas serializam — independentemente
de CPU, memória ou número de réplicas.

```text
saldo de uma conta         toda transação atualiza a mesma linha
estoque de produto popular idem
contador agregado          idem
```

As saídas são de modelagem, não de infraestrutura:

**Operação relativa** em vez de ler-calcular-gravar.

**Contadores parciais** somados na leitura.

**Livro de movimentações** com saldo derivado.

**Fila** que serializa deliberadamente, com processamento em lote.

Ver [pontos quentes](/11-scalability/hotspots.md) e
[transações](/07-data-architecture/transactions.md).

### Dados frios pesam em tudo

Tabelas grandes degradam índices, estatísticas, manutenção e cópias de segurança —
mesmo que os dados antigos nunca sejam consultados.

Arquivar o que não é acessado é uma das intervenções mais subestimadas: uma tabela que
encolhe 80% fica mais rápida em tudo, sem mudar nada da arquitetura.

Ver [particionamento de dados](/07-data-architecture/data-partitioning.md) — o
descarte de partição torna o arquivamento uma operação de metadados.

### Dividir por domínio antes de particionar

Se o banco único está no limite, separar por contexto — pedidos num banco, catálogo em
outro — costuma ser mais simples que particionar.

Ganhos: cada banco fica menor, escala independentemente, e a fronteira segue o
domínio, que é uma divisão que já existe.

Custo: consultas que cruzam os dois deixam de existir, e a consistência entre eles vira
problema de aplicação. Ver
[propriedade do dado](/07-data-architecture/data-ownership.md).

É o degrau 9, e ele resolve muitos casos que seriam levados ao 10.

## Modelo Mental

**Escale o banco de baixo para cima.** O degrau que resolve o seu problema é quase
sempre mais baixo do que a discussão sugere.

## Quando Usar

Cada degrau tem seu momento:

- **1 a 3:** sempre, antes de qualquer outra coisa.
- **4:** quando a máquina tem folga disponível.
- **5:** quando a leitura domina e tolera atraso.
- **6:** quando há carga analítica misturada.
- **7:** quando há dados antigos raramente acessados.
- **8 a 10:** quando os anteriores foram esgotados e medidos.

## Quando Não Usar

**Particionar antes de esgotar os degraus anteriores.**

**Réplica de leitura para operação que exige dado do instante.**

**Cache sem estratégia de invalidação.** Ver
[cache para escala](/11-scalability/scaling-cache.md).

**Mais capacidade para contenção de escrita.**

**Dividir por domínio sem que a fronteira exista** no negócio.

**Aumentar o pool de conexões** sem intermediário — piora a contenção no banco.

## Alternativas

- **Reduzir a escrita** — agrupar, tornar assíncrona, eliminar a desnecessária.
- **[CQRS distribuído](/06-distributed-systems/distributed-cqrs.md)** — modelo de leitura
  separado.
- **Armazenamento adequado por carga** — busca num índice invertido, série temporal
  num banco próprio. Ver
  [NoSQL](/07-data-architecture/nosql.md).
- **Banco relacional distribuído** — mantém o modelo e distribui a escrita, ao custo de
  latência de coordenação.

## Trade-offs

| Réplica de leitura | Particionamento |
|---|---|
| Escala leitura | Escala escrita e leitura |
| Consistência eventual | Forte por partição |
| Configuração | Redesenho |
| Reversível | Praticamente irreversível |

| Dividir por domínio | Particionar |
|---|---|
| Fronteira já existe | Artificial |
| Consultas cruzadas somem | Preservadas na partição |
| Cada banco escala só | Escala uniforme |

## Modos de Falha

**Conexões esgotadas com CPU ociosa.**

**Réplica atrasada servindo dado velho.** Ver
[replicação para escala](/11-scalability/scaling-replication.md).

**Contenção em registro quente.**

**Particionamento com chave errada.** Redistribuir exige reescrever tudo.

**Consulta cruzando partições.** O que era uma consulta vira N mais agregação.

**Transação longa segurando recursos.**

**Manutenção não acompanhando.** Estatísticas desatualizadas produzem planos ruins.

## Erros Comuns

**Pular para particionamento.** Índice adequado, réplica de leitura e correção de consulta resolvem a maioria dos casos. Particionar impede junção e transação entre partições — custo permanente por um limite que talvez não tenha chegado.

**Não usar intermediário de conexões.** Cada conexão consome memória no banco, e instâncias de aplicação multiplicam o número delas. O limite de conexões costuma ser atingido bem antes do limite de CPU.

**Não separar carga analítica.** Uma consulta que varre meses compete por memória e disco com as transações do horário comercial, e é a causa mais frequente de lentidão intermitente sem explicação.

**Não arquivar dados frios.** Tabelas que crescem para sempre degradam índice, backup e restauração. Mover o histórico que ninguém consulta costuma render mais por semana de engenharia que
qualquer outro degrau, quando a tabela cresce sem política de retenção e os índices deixaram
de caber em memória.

**Escolher chave de partição sem analisar o padrão de consulta.** Se a chave não aparece nas consultas frequentes, cada uma delas precisa perguntar a todas as partições — e o particionamento piorou o desempenho que deveria melhorar.

**Tratar contenção de escrita como falta de capacidade.** Quando milhares de transações disputam a mesma linha, adicionar máquina não ajuda: o gargalo é o bloqueio, e a solução é mudar o modelo.

## Exemplo Real

Uma plataforma de pagamentos chegou ao limite do banco: latência de escrita subindo,
timeouts em horário de pico, e a proposta na mesa era particionar por identificador de
comerciante — projeto estimado em sete meses.

A escada foi percorrida antes:

**Degrau 1 — consultas.** Três consultas respondiam por 60% da carga de leitura. Duas
tinham junções desnecessárias; uma faltava índice composto. Correção em quatro dias.
Carga de leitura caiu 45%.

**Degrau 2 — conexões.** As instâncias demandavam 1.100 conexões contra um limite de 400 no
banco: as excedentes eram recusadas, e a fila de espera ficava no pool de cada aplicação. Um intermediário de conexões reduziu para 180 conexões
reais. Os timeouts de pico desapareceram nesse mesmo dia.

**Degrau 3 — cache.** Dados de comerciante, lidos em toda transação e alterados
raramente, foram para cache com invalidação por evento. Menos 30% de leitura.

**Degrau 6 — separar cargas.** Relatórios de conciliação rodavam na base transacional.
Movidos para uma réplica dedicada.

**Degrau 7 — arquivar.** Transações com mais de dois anos, nunca consultadas pela
operação, foram para armazenamento frio. A tabela principal encolheu 70%, e os índices
couberam em memória — o que melhorou tudo.

**Contenção de escrita.** Descoberta no meio do processo: o saldo do comerciante era
atualizado com ler-calcular-gravar a cada transação. Comerciantes grandes tinham
dezenas de transações concorrentes na mesma linha. Substituído por operação relativa,
com o saldo detalhado derivado de um livro de movimentações.

Resultado após dez semanas: latência de escrita de 340 ms para 28 ms no pico,
capacidade de transações por segundo quadruplicada, **sem particionar**.

O plano de particionamento foi arquivado com o desenho pronto e um gatilho definido:
quando a utilização de escrita passar de 60% de forma sustentada por um mês.

O que a equipe aprendeu: os degraus 1 e 2, sozinhos, resolveram o incidente que
motivou o projeto — e custaram uma semana. A proposta de sete meses tinha sido montada
sem nenhuma das medições que a escada exige.

## Conceitos Relacionados

- [Replicação para Escala](/11-scalability/scaling-replication.md) e
  [Particionamento](/11-scalability/scaling-partitioning.md).
- [Pontos Quentes](/11-scalability/hotspots.md) — a contenção.
- [Indexação](/07-data-architecture/indexing.md) — o degrau 1.
- [OLTP](/07-data-architecture/oltp.md) — a separação de cargas.

## Exercício Prático

Percorra a escada com o seu banco: quantos degraus você já subiu, e qual é o próximo?

Se a discussão no seu time está no degrau 10 e você não passou pelo 2, o intermediário
de conexões provavelmente resolve o problema desta semana.

## Perguntas de Entrevista

- Por que conexões saturam antes da CPU?
- Por que contenção de escrita não é resolvida por capacidade?
- Por que dividir por domínio costuma ser preferível a particionar?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Botros, Silvia; Tinley, Jeremy. *High Performance MySQL*. 4ª ed. O'Reilly, 2021.
- Winand, Markus. *SQL Performance Explained*, 2012.
