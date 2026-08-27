---
id: software-design
title: Design de Software
sidebar_position: 0
description: Como estruturar código e módulos para que a arquitetura pretendida sobreviva ao contato com a implementação.
doc_type: index
level: 2
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor sabe estruturar módulos e dependências de forma que a
  fronteira arquitetural desenhada no diagrama exista de fato no código.
prerequisites: [fundamentals]
related: [design-patterns, domain-driven-design]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-26
---

# Nível 02 — Design de Software

Arquitetura que não se reflete no código é ficção. Esta seção trata de como
estruturar código para que as decisões arquiteturais tenham efeito real.

## O problema desta seção

É comum encontrar sistemas cuja documentação descreve camadas limpas e
responsabilidades separadas, e cujo código é uma teia em que qualquer mudança
toca sete arquivos em quatro módulos diferentes. A arquitetura existe no
diagrama e não existe no repositório.

Isso acontece porque fronteira arquitetural não é uma linha desenhada — é uma
restrição de dependência que precisa ser imposta e verificada. Se nada impede
que o módulo de faturamento importe diretamente o repositório de usuários, ele
vai importar, e a fronteira desaparece na terceira sprint.

Design de software é o que transforma intenção arquitetural em estrutura
executável. É também onde a maior parte do custo de manutenção é decidida.

## O que você vai encontrar aqui

**Princípios.** SOLID, DRY, KISS, YAGNI e as heurísticas de design. Tratados
como ferramentas com faixa de aplicação, não como mandamentos — inclusive os
casos em que aplicá-los produz código pior.

**Estrutura.** Encapsulamento, interfaces, fronteiras, camadas, design modular e
design de pacotes. Como decidir o que fica junto e o que fica separado.

**Dependências.** Inversão de dependência, direção de dependência e composição
versus herança. Este é o núcleo da seção: a direção em que as dependências
apontam determina o que você consegue mudar sem quebrar.

**Arquiteturas de código.** Clean Architecture, Hexagonal, Onion e Ports and
Adapters. Quatro nomes para uma mesma ideia central, com diferenças que
importam menos do que a literatura sugere — e um custo que a literatura
menciona pouco.

**Manutenção.** Refatoração e code smells. Como reconhecer estrutura que está
degradando antes que o custo se torne visível no roadmap.

## Ordem de leitura

Comece por **fronteiras** e **direção de dependência**. São os dois conceitos de
que todo o resto depende, e são os que mais mudam a forma de olhar um
repositório.

As quatro arquiteturas de código — Clean, Hexagonal, Onion, Ports and Adapters —
podem ser lidas em bloco. Elas compartilham a mesma tese; ler as quatro em
sequência deixa claro o que é essencial e o que é diferença de vocabulário.

Deixe **SOLID** para depois de fronteiras, não antes. SOLID lido cedo demais
vira regra decorada; lido depois de entender direção de dependência, vira
consequência óbvia.

## Ao terminar

Você consegue olhar um repositório e dizer onde estão as fronteiras reais,
que não é necessariamente onde estão os diretórios. Consegue justificar por que
uma dependência aponta para um lado e não para o outro. Consegue aplicar
Hexagonal sabendo o que ela custa em indireção e quando esse custo não se paga.

E consegue reconhecer o momento em que abstração deixou de reduzir complexidade
e passou a adicioná-la.

## Erros que esta seção previne

- Aplicar Clean Architecture inteira num sistema que tem um caso de uso e meio.
- Criar interface com uma única implementação e chamar isso de desacoplamento.
- Usar herança onde composição resolveria, por causa de uma economia de digitação.
- Tratar DRY como proibição de duplicar texto, em vez de proibição de duplicar
  conhecimento — e acoplar dois módulos que só coincidiam.
- Refatorar estrutura sem ter um critério que diga quando parar.

## Continua em

[Design Patterns](../03-design-patterns/index.md) para as soluções recorrentes,
e [Domain-Driven Design](../04-domain-driven-design/index.md) para quando a
complexidade do domínio, e não a técnica, é o que dita a estrutura.
