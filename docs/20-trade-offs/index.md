---
id: trade-offs
title: Trade-offs
sidebar_position: 0
description: A seção central do percurso — cada escolha arquitetural em função da restrição que a decide.
doc_type: index
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor articula qualquer decisão arquitetural como um trade-off
  explícito, com o eixo de comparação declarado.
prerequisites: [distributed-systems]
related: [architecture-decisions, case-studies, system-design-interviews]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-26
---

# Trade-offs

Se o percurso inteiro tivesse que caber numa seção, seria esta.

## O problema desta seção

Perguntas de arquitetura quase nunca têm resposta. Têm resposta **dada uma
restrição**.

"Monolito ou microsserviços?" não é respondível. "Monolito ou microsserviços,
para um time de oito pessoas, com um domínio ainda instável, sem plataforma de
operação e com prazo de seis meses?" é respondível, e a resposta é bastante
clara.

A diferença entre as duas perguntas é a única coisa que importa. Um profissional
que responde à primeira está exibindo preferência; um que exige a segunda está
fazendo arquitetura.

Esta seção treina essa conversão. Cada documento pega um par aparentemente
oposto, identifica o eixo real de comparação e mostra sob quais restrições cada
lado vence.

## O que você vai encontrar aqui

Quinze trade-offs recorrentes, cada um com cenários concretos:

**De estrutura.** Simplicidade versus flexibilidade · acoplamento versus
duplicação · centralização versus descentralização · monolito versus
microsserviços · abstração versus complexidade.

**De dados e coordenação.** Consistência versus disponibilidade · consistência
forte versus consistência eventual · síncrono versus assíncrono · SQL versus
NoSQL.

**De economia e prazo.** Custo versus confiabilidade · velocidade de entrega
versus qualidade técnica · build versus buy · serviço gerenciado versus
autogerido · cloud-native versus portável.

**De desempenho.** Desempenho versus manutenibilidade.

## Como cada documento é estruturado

Nenhum apresenta um lado como vencedor. Cada um estabelece:

1. Qual é o **eixo real** — frequentemente diferente do que o nome do par sugere.
2. As **condições** sob as quais cada lado vence, de forma verificável.
3. Os **sinais** de que você escolheu errado, observáveis antes do desastre.
4. O **custo de mudar de ideia** depois, que costuma ser assimétrico e é o que
   deveria decidir os casos de empate.

O quarto item é o menos discutido e frequentemente o mais decisivo: quando duas
opções empatam em mérito, escolhe-se a que é mais barata de abandonar.

## Ordem de leitura

Pode ser lida por consulta, quando a decisão aparecer. Mas há valor em ler em
sequência pelo menos uma vez — o padrão de raciocínio se repete, e é ele que se
está treinando, não os quinze casos.

Se for ler só três: **acoplamento versus duplicação**, **síncrono versus
assíncrono** e **velocidade de entrega versus qualidade técnica**. São os que
mais aparecem no dia a dia e os três em que a intuição comum mais erra.

## Ao terminar

Você converte qualquer pergunta de arquitetura numa pergunta condicionada, e
declara o eixo antes de argumentar. Reconhece um falso dilema — muitos pares
"opostos" são combináveis.

E consegue defender uma decisão diante de quem prefere a outra sem que a conversa
vire disputa de gosto, porque as premissas estão explícitas e podem ser
contestadas uma a uma.

## Relacionado

[Case Studies](/21-case-studies/index.md), onde esses trade-offs aparecem
combinados e em conflito.
