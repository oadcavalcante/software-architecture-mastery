---
id: capability-mapping
title: Mapeamento de Capacidades
sidebar_position: 6
description: Como construir o mapa — o método, e os erros que produzem um artefato inútil.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor conduz um exercício de mapeamento que produz um modelo usável
  e mantido.
prerequisites: [business-capabilities]
related: [business-capabilities, application-portfolios, business-architecture]
canonical_for: [mapeamento de capacidades, decomposição de capacidade, heat map de capacidades]
content_version: 1
last_reviewed: 2026-08-28
---

# Mapeamento de Capacidades

## Visão Geral

[Capacidades de negócio](business-capabilities.md) descreve o que são e para que servem.
Este documento é sobre **como construir o mapa** — e como evitar os erros que produzem
um artefato bonito e inútil.

O exercício parece simples: listar o que a organização faz. Na prática, ele desliza com
facilidade para o organograma, para os processos ou para os sistemas — e cada desvio
produz um modelo que envelhece rápido.

## Problema

Um mapeamento mal conduzido produz um dos três resultados ruins:

**Espelho do organograma.** As capacidades correspondem a departamentos. Na próxima
reorganização, o modelo está errado.

**Lista de processos.** Verbos em vez de substantivos, e o modelo muda quando o processo
muda — que é constantemente.

**Catálogo de sistemas com nomes de negócio.** As capacidades foram derivadas do que os
sistemas fazem, e o modelo apenas renomeia a arquitetura existente.

Os três acontecem porque são o caminho de menor resistência: essas são as estruturas
que as pessoas conhecem.

## Conceitos Centrais

### Comece pelo negócio, não pela TI

O exercício conduzido apenas por tecnologia produz o terceiro erro. As capacidades
precisam vir de quem opera o negócio.

O formato que funciona:

```text
entrevistas com líderes de negócio        o que a área faz, sem falar de sistemas
oficina conjunta                          consolidação, com negócio e tecnologia
validação com quem executa                as pessoas que fazem o trabalho
```

A terceira etapa costuma corrigir o modelo: líderes descrevem o que deveria acontecer;
quem executa sabe o que acontece.

### As perguntas que produzem capacidades

```text
"o que a área faz?"           → tende a produzir processos
"o que o negócio precisa
 saber fazer?"                → produz capacidades
"isso existiria se
 mudássemos todos os sistemas?" → testa independência de tecnologia
"isso existiria com outra
 estrutura organizacional?"    → testa independência de organograma
"isso existia há dez anos?"    → testa estabilidade
```

As três últimas são testes que se aplicam a cada item candidato, e eliminam a maior parte
dos erros.

### Decompor de cima para baixo

```text
1. as grandes áreas do negócio         8 a 15 itens
2. decomposição de cada uma            5 a 8 filhos por item
3. um terceiro nível onde for útil     não uniformemente
```

O erro de decompor de baixo para cima: começar listando tudo o que se faz e agrupar
depois produz categorias artificiais e sobreposição.

E o terceiro nível não precisa existir em toda parte. Ele é útil onde o mapeamento a
sistemas exige detalhe — tipicamente nas capacidades diferenciadoras.

### Teste de exclusividade e de exaustividade

```text
exclusividade  duas capacidades não descrevem a mesma coisa
exaustividade  juntas, cobrem o que a organização faz
```

O teste prático de exaustividade: pegue cinco atividades reais da organização e verifique
se cada uma cai em exatamente uma capacidade.

As que não caem em nenhuma revelam lacuna. As que caem em duas revelam sobreposição — e
sobreposição é o defeito mais comum, porque duas áreas descrevem a mesma capacidade com
palavras diferentes.

### O mapa de calor é onde o valor aparece

Um mapa de capacidades sem sobreposição de informação é um diagrama. O que produz
decisão:

```text
cor por saúde          estado dos sistemas que suportam
cor por criticidade    o que para o negócio
cor por diferenciação  o que distingue a organização
cor por custo          onde o dinheiro vai
número de sistemas     onde há duplicação
```

Ver [portfólio de aplicações](application-portfolios.md).

E a combinação mais produtiva: **criticidade contra saúde**. Ela produz uma lista curta
de prioridades que ninguém discute — capacidades críticas suportadas por sistemas ruins.

### Quanto tempo, e quando parar

```text
primeiro rascunho     2 a 3 oficinas, algumas semanas
validação             2 a 4 semanas
mapeamento a sistemas 3 a 6 semanas, conforme o tamanho
```

O sinal de que se está indo longe demais: as discussões passam a ser sobre onde uma
atividade específica se encaixa, em vez de sobre o que fazer com a informação.

Um modelo 80% correto e usado vale mais que um 95% correto e discutido por seis meses.

### O modelo precisa entrar num processo existente

Um mapa construído para um exercício e arquivado morre. O que o mantém:

```text
usado na discussão de orçamento
usado na priorização de modernização
usado em decisões de construir ou comprar
revisado quando o negócio muda
```

Se ele não entra em nenhuma decisão recorrente, não vale o custo de manter — e a
constatação honesta é que ele não deveria ter sido construído.

## Modelo Mental

**O mapa vale pelo que se sobrepõe a ele.** Construí-lo é a parte fácil; usá-lo é o que
o mantém vivo.

## Quando Usar

- Antes de decisões de investimento em tecnologia.
- Para identificar duplicação entre sistemas.
- Em programas de modernização.
- Após aquisições, para comparar organizações.
- Quando negócio e tecnologia não conseguem conversar sobre prioridade.

## Quando Não Usar

**Conduzido apenas por tecnologia.**

**Decompondo de baixo para cima.**

**Buscando precisão excessiva.**

**Sem sobreposição de informação.**

**Sem entrar em nenhum processo de decisão.**

**Copiando modelo de referência do setor** sem adaptar — ele descreve o setor, não a
organização.

## Alternativas

- **Mapa de fluxo de valor** — orientado a processo, melhor para otimizar fluxo de
  trabalho.
- **Mapeamento de domínios** — orientado a fronteiras de software. Ver
  [DDD](../04-domain-driven-design/index.md).
- **Inventário de sistemas** — sem a lente de negócio, mais barato.
- **Modelo de referência do setor** — ponto de partida, com adaptação.

O último acelera o início e produz um modelo genérico se não for adaptado com rigor.

## Trade-offs

| Três níveis | Dois |
|---|---|
| Detalhe para mapear sistemas | Mais simples |
| Mais manutenção | Menos |

| Conduzido com o negócio | Só por TI |
|---|---|
| Vocabulário compartilhado | Renomeia sistemas |
| Mais demorado | Rápido |
| Usado em decisão de orçamento | Fica na TI |

## Modos de Falha

**Organograma disfarçado.**

**Processos em vez de capacidades.**

**Sobreposição.** A mesma coisa em dois lugares.

**Lacuna.** Atividades que não cabem em nenhuma.

**Precisão excessiva.** Meses discutindo encaixe.

**Modelo sem uso.** Construído e arquivado.

## Erros Comuns

**Conduzir sem o negócio.**

**Decompor de baixo para cima.**

**Não aplicar os testes de estabilidade.**

**Não validar com quem executa.**

**Não sobrepor informação.**

**Não conectar a um processo de decisão existente.**

## Exemplo Real

Uma empresa de energia conduziu dois exercícios de mapeamento de capacidades com dois
anos de diferença.

**O primeiro** foi conduzido pela área de arquitetura, a partir do inventário de
sistemas. Levou três semanas e produziu 84 capacidades.

Ele nunca foi usado. As entrevistas posteriores explicaram por quê: as capacidades
tinham nomes que o negócio não reconhecia — elas descreviam o que os sistemas faziam,
com vocabulário técnico traduzido.

"Gestão de medições" era o nome de um sistema. O negócio chamava aquilo de "leitura e
faturamento", e não eram a mesma coisa: o sistema fazia parte do que o negócio entendia
por leitura, e nada do faturamento.

**O segundo** foi conduzido com as áreas de negócio, em quatro oficinas.

Ele produziu 11 capacidades de nível 1 e 58 de nível 2 — e o vocabulário era o que as
pessoas usavam.

Três diferenças de resultado:

**Duplicação revelada.** A capacidade "atendimento ao cliente" era atendida por cinco
sistemas, cada um de uma área, nenhum sabendo dos outros. O primeiro exercício não tinha
visto isso, porque cada sistema tinha virado uma capacidade própria.

**Lacuna revelada.** Uma capacidade que o negócio considerava crítica — "previsão de
demanda" — não tinha nenhum sistema. Era feita em planilha, por três pessoas.

**Priorização destravada.** A discussão de orçamento passou a acontecer sobre o mapa. O
negócio conseguia participar, porque reconhecia os nomes.

O mapa de calor de criticidade contra saúde produziu uma lista de seis capacidades
prioritárias, aceita sem disputa — o que não tinha acontecido em nenhum ciclo anterior.

O que a equipe registra: o primeiro exercício foi tecnicamente competente e produziu um
artefato correto. Ele era um mapa da arquitetura de sistemas com nomes diferentes, e por
isso não servia ao propósito — que era permitir a conversa com o negócio.

## Conceitos Relacionados

- [Capacidades de Negócio](business-capabilities.md) — o conceito.
- [Portfólio de Aplicações](application-portfolios.md) — a sobreposição.
- [Arquitetura de Negócio](business-architecture.md).
- [Estratégia Técnica](technical-strategy.md).

## Exercício Prático

Liste cinco atividades reais que a sua organização executa e verifique se cada uma cai
em exatamente uma capacidade do seu modelo.

As que caem em duas revelam sobreposição; as que não caem em nenhuma, lacuna.

## Perguntas de Entrevista

- Quais testes eliminam os erros mais comuns de mapeamento?
- Por que decompor de cima para baixo?
- Por que conduzir sem o negócio produz um mapa inútil?

## Para Aprofundar

- Ulrich, William; Rosen, Michael. *The Business Capability Map*. BAI, 2011.
- Open Group. *TOGAF Standard* — arquitetura de negócio.
- Ross, Jeanne et al. *Enterprise Architecture as Strategy*. HBS Press, 2006.
