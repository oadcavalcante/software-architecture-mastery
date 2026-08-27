---
id: core-domain
title: Core Domain
sidebar_position: 3
description: Onde a empresa se diferencia — e por que identificá-lo errado desperdiça a melhor capacidade de engenharia.
doc_type: foundation
level: 2
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor identifica o core domain a partir da diferenciação
  competitiva, não da dificuldade técnica.
prerequisites: [subdomain]
related: [supporting-domain, generic-domain, tactical-ddd]
canonical_for: [core domain, domínio central]
content_version: 1
last_reviewed: 2026-08-26
---

# Core Domain

## Visão Geral

O core domain é o subdomínio onde a empresa se diferencia — a razão pela qual os
clientes a escolhem em vez do concorrente.

É onde o melhor esforço de engenharia deve ir, e é o único lugar onde
[DDD tático](tactical-ddd.md) costuma se pagar.

## O Problema

Identificar o core parece trivial e raramente é.

Três forças puxam para a resposta errada.

**A dificuldade técnica.** O subdomínio mais desafiador atrai os melhores
engenheiros e é confundido com o mais importante. São coisas diferentes: um
algoritmo de otimização difícil pode não diferenciar nada se o concorrente usa a
mesma biblioteca.

**O volume de código.** O subdomínio maior parece o mais importante. Frequentemente
ele é grande porque acumulou complexidade acidental, não porque é essencial.

**A visibilidade.** O que o cliente vê — a interface — é confundido com o que o
cliente valoriza.

A pergunta que corrige: **se este subdomínio fosse igual ao do concorrente, a
empresa perderia clientes?** Se a resposta for não, não é core.

## Conceitos Centrais

### Diferenciação, não importância

Faturamento é essencial — sem ele a empresa não recebe. E não é core: toda
empresa fatura, e fazer isso melhor que o concorrente não ganha cliente nenhum.

Core é onde ser melhor **importa competitivamente**. É um conceito de estratégia
de negócio, não de criticidade operacional.

### O core costuma ser pequeno

Numa empresa madura, o core raramente passa de 10 a 20% do sistema. É a parte
que concentra a regra de negócio realmente própria.

Quando alguém aponta metade do sistema como core, ou a análise está errada ou a
empresa está tentando se diferenciar em coisas demais.

### O que o core merece

Uma vez identificado, as decisões seguem:

**Os melhores engenheiros.** É contraintuitivo alocá-los fora do problema técnico
mais difícil, e é o que a análise recomenda.

**Modelagem cuidadosa com o especialista.** Conversas frequentes, refinamento
contínuo, [ubiquitous language](ubiquitous-language.md) rigorosa.

**DDD tático.** Agregados, objetos de valor, eventos de domínio — os padrões que
não se pagam em outros lugares se pagam aqui.

**Nunca terceirizar nem comprar.** Comprar o core é comprar a própria
diferenciação de um fornecedor que a vende a todos.

### O core muda

O que diferencia hoje pode virar commodity. Quando o mercado resolve algo que era
core, continuar investindo ali é gastar onde não há mais retorno.

Revisar anualmente é barato.

## Por Que Isso Importa

**Porque a capacidade de engenharia é o recurso mais escasso.** Alocá-la fora do
core é o desperdício mais caro que uma empresa de software comete, e o mais
invisível — porque o trabalho feito é de boa qualidade.

**Porque determina onde a complexidade é justificável.** Ver
[complexidade](../01-fundamentals/complexity.md). No core, complexidade essencial
merece ser modelada com cuidado. Fora dele, a mesma complexidade deveria ser
evitada ou comprada.

**Porque é decisão de negócio.** Engenharia informa o custo; o negócio decide onde
quer se diferenciar. Quando a engenharia decide sozinha, escolhe o problema mais
interessante.

## Erros Comuns

**Confundir com o mais difícil tecnicamente.** O erro dominante.

**Confundir com o mais crítico operacionalmente.** Pagamento é crítico e
raramente é core.

**Identificar mais de um ou dois.** Empresas se diferenciam em poucas coisas.

**Deixar a engenharia decidir sozinha.**

**Comprar ou terceirizar o core.** É vender a diferenciação.

**Não revisar.** O mercado move a fronteira.

## Exemplo Real

Uma empresa de comércio eletrônico de nicho — produtos artesanais — tinha uma
equipe de doze engenheiros.

A alocação encontrada: cinco no motor de busca e recomendação, quatro no
checkout e pagamento, dois no catálogo, um no painel dos vendedores.

A pergunta de diferenciação foi feita a três clientes recorrentes e a cinco
vendedores. As respostas convergiram para algo que ninguém na engenharia
esperava: **a curadoria** — o processo pelo qual a empresa aprovava vendedores e
produtos, que garantia que tudo na plataforma era genuinamente artesanal.

Era o que os compradores citavam ao explicar por que não compravam no marketplace
grande. E era o que os vendedores citavam ao explicar por que pagavam comissão
mais alta.

O sistema de curadoria era uma planilha e um formulário, mantido por um
engenheiro em tempo parcial.

Busca e recomendação — cinco engenheiros — usavam uma biblioteca de prateleira com
ajustes, e eram comparáveis a qualquer concorrente.

A realocação moveu três engenheiros para construir o sistema de curadoria: fluxo
de avaliação, rastreabilidade de origem, verificação de artesão, reputação.

Dezoito meses depois, esse sistema virou o principal argumento comercial da
empresa e a base de uma certificação que ela passou a vender.

O que estava errado não era a qualidade do trabalho em busca. Era o lugar onde a
melhor capacidade estava alocada.

## Conceitos Relacionados

- [Subdomínio](subdomain.md) — a classificação.
- [Supporting](supporting-domain.md) e [Generic](generic-domain.md) — os outros
  tipos.
- [DDD Tático](tactical-ddd.md) — o que só se paga aqui.
- [Contexto de Negócio](../01-fundamentals/business-context.md).

## Exercício Prático

Pergunte a três clientes por que escolheram sua empresa em vez do concorrente.
Não à equipe — aos clientes.

Mapeie as respostas para subdomínios. Depois compare com a alocação atual de
engenheiros por subdomínio.

## Perguntas de Entrevista

- Como distinguir core de subdomínio meramente crítico?
- Por que o subdomínio tecnicamente mais difícil frequentemente não é o core?
- O que muda na prática ao identificar o core?

## Para Aprofundar

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003 — a parte sobre
  destilação do core.
- Vernon, Vaughn. *Domain-Driven Design Distilled*. Addison-Wesley, 2016.
