---
id: normalization
title: Normalização
sidebar_position: 13
description: Cada fato num lugar só — o que isso garante e onde o custo de junção pesa.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor aplica normalização como decisão de integridade, sabendo o
  que cada forma normal impede.
prerequisites: [data-modeling]
related: [denormalization, relational-databases, oltp]
canonical_for: [normalização, forma normal, anomalia de atualização]
content_version: 1
last_reviewed: 2026-08-27
---

# Normalização

## Visão Geral

Normalizar é organizar os dados de forma que **cada fato exista em um lugar só**.

O objetivo não é elegância nem economia de espaço — é impedir que o mesmo dado
exista em duas versões contraditórias.

É a escolha adequada para carga [transacional](/07-data-architecture/oltp.md), e a inadequada para
[analítica](/07-data-architecture/olap.md). Saber por quê é o que permite decidir em vez de seguir
regra.

## Problema

Quando um fato está repetido em vários lugares, três problemas surgem
inevitavelmente:

**Anomalia de atualização.** Mudar o endereço de um fornecedor exige alterar todas
as linhas que o copiaram. Uma que escape produz contradição.

**Anomalia de inserção.** Não é possível registrar um fornecedor sem registrar um
pedido, porque os dados dele vivem na tabela de pedidos.

**Anomalia de exclusão.** Apagar o último pedido de um fornecedor apaga também os
dados do fornecedor.

Normalização elimina os três por construção, não por disciplina.

## Conceitos Centrais

### As formas normais, sem o formalismo

A teoria tem seis ou mais formas normais. Na prática, três resolvem quase tudo:

**Primeira.** Cada campo guarda um valor único, não uma lista. Uma coluna
`telefones` com "11999998888, 1133334444" viola — e obriga a aplicação a
interpretar texto.

**Segunda.** Todo atributo depende da chave inteira. Numa tabela com chave
composta de pedido e produto, o nome do produto depende só do produto — logo, não
pertence ali.

**Terceira.** Nenhum atributo depende de outro atributo não-chave. Se a tabela tem
CEP e cidade, a cidade depende do CEP, não do registro — logo, pertence a outro
lugar.

A regra prática que resume as três: **cada atributo deve depender da chave, da
chave inteira, e de nada além da chave**.

### Terceira forma normal é o ponto de parada usual

Formas acima da terceira resolvem anomalias raras, e o custo de junção cresce.

Na prática, terceira forma normal com desvios conscientes é o desenho de um
sistema transacional bem feito. Formas superiores aparecem em domínios específicos
e raramente valem o esforço.

### O que se ganha é integridade verificável

O ganho central não é espaço — é que a **restrição pode ser declarada**.

Com o fornecedor em uma tabela e a chave estrangeira no pedido, o banco garante
que não existe pedido apontando para fornecedor inexistente. Para todo escritor,
inclusive scripts.

Num modelo desnormalizado, essa garantia precisa ser mantida por código — e por
todo código que escreve.

### O custo é junção, e ele é real

Cada tabela separada é uma junção a mais na leitura.

Em [OLTP](/07-data-architecture/oltp.md), onde a consulta traz poucos registros, junções indexadas são
baratas e o custo é irrelevante.

Em [OLAP](/07-data-architecture/olap.md), onde a consulta varre milhões, junções dominam o tempo — e é
por isso que o critério se inverte.

### Normalizar não é sobre economizar espaço

Este argumento aparece com frequência e envelheceu: armazenamento é barato.

O argumento válido é integridade. Quem normaliza para economizar espaço tende a
desnormalizar assim que o espaço deixa de importar — e perde a garantia sem
perceber que era ela que importava.

### Desvios conscientes são normais

Um sistema real tem desvios: um total pré-calculado, um nome copiado para evitar
junção numa consulta crítica.

Isso é [desnormalização](/07-data-architecture/denormalization.md) deliberada, e é legítima quando
documentada e com estratégia de manutenção. O problema não é o desvio — é o desvio
acidental, que ninguém sabe que existe.

## Modelo Mental

**Normalizar é garantir que não existam duas versões do mesmo fato.** O preço é
junção; o retorno é integridade que o banco cobra sozinho.

## Quando Usar

- Carga transacional com escrita concorrente.
- Integridade referencial importa.
- Os dados mudam com frequência.
- Consultas não previstas serão feitas.
- Múltiplos escritores, inclusive scripts e integrações.

## Quando Não Usar

**Em modelo analítico.** Ver [OLAP](/07-data-architecture/olap.md) — junções sobre volume dominam.

**Quando o dado é uma fotografia do momento.** O preço no instante da compra deve
ser copiado, não referenciado — ele não muda quando o preço do catálogo muda.

**Por princípio, sem avaliar o acesso.**

**Além da terceira forma normal sem razão concreta.**

**Em armazenamento sem junção.** Ver [documentos](/07-data-architecture/document-databases.md) — ali o
modelo é outro.

A segunda merece ênfase: copiar o valor histórico não é desnormalização, é
modelagem correta. São fatos diferentes — "o preço do produto" e "o preço pago".

## Alternativas

- **[Desnormalização](/07-data-architecture/denormalization.md) seletiva** — em pontos medidos.
- **Visão materializada** — a forma normalizada permanece; a leitura consulta a
  visão.
- **Modelo dimensional** — para analítico.
- **[CQRS](/06-distributed-systems/distributed-cqrs.md)** — normalizado para
  escrita, desnormalizado para leitura.

## Trade-offs

| Normalizado | Desnormalizado |
|---|---|
| Um lugar por fato | Duplicação |
| Sem anomalia de atualização | Atualização em massa |
| Integridade declarada | Mantida por código |
| Junções na leitura | Leitura direta |
| Escrita simples | Escrita em vários lugares |
| Consultas não previstas | Otimizado para o previsto |

## Modos de Falha

**Junções demais em consulta crítica.** Sinal de que falta uma visão materializada
ou um desvio consciente.

**Terceira forma normal aplicada a analítico.** Consultas inviáveis.

**Chave estrangeira ausente.** O modelo parece normalizado e não tem a garantia.

**Valor histórico referenciado em vez de copiado.** O relatório do ano passado
muda quando alguém corrige um cadastro.

**Normalização excessiva.** Tabelas com dois campos que só existem por rigor
formal.

O quarto é sutil e produz o pior tipo de defeito: números que mudam
retroativamente sem que ninguém tenha alterado o histórico.

## Erros Comuns

**Normalizar por hábito.**

**Não declarar chaves estrangeiras.**

**Referenciar quando o correto era copiar** — o caso do valor histórico.

**Aplicar o mesmo critério a OLTP e OLAP.**

**Desnormalizar sem documentar.**

## Exemplo Real

Um sistema de faturamento normalizou corretamente: cliente, produto, preço,
pedido, item de pedido. Chaves estrangeiras declaradas, terceira forma normal.

O item de pedido referenciava o produto e obtinha o preço da tabela de preços.

O problema apareceu numa auditoria fiscal: o valor das notas emitidas em 2023 não
batia com o que o sistema calculava ao reemitir o relatório em 2025.

A causa: os preços tinham mudado. Como o item referenciava a tabela de preços
atual, todo relatório histórico refletia os preços de hoje.

O modelo estava formalmente normalizado e conceitualmente errado. "O preço do
produto" e "o preço cobrado neste item" são fatos diferentes — o segundo é
imutável e pertence ao item.

A correção foi copiar para o item de pedido, no momento da emissão: preço
unitário, alíquota aplicada, descrição do produto e desconto. Cinco campos.

Isso parece duplicação e não é: nenhum desses valores tem relação com a tabela de
preços depois da emissão. Eles não podem mudar nunca.

A reconstrução do histórico anterior foi parcial, a partir de PDFs de notas
arquivadas.

O que a equipe registra: a revisão de modelo tinha sido feita por alguém rigoroso
em teoria de normalização, e o erro passou justamente por isso. A pergunta que
faltou não era sobre dependência funcional — era "este valor pode mudar depois?".

## Conceitos Relacionados

- [Desnormalização](/07-data-architecture/denormalization.md) — a decisão inversa.
- [Modelagem de Dados](/07-data-architecture/data-modeling.md) — o contexto.
- [OLTP](/07-data-architecture/oltp.md) — onde ela serve.
- [Bancos Relacionais](/07-data-architecture/relational-databases.md).

## Exercício Prático

Procure no seu modelo valores que representam um fato histórico — preço cobrado,
endereço da entrega, alíquota aplicada — e verifique se são copiados ou
referenciados.

Onde forem referenciados, seus relatórios históricos mudam sozinhos.

## Perguntas de Entrevista

- Quais anomalias a normalização elimina?
- Por que o critério se inverte em carga analítica?
- Quando copiar um valor não é desnormalização?

## Para Aprofundar

- Codd, E. F. *Further Normalization of the Data Base Relational Model*, 1971.
- Date, C. J. *Database Design and Relational Theory*. O'Reilly, 2012.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
