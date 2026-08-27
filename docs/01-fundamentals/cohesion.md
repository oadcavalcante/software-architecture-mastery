---
id: cohesion
title: Coesão
sidebar_position: 14
description: O grau em que o que está junto pertence junto — a outra face da decisão de fronteira.
doc_type: concept
level: 1
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor avalia a coesão de um módulo pelo eixo de mudança e
  reconhece quando aumentar coesão custa mais do que rende.
prerequisites: [coupling]
related: [modularity, separation-of-concerns]
canonical_for: [coesão, cohesion]
content_version: 1
last_reviewed: 2026-08-26
---

# Coesão

## Visão Geral

Coesão é o grau em que os elementos de um módulo pertencem juntos.

Coesão e [acoplamento](coupling.md) não são propriedades independentes: são a
mesma decisão vista de dois lados. Ao decidir o que fica dentro de uma fronteira,
você determina simultaneamente a coesão do que ficou dentro e o acoplamento com o
que ficou fora.

## Problema

Um módulo com baixa coesão agrupa coisas que não têm relação. O sintoma é
característico: o módulo muda com frequência alta, mas cada mudança toca uma
parte diferente dele, e as partes não se comunicam.

O custo aparece de três formas. Quem precisa entender uma parte carrega o resto
junto. Quem altera uma parte arrisca as outras sem motivo. E o módulo vira
dependência de todo mundo — porque todos precisam de alguma coisa lá dentro,
mesmo que coisas diferentes.

Módulos chamados `utils`, `helpers`, `common` ou `shared` são a manifestação
canônica: agrupados pelo que não são, e não pelo que são.

## Conceitos Centrais

### A escala de coesão

Do pior ao melhor, na taxonomia clássica:

| Tipo | Critério de agrupamento | Avaliação |
|---|---|---|
| Coincidental | Nenhum | `utils` |
| Lógica | Mesma categoria genérica | Todos os validadores juntos |
| Temporal | Executam no mesmo momento | `inicializacao()` |
| Procedural | Fazem parte da mesma sequência | Etapas de um fluxo |
| De comunicação | Operam sobre o mesmo dado | Tudo que lê o pedido |
| Sequencial | A saída de um é entrada do outro | Pipeline de transformação |
| Funcional | Contribuem para uma única tarefa bem definida | Cálculo de imposto |

Coesão funcional é o alvo. Coesão coincidental é o sinal de que ninguém decidiu.

### O critério prático

A taxonomia é útil para diagnosticar, mas o critério operacional é o mesmo de
[modularidade](modularity.md) e
[separação de responsabilidades](separation-of-concerns.md):

> **Coisas que mudam pela mesma razão pertencem juntas.**

Um módulo é coeso quando existe uma frase curta que descreve o que ele faz, sem
usar "e". Se a descrição precisa de conjunções, provavelmente há mais de um
assunto ali.

### Coesão alta reduz acoplamento — às vezes

Quando um módulo é coeso, quem o usa depende de uma coisa, não de várias. Isso
tende a reduzir acoplamento eferente do lado de fora.

Mas a relação não é automática. É possível ter um módulo internamente coeso que
depende de dez outros — coesão alta e acoplamento eferente alto ao mesmo tempo.
As duas propriedades se relacionam, não se determinam.

### Coesão é contextual

O mesmo agrupamento pode ser coeso ou não conforme o sistema. Num sistema
pequeno, "operações de cliente" é uma tarefa bem definida. Num sistema grande,
"cliente" se fragmenta em cadastro, crédito, preferências e histórico — que mudam
por razões distintas e não pertencem juntos.

Isso significa que coesão degrada com o crescimento sem que ninguém faça nada
errado. Um módulo coeso há dois anos pode não ser mais.

## Modelo Mental

**Descreva o módulo em uma frase. Se precisar de "e", ele não é coeso.**

O teste é grosseiro e funciona bem na prática, porque a dificuldade de nomear
reflete a ausência de um conceito único por trás do agrupamento.

## Quando Usar

Aumentar coesão vale quando:

- O módulo tem partes que mudam por razões independentes.
- Consumidores diferentes usam partes disjuntas dele.
- Nomeá-lo exige conjunção ou um nome genérico.
- Ele aparece em quase todo commit, mas por motivos diferentes a cada vez.
- Testá-lo exige preparar contexto de assuntos não relacionados.

## Quando Não Usar

**Quando a divisão resultante produz módulos que sempre mudam juntos.** Aumentar
coesão fragmentando um módulo em três que nunca mudam separadamente troca um
problema por outro pior — agora há três lugares a manter em sincronia.

**Quando a coesão que falta é aparente, não real.** Um módulo que parece agrupar
assuntos distintos mas cujas partes compartilham uma invariante de negócio é
coeso, ainda que o nome não capture isso bem. A solução é o nome, não a divisão.

**Quando o custo de reorganizar excede o benefício restante.** Um módulo pouco
coeso em código estável, que ninguém toca há um ano, é dívida sem juros. Corrigir
tem custo real e benefício hipotético.

**Em código descartável.** O mesmo raciocínio de
[separação de responsabilidades](separation-of-concerns.md).

## Alternativas

- **Renomear em vez de dividir** — quando a coesão existe e o nome não a revela.
- **Mover elementos em vez de dividir o módulo** — frequentemente um ou dois
  elementos estão no lugar errado, e o resto está bem.
- **Aceitar e isolar** — colocar o módulo pouco coeso atrás de uma fachada
  coesa, quando reorganizá-lo é caro demais.

## Trade-offs

O eixo é **custo de entender e alterar uma parte versus número de fronteiras a
navegar**.

| Mais coesão | Menos coesão |
|---|---|
| Módulo compreensível isoladamente | Precisa carregar contexto irrelevante |
| Mudança não arrisca partes não relacionadas | Toda alteração toca vizinhos alheios |
| Consumidores dependem só do que usam | Todos dependem do módulo inteiro |
| Mais módulos, mais fronteiras | Menos lugares para procurar |
| Risco de fragmentar o que muda junto | Sem risco de fragmentação |

## Modos de Falha

**Módulo depósito.** `utils`, `common`, `shared`. Coesão coincidental levada ao
limite. Torna-se dependência universal, e mudanças nele afetam tudo.

**Coesão temporal virando acoplamento.** Um `setup()` que inicializa dez coisas
não relacionadas cria dependência de ordem entre elas, que ninguém documentou.

**Módulo que cresceu.** Começou coeso e acumulou responsabilidades vizinhas, uma
de cada vez, cada adição defensável. O sintoma é o nome ter parado de descrever o
conteúdo.

**Fragmentação por perseguir coesão.** Cinco módulos minúsculos que sempre mudam
juntos. A coesão de cada um é alta e o sistema ficou pior.

## Erros Comuns

**Criar `utils` como default.** É o caminho de menor resistência quando não se
sabe onde algo pertence. Não saber é informação: geralmente significa que o
conceito ainda não foi identificado.

**Confundir coesão com tamanho.** Um módulo grande pode ser altamente coeso; um
pequeno pode ser coincidental. Tamanho é consequência.

**Agrupar por tipo técnico.** Todos os validadores, todos os DTOs, todos os
mapeadores. Coesão lógica — segundo pior nível da escala — e muito comum por
parecer organizado.

**Ignorar a degradação.** Coesão não é decidida uma vez. Módulos degradam por
acúmulo, e ninguém percebe porque cada adição individual foi razoável.

## Exemplo Real

Um módulo `ClienteService` com 900 linhas, responsável por: cadastro, validação
de documento, cálculo de limite de crédito, preferências de comunicação e
histórico de compras.

Cinco consumidores. Nenhum usava mais que dois dos cinco assuntos.

A análise por razão de mudança separou os grupos com clareza: cadastro e
validação de documento mudam juntos, por razão regulatória. Limite de crédito
muda por decisão de risco. Preferências mudam por decisão de produto. Histórico
não mudava havia dois anos.

O módulo virou três: `ClienteCadastro`, `ClienteCredito`, `ClientePreferencias`.
O histórico foi absorvido pelo módulo de pedidos, onde o dado já morava.

O detalhe instrutivo: a tentação inicial foi criar cinco módulos, um por assunto
identificado. Manter cadastro e validação juntos — apesar de parecerem
separáveis — foi a decisão certa, porque as duas mudam pela mesma razão externa e
separá-las teria criado uma fronteira que toda mudança regulatória atravessaria.

## Conceitos Relacionados

- [Acoplamento](coupling.md) — a outra face.
- [Modularidade](modularity.md) — a estrutura resultante.
- [Separação de Responsabilidades](separation-of-concerns.md) — o princípio que
  orienta a divisão.

## Exercício Prático

Escolha os três maiores módulos do seu sistema. Para cada um, tente escrever em
uma frase o que ele faz, sem usar "e" e sem usar o próprio nome.

Onde você não conseguir, liste as razões de mudança e agrupe as que já ocorreram
juntas historicamente. Os grupos são os módulos que deveriam existir.

## Perguntas de Entrevista

- Como você avalia se um módulo é coeso?
- Qual a relação entre coesão e acoplamento?
- Por que `utils` é um problema, e o que fazer com o que está lá dentro?

## Para Aprofundar

- Yourdon, Edward; Constantine, Larry. *Structured Design*. Prentice Hall,
  1979 — a taxonomia original de coesão.
- Martin, Robert C. *Clean Architecture*. Prentice Hall, 2017 — princípios de
  coesão de componentes.
