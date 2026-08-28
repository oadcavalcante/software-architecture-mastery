---
id: nosql
title: NoSQL
sidebar_position: 2
description: Um termo que agrupa tecnologias sem nada em comum — e por que usá-lo atrapalha a decisão.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor substitui a pergunta "SQL ou NoSQL?" por perguntas sobre
  padrão de acesso, que é o que de fato decide.
prerequisites: [relational-databases]
related: [document-databases, key-value-databases, column-stores]
canonical_for: [NoSQL]
content_version: 1
last_reviewed: 2026-08-27
---

# NoSQL

## Visão Geral

"NoSQL" não descreve uma tecnologia. Ele agrupa bancos de documentos, chave-valor,
colunares, de grafo e de série temporal — que **não têm nada em comum** além de
não serem relacionais.

Um banco de grafo e um armazenamento chave-valor são mais diferentes entre si do
que qualquer um deles é de um banco relacional.

Este documento existe para desmontar o termo, porque raciocinar com ele leva a
decisões ruins de forma sistemática.

## Problema

A pergunta "devemos usar SQL ou NoSQL?" parece uma escolha entre duas opções.

Ela é, na verdade, uma escolha entre seis ou sete modelos com propriedades
radicalmente diferentes, apresentada como binária.

O efeito prático: times decidem "vamos de NoSQL", escolhem a ferramenta mais
conhecida da categoria e descobrem meses depois que o modelo dela não serve ao
padrão de acesso que têm.

A pergunta correta nunca é sobre a categoria. É sobre como o dado é acessado.

## Conceitos Centrais

### O que o termo agrupa

```text
documento      agregados com estrutura variável, lidos inteiros
chave-valor    acesso por chave, vazão altíssima, sem consulta
colunar        varredura analítica sobre poucas colunas
grafo          travessia de relacionamentos
série temporal métricas ordenadas por tempo, com retenção
busca          índice invertido com relevância
```

Cada linha resolve um problema diferente. Escolher "NoSQL" é escolher nenhum
deles.

### O que os une é histórico, não técnico

Eles surgiram no mesmo período, motivados por limitações reais dos bancos
relacionais da época em escala web.

Isso explica a associação e não a justifica hoje: os relacionais evoluíram, vários
não relacionais adicionaram transações e esquema, e a fronteira ficou porosa.

Bancos relacionais suportam documentos com indexação. Bancos de documentos
oferecem transações entre documentos. A categoria não prediz mais as
propriedades.

### As promessas que envelheceram

**"Sem esquema."** Não existe dado sem esquema — existe esquema não declarado. Ele
some do banco e reaparece na aplicação, em vários lugares, sem validação. Ver
[bancos de documentos](document-databases.md).

**"Escala horizontalmente."** Vários escalam, ao custo de abandonar transações
entre registros e consultas não previstas. E relacionais distribuídos escalam
também.

**"Mais rápido."** Mais rápido para o padrão de acesso específico. Fora dele,
frequentemente pior.

### A pergunta que substitui

Em vez de "SQL ou NoSQL", quatro perguntas decidem:

**Como o dado é lido?** Por chave, por consulta com filtro, por varredura, por
travessia, por relevância textual.

**Como é escrito?** Registro individual, lote, fluxo contínuo.

**Que consistência a operação exige?** Ver
[consistência](../06-distributed-systems/consistency.md).

**Que perguntas não previstas serão feitas?** Se muitas, modelos otimizados para
um acesso vão limitar.

Respondidas essas quatro, a escolha do armazenamento é quase mecânica — e a
palavra "NoSQL" nunca aparece.

### Poliglota tem custo operacional real

Usar o armazenamento certo para cada caso é correto em princípio e cada tecnologia
adicional traz: conhecimento operacional, monitoramento, procedimento de cópia e
recuperação, plano de atualização, e alguém que saiba depurar às três da manhã.

A regra prática: adicione um armazenamento quando houver um problema concreto que
o atual não resolve — não por adequação teórica.

### O termo esconde as perguntas de operação

Além de agrupar tecnologias incompatíveis, "NoSQL" desloca a conversa para
capacidade e desempenho — e para longe das perguntas que determinam se a adoção
vai se sustentar.

As que costumam faltar:

**Como se faz cópia de segurança e quanto leva a restauração?** Varia enormemente
entre categorias, e algumas exigem procedimento próprio.

**O que acontece numa atualização de versão?** Alguns exigem parada.

**Quem no time sabe depurar isso sob pressão?**

**Como se monitora?** As métricas que importam são diferentes das de um banco
relacional, e o ferramental padrão pode não cobri-las.

**Qual o custo de migrar para fora depois?** Modelos otimizados para um acesso
específico são difíceis de exportar para outro formato.

Nenhuma dessas aparece numa comparação de desempenho, e todas aparecem no primeiro
incidente sério.

## Modelo Mental

**"NoSQL" é uma categoria de marketing, não uma decisão de arquitetura.** Decida
pelo padrão de acesso.

## Quando Usar

O termo é útil em exatamente um contexto: conversa histórica sobre o movimento do
final dos anos 2000.

Para decidir armazenamento, use as categorias específicas:

- **[Documento](document-databases.md)** — agregados variáveis lidos inteiros.
- **[Chave-valor](key-value-databases.md)** — acesso por chave, vazão.
- **[Colunar](column-stores.md)** — analítico.
- **[Grafo](graph-databases.md)** — travessia.
- **Série temporal** — métricas com retenção.

## Quando Não Usar

**Como categoria de decisão.** "Vamos de NoSQL" não é uma decisão.

**Como sinônimo de escala.** Relacionais escalam mais do que a maioria precisa.

**Como sinônimo de "sem esquema".** O esquema apenas muda de lugar.

**Como oposição a SQL.** Vários não relacionais têm linguagens parecidas com SQL,
e a oposição nunca foi sobre a linguagem.

**Para justificar sair do relacional sem medir.** Ver
[bancos relacionais](relational-databases.md).

## Alternativas

Em vez do termo, use a categoria específica. Em vez da pergunta binária, use as
quatro perguntas de padrão de acesso.

E considere que a resposta pode ser mais de um armazenamento — com o custo
operacional na conta.

## Trade-offs

O trade-off real não é entre SQL e NoSQL. É entre generalidade e especialização:

| Armazenamento geral | Especializado |
|---|---|
| Serve muitos padrões razoavelmente | Um padrão muito bem |
| Consultas não previstas possíveis | Limitadas ao previsto |
| Uma tecnologia a operar | Uma a mais por caso |
| Desempenho adequado | Ordens de grandeza melhor no caso dele |
| Migrar depois é caro | Migrar depois é caro |

## Modos de Falha

**Escolha por categoria.** A ferramenta não serve ao acesso real.

**Esquema implícito divergindo.** Cada serviço grava um formato ligeiramente
diferente.

**Consulta não prevista impossível.** O modelo otimizado não responde a pergunta
nova.

**Proliferação.** Cinco armazenamentos e ninguém domina nenhum.

**Perda de integridade.** Sem restrições no armazenamento.

## Erros Comuns

**Tratar como decisão binária.**

**Adotar por tendência.**

**Assumir que "sem esquema" elimina o esquema.**

**Escolher a ferramenta antes de descrever o padrão de acesso.**

**Adicionar tecnologia sem contar o custo operacional.**

## Exemplo Real

Uma startup de saúde definiu na fundação: "arquitetura NoSQL, para escalar desde o
começo". Escolheu um banco de documentos para tudo.

Três anos depois, o inventário era este:

**Prontuários.** Estrutura variável, lidos inteiros por paciente. O modelo de
documentos serve bem. Permaneceu.

**Agendamentos.** Consultas por período, por profissional, por sala, com detecção
de conflito de horário. Exigia transação e consulta com múltiplos filtros. Foi
migrado para relacional depois de dois incidentes de agendamento duplicado.

**Sessões de usuário.** Acesso por chave, alta vazão, expiração. Estava no banco
de documentos, com um processo varrendo para apagar expirados. Migrado para
chave-valor com expiração nativa; o processo de limpeza deixou de existir.

**Métricas de uso.** Séries temporais gravadas como documentos, uma por evento.
A coleção cresceu para 2 bilhões de documentos e as consultas de agregação
levavam minutos. Migrado para banco de série temporal.

**Busca por sintomas.** Implementada com expressão regular sobre campos de texto.
Lenta e sem relevância. Migrada para índice invertido.

Das cinco cargas, o banco de documentos era a escolha certa para uma.

A avaliação posterior aponta: a decisão original não foi entre modelos — foi entre
"NoSQL" e "SQL", e por isso não podia estar certa. Nenhuma das cinco cargas foi
descrita em termos de padrão de acesso antes de escolher.

## Conceitos Relacionados

- [Bancos Relacionais](relational-databases.md) — o padrão do qual se abre mão.
- [Bancos de Documentos](document-databases.md), [Chave-Valor](key-value-databases.md),
  [Colunar](column-stores.md), [Grafo](graph-databases.md) — as categorias reais.

## Exercício Prático

Para cada armazenamento do seu sistema, escreva em uma frase o padrão de acesso
que ele serve.

Onde não conseguir escrever, ou onde a frase couber igualmente em outra
tecnologia, há uma escolha que não foi feita por critério.

## Perguntas de Entrevista

- Por que "NoSQL" não é uma categoria útil para decidir?
- O que "sem esquema" realmente significa?
- Que perguntas substituem "SQL ou NoSQL"?

## Para Aprofundar

- Sadalage, Pramod; Fowler, Martin. *NoSQL Distilled*. Addison-Wesley, 2012.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 2.
- Stonebraker, Michael. *The Traditional RDBMS Wisdom Is All Wrong*, 2013.
