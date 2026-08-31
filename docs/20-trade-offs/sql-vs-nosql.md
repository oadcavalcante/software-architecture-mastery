---
id: sql-vs-nosql
title: SQL vs. NoSQL
sidebar_position: 10
description: O eixo é o padrão de acesso e a necessidade de consulta não prevista — não o volume.
doc_type: tradeoff
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escolhe o armazenamento pelo padrão de acesso conhecido e pelo custo
  de operar mais um banco.
prerequisites: [nosql]
related: [strong-vs-eventual-consistency, managed-vs-self-hosted, performance-vs-maintainability]
canonical_for: [SQL contra NoSQL, padrão de acesso, consulta não prevista, custo do segundo banco]
content_version: 1
last_reviewed: 2026-08-29
---

# SQL vs. NoSQL

## Visão Geral

O par é mal nomeado. "NoSQL" reúne famílias com propriedades muito diferentes — chave-valor,
documento, coluna larga, grafo — e vários bancos relacionais modernos absorveram capacidades
que motivaram a divisão original.

O eixo útil não é a linguagem de consulta:

```text
eixo real   os padrões de acesso são conhecidos e estáveis, ou haverá
            consulta não prevista sobre os mesmos dados?
```

Bancos não relacionais são otimizados para padrões de acesso **conhecidos de antemão** — a
modelagem parte da consulta. Bancos relacionais permitem consulta arbitrária sobre a mesma
estrutura, ao custo de menos otimização por caso.

E há um segundo eixo, quase sempre decisivo na prática: **quanto custa operar mais um
banco?**

## Problema

A decisão é comumente tomada por argumentos que não decidem:

```text
"NoSQL escala melhor"        → bancos relacionais escalam bem até volumes
                               que a maioria dos sistemas nunca alcança
"SQL é mais maduro"          → várias opções não relacionais têm 15+ anos
"esquema flexível é melhor"  → o esquema existe de qualquer forma;
                               a questão é se ele é verificado ou implícito
"vamos precisar de escala"   → precisa de qual escala, medida como?
```

E o custo esquecido é o operacional. Um banco a mais significa: mais uma competência na
equipe, mais um procedimento de cópia e restauração, mais uma atualização, mais um alarme,
mais um item no plantão, mais uma consistência a coordenar.

Ver [gerenciado vs. autogerido](/20-trade-offs/managed-vs-self-hosted.md).

## Conceitos Centrais

### Padrão de acesso é o eixo

```text
conhecido e estável       modele para a consulta → não relacional funciona bem
não previsto, exploratório  precisa de consulta arbitrária → relacional
```

Exemplos concretos:

```text
sessão de usuário por identificador                chave-valor
catálogo de produtos com atributos por categoria   documento ou relacional
relacionamentos e caminhos entre entidades         grafo
séries temporais com agregação por janela          coluna larga ou específico
relatório que ninguém previu, sobre dados de
  pedidos, filtrado por três dimensões             relacional
```

O último é o critério decisivo em sistemas de informação: **haverá pergunta não prevista?**
Em quase todo sistema de negócio, sim — e responder a ela num banco modelado para o acesso
conhecido exige reprocessar dados.

### Esquema existe sempre

```text
esquema declarado    verificado pelo banco, visível, migração explícita
esquema implícito    verificado pela aplicação, disperso, migração silenciosa
```

"Sem esquema" significa que o esquema mora no código de todas as aplicações que leem aquele
dado — e que documentos de formatos diferentes coexistem indefinidamente.

Isso é uma vantagem real durante a descoberta, e uma dívida real depois. Sistemas maduros
sobre bancos de documentos frequentemente reintroduzem validação de esquema na camada de
aplicação, o que é o esquema declarado com passos extras.

Ver [modelagem de dados](/07-data-architecture/data-modeling.md).

### Transações e integridade

```text
relacional        transação multitabela, chave estrangeira, restrição
não relacional    transação por documento ou partição, integridade na aplicação
```

Vários bancos não relacionais adicionaram transações multidocumento, com restrições de
escopo e custo de desempenho. A pergunta prática: **o modelo exige alterar duas coisas
atomicamente?** Se sim, o relacional resolve isso sem código.

Ver [transações](/07-data-architecture/transactions.md).

### Escala não é o argumento que parece

```text
até ~milhões de linhas com índices adequados   relacional, sem esforço
dezenas de milhões, com particionamento        relacional, com trabalho
escrita distribuída global, multirregião       o não relacional tem vantagem clara
chave-valor com latência de microssegundos     idem
```

A maior parte dos sistemas de negócio vive na primeira faixa e nunca sai dela. Escolher pelo
cenário de escala que talvez nunca chegue custa hoje, com certeza, para um benefício
incerto.

Ver [simplicidade vs. flexibilidade](/20-trade-offs/simplicity-vs-flexibility.md) — é o mesmo trade-off de
opcionalidade.

### O segundo banco custa mais que o primeiro

```text
competência da equipe        duplicada
procedimento de restauração  duplicado, e precisa ser testado
atualização e migração       duplicadas
monitoração e alarme         duplicados
plantão                      mais um a conhecer
consistência entre os dois   nova, e não trivial
```

Isso torna "usar o banco certo para cada caso" — poliglota — uma estratégia mais cara do que
parece. Ela se justifica quando o ganho de um caso é grande; não se justifica por
elegância.

### Sinais de escolha errada

```text
escolheu não relacional e não devia
  junções feitas na aplicação
  dados duplicados entre coleções, divergindo
  consultas exploratórias exigindo exportação para outro sistema
  validação de esquema reimplementada na aplicação
  transações simuladas com compensação manual

escolheu relacional e não devia
  esquema com dezenas de colunas nulas por variação de tipo
  tabela de atributos genéricos (entidade-atributo-valor)
  latência dominada por junções que sempre retornam o mesmo agregado
  particionamento manual feito à mão
```

O primeiro sinal de cada lista aparece cedo e é o mais confiável.

### Custo de mudar de ideia

```text
relacional → não relacional   migração de dados, com modelo derivado do acesso
não relacional → relacional   mais caro: exige reconstruir o esquema a partir
                              de documentos heterogêneos acumulados
```

A assimetria favorece começar relacional quando há dúvida — o dado sai de lá com estrutura
conhecida, e entra em qualquer outro modelo. O caminho inverso exige arqueologia sobre
variações de formato acumuladas ao longo de anos.

## Modelo Mental

**Os acessos são conhecidos, ou haverá pergunta nova?** E: quanto custa operar mais um
banco?

## Quando Usar

Prefira **não relacional** quando:

- Os padrões de acesso são conhecidos, estáveis e poucos.
- O modelo é naturalmente hierárquico, de grafo ou de série temporal.
- A escala exige escrita distribuída globalmente.
- A latência exigida está abaixo do que o relacional entrega.
- Não haverá consulta exploratória sobre esses dados.

Prefira **relacional** quando:

- Haverá consulta não prevista.
- Há necessidade de transação entre entidades.
- A integridade referencial importa.
- O volume está dentro do que o relacional atende com folga.
- A equipe já opera um, e o caso não justifica o segundo.

## Quando Não Usar

**Escolhendo por escala hipotética.**

**Adotando um segundo banco sem contar o custo operacional.**

**Tratando "sem esquema" como ausência de esquema.**

**Usando não relacional para consulta exploratória.**

**Usando relacional com tabela de atributos genéricos** — sintoma de modelo errado, não de
banco errado.

## Alternativas

- **Relacional com JSON** — atende variação de atributos sem segundo banco; resolve a maior
  parte dos casos que motivam bancos de documentos.
- **Índice de busca dedicado** — mantém o relacional como fonte de verdade e resolve consulta
  facetada.
- **Réplica de leitura ou armazém analítico** — para consulta exploratória sem afetar o
  operacional.
- **Cache** — quando o problema é latência de leitura, não modelo.

A primeira é a alternativa mais subestimada: colunas tipadas para o que é comum, documento
para o que varia, um só banco a operar.

## Trade-offs

| Relacional | Não relacional |
|---|---|
| Consulta arbitrária | Acesso conhecido otimizado |
| Transação e integridade | Escala de escrita |
| Esquema verificado | Evolução sem migração |
| Um só, já operado | Mais um a operar |

| Um banco | Poliglota |
|---|---|
| Menor custo operacional | Ferramenta certa por caso |
| Compromisso em alguns casos | Consistência entre bancos |
| Uma competência | Várias |

## Modos de Falha

**Junção na aplicação.** Modelo não relacional usado para acesso relacional.

**Documentos heterogêneos acumulados.** Migração futura vira arqueologia.

**Tabela de atributos genéricos.** Relacional usado contra sua natureza.

**Segundo banco sem justificativa.** Custo operacional dobrado.

**Escolha por escala hipotética.** Custo hoje, benefício talvez.

**Consistência entre bancos improvisada.**

## Erros Comuns

**Decidir pela família de banco antes de listar os padrões de acesso.** Bancos orientados a chave exigem modelar a partir das consultas; escolher primeiro obriga a descobrir depois que a consulta necessária não é expressável.

**Não perguntar se haverá consulta não prevista.** É a distinção decisiva: o relacional responde bem ao que ninguém antecipou; o desnormalizado, não.

**Não contar o custo do segundo banco.** Backup, monitoramento, atualização e uma competência a manter no time são custo recorrente que não aparece na comparação de desempenho.

**Ignorar JSON em banco relacional** como opção. Ela cobre boa parte do que se busca em documento sem abrir mão de transação, junção e consulta ad hoc — e raramente entra na lista.

**Confundir problema de índice com problema de modelo.** Trocar de banco por lentidão que um índice resolveria substitui uma tarde de trabalho por uma migração.

## Exemplo Real

Uma empresa de nutrição digital escolheu um banco de documentos como armazenamento primário
em 2022. A justificativa registrada: variação de atributos entre tipos de plano alimentar, e
expectativa de crescimento.

Em 2025, com 2,3 milhões de usuários:

```text
coleções                                        11
formatos de documento distintos coexistindo
  na coleção de planos                          9
junções feitas na aplicação                     14 pontos
validação de esquema reimplementada             sim, em 2023
consultas exploratórias do time de produto      exportação semanal para
                                                planilha e banco relacional
                                                temporário
transações multidocumento simuladas             4 fluxos, com compensação manual
incidentes por divergência entre coleções       9 em 12 meses
```

Os 9 formatos coexistindo eram o problema estrutural. Cada mudança de modelo tinha sido
aplicada apenas a documentos novos, e o código lidava com todas as variações.

E o padrão de acesso tinha mudado: o produto passou a fazer perguntas não previstas —
segmentação por combinação de restrição alimentar, aderência e histórico —, exatamente o
caso que o modelo não atende.

A migração levou nove meses:

**Relacional como fonte de verdade** para plano, usuário, aderência e histórico — as
entidades com relacionamento e consulta exploratória.

**Coluna JSON** para os atributos que de fato variam por tipo de plano, com validação de
esquema no banco. Isso resolveu a motivação original sem um segundo banco.

**Banco de documentos mantido** para um caso: o registro de refeições, que é apenas escrita
por usuário e leitura por identificador, sem consulta cruzada. Cerca de 80% do volume de
escrita, e nenhuma consulta exploratória.

**Normalização dos 9 formatos** em um, com processo de migração único — o trabalho mais
demorado, quatro meses.

**Índice de busca dedicado** para a segmentação do produto, alimentado a partir do
relacional.

Resultados após a migração:

```text
formatos coexistindo                            1
junções na aplicação                            0
transações simuladas                            0 — viraram transações
consultas exploratórias                         direto no relacional, sem exportação
incidentes por divergência                      0 em 10 meses
bancos em produção                              2 (contra 1, com propósito claro)
custo de infraestrutura                         -12%
```

Os dois bancos remanescentes têm justificativa registrada em ADR, com condição de reversão:
se o registro de refeições passar a exigir consulta cruzada, ele volta para o relacional.

A decisão de 2022 não era absurda — a variação de atributos era
real. O erro foi de método: a escolha foi feita a partir de uma característica do dado, sem
listar os padrões de acesso previstos nem perguntar se haveria consulta não prevista. A
resposta a essa segunda pergunta, em um produto que ainda estava descobrindo seu mercado,
era obviamente sim.

## Conceitos Relacionados

- [NoSQL](/07-data-architecture/nosql.md) e
  [Bancos Relacionais](/07-data-architecture/relational-databases.md).
- [Modelagem de Dados](/07-data-architecture/data-modeling.md).
- [Consistência Forte vs. Eventual](/20-trade-offs/strong-vs-eventual-consistency.md).
- [Indexação](/07-data-architecture/indexing.md).

## Exercício Prático

Liste os padrões de acesso do seu sistema aos dados principais e marque quais existiam
quando o banco foi escolhido.

Os que apareceram depois medem a probabilidade de aparecerem mais — e é essa probabilidade
que decide.

## Perguntas de Entrevista

- Por que "escala" raramente é o argumento decisivo nesta escolha?
- Por que "sem esquema" não significa ausência de esquema?
- Por que a assimetria de custo de migração favorece começar relacional na dúvida?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Sadalage, Pramod; Fowler, Martin. *NoSQL Distilled*. Addison-Wesley, 2012.
- Winand, Markus. *SQL Performance Explained*. 2012.
