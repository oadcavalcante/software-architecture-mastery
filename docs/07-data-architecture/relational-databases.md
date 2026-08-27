---
id: relational-databases
title: Bancos Relacionais
sidebar_position: 1
description: O padrão que continua sendo a escolha certa na maioria dos casos — e onde ele de fato não serve.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor sabe justificar o relacional como escolha padrão e
  identificar os casos concretos em que outro modelo é melhor.
prerequisites: [data-architecture]
related: [nosql, transactions, normalization]
canonical_for: [banco relacional, modelo relacional]
content_version: 1
last_reviewed: 2026-08-27
---

# Bancos Relacionais

## Visão Geral

O modelo relacional organiza dados em tabelas com esquema definido, e permite
consultá-los por uma linguagem declarativa que descreve **o que** se quer, não
como buscar.

Ele tem cinquenta anos, sobreviveu a várias ondas de substituição, e continua
sendo a escolha correta para a maioria dos sistemas.

Este documento defende essa posição e delimita onde ela não vale — porque
"relacional por padrão" só é uma boa regra se acompanhada dos casos em que se
abandona a regra.

## Problema

A pergunta "qual banco usar?" costuma ser respondida por familiaridade ou por
tendência, e ambas produzem escolhas ruins.

A escolha correta vem do padrão de acesso: como o dado é escrito, como é lido, em
qual volume, com qual exigência de consistência.

O relacional é o padrão razoável porque atende bem a uma faixa muito ampla desses
padrões — e porque erra de forma barata quando você descobre que precisava de
outra coisa.

## Conceitos Centrais

### O que ele entrega que os outros não entregam junto

Nenhuma dessas propriedades é exclusiva. O que distingue o relacional é tê-las
todas ao mesmo tempo, maduras:

**Transações com garantias fortes.** Ver [transações](transactions.md).

**Consulta declarativa com otimizador.** Você descreve o resultado; o banco decide
o plano. Isso significa que o mesmo código continua eficiente quando o volume ou
a distribuição dos dados muda.

**Restrições no armazenamento.** Chave estrangeira, unicidade, verificação. A
regra vale para todo escritor, inclusive scripts avulsos e correções manuais.

**Consultas não previstas.** O modelo normalizado permite perguntas que não foram
antecipadas na modelagem. Modelos otimizados para um padrão de acesso não
permitem.

A quarta é a mais subestimada. A maior parte das perguntas que um sistema
responderá em cinco anos não é conhecida hoje.

### Esquema rígido é vantagem operacional

A crítica comum é que o esquema atrasa a evolução. O que raramente entra na conta
é o outro lado: sem esquema, a validação migra para a aplicação — e para **todas**
as aplicações que escrevem.

Basta um script de correção ou um serviço legado para introduzir registros
inconsistentes, que só serão descobertos ao serem lidos, meses depois.

O esquema é o único ponto onde a regra vale para todos.

### Escala vertical vai mais longe do que se supõe

O argumento de que relacional não escala é de uma época com hardware diferente.
Uma instância moderna comporta dezenas de terabytes e dezenas de milhares de
transações por segundo.

A maioria dos sistemas que abandona o relacional por escala nunca chegou perto
desse limite — e frequentemente o problema era
[índice](indexing.md) ou mistura de cargas.

### Onde ele genuinamente não serve

Sendo específico, porque a lista é curta:

**Escrita distribuída global.** Múltiplas regiões aceitando escrita para o mesmo
dado. Ver [PACELC](../06-distributed-systems/pacelc.md).

**Volume extremo de escrita simples.** Telemetria, eventos, séries temporais em
milhões por segundo.

**Travessia de relacionamentos profundos.** Consultas de vários níveis de
profundidade. Ver [bancos de grafo](graph-databases.md).

**Documentos com estrutura genuinamente variável.** Quando não há esquema comum.

**Analítico em grande escala.** Ver [colunar](column-stores.md).

**Busca textual com relevância.** Índice invertido resolve; relacional não.

### Um sistema pode usar mais de um

A decisão não é global. Um sistema pode ter o núcleo transacional em relacional,
busca num índice invertido e telemetria em série temporal.

O custo é operacional — mais tecnologias para conhecer, monitorar e recuperar — e
frequentemente vale. O erro é adotar vários sem que cada um resolva um problema
concreto.

## Modelo Mental

**Relacional é o padrão de que se abre mão com justificativa, não a opção que se
escolhe por comparação.**

## Quando Usar

- Os dados têm estrutura estável e relacionamentos.
- Transações com múltiplos registros precisam ser atômicas.
- Consultas não previstas serão necessárias.
- Integridade referencial importa.
- O volume cabe numa instância — que é mais do que se imagina.
- Não há razão específica para outra coisa.

## Quando Não Usar

**Escrita distribuída globalmente ativa em várias regiões.**

**Ingestão massiva de eventos ou séries temporais.**

**Travessia de grafo profunda.**

**Documentos sem esquema comum.**

**Analítico sobre bilhões de linhas.**

**Busca textual com relevância.**

**Cache.** Um banco relacional como cache é desperdício; use um armazenamento
[chave-valor](key-value-databases.md).

## Alternativas

- **[Documento](document-databases.md)** — agregados lidos inteiros.
- **[Chave-valor](key-value-databases.md)** — acesso por chave, altíssima vazão.
- **[Colunar](column-stores.md)** — analítico.
- **[Grafo](graph-databases.md)** — relacionamentos como primeira classe.
- **Série temporal** — métricas e telemetria.
- **Relacional distribuído** — mantém o modelo e distribui a escrita, ao custo de
  latência de coordenação.

## Trade-offs

| Relacional | Não relacional |
|---|---|
| Transações entre registros | Geralmente por registro |
| Esquema garantido | Validação na aplicação |
| Consultas não previstas | Otimizado para o previsto |
| Integridade no armazenamento | No código |
| Escala vertical, distribuir é caro | Escala horizontal nativa |
| Ferramental maduro | Varia |
| Junções eficientes | Frequentemente ausentes |

## Modos de Falha

**Consulta lenta por índice ausente.** A causa mais comum, e a mais confundida com
limite de escala.

**Contenção em registro quente.**

**Migração de esquema travando a tabela.** Em tabelas grandes, uma alteração mal
planejada causa indisponibilidade.

**Conexões esgotadas.** O limite de conexões costuma ser atingido antes de
qualquer limite de dados.

**Transação longa segurando bloqueios.**

**Junção sobre volume analítico.** Carga errada no lugar errado.

## Erros Comuns

**Abandonar por escala sem ter medido o limite real.**

**Não usar restrições** — chave estrangeira e unicidade — e reimplementá-las na
aplicação, pior.

**Alterar esquema de tabela grande sem estratégia.**

**Guardar documento sem estrutura em coluna de texto** e consultar por conteúdo.

**Usar como fila.** Funciona em volume baixo e degrada com contenção; existe
ferramenta para isso.

## Exemplo Real

Uma empresa de logística migrou o núcleo de rastreamento de um banco relacional
para um de documentos, motivada por "o relacional não escala".

O sistema tinha 80 milhões de registros de remessa e 3 mil operações por segundo
no pico.

A migração levou sete meses. Os resultados:

**Desempenho.** Praticamente igual. O gargalo original eram três consultas sem
índice adequado, o que a auditoria posterior confirmou.

**Integridade.** Sem chave estrangeira, referências órfãs começaram a aparecer —
remessas apontando para rotas apagadas. Em oito meses, cerca de 12 mil registros
inconsistentes, corrigidos por script.

**Relatórios.** As consultas que cruzavam remessa, rota e cliente ficaram muito
mais difíceis. Duas foram reescritas como processamento em lote, e o que era uma
consulta virou código.

**Transações.** A operação de transferir uma remessa entre rotas tocava três
documentos. Sem transação, foi preciso implementar
[saga](../06-distributed-systems/sagas.md) com compensação — para uma operação
que era uma transação de três linhas.

Dois anos depois, o núcleo transacional voltou para relacional. O que permaneceu
em documento foi o histórico de eventos de rastreamento — dados de estrutura
variável, escritos uma vez, lidos por chave. Ali o modelo é adequado.

O que a equipe registra: a decisão foi tomada a partir de uma premissa que ninguém
tinha verificado. Um dia de análise de plano de consulta teria evitado sete meses
de migração.

## Conceitos Relacionados

- [NoSQL](nosql.md) — o termo e o que ele esconde.
- [Transações](transactions.md) — a garantia principal.
- [Normalização](normalization.md) — o modelo.
- [Indexação](indexing.md) — o que costuma ser o problema real.

## Exercício Prático

Se alguém no seu time defende sair do relacional por escala, peça o número: qual
métrica está no limite, e qual é o limite.

Se a resposta não existir, o próximo passo é analisar os planos das consultas
lentas — não escolher outro banco.

## Perguntas de Entrevista

- O que o relacional entrega que outros modelos não entregam simultaneamente?
- Por que esquema rígido é vantagem operacional?
- Quais casos concretos justificam sair do relacional?

## Para Aprofundar

- Codd, E. F. *A Relational Model of Data for Large Shared Data Banks*. CACM,
  1970.
- Winand, Markus. *SQL Performance Explained*, 2012.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 2.
