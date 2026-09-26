---
id: architecture-governance
title: Governança de Arquitetura
sidebar_position: 0
description: Manter coerência entre times sem virar comitê de aprovação.
doc_type: index
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor desenha mecanismos de governança que orientam decisão
  distribuída em vez de centralizá-la.
prerequisites: [enterprise-architecture]
related: [architecture-decisions, architecture-leadership, security]
canonical_for: []
content_version: 4
last_reviewed: 2026-08-26
---

# Governança de Arquitetura

Governança é como uma organização mantém coerência arquitetural entre times que
decidem de forma independente.

## O problema desta seção

Governança tem má reputação merecida. Na forma degenerada, é um comitê que
aprova desenhos, adiciona três semanas a cada projeto e produz conformidade
aparente com decisões que já foram tomadas de outro jeito.

Mas a ausência de governança tem seu próprio custo: seis formas de autenticar,
quatro filas diferentes, decisões de segurança tomadas por quem não tinha
contexto, e nenhum lugar onde uma lição aprendida caro fique registrada para o
próximo time.

O problema real é de mecanismo. Governança que funciona orienta decisão no
momento em que ela é tomada, por quem a toma. Governança que falha tenta
inspecionar decisões depois, por quem não as tomou.

## O que você vai encontrar aqui

**Instrumentos.** Princípios, padrões e as formas de conformidade, junto com o
processo de exceção, que é o que separa governança viva de burocracia. Um padrão
sem caminho de exceção é contornado em silêncio.

**Revisão.** Revisão de arquitetura como conversa que melhora a decisão, não como
portão. Quando revisar, quem participa, e o que produz.

**Automação.** Fitness functions como governança executável. Verificar
automaticamente a propriedade que se quer preservar é mais barato e mais
confiável que inspecionar desenho.

**Modelo distribuído.** Governança federada: quando a decisão fica no time e o
que permanece central. Aplicável a organizações a partir de certo tamanho.

**Patologias.** Como governança vira gargalo, e os sinais de que já virou.

**Medição.** Efeito e atrito de cada mecanismo: os dois números sem os quais a
decisão de manter ou remover cai para quem tem mais autoridade.

## Princípio e padrão não são a mesma coisa

Os dois orientam decisão, mas em pontos de intervenção diferentes, e tratá-los
como a mesma coisa faz o mecanismo errar o ponto: prescreve onde deveria
orientar, ou orienta onde deveria prescrever. Princípio dá o critério para a
situação nova ("preferimos X a Y, porque Z") e se pondera contra outros
princípios. Padrão fecha a situação recorrente ("use X") e, quando não serve
ao caso, precisa de um processo de exceção explícito.

A comparação linha a linha, com o eixo de cada uma, está em
[Padrões em Operação](/19-architecture-governance/governance-standards.md); o
critério do que faz um princípio decidir alguma coisa, em
[Princípios em Operação](/19-architecture-governance/governance-principles.md).

Uma organização que só tem princípios produz decisões inconsistentes; uma que só
tem padrões trava diante do primeiro caso não previsto.

## Ordem de leitura

Comece por **Fundamentos de Governança**, que fixa o mecanismo e o ponto de
intervenção, e é pré-requisito da maior parte do resto. Depois **Princípios em
Operação** e **Padrões em Operação**, nessa ordem.

Depois **fitness functions**, que é o mecanismo com melhor relação entre efeito e
atrito.

Leia **patologias** e **Medição de Governança** por último, e como par: uma é a
lista de verificação sobre a governança que você tem ou está propondo, a outra dá
os dois números com que você sustenta manter, ajustar ou remover cada mecanismo.

## Ao terminar

Você desenha mecanismos de governança proporcionais ao risco que endereçam.
Reconhece quando um processo virou ritual e consegue propor removê-lo.

E consegue argumentar por autonomia de time com uma proposta concreta de como a
coerência será mantida. É isso que torna o argumento aceitável para quem
responde pelo risco.

## Continua em

[Nível 07 — Liderança em Arquitetura](/23-architecture-leadership/index.md).
