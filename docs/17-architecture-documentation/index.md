---
id: architecture-documentation
title: Documentação de Arquitetura
sidebar_position: 0
description: Como o conhecimento sobre o sistema sobrevive às pessoas — e por que a maior parte da documentação não sobrevive a si mesma.
doc_type: index
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor produz documentação com leitor definido, no nível de detalhe que
  se sustenta, e que envelhece devagar.
prerequisites: [system-design]
related: [architecture-decisions, enterprise-architecture, observability]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-29
---

# Nível 05 — Documentação de Arquitetura

Esta seção trata de como o conhecimento sobre o sistema sobrevive às pessoas.

## O problema desta seção

Documentação de arquitetura tem um problema recorrente: ela é produzida, e não é lida.

As razões são conhecidas. Ela é escrita sem leitor definido — para "documentar", não para
alguém. Ela descreve o sistema num nível de detalhe que envelhece em semanas. Ela fica
num lugar que ninguém visita. E ninguém é dono dela.

O resultado é o pior dos dois mundos: custo de produção e manutenção, sem o benefício —
e, pior, um artefato desatualizado que induz decisões erradas em quem confia nele.

O segundo problema é de calibração. O reflexo, quando se percebe que falta documentação,
é documentar mais. Frequentemente a resposta certa é documentar **menos**, e melhor: um
diagrama de contexto correto vale mais que quarenta páginas que ninguém confia.

O terceiro é de derivação. Boa parte do que se documenta à mão pode ser derivada do
sistema — dependências, topologia, versões, contratos. O que precisa de escrita humana é
o que a máquina não sabe: **por que** as coisas são assim.

## O que você vai encontrar aqui

**Princípios.** O que decide se a documentação vai ser lida: leitor, propósito, nível de
detalhe, e onde ela vive.

**O modelo C4.** A abordagem mais prática para diagramar software, com os quatro níveis
de zoom — e a orientação de que os dois primeiros bastam na maioria dos casos.

**Os diagramas.** Contexto, contêiner, componente, implantação, sequência e fluxo de
dados — cada um com o que ele responde e quando não vale a pena.

**Visões e descrições.** Como organizar a documentação por preocupação de quem lê, em vez
de por estrutura do sistema.

**Padrões e documentação viva.** Como manter, derivar e evitar que envelheça.

**Qualidade de diagrama.** O que separa um diagrama que comunica de um que polui.

## Ordem de leitura

Comece por **princípios de documentação** — ele estabelece os critérios que o resto usa.

Depois **o modelo C4** e, dentro dele, **contexto** e **contêiner**. Esses dois diagramas
cobrem a maior parte da necessidade real.

**Qualidade de diagrama** pode ser lido a qualquer momento e é o de retorno mais imediato
para quem já produz diagramas.

Deixe **documentação viva** para o fim: ela reorganiza tudo o que veio antes em torno da
pergunta de como isso se mantém.

## Ao terminar

Você escreve para um leitor específico, com uma pergunta específica — e descarta o que
não serve a nenhum dos dois.

Escolhe o nível de detalhe pelo tempo que ele vai sobreviver, e não pela completude.

Deriva do sistema o que a máquina sabe, e reserva a escrita humana para o que ela não
sabe — as razões, os trade-offs, o que foi descartado e por quê.

E reconhece que documentação desatualizada é pior que ausente, porque ela é confiável até
o momento em que alguém age sobre ela.

## Continua em

[Decisões de Arquitetura](/18-architecture-decisions/index.md), onde o registro do
**porquê** ganha forma própria.
