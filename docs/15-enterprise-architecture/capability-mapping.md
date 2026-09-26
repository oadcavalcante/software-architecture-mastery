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
content_version: 3
last_reviewed: 2026-08-28
---

# Mapeamento de Capacidades

## Visão Geral

[Capacidades de negócio](/15-enterprise-architecture/business-capabilities.md) descreve o que são e para que servem.
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

Ver [portfólio de aplicações](/15-enterprise-architecture/application-portfolios.md).

Cada pergunta pede uma combinação. Para priorizar risco e modernização, **criticidade
contra saúde**: ela produz uma lista curta de prioridades difícil de contestar, porque
cruza dois fatos que o negócio e a TI já reconhecem — capacidades críticas suportadas por
sistemas ruins. Para decidir entre construir e comprar, **diferenciação contra custo**, como
descrito em [capacidades de negócio](/15-enterprise-architecture/business-capabilities.md).

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

Manter tem forma concreta: um responsável nomeado pelo mapa — em geral a arquitetura de
negócio, não um projeto que termina —, revisão da estrutura atrelada ao ciclo de orçamento,
e a camada de sistemas atualizada junto com o
[portfólio de aplicações](/15-enterprise-architecture/application-portfolios.md), a cada
sistema que entra ou é desativado. A estrutura de capacidades muda pouco; o mapa de calor
envelhece em meses se a camada de sistemas não acompanha o portfólio.

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

**Organização pequena, com poucos sistemas.** Quando um inventário de uma página já mostra
o que suporta o quê, o mapa acrescenta semanas de oficina sem revelar duplicação que a lista
não mostrasse.

**Nenhuma decisão recorrente onde o mapa possa entrar.** Sem ciclo de orçamento, programa de
modernização ou decisão de construir ou comprar à vista, o mapa é arquivado ao fim do
exercício — o modo de falha mais caro, porque todo o custo já foi pago.

**O problema dominante é fronteira de software.** Se a pergunta é onde dividir serviços ou
quem é dono de qual dado, o mapeamento de domínios responde com o nível de detalhe certo; o
mapa de capacidades fica acima disso.

**O problema é o fluxo, não o portfólio.** Se o que dói é o tempo entre pedido e entrega, o
mapa de fluxo de valor mostra a espera; o de capacidades mostra só que a capacidade existe.

## Alternativas

- **Mapa de fluxo de valor** — orientado a processo, melhor para otimizar fluxo de
  trabalho.
- **Mapeamento de domínios** — orientado a fronteiras de software. Ver
  [DDD](/04-domain-driven-design/index.md).
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

**Conduzir sem o negócio.** Um mapa desenhado só pela área técnica descreve sistemas com outro nome, e o negócio não se reconhece nele — o que o torna inútil para a conversa que ele existia para ter.

**Decompor de baixo para cima.** Listar todas as atividades e agrupar depois produz categorias artificiais, definidas pela semelhança entre as tarefas e não pelo que o negócio precisa saber fazer — e as mesmas atividades acabam agrupadas em dois lugares, que é a sobreposição que o teste de exclusividade depois precisa desfazer.

**Não aplicar os testes de estabilidade.** Se um item do mapa desaparece quando a empresa troca de ferramenta ou de estrutura, ele não era capacidade; era processo ou sistema com nome de capacidade.

**Não validar com quem executa.** O mapa validado só com a diretoria descreve como a empresa acha que funciona. Quem executa sabe onde há capacidade informal e duplicada.

**Não sobrepor informação.** Um mapa sem custo, criticidade ou saúde sobreposta é um organograma de substantivos. As camadas de informação é que fazem dele instrumento de decisão.

**Não conectar a um processo de decisão existente.** Mapa que não entra no planejamento nem na priorização de investimento é entregue, elogiado e esquecido.

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

O primeiro exercício foi tecnicamente competente e produziu um
artefato correto. Ele era um mapa da arquitetura de sistemas com nomes diferentes, e por
isso não servia ao propósito — que era permitir a conversa com o negócio.

## Conceitos Relacionados

- [Capacidades de Negócio](/15-enterprise-architecture/business-capabilities.md) — o conceito.
- [Portfólio de Aplicações](/15-enterprise-architecture/application-portfolios.md) — a sobreposição.
- [Arquitetura de Negócio](/15-enterprise-architecture/business-architecture.md).
- [Estratégia Técnica](/15-enterprise-architecture/technical-strategy.md).

## Exercício Prático

Liste cinco atividades reais que a sua organização executa e verifique se cada uma cai
em exatamente uma capacidade do seu modelo.

As que caem em duas revelam sobreposição; as que não caem em nenhuma, lacuna.

## Perguntas de Entrevista

- Quais testes eliminam os erros mais comuns de mapeamento?
- Por que decompor de cima para baixo?
- Por que conduzir sem o negócio produz um mapa inútil?

## Para Aprofundar

- Ulrich, William; Rosen, Michael. *The Business Capability Map*. Cutter Consortium, 2011.
- The Open Group. *TOGAF Standard*, 10ª ed., 2022 — arquitetura de negócio.
- Ross, Jeanne et al. *Enterprise Architecture as Strategy*. HBS Press, 2006.
