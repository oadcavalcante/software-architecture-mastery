---
id: data-warehouses
title: Data Warehouses
sidebar_position: 9
description: Dados de várias fontes, modelados para análise — e o custo de manter a transformação.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor reconhece quando um warehouse se justifica e o que sustenta
  a confiança nos números que ele produz.
prerequisites: [olap]
related: [data-lakes, column-stores, denormalization]
canonical_for: [data warehouse, modelo dimensional, tabela fato, tabela dimensão]
content_version: 1
last_reviewed: 2026-08-27
---

# Data Warehouses

## Visão Geral

Um data warehouse reúne dados de múltiplas fontes operacionais num modelo próprio,
desenhado para análise.

A palavra-chave é **múltiplas**. Se há uma única fonte, uma réplica ou um
armazenamento [colunar](/07-data-architecture/column-stores.md) resolvem sem a complexidade.

O que o warehouse acrescenta é a integração: cruzar vendas do sistema comercial,
custos do financeiro e atendimento do suporte — sistemas que não se conhecem e
nomeiam as mesmas coisas de formas diferentes.

## Problema

Cada sistema operacional tem seu vocabulário, sua chave e sua granularidade. O
"cliente" do comercial não é o mesmo registro que o "cliente" do financeiro.

Responder "qual a margem por segmento de cliente" exige reconciliar isso — decidir
o que é um cliente, qual identificador vale, o que fazer quando os cadastros
divergem.

Esse trabalho de reconciliação é o warehouse. A tecnologia é a parte fácil.

## Conceitos Centrais

### Modelo dimensional

O desenho padrão: **tabelas fato** no centro, com as medidas e as chaves; **tabelas
dimensão** ao redor, com os atributos descritivos.

```text
fato_vendas          dimensões
  chave_produto  →     dim_produto   (nome, categoria, marca)
  chave_loja     →     dim_loja      (nome, cidade, região)
  chave_data     →     dim_data      (dia, mês, trimestre, feriado)
  quantidade
  valor
```

O modelo é deliberadamente [desnormalizado](/07-data-architecture/denormalization.md): a dimensão
produto repete categoria e marca em vez de referenciá-las.

Isso evita junções em cadeia e torna as consultas legíveis por quem não é
especialista — que é metade do propósito.

### A granularidade do fato é irreversível

A decisão mais importante da modelagem: cada linha da tabela fato representa o
quê?

Uma venda? Um item de venda? Um total diário por loja?

Granularidade fina permite agregar de qualquer forma. Granularidade grossa é mais
barata e **descarta a possibilidade** de perguntas mais detalhadas — permanentemente,
porque o detalhe não foi guardado.

A regra: grave na menor granularidade que o volume permitir. Agregar depois é
sempre possível; desagregar nunca é.

### Dimensões que mudam ao longo do tempo

Um cliente muda de segmento. As vendas antigas devem aparecer no segmento antigo
ou no atual?

**Sobrescrever.** Simples, e reescreve a história — relatórios antigos mudam.

**Versionar.** Uma nova linha na dimensão, com período de validade. O fato aponta
para a versão vigente na época. Preserva a história e complica o carregamento.

**Manter os dois valores.** Segmento atual e original lado a lado.

A escolha precisa ser feita por dimensão, com o negócio. É a fonte mais comum de
"o relatório do ano passado mudou".

### O carregamento precisa ser idempotente

Processos de carga falham no meio e são reexecutados. Se a reexecução insere os
fatos de novo, os números dobram — sem erro, sem alerta.

O padrão que funciona: apagar a partição do período e recarregar, em vez de
inserir incrementalmente. Ver
[idempotência](/06-distributed-systems/idempotency.md).

### Linhagem e confiança

O warehouse só tem valor se as pessoas confiarem nos números. E a confiança se
perde na primeira vez que dois relatórios discordam sem explicação.

O que sustenta a confiança:

**Linhagem.** De onde veio cada número, por qual transformação.

**Data de atualização visível** em todo relatório.

**Reconciliação com a fonte.** Comparação periódica de totais. Ver
[consistência de dados](/07-data-architecture/data-consistency.md).

**Definições publicadas.** O que exatamente conta como "cliente ativo".

A última evita a discussão mais desgastante que um warehouse produz: dois times
com números diferentes, ambos corretos segundo definições distintas.

### O custo real é a transformação

A tecnologia de armazenamento é commodity. O que custa é escrever e manter as
transformações — e elas quebram sempre que um sistema de origem muda.

Um warehouse com dezenas de fontes tem um fluxo constante de manutenção. Orçar o
projeto sem orçar essa manutenção é o erro de planejamento característico.

## Modelo Mental

**Warehouse é sobre integrar fontes, não sobre guardar muito dado.** Se a fonte é
uma só, você não precisa de um.

## Quando Usar

- Múltiplas fontes precisam ser cruzadas.
- Há necessidade de definições únicas para o negócio.
- Consultas analíticas recorrentes sobre dados históricos.
- Requisito de histórico que os sistemas de origem não guardam.
- A carga analítica precisa sair da base transacional.

## Quando Não Usar

**Com uma única fonte.** Réplica ou colunar resolvem.

**Quando o volume não justifica.**

**Para análise exploratória de dados brutos não estruturados.** Ver
[data lake](/07-data-architecture/data-lakes.md).

**Sem dono das definições de negócio.** Vira mais uma fonte discordante.

**Sem orçamento para manutenção contínua.**

**Como fonte da verdade operacional.** É derivado.

## Alternativas

- **Réplica de leitura** — quando a fonte é uma.
- **[Colunar](/07-data-architecture/column-stores.md) direto** — sem camada de integração.
- **[Data lake](/07-data-architecture/data-lakes.md)** — para dados brutos e exploração.
- **[Lakehouse](/07-data-architecture/data-lakehouses.md)** — a combinação.
- **Consulta federada** — consultar as fontes onde estão, sem mover; evita a carga
  ao custo de desempenho e de carga nos sistemas de origem.

## Trade-offs

| Warehouse | Consultar as fontes |
|---|---|
| Definições unificadas | Cada fonte com a sua |
| Histórico preservado | O que a fonte guardar |
| Sem carga nos sistemas | Compete com a operação |
| Transformação a manter | Nenhuma |
| Dados com atraso | Atuais |

| Granularidade fina | Agregada |
|---|---|
| Qualquer pergunta futura | Só as previstas |
| Volume maior | Menor |
| Consulta mais cara | Barata |
| Irreversível se grossa demais | — |

## Modos de Falha

**Duplicação por recarga.** Os números dobram silenciosamente.

**Dimensão sobrescrita.** Relatórios históricos mudam.

**Transformação quebrada por mudança na origem.**

**Granularidade grossa demais.** A pergunta nova não pode ser respondida.

**Números divergentes entre relatórios.** Definições diferentes.

**Carga atrasada sem sinal.** Decisões sobre dados velhos.

## Erros Comuns

**Construir com uma única fonte.** Se há só uma origem, o valor do warehouse é quase nulo: uma réplica de leitura resolve, sem custo de modelagem e de carga.

**Carga não idempotente.** Reexecutar a carga do dia é operação rotineira depois de falha. Se ela soma em vez de substituir, o reprocesso duplica os números — e o erro é descoberto pelo relatório.

**Não decidir a estratégia de dimensão que muda.** Quando um cliente troca de região, os pedidos antigos passam a contar na região nova se a dimensão for sobrescrita. É a diferença entre "vendas por região" histórico e atual, e ninguém percebe até a comparação com o ano anterior não bater.

**Agregar cedo demais.** Guardar só o total diário impede qualquer pergunta por hora ou por segmento depois — e o dado que produziria a resposta já foi descartado.

**Não publicar definições.** Sem uma definição escrita de "cliente ativo", cada área calcula a sua, e a reunião discute de quem é o número em vez de discutir o que ele mostra.

**Não expor a data de atualização.** Um painel que não diz até quando os dados vão é indistinguível de um painel com carga quebrada há três dias.

## Exemplo Real

Uma rede de farmácias construiu um warehouse integrando ponto de venda, estoque,
financeiro e programa de fidelidade.

Funcionou bem por dois anos e a confiança desmoronou em uma semana.

O diretor comercial e o financeiro apresentaram números de faturamento diferentes
para o mesmo trimestre — 4% de diferença. Ambos vinham do warehouse.

A investigação encontrou três causas simultâneas:

**Definições divergentes.** Um relatório incluía vendas canceladas no mesmo dia; o
outro não. Nenhuma definição estava publicada; cada analista tinha escrito a sua.

**Dimensão sobrescrita.** Lojas que mudaram de região tinham a dimensão
atualizada, e as vendas históricas passaram a aparecer na região nova. Comparações
com trimestres anteriores ficaram inconsistentes.

**Duplicação parcial.** Uma carga do ponto de venda tinha falhado e sido
reexecutada manualmente. Três dias entraram duas vezes.

As correções:

**Glossário publicado** com definições aprovadas pelo negócio, e uma camada de
métricas certificadas — relatórios oficiais só podem usar essas definições.

**Versionamento na dimensão loja**, permitindo ver a venda na região da época ou na
atual, explicitamente.

**Carga idempotente** por partição de data, e o processo manual eliminado.

**Reconciliação diária** comparando o total do warehouse com o do ponto de venda,
com alerta acima de 0,1%.

A lição registrada: os problemas técnicos foram corrigidos em três semanas. A
confiança levou quase um ano para voltar, e por muito tempo as áreas mantiveram
planilhas paralelas "para conferir".

## Conceitos Relacionados

- [OLAP](/07-data-architecture/olap.md) — a carga.
- [Colunar](/07-data-architecture/column-stores.md) — o armazenamento típico.
- [Data Lake](/07-data-architecture/data-lakes.md) e [Lakehouse](/07-data-architecture/data-lakehouses.md).
- [Desnormalização](/07-data-architecture/denormalization.md) — o modelo.

## Exercício Prático

Pegue duas métricas parecidas usadas por áreas diferentes — faturamento, clientes
ativos. Peça a definição exata de cada uma a quem a usa.

Se as definições diferirem e ninguém souber disso, você encontrou a próxima
discussão de números divergentes antes que ela aconteça.

## Perguntas de Entrevista

- Por que a granularidade do fato é irreversível?
- Quais as estratégias para dimensão que muda, e o que cada uma custa?
- O que sustenta a confiança nos números de um warehouse?

## Para Aprofundar

- Kimball, Ralph; Ross, Margy. *The Data Warehouse Toolkit*. 3ª ed. Wiley, 2013.
- Inmon, W. H. *Building the Data Warehouse*. 4ª ed. Wiley, 2005.
- Linstedt, Dan. *Building a Scalable Data Warehouse with Data Vault 2.0*, 2015.
