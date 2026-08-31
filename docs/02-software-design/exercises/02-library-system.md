---
id: 02-library-system
title: "Exercício 02 — Sistema de Biblioteca"
sidebar_position: 1
description: O primeiro exercício do percurso — fronteiras, direção de dependência e o que acontece quando o requisito muda.
doc_type: exercise
level: 2
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor desenha módulos com fronteiras explícitas e direção de dependência
  declarada, e percebe o custo de uma fronteira mal posicionada.
prerequisites: [modular-design]
related: [coupling, cohesion, dependency-direction, boundaries]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-29
---

# Exercício 02 — Sistema de Biblioteca

## Contexto

Uma rede de bibliotecas municipais com 14 unidades quer substituir o sistema de empréstimos,
que hoje é uma planilha compartilhada por unidade.

O acervo é de cerca de 180 mil exemplares, com 40 mil usuários cadastrados e uma média de 900
empréstimos por dia em toda a rede. Não há pressão de escala — o sistema roda numa máquina.

Este é o primeiro exercício do percurso, e ele não é sobre escala nem sobre distribuição. É
sobre **fronteiras**: onde separar, o que depende de quê, e o que acontece quando o requisito
muda.

## Requisitos

Para o **usuário**: buscar no acervo; reservar um exemplar; consultar seus empréstimos e prazos;
renovar um empréstimo, se não houver reserva de outra pessoa.

Para o **atendente**: registrar empréstimo e devolução; consultar a situação de um usuário;
tratar atraso, aplicando a regra de suspensão.

Para a **rede**: transferir exemplares entre unidades; gerar relatório de acervo e de
circulação.

## Restrições

```text
prazo de empréstimo      14 dias, renovável duas vezes
suspensão por atraso     um dia de suspensão por dia de atraso,
                         acumulado; teto de 60 dias
reserva                  fila por título, não por exemplar
transferência            um exemplar em trânsito não pode ser
                         emprestado nem reservado
regra municipal          o prazo e a suspensão são definidos por
                         decreto e mudaram três vezes em dez anos
```

A última restrição é a mais importante do enunciado, e a que se costuma ignorar.

## Sua Tarefa

Produza, em até uma hora:

1. Os **módulos** do sistema, com uma frase dizendo o que cada um esconde do resto.
2. A **direção das dependências** entre eles — quem importa quem, e quem nunca importa quem.
3. O **modelo de dados** de empréstimo, reserva e exemplar.
4. Onde a **regra de prazo e suspensão** vive, e por quê.

Não desenhe camadas técnicas — controlador, serviço, repositório. Desenhe módulos por
responsabilidade de domínio.

## Perguntas que Você Deveria Fazer

Antes de decidir qualquer coisa:

```text
um exemplar e um título são a mesma coisa?
a fila de reserva é por título ou por exemplar?
o que acontece com a reserva quando o exemplar volta danificado?
uma unidade pode ter regra de prazo diferente?
o histórico de empréstimo precisa ser preservado por quanto tempo?
quem pode alterar a regra de suspensão, e com que frequência?
```

A primeira e a última decidem quase tudo. A primeira define o modelo; a última define onde a
regra vive.

## Critérios de Avaliação

Sua resposta está boa se:

- **Título e exemplar são entidades distintas.** Um título tem N exemplares; a reserva é por
  título e a satisfação da reserva é por exemplar. Confundi-los produz um modelo que não
  representa o domínio.
- **A regra de prazo e suspensão está isolada.** Ela muda por decreto, três vezes em dez anos, e
  o requisito diz isso. Se ela estiver espalhada por quatro módulos, cada mudança municipal é uma
  caçada.
- **Nenhum módulo de domínio depende de infraestrutura.** O módulo de empréstimo não sabe que
  existe banco de dados nem interface web.
- **As dependências têm direção declarada e não têm ciclo.** Se `emprestimo` importa `acervo` e
  `acervo` importa `emprestimo`, eles são um módulo só disfarçado de dois.
- **Você consegue dizer o que cada módulo esconde.** Um módulo que não esconde nada é uma pasta.

Sua resposta é fraca se ela é uma lista de tabelas de banco de dados com nomes de módulo
colados por cima.

## Discussão

:::details Abra depois de tentar

**A fronteira que decide o exercício** é entre o que empresta e o que guarda o acervo.

```text
acervo        títulos, exemplares, estado físico, localização,
              transferência entre unidades
circulação    empréstimo, devolução, renovação, reserva, prazo
usuários      cadastro, situação, suspensão
```

`circulação` depende de `acervo` — ela precisa saber se um exemplar está disponível. `acervo`
**não** depende de `circulação`: um exemplar sabe onde está e em que estado, e não sabe se
está emprestado.

Isso é contraintuitivo, porque "emprestado" parece estado do exemplar. Modelá-lo assim acopla
o acervo à circulação e produz o ciclo. O exemplar tem estado físico — disponível, em trânsito,
danificado, baixado; **emprestado é um fato da circulação**, não do acervo.

Quem modela "emprestado" como estado do exemplar descobre o problema na transferência: um
exemplar em trânsito e emprestado ao mesmo tempo é impossível, e o modelo permite.

**A regra de prazo e suspensão** merece módulo próprio, ou pelo menos um ponto único. Ela é a
única parte do sistema com data de validade conhecida — o enunciado diz que muda por decreto.
Um sistema em que essa regra está em três lugares paga a mudança três vezes, a cada decreto.

O detalhe que separa uma resposta boa de uma ótima: a regra precisa ser **datada**. Um
empréstimo feito sob o decreto anterior é renovado sob qual prazo? A resposta correta é a regra
vigente na data do empréstimo, o que significa que a regra é versionada por vigência — e isso é
uma decisão de modelo, não de configuração.

**O que quase todo mundo erra:** fazer a fila de reserva por exemplar. O usuário reserva um
título; qual exemplar satisfaz a reserva é decisão do sistema no momento da devolução. Reservar
por exemplar cria filas por objeto físico e produz a situação absurda de alguém esperando o
exemplar 3 enquanto o 7 está na prateleira.

Ver [desenho modular](/02-software-design/modular-design.md), [fronteiras](/02-software-design/boundaries.md) e
[direção de dependência](/02-software-design/dependency-direction.md).

:::

## Conceitos Relacionados

- [Desenho Modular](/02-software-design/modular-design.md).
- [Fronteiras](/02-software-design/boundaries.md).
- [Direção de Dependência](/02-software-design/dependency-direction.md).
- [Acoplamento](/01-fundamentals/coupling.md) e
  [Coesão](/01-fundamentals/cohesion.md).
