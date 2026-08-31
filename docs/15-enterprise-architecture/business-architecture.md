---
id: business-architecture
title: Arquitetura de Negócio
sidebar_position: 2
description: A camada que conecta tecnologia a estratégia — e por que ela costuma ser pulada.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor conecta decisões técnicas a objetivos de negócio usando um
  vocabulário que o negócio reconhece.
prerequisites: [enterprise-architecture]
related: [business-capabilities, capability-mapping, technical-strategy]
canonical_for: [arquitetura de negócio, fluxo de valor, ator de negócio, objetivo de negócio]
content_version: 1
last_reviewed: 2026-08-28
---

# Arquitetura de Negócio

## Visão Geral

A arquitetura de negócio descreve **o que a organização faz e como ela cria valor**, sem
mencionar tecnologia.

Ela é a camada que conecta decisões técnicas a objetivos de negócio — e é a que mais
frequentemente é pulada, porque parece distante do trabalho de engenharia.

O custo de pulá-la é concreto: decisões técnicas que não conseguem ser justificadas em
termos que o negócio reconheça, e por isso não conseguem competir por orçamento.

## Problema

A conversa típica entre tecnologia e negócio:

```text
tecnologia   "precisamos modernizar o sistema de precificação"
negócio      "por quê? ele funciona"
tecnologia   "a tecnologia é antiga, o código é difícil de manter"
negócio      "quanto isso custa? e o que ganhamos?"
tecnologia   "..."
```

O problema não é falta de razão — a razão existe. É que ela está expressa em vocabulário
que não conecta a nada que o negócio decide.

A arquitetura de negócio fornece o vocabulário intermediário.

## Conceitos Centrais

### Os elementos

```text
capacidades      o que a organização sabe fazer. Ver capacidades de negócio
fluxos de valor  como o valor chega ao cliente, de ponta a ponta
atores           quem participa — clientes, parceiros, áreas, papéis
objetivos        o que a organização quer alcançar, com métrica
informação       os conceitos de negócio, independentes de sistema
```

Os dois primeiros são os mais usados. Capacidades organizam o **quê**; fluxos de valor
organizam o **como**.

E eles respondem perguntas diferentes: capacidades servem à decisão de investimento;
fluxos de valor servem à decisão de onde otimizar.

### Fluxo de valor revela onde o tempo vai

Um fluxo de valor traça o caminho do início ao fim, do ponto de vista de quem recebe o
valor:

```text
cliente solicita apólice
  → cotação          2 h
  → análise de risco 3 dias      ← 78% do tempo total
  → aprovação        4 h
  → emissão          20 min
```

O mapeamento revela onde o tempo é gasto — e frequentemente contradiz a intuição.

Isso muda a priorização técnica: otimizar a emissão, que já leva 20 minutos, não muda
nada. O gargalo está na análise, e a pergunta passa a ser o que a torna lenta.

E a resposta pode não ser técnica: pode ser espera por informação, aprovação humana, ou
uma etapa manual. Descobrir isso evita investir em automatizar o que não é o problema.

### Objetivos precisam de métrica

```text
vago       "melhorar a experiência do cliente"
com métrica "reduzir o tempo de emissão de apólice de 4 dias para 1"
```

O segundo permite conectar uma decisão técnica a um resultado verificável. O primeiro,
não.

E é o que permite avaliar depois se a decisão funcionou — ver
[estratégia técnica](/15-enterprise-architecture/technical-strategy.md), na parte de apostas.

### O vocabulário precisa ser o do negócio

Um artefato de arquitetura de negócio escrito em vocabulário técnico falha no propósito
principal, que é permitir a conversa.

```text
técnico   "microsserviço de cotação"
negócio   "capacidade de cotar"
```

Ver [linguagem ubíqua](/04-domain-driven-design/ubiquitous-language.md) — é o mesmo
princípio, aplicado no nível organizacional.

E a validação é simples: alguém do negócio consegue ler o artefato e reconhecer a
organização nele?

### Ela não pertence à tecnologia

A arquitetura de negócio descreve o negócio. Ela deveria ser mantida com — idealmente
por — as áreas de negócio.

Quando a tecnologia a mantém sozinha, dois problemas: ela envelhece, porque a tecnologia
não sabe das mudanças de negócio; e ela é vista como artefato de TI, não sendo usada nas
decisões que importam.

O papel da arquitetura corporativa é **facilitar e conectar** — trazer a lente que liga
capacidades a sistemas e a custo. Ver
[capacidades de negócio](/15-enterprise-architecture/business-capabilities.md).

### O nível de detalhe adequado é baixo

A tentação de modelar processos em detalhe produz artefatos grandes que envelhecem em
meses.

```text
útil        capacidades, fluxos de valor de ponta a ponta, objetivos
excessivo   processos detalhados, com todas as ramificações
```

Processos detalhados pertencem a quem os executa e mudam constantemente. A arquitetura
de negócio trabalha no nível que permanece estável.

## Modelo Mental

**Ela fornece o vocabulário que conecta decisão técnica a resultado de negócio.** Sem
ela, a justificativa técnica não compete por orçamento.

## Quando Usar

- Para justificar investimento técnico.
- Antes de programas de modernização.
- Para identificar onde otimizar — fluxos de valor.
- Em decisões de construir ou comprar.
- Quando a conversa entre negócio e tecnologia não avança.

## Quando Não Usar

**Mantida apenas pela tecnologia.** Ela descreve o negócio; sem participação de quem o
opera, envelhece e passa a ser vista como artefato de TI.

**Em vocabulário técnico.** Se o negócio não reconhece os nomes, o propósito principal —
permitir a conversa — não é atendido.

**Com detalhe de processo.** Processos mudam constantemente; a arquitetura de negócio
trabalha no nível que permanece estável.

**Sem métricas nos objetivos.** Objetivos vagos não permitem conectar decisão técnica a
resultado verificável.

**Como exercício documental** sem uso em decisão. Um artefato que não entra na discussão
de orçamento ou de priorização não justifica o custo de manter.

**Quando a organização é pequena.** Com um produto e uma área de negócio, a conversa
acontece diretamente, e a formalização adiciona cerimônia sem benefício.

## Alternativas

- **[Capacidades de negócio](/15-enterprise-architecture/business-capabilities.md)** — o subconjunto de maior
  retorno, isoladamente útil.
- **Mapeamento de fluxo de valor** — quando o problema é fluxo, não investimento.
- **Objetivos e resultados-chave** — se a organização já os usa, conectar-se a eles é
  mais barato que criar artefato novo.

A última merece consideração: quando o negócio já tem um mecanismo de definição de
objetivos, ancorar a arquitetura nele evita criar uma estrutura paralela.

## Trade-offs

| Com arquitetura de negócio | Sem |
|---|---|
| Decisão técnica justificável | Difícil de defender |
| Vocabulário compartilhado | Conversas paralelas |
| Esforço de construir e manter | Nenhum |
| Depende de participação do negócio | Autonomia da TI |

| Capacidades | Fluxos de valor |
|---|---|
| Investimento | Otimização de fluxo |
| Estável | Muda com o processo |

## Modos de Falha

**Mantida pela TI.** Envelhece e não é usada.

**Vocabulário técnico.** O negócio não reconhece.

**Detalhe excessivo.** Envelhece em meses.

**Objetivos sem métrica.** Não permitem avaliar.

**Artefato sem uso.**

**Fluxo de valor incompleto.** Mapeado só a parte que a TI enxerga.

## Erros Comuns

**Construir sozinho.**

**Modelar processos em detalhe.**

**Não medir tempo por etapa** nos fluxos de valor.

**Não conectar a objetivos com métrica.**

**Usar vocabulário de sistema.**

**Não validar com quem executa o trabalho.**

## Exemplo Real

Uma seguradora tinha um pedido de modernização do sistema de subscrição parado havia dois
anos. A justificativa técnica era sólida — tecnologia obsoleta, mantenedor único, difícil
de mudar — e nunca competia com iniciativas de produto no orçamento.

O mapeamento do fluxo de valor de emissão de apólice mudou a conversa:

```text
solicitação → cotação        2 h
            → subscrição     3,5 dias    ← 82% do tempo
            → aprovação      4 h
            → emissão        20 min
total                        4,3 dias
```

E a decomposição da subscrição:

```text
espera por documentos do cliente    1,2 dia
análise automática                  15 min
fila para análise humana            1,8 dia   ← o gargalo dentro do gargalo
decisão                             30 min
```

A fila de análise humana existia porque o sistema só conseguia automatizar 30% dos casos.
Os outros 70% iam para uma equipe de oito analistas.

O sistema conseguia automatizar pouco porque adicionar uma regra de subscrição exigia
mudança de código, com release trimestral — o que significava que as regras estavam
desatualizadas e cobriam poucos casos.

Essa era a mesma limitação que a justificativa técnica apontava, agora expressa em termos
que o negócio decidia:

```text
"modernizar a subscrição permite automatizar 70% em vez de 30%,
 reduzindo o tempo de emissão de 4,3 para cerca de 1,5 dia,
 e liberando 5 dos 8 analistas para casos complexos"
```

O objetivo, com métrica: reduzir o tempo de emissão para menos de 2 dias em 18 meses.

A iniciativa foi aprovada no ciclo seguinte.

Dois anos depois, o tempo de emissão estava em 1,3 dia, e a automação em 74%.

A avaliação posterior aponta: a justificativa técnica estava correta desde o início. Ela
falhava porque descrevia a **causa** — tecnologia obsoleta — sem conectar ao **efeito**
que o negócio media. O mapeamento do fluxo levou três semanas e fez essa conexão.

## Conceitos Relacionados

- [Capacidades de Negócio](/15-enterprise-architecture/business-capabilities.md) — o elemento central.
- [Mapeamento de Capacidades](/15-enterprise-architecture/capability-mapping.md) — o método.
- [Estratégia Técnica](/15-enterprise-architecture/technical-strategy.md) — a conexão com investimento.
- [Linguagem Ubíqua](/04-domain-driven-design/ubiquitous-language.md).

## Exercício Prático

Mapeie o fluxo de valor de ponta a ponta de um processo importante da sua organização,
com o tempo de cada etapa.

A etapa que consome a maior fração do tempo é onde a discussão de investimento deveria
estar — e frequentemente não está.

## Perguntas de Entrevista

- Por que a justificativa técnica frequentemente não compete por orçamento?
- O que um fluxo de valor revela que uma discussão de sistemas não revela?
- Por que a arquitetura de negócio não deveria ser mantida pela tecnologia?

## Para Aprofundar

- Ulrich, William; Rosen, Michael. *The Business Capability Map*. Cutter Consortium, 2011.
- Open Group. *TOGAF Standard* — arquitetura de negócio.
- Rother, Mike; Shook, John. *Learning to See*. LEI, 1999 — mapeamento de fluxo de valor.
