---
id: devops-and-platform
title: DevOps e Plataforma
sidebar_position: 0
description: Reduzir o tempo entre decidir e entregar, sem trocar velocidade por estabilidade.
doc_type: index
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor projeta o caminho da mudança até produção com reversibilidade
  e sem gargalos organizacionais.
prerequisites: [observability]
related: [reliability, cloud-architecture, security]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-28
---

# Nível 05 — DevOps e Plataforma

Esta seção trata do caminho entre decidir uma mudança e ela estar em produção.

## O problema desta seção

Arquitetura costuma ser discutida como estrutura do sistema. Mas o **caminho da
mudança** — quanto tempo leva, quantas pessoas aprovam, o que pode ser revertido — é
uma propriedade arquitetural como qualquer outra, e frequentemente a que mais limita.

Um sistema bem estruturado com implantação que leva três semanas entrega menos que um
sistema mediano com implantação de quinze minutos.

E há uma crença que os dados desmentem: a de que velocidade e estabilidade se opõem. As
organizações que entregam mais frequentemente também falham menos e se recuperam mais
rápido — porque as mesmas práticas produzem os dois resultados. Lotes pequenos são mais
fáceis de testar, de reverter e de diagnosticar.

O segundo problema é organizacional. Boa parte do atrito não é técnico: é aprovação,
fila, dependência entre times, ambiente disputado. Automatizar sem tratar isso move o
gargalo sem removê-lo.

## O que você vai encontrar aqui

**Integração e entrega contínuas.** O que cada termo significa de fato, e por que a
maioria dos times que diz praticar integração contínua não pratica.

**Infraestrutura como código.** O que muda quando o ambiente é declarado, e o desvio
que aparece quando não é.

**Contêineres na entrega.** O artefato imutável promovido entre ambientes.

**Estratégias de implantação.** Blue-green, canary e implantação em ondas — cada uma com
o que ela custa e o que ela protege.

**Feature flags.** A separação entre implantar e liberar, e a dívida que elas acumulam.

**Gestão de ambientes.** Paridade, ambientes efêmeros e o que a falta deles produz.

**Engenharia de plataforma.** A disciplina que trata infraestrutura interna como
produto, e as plataformas internas que ninguém usa.

**Segurança da esteira.** A esteira é ambiente de produção, e é tratada como se não
fosse.

**Gestão de releases.** O que resta de coordenação quando a entrega é contínua.

## Ordem de leitura

Comece por **integração e entrega contínuas** — ele define o vocabulário que o resto
usa, e desfaz a confusão mais comum da área.

Depois **estratégias de implantação**, que organiza blue-green, canary e ondas como
escolhas com critérios, não como alternativas de gosto.

**Feature flags** merece atenção especial: é a técnica de maior impacto e a que mais
acumula dívida silenciosa.

Deixe **engenharia de plataforma** para o fim. Ela reorganiza tudo o que veio antes numa
decisão organizacional.

## Ao terminar

Você trata o tempo entre decidir e entregar como propriedade arquitetural, e sabe onde
ele está sendo gasto.

Consegue escolher a estratégia de implantação a partir do risco da mudança, e não por
hábito.

Reconhece que reverter rápido vale mais que acertar na primeira tentativa, e projeta
para isso.

E entende que uma plataforma interna que ninguém quer usar não é uma plataforma — é
mais um obstáculo com boas intenções.

## Continua em

[Documentação de Arquitetura](/17-architecture-documentation/index.md), onde a questão
passa a ser como o conhecimento sobre o sistema sobrevive às pessoas.
