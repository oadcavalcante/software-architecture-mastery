---
id: column-stores
title: Armazenamento Colunar
sidebar_position: 5
description: Guardar por coluna em vez de por linha — a diferença de ordem de grandeza em carga analítica.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor entende por que colunar transforma o desempenho analítico
  e por que ele é inadequado para carga transacional.
prerequisites: [olap]
related: [data-warehouses, oltp, data-partitioning]
canonical_for: [colunar, armazenamento colunar, orientado a linha]
content_version: 1
last_reviewed: 2026-08-27
---

# Armazenamento Colunar

## Visão Geral

Armazenamento colunar guarda os valores de cada coluna juntos, em vez de guardar
as linhas inteiras em sequência.

A mudança é de layout físico, não de modelo lógico — a tabela continua sendo uma
tabela. E ela produz diferenças de uma a duas ordens de grandeza em consulta
analítica.

Entender **por quê** é o que permite prever quando o ganho vai aparecer e quando
não vai.

## Problema

Uma consulta analítica típica lê poucas colunas de uma tabela larga:

```sql
SELECT regiao, SUM(valor) FROM vendas WHERE ano = 2025 GROUP BY regiao
```

Três colunas de uma tabela que pode ter cinquenta.

Num armazenamento orientado a linha, os valores de uma linha ficam adjacentes no
disco. Para ler três colunas, é preciso trazer a linha inteira — as outras
quarenta e sete vêm junto e são descartadas.

Em bilhões de linhas, isso é a maior parte do trabalho, e nenhum índice resolve:
o problema não é encontrar as linhas, é que elas são largas.

## Conceitos Centrais

### Ler só o necessário

No layout colunar, cada coluna é um arquivo. Ler três colunas lê três arquivos e
ignora os outros quarenta e sete.

O ganho é proporcional à razão entre colunas lidas e colunas totais. Numa tabela
de cinquenta colunas em que a consulta usa três, o volume lido cai por um fator
próximo de dezesseis.

Isso também explica o limite: numa tabela de cinco colunas em que a consulta usa
quatro, o ganho de layout quase desaparece.

### Compressão é o segundo ganho, e frequentemente o maior

Valores da mesma coluna são do mesmo tipo e frequentemente se repetem. Uma coluna
de país tem duzentos valores distintos em bilhões de linhas.

Isso comprime extraordinariamente bem — dicionário, repetição, diferença — com
taxas de cinco a vinte vezes comuns.

E o efeito se multiplica com o primeiro: menos colunas, cada uma muito menor.

Há um efeito adicional que costuma passar despercebido: dados comprimidos cabem em
memória. Uma tabela de 2 TB que comprime para 150 GB pode ser processada sem tocar
o disco.

### A ordenação física muda tudo

Ordenar fisicamente os dados por uma coluna — data, tipicamente — permite pular
blocos inteiros.

Cada bloco guarda o valor mínimo e máximo de cada coluna. Uma consulta filtrando
por um mês descarta os blocos cujo intervalo não intersecta, sem ler nada deles.

Isso torna a escolha da ordenação tão importante quanto a escolha de índice em
OLTP — e é a razão de filtros por período serem rápidos e filtros por outra
dimensão não serem.

### Por que ele é ruim em OLTP

**Escrever uma linha** significa escrever em cinquenta lugares diferentes.

**Atualizar um valor** exige descomprimir um bloco, alterar e recomprimir.

**Ler uma linha inteira por chave** exige montar a linha a partir de cinquenta
arquivos — o pior caso possível.

Não é ajuste ausente. É o layout funcionando ao contrário do que a carga precisa.
Ver [OLTP](oltp.md).

### Escrita em lote é o modo natural

Colunar quer receber muitos registros de uma vez. Inserções individuais produzem
arquivos pequenos e fragmentação que degrada a leitura.

Sistemas colunares costumam ter processo de compactação que junta arquivos
pequenos. Quando ele não acompanha o ritmo de escrita, o desempenho de leitura cai
progressivamente — e o diagnóstico é contraintuitivo, porque a consulta piorou sem
o volume ter mudado.

## Modelo Mental

**Colunar troca eficiência de linha por eficiência de coluna.** Quem lê muitas
linhas e poucas colunas ganha; quem lê uma linha inteira perde.

## Quando Usar

- Carga analítica sobre grandes volumes. Ver [OLAP](olap.md).
- Tabelas largas com consultas que usam poucas colunas.
- Dados históricos, escritos em lote, raramente atualizados.
- Agregação sobre milhões ou bilhões de linhas.
- Compressão importa por custo de armazenamento.

## Quando Não Usar

**Para carga transacional.** Cada ponto do layout trabalha contra.

**Para leitura de registros individuais completos.**

**Para atualização frequente de valores.**

**Quando a tabela tem poucas colunas.** O ganho de layout some.

**Quando o volume é pequeno.** Alguns milhões de linhas num relacional indexado
não justificam a complexidade.

**Para escrita registro a registro.** Fragmentação.

## Alternativas

- **Orientado a linha com índice** — suficiente até volumes moderados.
- **Índice colunar dentro de um banco relacional** — vários oferecem, permitindo
  as duas cargas no mesmo lugar em escala média.
- **Visão materializada** — pré-agregação sem mudar o armazenamento.
- **Arquivos colunares em armazenamento de objetos** — consultados sob demanda,
  quando a frequência é baixa.

A segunda opção resolve muitos casos: se o volume é grande mas não enorme, um
índice colunar sobre a tabela existente evita uma plataforma inteira.

## Trade-offs

| Colunar | Orientado a linha |
|---|---|
| Lê só as colunas usadas | Lê a linha inteira |
| Compressão alta | Baixa |
| Varredura eficiente | Acesso por chave eficiente |
| Escrita em lote | Escrita individual |
| Atualização cara | Barata |
| Ideal para agregação | Para transação |

## Modos de Falha

**Fragmentação por escrita individual.** Muitos arquivos pequenos degradam a
leitura.

**Consulta sem filtro de ordenação.** Varre tudo, porque não há bloco a pular.

**`SELECT *` em tabela larga.** Anula o benefício inteiro — lê todas as colunas.

**Atualização em massa.** Reescrita e recompressão de blocos grandes.

**Compactação atrasada.** O desempenho cai sem que o volume tenha mudado.

**Cardinalidade alta na coluna de ordenação.** Os blocos não se separam bem e o
descarte não acontece.

## Erros Comuns

**Usar `SELECT *`.** É o antipadrão específico deste layout.

**Inserir registro a registro.**

**Não escolher a ordenação física** — ficar com a padrão desperdiça o principal
mecanismo de filtro.

**Esperar desempenho transacional.**

**Não monitorar a compactação.**

## Exemplo Real

Uma empresa de telecomunicações guardava registros de chamadas num banco
relacional orientado a linha: 12 bilhões de linhas, 60 colunas, 4 TB.

O relatório de consumo mensal por cliente levava 4 horas.

A migração para colunar produziu números que a equipe documentou:

**Volume em disco.** De 4 TB para 280 GB — compressão de 14 vezes, sobretudo em
colunas de operadora, tipo de chamada e código de área.

**A mesma consulta.** De 4 horas para 3 minutos. O ganho veio de três fontes: ler
6 colunas em vez de 60, dados comprimidos, e descarte de blocos pelo filtro de
período, com os dados ordenados por data.

**Custo.** Caiu por causa da compressão, não do processamento.

Dois problemas depois da migração:

**`SELECT *` em ferramenta de exploração.** Analistas usavam uma ferramenta que
gerava consultas com todas as colunas. Essas consultas ficaram **mais lentas** que
no relacional — precisavam montar 60 colunas por linha. Resolvido com projeção
obrigatória de colunas na camada de acesso.

**Ingestão em tempo real.** Uma tentativa de gravar chamadas individualmente,
conforme aconteciam, criou milhões de arquivos pequenos. A consulta que levava 3
minutos passou a levar 25. A ingestão voltou para lotes de cinco minutos.

O que a equipe registra sobre o segundo caso: a intuição de "quanto mais fresco o
dado, melhor" era razoável e custou duas semanas de degradação até alguém ligar as
duas coisas. O requisito real de frescor era diário.

## Conceitos Relacionados

- [OLAP](olap.md) — a carga que ele serve.
- [OLTP](oltp.md) — a carga que ele não serve.
- [Data Warehouse](data-warehouses.md) — onde ele costuma viver.
- [Particionamento de Dados](data-partitioning.md) — complementa o descarte de
  blocos.

## Exercício Prático

Pegue a consulta analítica mais pesada do seu sistema. Conte quantas colunas ela
usa e quantas a tabela tem.

Essa razão é uma estimativa direta do ganho que o layout colunar traria — e se ela
for próxima de 1, o layout não é o seu problema.

## Perguntas de Entrevista

- Por que colunar comprime muito melhor?
- Por que `SELECT *` é o antipadrão deste layout?
- Como a ordenação física acelera consultas com filtro?

## Para Aprofundar

- Abadi, Daniel et al. *The Design and Implementation of Modern Column-Oriented
  Database Systems*, 2013.
- Stonebraker, Michael et al. *C-Store: A Column-oriented DBMS*. VLDB, 2005.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 3.
