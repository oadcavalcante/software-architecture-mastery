---
id: legacy-modernization
title: Modernização de Legado
sidebar_position: 0
description: Mudar o que já está em produção, funcionando, e sustentando o negócio — sem parar.
doc_type: index
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor escolhe estratégia de modernização a partir do motivo real, e
  executa incrementalmente com risco controlado.
prerequisites: [enterprise-architecture]
related: [enterprise-architecture, architecture-governance, architecture-leadership]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-28
---

# Nível 06 — Modernização de Legado

Esta seção trata de mudar o que já está em produção, funcionando, e sustentando o
negócio.

## O problema desta seção

Projetar do zero é o caso raro. A maior parte do trabalho de arquitetura acontece sobre
sistemas que já existem — que atendem clientes agora, que ninguém entende completamente,
e que não podem parar.

Isso muda a natureza do problema. Numa construção nova, a dificuldade é decidir. Aqui, a
dificuldade é **mudar sem quebrar** — e o sistema em produção é a restrição, não o
ponto de partida.

O segundo problema é de motivação. "É legado" não é razão para modernizar. Um sistema
antigo, estável, barato de operar e que ninguém precisa mudar está fazendo o trabalho
dele. Modernizar por desconforto estético é a forma mais cara de não entregar nada.

A pergunta que precede tudo: **o que exatamente não conseguimos fazer por causa deste
sistema?** Se não houver resposta concreta, não há projeto.

O terceiro é de execução. Reescritas completas falham com frequência conhecida, por
razões estruturais: elas competem com um sistema em movimento, o conhecimento embutido
no código antigo se perde, e o valor só aparece no fim — quando frequentemente já não há
apoio.

## O que você vai encontrar aqui

**O que é legado, e o que motiva mudar.** A definição útil, e os motivos que sustentam
investimento — separados dos que não sustentam.

**Estrangulamento.** O padrão que permite substituir gradualmente, com o antigo em
operação.

**Modernização incremental.** A abordagem que sobrevive a interrupções.

**As estratégias.** Replataformar, refatorar, reconstruir, substituir — cada uma com o
problema que resolve e o que ela custa.

**Migração de dados.** A parte mais arriscada e a mais subestimada de qualquer
modernização.

**Risco.** O que dá errado, e os controles que reduzem a probabilidade e o dano.

**Restrições organizacionais.** As que decidem o resultado com mais frequência que as
técnicas — conhecimento concentrado, apoio que evapora, incentivo desalinhado.

## Ordem de leitura

Comece por **motivadores de modernização**. Ele estabelece o critério que separa
projetos que se justificam dos que são desconforto com nome de estratégia.

Depois **estratégias de migração**, que organiza as opções e o critério de escolha.

**Estrangulamento** e **modernização incremental** formam um bloco — o primeiro é o
padrão, o segundo é a disciplina de executá-lo.

**Migração de dados** merece leitura atenta: é onde os projetos falham de forma
irreversível.

E deixe **restrições organizacionais** para o fim, lendo-o como o documento que explica
por que projetos tecnicamente corretos fracassam.

## Ao terminar

Você exige um motivo concreto antes de propor modernização, e sabe defender a decisão de
**não** modernizar.

Escolhe entre replataformar, refatorar, reconstruir e substituir a partir do problema, e
não da preferência.

Executa em incrementos que entregam valor por si, de forma que uma interrupção não
transforme meses de trabalho em desperdício.

E reconhece que os obstáculos decisivos costumam ser organizacionais — e que ignorá-los
é a razão mais comum de fracasso de programas tecnicamente bem desenhados.

## Continua em

[Governança de Arquitetura](/19-architecture-governance/index.md), onde a questão passa
a ser como sustentar decisões ao longo do tempo.
