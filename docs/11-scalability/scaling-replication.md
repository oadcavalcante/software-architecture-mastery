---
id: scaling-replication
title: Replicação para Escala
sidebar_position: 6
description: Multiplicar cópias para escalar leitura — o que ela resolve, e o limite que ela não resolve.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor usa réplicas para escalar leitura classificando o que tolera
  atraso, e reconhece onde a replicação não ajuda.
prerequisites: [scalability]
related: [database-scaling, scaling-partitioning, scaling-cache]
canonical_for: [réplica para escala de leitura, amplificação de escrita, classificação de leitura]
content_version: 2
last_reviewed: 2026-08-28
---

# Replicação para Escala

## Visão Geral

Replicar é manter cópias dos dados em mais nós. Para escala, ela resolve um problema
específico e não resolve outro:

```text
escala de leitura   sim — cada réplica atende leituras
escala de escrita   não — toda escrita vai para todas as réplicas
```

Os fundamentos estão em
[replicação](/06-distributed-systems/replication.md) e
[replicação de dados](/07-data-architecture/data-replication.md). Aqui interessa o
cálculo de escala e o que ele revela sobre o limite.

## Problema

A maioria dos sistemas tem proporção de leitura para escrita de 10 para 1 ou mais. Isso
torna a replicação a resposta natural: adicionar réplicas multiplica a capacidade de
leitura sem tocar no modelo.

O que a torna insuficiente sozinha é a assimetria: cada réplica adicionada aumenta a
capacidade de leitura e **não muda em nada** a de escrita — porque toda escrita
continua indo para todas as cópias.

Existe um ponto em que a escrita satura, e nenhuma quantidade de réplicas ajuda.

## Conceitos Centrais

### A amplificação de escrita

```text
1 primário, 0 réplicas   → 1 escrita por operação
1 primário, 5 réplicas   → 6 escritas por operação
1 primário, 20 réplicas  → 21 escritas por operação
```

Cada réplica precisa aplicar todas as escritas. O trabalho total de escrita cresce
linearmente com o número de cópias, enquanto a capacidade de escrita **por nó**
permanece a mesma.

A consequência prática: acima de certo número de réplicas, elas passam a gastar a maior
parte da capacidade aplicando replicação, e sobra pouco para servir leitura.

Isso define o teto: replicação escala leitura até o ponto em que a escrita, aplicada em
toda parte, consome os nós.

Quando esse ponto chega, a resposta é
[particionamento](/11-scalability/scaling-partitioning.md) — que divide a escrita em vez de
multiplicá-la.

### Classificar as leituras é o trabalho

Nem toda leitura pode ir para réplica. A classificação que funciona:

```text
crítica             primário — saldo antes de debitar, verificação de estoque
do próprio usuário  primário por N segundos após ele escrever
geral               réplica
relatório           réplica dedicada
```

A segunda linha é a que elimina a maior parte das queixas de "salvei e não aparece". Ver
[consistência eventual](/06-distributed-systems/eventual-consistency.md).

Sem essa classificação, duas coisas ruins acontecem: ou tudo vai para o primário — e a
replicação não escala nada — ou tudo vai para réplica, e operações críticas decidem
sobre dado velho.

### Relatório em réplica compartilhada envenena a leitura geral

Uma consulta analítica pesada numa réplica que também serve tráfego de usuário aumenta o
atraso dela para todo mundo, e compete por recursos.

Réplica de relatório deve ser dedicada. É a mesma lógica de separar
[OLTP de OLAP](/07-data-architecture/oltp.md), aplicada dentro da camada de
réplicas.

### O atraso precisa entrar na decisão de roteamento

Uma réplica atrasada continua respondendo — com dados velhos, sem erro.

O roteamento maduro considera o atraso: réplicas acima de um limiar saem da rotação
para leituras sensíveis, ou saem completamente.

Sem isso, uma réplica que travou continua recebendo tráfego e servindo dados
congelados. Ver
[detecção de falhas](/06-distributed-systems/failure-detection.md).

### Réplica não é apenas para escala

Vale lembrar, porque muda o dimensionamento: as réplicas também servem para
disponibilidade — assumir se o primário cair.

Se todas as réplicas estão dimensionadas no limite servindo leitura, a promoção de uma
delas acontece num nó já saturado, no pior momento possível.

O dimensionamento precisa reservar folga para esse cenário. Ver
[planejamento de capacidade](/11-scalability/scaling-capacity-planning.md).

### Cache antes de réplica

Uma leitura servida por cache não chega a nenhuma réplica.

Para dados lidos repetidamente, cache é mais barato e mais rápido que adicionar
réplicas — e não sofre amplificação de escrita.

A ordem prática: cache primeiro, réplica para o que o cache não cobre. Ver
[cache para escala](/11-scalability/scaling-cache.md) e a escada em
[escala de banco de dados](/11-scalability/database-scaling.md).

## Modelo Mental

**Réplica multiplica leitura e multiplica o trabalho de escrita.** Ela escala até o
ponto em que a escrita, aplicada em toda parte, consome os nós.

## Quando Usar

- A leitura domina a escrita.
- As leituras toleram atraso de segundos.
- Há carga de relatório a separar.
- Disponibilidade exige cópias de qualquer forma.
- Usuários geograficamente distribuídos leem localmente.

## Quando Não Usar

**Para escalar escrita.**

**Sem classificar as leituras.**

**Relatório em réplica compartilhada.**

**Sem considerar o atraso no roteamento.**

**Sem folga para promoção.**

**Antes do cache.** Réplica é mais cara para o mesmo efeito em dados repetidos.

## Alternativas

- **[Cache](/11-scalability/scaling-cache.md)** — mais barato para leitura repetida.
- **[Particionamento](/11-scalability/scaling-partitioning.md)** — quando o limite é escrita.
- **[CQRS distribuído](/06-distributed-systems/distributed-cqrs.md)** — modelo de leitura
  próprio, otimizado.
- **Visão materializada** — pré-cálculo no próprio banco.

## Trade-offs

| Mais réplicas | Menos |
|---|---|
| Mais capacidade de leitura | Menos |
| Mais amplificação de escrita | Menos |
| Mais tolerância a falha | Menos |
| Mais atraso a monitorar | Menos |
| Custo linear | Baixo |

| Réplica | Cache |
|---|---|
| Todos os dados | Só o cacheado |
| Consulta arbitrária | Chave conhecida |
| Sofre amplificação | Não |
| Sem invalidação | Invalidação a gerenciar |

## Modos de Falha

**Escrita saturando com muitas réplicas.**

**Réplica atrasada servindo dado velho.**

**Réplica parada respondendo normalmente.**

**Relatório aumentando o atraso geral.**

**Promoção em nó saturado.**

**Leitura crítica em réplica.** Decisão sobre dado desatualizado.

## Erros Comuns

**Adicionar réplicas para resolver escrita.** Réplica escala leitura; toda escrita continua indo para o primário, e cada réplica adicional ainda aumenta o trabalho de replicação dele.

**Não classificar as leituras.** Nem toda leitura tolera atraso. Mandar tudo para réplica faz o usuário não ver a própria alteração ao recarregar — o relato de bug mais comum desse arranjo.

**Não implementar "leia seus próprios escritos".** É a garantia mínima que torna leitura de réplica aceitável para o usuário. Sem ela, a inconsistência aparece exatamente para quem acabou de agir.

**Não monitorar atraso por réplica.** O atraso varia entre réplicas e com a carga. A média esconde a réplica que está minutos atrás e continua recebendo leituras.

**Não reservar folga para promoção.** Se as réplicas operam no limite, promover uma a primário a coloca sob carga de escrita que ela não tem capacidade de absorver — e o failover derruba o sucessor.

**Não usar cache antes.** Réplica adicional custa uma instância de banco por mês; cache costuma resolver a mesma carga de leitura por uma fração, e deveria ser avaliado primeiro.

## Exemplo Real

Uma plataforma de classificados escalou de 2 para 12 réplicas de leitura ao longo de
dois anos, conforme o tráfego crescia.

Com 12 réplicas, dois problemas apareceram:

**A escrita saturou.** Cada anúncio publicado gerava 13 escritas — o primário e as 12
réplicas. As réplicas passavam a maior parte do tempo aplicando replicação, e a
capacidade de leitura por réplica tinha caído. Adicionar a 13ª piorou o atraso de todas.

**Atraso irregular.** Duas réplicas serviam relatórios internos e tinham atraso de
minutos, enquanto as outras tinham segundos. O roteamento não distinguia, e usuários
ocasionalmente viam anúncios desatualizados — sem padrão aparente, o que dificultou o
diagnóstico por meses.

As correções:

**Cache antes de réplica.** As buscas mais comuns — que respondiam por 70% da leitura —
foram para cache com invalidação por evento. Isso permitiu **reduzir** de 12 para 6
réplicas, o que diminuiu a amplificação de escrita pela metade e melhorou o atraso de
todas.

**Réplicas dedicadas a relatório**, fora da rotação de tráfego de usuário.

**Roteamento sensível a atraso.** Réplicas com mais de 5 segundos saem da rotação para
leituras sensíveis; acima de 30 segundos, saem completamente.

**Classificação de leitura.** Publicação de anúncio e edição pelo próprio autor passaram
a ler do primário por 30 segundos. A queixa de "editei e não mudou" desapareceu.

**Particionamento planejado** para quando a escrita voltar a saturar, com gatilho
definido — o que a equipe estima em cerca de três anos no ritmo atual.

A avaliação posterior aponta: a resposta para dois anos de crescimento tinha sido sempre a
mesma — adicionar uma réplica. Ninguém tinha calculado a amplificação de escrita, e a
12ª réplica estava tornando o sistema pior.

## Conceitos Relacionados

- [Escala de Banco de Dados](/11-scalability/database-scaling.md) — a escada.
- [Particionamento para Escala](/11-scalability/scaling-partitioning.md) — quando a escrita satura.
- [Cache para Escala](/11-scalability/scaling-cache.md) — antes da réplica.
- [Replicação](/06-distributed-systems/replication.md) — os fundamentos.

## Exercício Prático

Conte quantas réplicas você tem e multiplique pela taxa de escrita. Esse é o trabalho de
escrita total do seu conjunto.

Compare com a capacidade de escrita de um nó. A razão diz quanto da capacidade de cada
réplica está sendo consumida antes de servir qualquer leitura.

## Perguntas de Entrevista

- Por que replicação não escala escrita?
- O que é amplificação de escrita e como ela define o teto?
- Por que cache deve vir antes de réplica?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 5.
- Botros, Silvia; Tinley, Jeremy. *High Performance MySQL*. 4ª ed. O'Reilly, 2021.
- Gunther, Neil. *Guerrilla Capacity Planning*. Springer, 2007.
