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
content_version: 1
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

**Instrumentos.** Princípios, padrões e as formas de conformidade — junto com o
processo de exceção, que é o que separa governança viva de burocracia. Um padrão
sem caminho de exceção é contornado em silêncio.

**Revisão.** Revisão de arquitetura como conversa que melhora a decisão, não como
portão. Quando revisar, quem participa, e o que produz.

**Automação.** Fitness functions como governança executável. Verificar
automaticamente a propriedade que se quer preservar é mais barato e mais
confiável que inspecionar desenho.

**Modelo distribuído.** Governança federada — quando a decisão fica no time e o
que permanece central. Aplicável a organizações a partir de certo tamanho.

**Patologias.** Como governança vira gargalo, e os sinais de que já virou.

## Princípio e padrão não são a mesma coisa

A confusão entre os dois é a causa mais comum de governança que não funciona.

| | Princípio | Padrão |
|---|---|---|
| O que faz | Orienta julgamento | Prescreve escolha |
| Formato | "Preferimos X a Y, porque Z" | "Use X" |
| Quando aplicar | Situação nova, não prevista | Situação recorrente, já resolvida |
| Exceção | Não se aplica — princípio se pondera | Precisa de processo explícito |
| Falha típica | Vago demais para decidir nada | Rígido demais para o caso real |

Uma organização que só tem princípios produz decisões inconsistentes; uma que só
tem padrões trava diante do primeiro caso não previsto. As duas coisas são
necessárias, e confundi-las produz o pior dos dois.

## Ordem de leitura

Comece por **princípios versus padrões**, que é a distinção operacional central:
princípios orientam julgamento, padrões prescrevem. Confundir os dois produz
tanto rigidez quanto vagueza.

Depois **fitness functions**, que é o mecanismo com melhor relação entre efeito e
atrito.

Leia **patologias** por último, como lista de verificação sobre a governança que
você tem ou está propondo.

## Ao terminar

Você desenha mecanismos de governança proporcionais ao risco que endereçam.
Reconhece quando um processo virou ritual e consegue propor removê-lo.

E consegue argumentar por autonomia de time com uma proposta concreta de como a
coerência será mantida — que é o que torna o argumento aceitável para quem
responde pelo risco.

## Continua em

[Nível 07 — Liderança em Arquitetura](/23-architecture-leadership/index.md).
