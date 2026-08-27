---
id: legacy-modernization
title: Modernização de Legado
sidebar_position: 0
description: Mudar sistemas que não podem parar, sem apostar a empresa numa reescrita.
doc_type: index
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor escolhe entre as estratégias de modernização a partir de
  risco e valor, e sabe por que reescrever é quase sempre a pior delas.
prerequisites: [enterprise-architecture]
related: [architecture-decisions, architecture-governance]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-26
---

# Modernização de Legado

A maior parte do trabalho de arquitetura acontece sobre sistemas que já existem,
não em folha em branco. Esta seção trata desse caso.

## O problema desta seção

Sistemas legados têm três propriedades que tornam a mudança difícil: estão em
produção e não podem parar, encodam regras de negócio que ninguém documentou, e
frequentemente já sobreviveram a uma tentativa de substituição fracassada.

A resposta instintiva — reescrever — é a que mais falha. Falha porque o sistema
antigo continua evoluindo durante a reescrita, porque as regras não documentadas
só aparecem quando o novo sistema erra em produção, e porque o valor só chega no
fim, quando o orçamento já acabou.

O trabalho arquitetural aqui é encontrar caminhos incrementais: mudanças que
entregam valor antes de estarem completas e que podem ser revertidas.

## O que você vai encontrar aqui

**Diagnóstico.** O que caracteriza um sistema legado além da idade — e por que
"legado" descreve a relação do time com o sistema, não a tecnologia dele.

**As estratégias.** Replatforming, refactoring, rebuilding e replacing, com o
perfil de risco, custo e prazo de cada uma. A escolha entre elas é a decisão
central da seção.

**O padrão principal.** Strangler fig — substituição incremental com convivência
entre o antigo e o novo. Tratado a fundo, incluindo o que ele exige em
roteamento, consistência de dados e a fase desconfortável em que os dois sistemas
coexistem.

**Modernização incremental.** Como fatiar para que cada fatia entregue valor.

**Migração.** Estratégias de migração de dados, que são frequentemente a parte
mais difícil e a menos planejada.

**Realidade.** Gestão de risco e restrições organizacionais. Por que a melhor
estratégia técnica perde para a que o negócio consegue patrocinar por três anos.

## Ordem de leitura

Comece pelas **quatro estratégias**, para ter o espaço de decisão inteiro antes
de aprofundar em qualquer uma.

Depois **strangler fig**, que é o padrão que viabiliza a maior parte dos casos
reais.

Leia **restrições organizacionais** por último e com atenção. É o tópico que mais
frequentemente explica por que a modernização tecnicamente correta não aconteceu.

## Ao terminar

Você avalia um sistema legado e recomenda uma estratégia com justificativa de
risco e valor, não de preferência técnica. Desenha um caminho incremental com
pontos de reversão.

E consegue argumentar contra uma reescrita completa diante de um time que quer
fazê-la — que é uma das conversas mais difíceis e mais necessárias da profissão.

## Relacionado

[ADRs](../18-architecture-decisions/index.md), porque decisões de modernização
duram anos e precisam do contexto registrado.
