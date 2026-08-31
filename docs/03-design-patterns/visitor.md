---
id: visitor
title: Visitor
sidebar_position: 22
description: Separar operações da estrutura que percorrem — poderoso, rígido, e quase sempre a escolha errada.
doc_type: pattern
level: 2
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor reconhece o eixo de variação que Visitor privilegia e por
  que ele é o padrão mais frequentemente mal aplicado.
prerequisites: [composite]
related: [composite, iterator, strategy]
canonical_for: [visitor, visitante, despacho duplo]
content_version: 1
last_reviewed: 2026-08-26
---

# Visitor

## Visão Geral

Visitor separa um algoritmo da estrutura de objetos sobre a qual ele opera,
permitindo adicionar operações novas sem alterar as classes da estrutura.

É o padrão mais complexo do catálogo e o mais frequentemente aplicado onde não
serve. A razão está num único eixo, e entendê-lo resolve quase toda decisão sobre
ele.

## Problema

Uma estrutura de objetos com vários tipos de nó precisa de várias operações
diferentes.

Uma árvore sintática com números, operadores e variáveis precisa ser avaliada,
impressa, otimizada, verificada quanto a tipos e serializada.

Colocar cada operação nos nós funciona — mas cada operação nova toca todas as
classes de nó, e as classes acumulam responsabilidades sem relação entre si.

Visitor inverte: cada operação vira um objeto que sabe lidar com todos os tipos
de nó.

## Conceitos Centrais

### O dilema da expressão

A formulação que decide tudo. Existem dois eixos de crescimento:

**Tipos novos** — mais tipos de nó na estrutura.
**Operações novas** — mais coisas a fazer com a estrutura.

Nenhuma organização torna os dois baratos ao mesmo tempo.

| | Método no nó | Visitor |
|---|---|---|
| Adicionar tipo de nó | Barato — uma classe | **Caro** — toca todos os visitantes |
| Adicionar operação | **Caro** — toca todos os nós | Barato — uma classe |

Visitor privilegia operações e penaliza tipos. Aplicá-lo a uma estrutura cujos
tipos crescem é escolher o lado errado do dilema — e é o erro mais comum com este
padrão.

### Despacho duplo

O mecanismo. Em linguagens com despacho simples, o método chamado depende de um
tipo. Visitor precisa de dois: o tipo do nó e o tipo da operação.

```text
no.aceitar(visitante)          ← despacha pelo tipo do nó
  visitante.visitarNumero(this) ← despacha pelo tipo do visitante
```

O `aceitar` em cada nó existe só para isso. É cerimônia obrigatória, e o que torna
o padrão verboso.

Em linguagens com correspondência de padrões sobre tipos algébricos, o mesmo se
escreve sem hierarquia nem `aceitar` — o que explica por que Visitor é raro em
código funcional.

### O custo de legibilidade

Uma operação distribuída entre `visitarNumero`, `visitarOperador`,
`visitarVariavel` fica coesa como classe e fragmentada como leitura: entender o
que ela faz exige ler todos os métodos e reconstruir mentalmente o percurso.

## Quando Usar

- A estrutura de tipos é **estável** e as operações crescem.
- As operações são complexas e não pertencem conceitualmente aos nós.
- Uma operação precisa acumular estado ao percorrer a estrutura.
- É necessário aplicar operações a uma hierarquia que você não controla.

## Quando Não Usar

**Quando tipos novos aparecem com frequência.** O lado errado do dilema. Cada tipo
toca todos os visitantes.

**Quando há uma operação só.** Toda a cerimônia sem o benefício.

**Quando a linguagem tem correspondência de padrões.** Uma função com `match`
sobre os tipos faz o mesmo com uma fração do código.

**Quando a operação pertence ao nó.** Se `avaliar` é o que o nó é, ele deve saber
avaliar-se.

**Quando a legibilidade importa mais que a extensibilidade.** Visitor fragmenta a
leitura de cada operação, e em código lido com frequência isso pesa.

## Alternativas

- **Correspondência de padrões** — em linguagens que oferecem, é superior em quase
  tudo.
- **Método no nó** — quando as operações são poucas e estáveis.
- **[Iterator](/03-design-patterns/iterator.md) com condicional de tipo** — menos elegante, muito mais
  legível, e adequado quando há poucos tipos.
- **Tabela de despacho** — um mapa de tipo para função, sem hierarquia de
  visitantes.

## Trade-offs

| Visitor | Método no nó |
|---|---|
| Operação nova é uma classe | Toca todos os nós |
| Tipo novo toca todos os visitantes | É uma classe |
| Operação coesa numa classe | Distribuída pelos nós |
| Leitura fragmentada por tipo | Cada nó legível isolado |
| `aceitar` obrigatório em cada nó | Sem cerimônia |
| Acumula estado no percurso | Estado precisa ser passado |

## Modos de Falha

**Tipo novo esquecido num visitante.** Sem verificação exaustiva, o compilador não
avisa e o comportamento fica errado silenciosamente.

**Visitante com estado compartilhado.** Reutilizar a instância entre percursos
produz contaminação.

**Hierarquia de visitantes.** Um visitante base com comportamento padrão e
subclasses que sobrescrevem: combina os custos de Visitor com os de herança.

**Ordem de percurso implícita.** Quem controla o percurso — o nó ou o visitante —
não é óbvio, e mudar isso quebra visitantes que dependiam da ordem.

## Erros Comuns

**Aplicar a estrutura com tipos instáveis.** O erro central.

**Usar em linguagem com correspondência de padrões.**

**Colocar no visitante o que pertence ao nó.**

**Não tratar o caso do tipo desconhecido.** Um visitante que não cobre um tipo
deveria falhar explicitamente, não ignorar.

## Onde ele aparece na prática

**Compiladores e interpretadores.** O caso canônico e o que melhor satisfaz a
condição: a gramática de uma linguagem é estável por anos, e as operações —
verificação de tipos, otimização, geração de código, formatação — crescem.

**Ferramentas de análise estática.** Cada regra é um visitante sobre a árvore
sintática. Regras novas são frequentes; tipos de nó, não.

**Serialização de estruturas complexas.** Um visitante por formato.

**Percurso de documentos estruturados.** Transformações sobre árvores de
documento.

Os quatro compartilham a mesma característica, e ela é o teste do padrão: **a
estrutura foi definida por uma especificação externa** — uma gramática, um
formato, um padrão — e por isso não muda no ritmo do código. Quando a estrutura é
sua e evolui com o domínio, a condição não vale.

## Exemplo Real

Um sistema de regras de negócio representava condições como árvore: comparações,
conjunções, disjunções, negações, referências a campo.

Cinco tipos de nó, definidos pela gramática da linguagem de regras — estável desde
o início.

As operações cresceram: avaliar, renderizar para leitura humana, converter em SQL,
estimar custo, extrair os campos referenciados, validar.

Seis visitantes, cada um numa classe. Adicionar uma operação nunca tocou os nós.

O contraexemplo, no mesmo sistema: alguém aplicou Visitor à hierarquia de
documentos do domínio — contrato, apólice, endosso, sinistro. Essa hierarquia
crescia: em dois anos ganhou cinco tipos novos.

Cada tipo novo tocou os quatro visitantes existentes. Em duas ocasiões um tipo foi
adicionado e um visitante não foi atualizado — e o defeito passou porque nada
obrigava a exaustividade.

Foi revertido para métodos nos próprios documentos.

A mesma equipe, o mesmo padrão, dois resultados opostos. A diferença foi qual eixo
crescia.

## Conceitos Relacionados

- [Composite](/03-design-patterns/composite.md) — a estrutura sobre a qual Visitor costuma operar.
- [Iterator](/03-design-patterns/iterator.md) — percurso sem distinção de tipo.
- [Strategy](/03-design-patterns/strategy.md) — variação de algoritmo sem estrutura.

## Exercício Prático

Escolha uma hierarquia de tipos do seu sistema e responda com o histórico: quantos
tipos novos foram adicionados no último ano? Quantas operações novas?

Se tipos > operações, Visitor é o padrão errado ali. Se operações > tipos e a
estrutura vem de uma especificação externa, pode valer.

## Perguntas de Entrevista

- O que é o dilema da expressão e qual lado Visitor escolhe?
- Por que Visitor precisa de despacho duplo?
- Em que tipo de linguagem ele deixa de ser necessário?

## Para Aprofundar

- Gamma, Erich et al. *Design Patterns*. Addison-Wesley, 1994.
- Wadler, Philip. *The Expression Problem*, 1998.
