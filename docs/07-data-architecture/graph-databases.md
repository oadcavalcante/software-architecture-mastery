---
id: graph-databases
title: Bancos de Grafo
sidebar_position: 6
description: Relacionamento como cidadão de primeira classe — e por que o caso de uso é mais estreito do que parece.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor identifica se o problema é de travessia profunda ou apenas
  de dados relacionados, que são coisas diferentes.
prerequisites: [nosql]
related: [relational-databases, data-modeling, nosql]
canonical_for: [banco de grafo, travessia de grafo]
content_version: 1
last_reviewed: 2026-08-27
---

# Bancos de Grafo

## Visão Geral

Um banco de grafo trata **conexões** como estrutura de primeira classe: nós, arestas
com tipo e propriedades, e travessia como operação primitiva.

O ganho aparece numa situação específica: consultas que percorrem muitos níveis de
relacionamento, cuja profundidade não é conhecida de antemão.

Fora disso — e "fora disso" cobre a maioria dos sistemas que têm dados
relacionados — um banco relacional resolve melhor.

## Problema

Num modelo relacional, cada nível de relacionamento é uma junção. Duas junções são
triviais. Cinco começam a doer. Profundidade variável — "todos os conectados a
este, direta ou indiretamente" — é difícil de expressar e cara de executar.

O custo cresce de forma multiplicativa com a profundidade, porque cada junção
processa o resultado da anterior.

Bancos de grafo resolvem isso guardando as conexões como ponteiros: caminhar de um
nó para os vizinhos é seguir referências, com custo proporcional ao número de
vizinhos, não ao tamanho da tabela.

## Conceitos Centrais

### A vantagem é sobre profundidade, não sobre relacionamento

Esta é a distinção que decide a escolha, e a que mais se confunde.

**Ter dados relacionados** — pedido pertence a cliente, produto pertence a
categoria — é o caso normal e o relacional foi feito para ele.

**Precisar percorrer profundidade variável** — cadeia de indicações, propriedade
societária através de camadas, caminho entre duas pessoas — é o caso do grafo.

Se todas as suas consultas têm profundidade conhecida e pequena, você tem dados
relacionados, não um problema de grafo.

### O custo não depende do tamanho total

Numa junção relacional, o otimizador trabalha sobre tabelas inteiras. Num grafo, a
travessia parte de um nó e visita apenas os alcançados.

Uma busca de três níveis a partir de uma pessoa visita dezenas ou centenas de nós,
independentemente de o grafo ter mil ou cem milhões.

É a propriedade que justifica o modelo quando ele se justifica.

### A explosão continua existindo

O custo não some — muda de forma. Uma travessia sem limite de profundidade em
grafo denso pode visitar quase tudo.

Redes sociais são o exemplo: quatro níveis a partir de uma pessoa alcançam boa
parte da rede. Limite de profundidade e de resultados não é otimização, é
requisito.

### Modelar o que é nó e o que é aresta

A decisão inicial: o relacionamento é uma aresta simples, ou é uma entidade com
propriedades?

Uma transação entre contas pode ser aresta com valor e data, ou pode ser um nó
conectado às duas contas. A segunda forma permite que a transação tenha seus
próprios relacionamentos.

Errar isso limita as perguntas possíveis, e refazer exige remodelar o grafo.

### Escrita e escala são o ponto fraco

Grafos não particionam bem. Cortar um grafo em partes minimizando as arestas que
cruzam a fronteira é um problema difícil, e toda travessia que cruza a fronteira
paga rede.

Na prática, a maioria dos bancos de grafo escala verticalmente. Isso limita o
tamanho e é aceitável, porque grafos genuinamente grandes são raros fora de
algumas indústrias.

### Grafo especializado ao lado do armazenamento principal

O desenho mais comum entre implementações bem-sucedidas: manter o sistema no
armazenamento adequado à operação, e projetar apenas o subgrafo relevante para um
banco de grafo.

Não é preciso — nem desejável — mover o sistema inteiro para grafo porque uma
consulta precisa de travessia.

## Modelo Mental

**Grafo é para profundidade variável.** Se a profundidade das suas consultas é
conhecida e pequena, o relacional é melhor em tudo o mais.

## Quando Usar

- Travessia de profundidade variável ou desconhecida.
- Busca de caminho entre entidades.
- Detecção de ciclo ou de comunidade.
- Recomendação baseada em conexões.
- Análise de propriedade societária, fraude, dependências.
- As perguntas são sobre a estrutura das conexões, não sobre os dados dos nós.

## Quando Não Usar

**Quando as consultas têm profundidade fixa e pequena.** Junções resolvem.

**Para carga transacional geral.**

**Para agregação sobre grandes volumes.** Ver [colunar](/07-data-architecture/column-stores.md).

**Quando o volume de escrita é alto.**

**Como armazenamento único do sistema.** Projete o subgrafo relevante.

**Quando "temos muitos relacionamentos" é a única justificativa.** Todo sistema
tem.

## Alternativas

- **[Relacional](/07-data-architecture/relational-databases.md) com consulta recursiva** — bancos
  relacionais expressam travessia recursiva; para profundidade moderada, funciona
  bem e evita uma tecnologia.
- **Tabela de fechamento transitivo** — pré-calcular os caminhos quando a
  estrutura muda pouco.
- **Processamento de grafo em lote** — quando a análise é periódica, não
  interativa.
- **Coluna de adjacência** — guardar a lista de vizinhos junto ao registro.

A primeira merece consideração séria antes de adotar uma tecnologia nova: a
consulta recursiva cobre uma boa parte dos casos de profundidade moderada.

## Trade-offs

| Grafo | Relacional |
|---|---|
| Travessia de profundidade variável | Junções de profundidade fixa |
| Custo independe do tamanho total | Depende |
| Escala horizontal difícil | Mais opções |
| Agregação fraca | Forte |
| Ferramental menos maduro | Muito maduro |
| Modelagem por conexão | Por entidade |

## Modos de Falha

**Travessia sem limite.** Visita metade do grafo e não termina.

**Supernó.** Um nó com milhões de arestas — uma categoria popular, um país —
destrói o desempenho de qualquer travessia que passe por ele.

**Modelagem errada de aresta.** Descobre-se que o relacionamento precisava de
propriedades próprias.

**Escala de escrita.** Ingestão alta degrada.

**Consulta escrita ingenuamente.** A linguagem esconde o custo, e uma consulta
inocente pode ser exponencial.

O supernó é o modo de falha mais característico, e o que mais surpreende: o grafo
funciona bem até que uma travessia toque um nó muito conectado.

## Erros Comuns

**Adotar porque "os dados são conectados".**

**Não limitar profundidade e resultados.**

**Não tratar supernós** — que exigem modelagem específica, como dividir a categoria
em subcategorias.

**Migrar o sistema inteiro** em vez de projetar o subgrafo.

**Não testar com volume e densidade realistas.** Um grafo pequeno esconde todos os
problemas.

## Exemplo Real

Uma seguradora precisava detectar fraude organizada: grupos de pessoas ligadas por
endereço, telefone, conta bancária ou veículo, apresentando sinistros
relacionados.

No modelo relacional, a consulta era de profundidade variável — "encontre todos
conectados a esta pessoa por qualquer caminho de até cinco passos". A
implementação existente rodava em lote noturno e levava 6 horas.

Um banco de grafo com os dados projetados — pessoas, contatos, contas, veículos,
sinistros — respondia a mesma pergunta em 200 milissegundos, permitindo verificação
no momento do registro do sinistro.

O ganho foi real e trouxe dois problemas.

**Supernós.** Certos telefones apareciam em milhares de cadastros — centrais de
atendimento, números de empresas. Uma travessia que tocasse um deles conectava
metade da base. A correção foi marcar esses nós e excluí-los da travessia, com
regra explícita: contatos com mais de 50 ligações não são evidência de vínculo.

**Consultas exponenciais.** Um analista escreveu uma consulta sem limite de
profundidade que derrubou o servidor. Passou a haver limite obrigatório e prazo de
execução.

E uma decisão que a equipe considera a mais importante: o grafo **não** virou fonte
da verdade. Os dados continuam no sistema transacional, e o grafo é reconstruído
diariamente com o subconjunto relevante.

Isso permitiu mudar o modelo do grafo três vezes no primeiro ano, conforme os
analistas descobriam quais conexões importavam — algo impossível se ele fosse a
fonte da verdade.

## Conceitos Relacionados

- [Bancos Relacionais](/07-data-architecture/relational-databases.md) — a comparação principal.
- [NoSQL](/07-data-architecture/nosql.md) — a categoria.
- [Modelagem de Dados](/07-data-architecture/data-modeling.md).

## Exercício Prático

Pegue a consulta do seu sistema que faz mais junções. Conte os níveis e pergunte:
a profundidade é fixa?

Se for fixa, grafo não vai ajudar. Se variar conforme os dados, você tem um
candidato — e o próximo passo é testar a consulta recursiva do seu banco atual
antes de adotar tecnologia nova.

## Perguntas de Entrevista

- Qual a diferença entre ter dados relacionados e ter um problema de grafo?
- O que é um supernó e por que ele quebra o desempenho?
- Por que grafos particionam mal?

## Para Aprofundar

- Robinson, Ian; Webber, Jim; Eifrem, Emil. *Graph Databases*. 2ª ed. O'Reilly,
  2015.
- Sadalage, Pramod; Fowler, Martin. *NoSQL Distilled*. Addison-Wesley, 2012.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 2.
