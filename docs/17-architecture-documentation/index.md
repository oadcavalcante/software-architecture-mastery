---
id: architecture-documentation
title: Documentação de Arquitetura
sidebar_position: 0
description: Documentar para que alguém decida melhor depois — não para cumprir processo.
doc_type: index
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escolhe a visão certa para cada audiência e produz
  diagramas em que cada elemento carrega informação.
prerequisites: [system-design]
related: [architecture-decisions, architecture-governance]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-26
---

# Documentação de Arquitetura

Documentação de arquitetura existe para que alguém — frequentemente você, daqui
a dois anos — consiga decidir melhor. Todo o resto é cerimônia.

## O problema desta seção

Dois fracassos simétricos. No primeiro, não há documentação: o conhecimento vive
na cabeça de três pessoas e sai pela porta quando elas saem. No segundo, há
documentação demais: cem páginas geradas para um comitê, desatualizadas no mês
seguinte, que ninguém lê porque ninguém confia.

O segundo é pior, porque consome esforço e produz falsa segurança.

A saída não é escrever mais nem menos, e sim escrever para uma audiência
específica com uma decisão específica em vista. Um diagrama que não muda nenhuma
decisão de ninguém não precisa existir.

A pergunta que este material aplica a cada artefato: **quem vai ler isto, e que
decisão vai tomar melhor por causa disto?**

## O que você vai encontrar aqui

**Princípios.** O que documentar, para quem e com que durabilidade. Separar o
que muda toda semana do que muda a cada dois anos, e documentar cada um de forma
diferente.

**O modelo C4.** Contexto, container, componente e código — como quatro níveis
de zoom, cada um para uma audiência. Inclui o nível que quase nunca vale a pena
manter.

**Outras visões.** Diagramas de implantação, sequência e fluxo de dados. Cada um
responde a uma pergunta que os demais respondem mal; diagrama de sequência é o
mais subutilizado dos três.

**Estrutura.** Visões de arquitetura e descrições de arquitetura — como organizar
para que audiências diferentes encontrem o que precisam.

**Sustentação.** Documentação viva e padrões de documentação. Como manter perto
do código para que a defasagem seja visível.

**Qualidade de diagramas.** Notação consistente, legenda, densidade. Um diagrama
com quarenta caixas e nenhuma legenda transfere zero informação com muito esforço.

## Sobre a ferramenta

Este repositório usa **Mermaid** para tudo. A razão é arquitetural: diagrama em
texto fica versionado, aparece em diff e é revisado como código. Um diagrama que
vive num arquivo binário numa pasta compartilhada está desatualizado agora e
ninguém sabe.

## Ordem de leitura

Comece por **princípios** e pela pergunta de audiência. Sem isso, C4 vira
formato a preencher.

Depois **C4**, que é a estrutura de zoom mais útil disponível. Depois
**diagramas de sequência**, que cobrem o que o C4 não cobre: comportamento no
tempo, especialmente em cenário de falha.

**Qualidade de diagramas** por último, como critério de revisão.

## Ao terminar

Você escolhe a visão certa para a audiência certa e sabe justificar por que não
produziu as outras. Produz diagramas em que cada elemento carrega informação.

E consegue apagar documentação sem ansiedade quando ela deixou de servir a
alguém.

## Continua em

[Decisões de Arquitetura](../18-architecture-decisions/index.md) — o registro do
porquê, que é a parte que diagramas não capturam.
