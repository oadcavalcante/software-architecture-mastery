---
id: component-design
title: Design de Componentes
sidebar_position: 14
description: A unidade que se implanta — como decidir o que vira componente e o que fica dentro.
doc_type: concept
level: 2
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor decide o que merece ser um componente implantável a partir
  de requisito de qualidade e ciclo de vida, não de organização de código.
prerequisites: [package-design]
related: [modular-design, boundaries, dependency-direction]
canonical_for: [design de componentes, componente implantável]
content_version: 1
last_reviewed: 2026-08-26
---

# Design de Componentes

## Visão Geral

Um componente é a menor unidade que se implanta. Design de componentes decide o
que vira uma dessas unidades e o que fica dentro de outra.

A decisão é frequentemente confundida com organização de código. Não é: um
componente é uma decisão de **operação**, e o critério vem de requisitos de
qualidade e ciclo de vida, não de estética de estrutura.

## Problema

A pergunta "isto deveria ser um componente separado?" costuma ser respondida com
argumentos de código: "está muito grande", "tem responsabilidade demais", "seria
mais limpo separado".

Nenhum desses justifica um componente. Todos justificam um
[módulo](modular-design.md), que é gratuito em comparação.

Separar em componentes adiciona: um pipeline de implantação, um artefato a
versionar, comunicação entre processos ou entre bibliotecas, tratamento de
incompatibilidade de versão, e — se for por rede — falha parcial, latência e
observabilidade distribuída.

Esse custo só se paga quando existe uma razão que módulos não resolvem.

## Conceitos Centrais

### As razões que justificam um componente

Quatro, e nenhuma delas é sobre limpeza de código:

**Ciclo de vida independente.** A parte precisa ser publicada em ritmo diferente
do resto. Uma biblioteca consumida por sete times não pode subir junto com a
aplicação de um deles.

**Requisito de qualidade distinto.** A parte precisa escalar, falhar ou ser
protegida separadamente. Um processador de relatórios que consome muita memória
não deveria derrubar o atendimento de requisições.

**Fronteira organizacional.** Times diferentes com autonomia de release. É a
razão mais forte na prática e a menos técnica — ver
[lei de Conway](../23-architecture-leadership/index.md).

**Reúso por consumidores externos.** Outros sistemas precisam da capacidade sem o
resto.

Se nenhuma se aplica, um módulo interno entrega o mesmo isolamento lógico por uma
fração do custo.

### Componente e módulo não são a mesma escala

| | Módulo | Componente |
|---|---|---|
| Unidade de | Compreensão e mudança | Implantação |
| Fronteira imposta por | Linguagem, teste de arquitetura | Processo, artefato |
| Custo de criar | Baixo | Alto |
| Custo de mover a fronteira | Refatoração | Migração |
| Falha | Compartilhada | Isolável |

Um sistema bem projetado tem muitos módulos e poucos componentes.

### Componentes herdam a estrutura dos módulos

A ordem que funciona: dividir em módulos primeiro, deixar as fronteiras se
provarem no histórico, e só então promover a componente o módulo que tem uma das
quatro razões.

A ordem inversa — decidir componentes antes de conhecer os eixos de mudança —
produz fronteiras de alto custo no lugar errado. E fronteira de componente errada
é a mais cara de corrigir de todas.

### O contrato de componente é público

O contrato entre módulos pode ser refatorado num commit. O contrato entre
componentes é público: existe uma versão implantada do outro lado que você não
controla.

Isso significa versionamento, compatibilidade retroativa e, eventualmente, suporte
a duas versões simultâneas. Ver
[evolução de schema](../08-integration-architecture/index.md).

## Modelo Mental

**Um componente é um módulo que ganhou o direito de ser implantado sozinho.** O
direito é conquistado por uma das quatro razões, não concedido por organização.

## Quando Usar

- Ciclo de release independente é necessário.
- Requisito de escala, falha ou segurança distinto.
- Times diferentes precisam de autonomia de implantação.
- Consumidores externos precisam da capacidade isolada.

## Quando Não Usar

**Por tamanho ou estética.** "Está grande demais" justifica módulo, não
componente.

**Antes de as fronteiras se provarem.** Promova o que o histórico mostrou
estável, não o que o diagrama sugere.

**Quando os dois lados sempre são implantados juntos.** Se a separação não é
exercida, ela é custo puro. Ver [fronteiras](boundaries.md).

**Quando a indisponibilidade de um torna o outro inútil.** Não há isolamento de
falha real; há dois pontos de falha em vez de um.

**Quando o time não consegue operar o resultado.** Cada componente adicional é
mais um item em plantão, mais um conjunto de alertas, mais uma coisa a
diagnosticar às três da manhã.

## Alternativas

- **Módulo interno** — a resposta certa na maioria dos casos.
- **Biblioteca compartilhada** — componente sem processo separado; custo
  intermediário, e acopla ciclos de release.
- **Mesmo processo, isolamento de recurso** — limites de thread ou memória por
  módulo, sem separar implantação.

## Trade-offs

| Componente separado | Módulo interno |
|---|---|
| Release independente | Release conjunto |
| Escala e falha isoladas | Compartilhadas |
| Pipeline, artefato, versionamento | Nada disso |
| Comunicação entre processos | Chamada de função |
| Contrato público a manter | Contrato refatorável |
| Mais itens em operação | Um item |

## Modos de Falha

**Componentes acoplados no release.** Sempre implantados juntos, em ordem, com
versões casadas.

**Monolito distribuído.** Componentes separados que se chamam sincronamente em
cadeia; a falha de um derruba todos.

**Componente sem dono.** Ninguém responde pelo seu ciclo de vida.

**Granularidade excessiva.** Mais componentes do que o time consegue operar. O
custo aparece em plantão e em tempo de diagnóstico.

## Erros Comuns

**Decidir componentes antes de módulos.** Fronteira cara no lugar errado.

**Justificar por limpeza de código.** Não é razão suficiente.

**Ignorar o custo operacional.** É o maior componente do custo e o menos
contabilizado.

**Tratar o contrato como refatorável.** Ele é público.

**Confundir componente com microsserviço.** Uma biblioteca publicada é um
componente e não é um serviço.

## Exemplo Real

Um time propôs extrair `relatorios` como serviço. Justificativa: "está muito
acoplado e cresceu demais".

As quatro razões foram verificadas.

*Ciclo de vida?* Não — relatórios subiam junto com o resto e ninguém reclamava.
*Requisito de qualidade distinto?* Sim — uma consulta pesada consumia memória e já
tinha derrubado a aplicação duas vezes.
*Fronteira organizacional?* Não — mesmo time.
*Consumidor externo?* Não.

Uma razão de quatro. A extração aconteceu, mas o escopo mudou por causa da
análise: em vez de um serviço `relatorios` com API completa, foi extraído apenas
o **executor de consultas pesadas**, como processo separado consumindo de uma
fila.

A regra de negócio de relatórios permaneceu no monolito, como módulo. O que saiu
foi só o que tinha requisito de isolamento de recurso.

O resultado: um componente pequeno, sem API pública, sem contrato síncrono, e o
problema de memória resolvido. A proposta original teria criado um serviço com
API, contrato público e todo o custo — para resolver um problema de memória.

## O custo que não entra na conta

A discussão sobre separar um componente costuma comparar esforço de
implementação. O custo real é operacional e recorrente.

Cada componente adicional traz, por ano de vida: um pipeline a manter e migrar,
um conjunto de alertas a calibrar, uma superfície de autenticação, uma matriz de
compatibilidade de versões, um item a mais no diagnóstico de qualquer incidente,
e um lugar a mais onde alguém precisa procurar ao investigar.

Nada disso aparece no pull request que cria o componente.

Uma regra prática que funciona: **estime quantos componentes seu time consegue
operar bem**, e trate isso como orçamento. Times de oito pessoas com plantão
compartilhado costumam sustentar entre três e seis componentes com qualidade.
Acima disso, o diagnóstico de incidentes começa a degradar antes que qualquer
métrica técnica indique problema.

Quando o orçamento está cheio, criar um componente novo exige aposentar outro ou
aumentar o time. Enunciar isso explicitamente muda a conversa de "seria mais
limpo separado" para "o que sai da lista?".

## Conceitos Relacionados

- [Design Modular](modular-design.md) — a divisão que precede.
- [Design de Pacotes](package-design.md) — a unidade de release.
- [Fronteiras](boundaries.md) — os níveis e seus custos.
- [Microsserviços](../03-design-patterns/index.md) — o caso extremo.

## Exercício Prático

Liste os componentes implantáveis do seu sistema. Para cada um, verifique quais
das quatro razões se aplicam hoje.

Os que não satisfazem nenhuma são candidatos a voltar a ser módulo — e vale
estimar quanto o time economizaria em operação.

## Perguntas de Entrevista

- O que justifica separar algo em um componente implantável?
- Qual a diferença entre módulo e componente?
- Por que decidir componentes antes de módulos é arriscado?

## Para Aprofundar

- Martin, Robert C. *Clean Architecture*. Prentice Hall, 2017 — componentes e
  seus princípios.
- Newman, Sam. *Building Microservices*. 2ª ed., O'Reilly, 2021 — critérios de
  separação e seus custos.
