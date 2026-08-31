---
id: system-design
title: Design de Sistemas
sidebar_position: 0
description: Como ir de requisitos e restrições a um sistema com componentes, interfaces, dados e implantação.
doc_type: index
level: 3
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor consegue conduzir o caminho completo de requisitos a
  arquitetura de alto nível, justificando cada decomposição pelas restrições.
prerequisites: [design-patterns, domain-driven-design]
related: [distributed-systems, scalability, case-studies]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-26
---

# Nível 03 — Design de Sistemas

Aqui o objeto de estudo deixa de ser o código e passa a ser o sistema em
execução: processos, dados que persistem, chamadas que atravessam a rede,
recursos que se esgotam.

## O problema desta seção

Um profissional que domina design de software sabe estruturar um módulo. Diante
de "projete o sistema", frequentemente não sabe por onde começar — porque o
espaço de decisão mudou de natureza. Não se trata mais de onde colocar uma
classe, e sim de quantos processos existem, o que cada um guarda, o que acontece
quando um deles cai e quanto tudo isso custa por mês.

Esta seção estabelece o caminho que leva de um enunciado a uma arquitetura
defensável:

```text
requisitos
    ↓
restrições
    ↓
arquitetura de alto nível
    ↓
componentes
    ↓
interfaces
    ↓
dados
    ↓
implantação
```

O caminho é sempre esse. O que muda entre um sistema e outro é o que as
restrições permitem em cada etapa.

## O que você vai encontrar aqui

**Decomposição.** Componentes, serviços e fronteiras de serviço. Como decidir o
que é um serviço e o que é um módulo dentro de um serviço — e por que essa
decisão é mais organizacional do que técnica.

**Interfaces.** APIs, sistemas de request/response, paginação e configuração.
O contrato é a parte mais difícil de mudar depois; é onde vale gastar tempo.

**Estado.** Gestão de estado e a distinção entre sistemas com e sem estado. Esta
é a decisão que mais determina quão fácil será escalar depois.

**Mecanismos.** Balanceamento de carga, cache, CDNs, filas, processamento em
background, rate limiting, busca e armazenamento de arquivos. As peças de que
sistemas são feitos, cada uma com o problema que resolve e o que ela quebra.

**Acesso.** Autenticação e autorização no nível de sistema — onde as decisões
são tomadas e por quem.

**Dimensionamento.** Planejamento de capacidade, análise de gargalos e as
estratégias básicas de escalabilidade. Como estimar antes de construir.

## Ordem de leitura

Leia **decomposição**, **estado** e **fronteiras de serviço** primeiro, nessa
ordem. São as três decisões estruturais; tudo o mais é consequência.

Os mecanismos — cache, filas, balanceamento de carga — podem ser lidos por
consulta. Mas leia **planejamento de capacidade** e **análise de gargalos** antes
deles, não depois. Sem uma estimativa, a escolha de mecanismo vira preferência.

## Ao terminar

Você consegue receber um enunciado de sistema e produzir, em uma hora, uma
arquitetura de alto nível com componentes nomeados, contratos esboçados, modelo
de dados inicial e uma estimativa de capacidade — junto com a lista do que você
ainda não sabe e precisaria perguntar.

Consegue apontar onde está o gargalo antes de o sistema existir. E consegue
explicar por que introduziu cada peça, sem que a resposta seja "porque todo
mundo usa".

## Um aviso sobre o próximo nível

Boa parte do que se projeta aqui assume que chamadas funcionam, que a rede
entrega e que componentes ou estão de pé ou estão caídos.

Nada disso é verdade. O [Nível 04](/06-distributed-systems/index.md) desfaz
essas suposições, e é a seção mais profunda do percurso por esse motivo.
