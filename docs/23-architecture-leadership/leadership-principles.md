---
id: leadership-principles
title: Princípios sob a Ótica de Quem Escreve
sidebar_position: 12
description: Formular princípios que eliminam opções e removê-los quando viram consenso.
doc_type: concept
level: 7
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor formula princípios derivados de decisões reais, com implicações e
  precedência, e sabe quando aposentá-los.
prerequisites: [architecture-vision]
related: [architecture-vision, leadership-standards, leadership-governance]
canonical_for: [formulação de princípio, princípio derivado de precedente, aposentadoria de princípio]
content_version: 6
last_reviewed: 2026-08-29
---

# Princípios sob a Ótica de Quem Escreve

## Visão Geral

O [nível anterior](/19-architecture-governance/governance-principles.md) trata de como
princípios operam no momento da decisão. Este trata de quem os **escreve**, e o trabalho de
escrita tem três problemas próprios:

```text
1. de onde vêm os princípios
2. como saber se eles funcionam
3. quando removê-los
```

O primeiro é o mais determinante. Princípios formulados numa oficina, a partir do que a
organização gostaria de ser, quase sempre viram slogans. Princípios **derivados de decisões que já
foram tomadas** descrevem o critério real da organização, e por isso são reconhecidos e usados.

## Problema

O processo típico de criação:

```text
oficina de dois dias com a liderança
brainstorming sobre valores e direção
consolidação em nove princípios
publicação no portal interno
```

O resultado previsível: afirmações que ninguém contestaria ("priorizamos qualidade", "buscamos
simplicidade"), nenhuma das quais elimina uma opção em nenhuma decisão real.

O problema está na fonte, não na oficina: a organização foi perguntada sobre o que gostaria de ser,
e não sobre o que ela de fato usa para decidir.

E há um segundo problema, do outro lado: princípios que funcionaram e viraram consenso, e que
continuam ocupando espaço numa lista que ninguém consegue lembrar inteira.

## Conceitos Centrais

### Derive dos precedentes

O método que produz princípios usáveis:

```text
1. leia as últimas cinquenta decisões arquiteturais registradas
2. procure os critérios que aparecem repetidamente
3. enuncie cada um como uma afirmação que elimina opções
4. valide contra decisões que você não usou para derivá-los
```

Isso produz princípios que descrevem o que a organização já faz, e a diferença prática é enorme:
eles são reconhecidos imediatamente, e a discussão passa a ser sobre se o critério está certo, e
não sobre se ele é o critério.

Ver [ADRs](/18-architecture-decisions/what-is-an-adr.md).

Quando o acervo de decisões não existe, construí-lo vem antes de escrever princípios.

### Aplique o teste do inverso aos critérios extraídos

O [teste do inverso](/19-architecture-governance/governance-principles.md#o-teste-do-inverso)
(alguém defenderia o oposto?) é definido no nível anterior. Para quem escreve, o que muda é onde
ele é aplicado: aos critérios que saíram dos ADRs, antes de virarem enunciado. Um critério que
aparece em decisões reais costuma passar, porque foi usado para rejeitar uma opção; quando falha,
ele era retórica de justificativa repetida nos registros, não o critério que decidiu. Essa
diferença só aparece relendo as opções que o ADR descartou.

### Implicações, não apenas o enunciado

O que é uma implicação está em
[princípios corporativos](/15-enterprise-architecture/enterprise-principles.md#implicações-são-o-que-torna-acionável). Para quem
escreve, a pergunta é quem ela obriga:

```text
princípio    "o que a plataforma oferece, os times não reconstroem"

implicações  toda proposta de construir algo que a plataforma
             cobre precisa justificar por escrito
             lacunas da plataforma viram itens de roteiro dela,
             não construções paralelas
             a plataforma se compromete com prazo de resposta
```

A terceira implicação é a que torna o princípio justo: ele impõe obrigação aos dois lados. Um
princípio que só restringe os times e não compromete a plataforma será contornado, com razão.

### Precedência entre princípios conflitantes

As formas de regra (por domínio, por risco) estão em
[Princípios em Operação](/19-architecture-governance/governance-principles.md#princípios-conflitam-e-a-precedência-precisa-existir).
Escolher qual delas vale, e declará-la no mesmo documento que os princípios, é responsabilidade de
quem escreve, e é a parte que a oficina normalmente não faz, porque exige escolher, e a oficina
busca consenso.

Derivando de precedentes, o conflito já está no acervo: são os ADRs que citaram os dois critérios
e seguiram direções diferentes. Esses registros mostram onde a fronteira caiu na prática, e a regra
declarada deveria reproduzi-la ou dizer por que muda.

### Cinco a oito, no máximo

O limite é de memória, não de rigor. Princípios que precisam ser consultados não orientam as
decisões que eles existem para orientar, porque essas decisões acontecem sem consulta.

Se a lista tem quinze, ela é referência de auditoria, não instrumento de decisão.

### Meça citação em decisões reais

```text
princípio citado em ADRs e revisões    está operando
nunca citado                           não está
```

Essa medição é barata (uma busca no acervo de decisões) e é a que menos depende de opinião.
Tem dois limites: só enxerga decisões que viraram ADR ou revisão, e conta igual a citação ritual e
a que eliminou uma opção; ler uma amostra das citações separa as duas. Um princípio
bem escrito que ninguém cita em um ano não está funcionando, independentemente da qualidade da
redação.

### Aposente o que virou consenso

Contraintuitivo e importante: um princípio que ninguém mais contesta deixou de eliminar opções, e
por isso deixou de ser princípio.

```text
"preferimos serviços gerenciados a componentes operados por nós"
  → em 2020, eliminava opções e gerava discussão
  → em 2026, é consenso; virou descrição, não escolha
```

Removê-lo libera espaço na lista para um princípio que ainda decide algo. O caminho usual é
promovê-lo a padrão verificado automaticamente, se aplicável. Ver
[padrões](/23-architecture-leadership/leadership-standards.md).

### Revisão anual, com uma pergunta

```text
"as condições que produziram este princípio ainda valem?"
```

Princípios são decisões sobre como decidir, e envelhecem como qualquer decisão. Um princípio
formulado para uma organização de seis times pode ser ativamente prejudicial numa de trinta.

## Modelo Mental

**Derive de precedentes, teste pelo inverso, e aposente o que virou consenso.** Cinco a oito, com
implicações e precedência.

## Quando Usar

- Quando decisões independentes precisam de critério comum.
- Derivando do acervo de decisões, não de oficina.
- Com implicações e regra de precedência.

## Quando Não Usar

**Acervo de decisões pequeno demais.** Com menos de umas trinta decisões registradas, um critério
que aparece três vezes não se distingue de coincidência, e o método de derivação não tem de onde
tirar recorrência. O trabalho certo é construir o acervo primeiro.

**Organização em que o critério circula sem registro.** Com poucos times sob a mesma liderança
técnica, as decisões passam pelas mesmas pessoas e o critério já é compartilhado. Um princípio
escrito ali nasce consenso, e consenso é exatamente o que este documento manda aposentar.

**Decisão recorrente com resultado verificável.** Se a resposta certa é sempre a mesma e dá para
checar automaticamente, o instrumento é um padrão, não um princípio.

**Liderança que não aceita se obrigar.** Sem disposição para declarar precedência e assumir
implicações que comprometem quem escreve, a lista publicada vira aspiração com outro nome.

## Alternativas

- **Acervo de ADRs**: precedentes concretos ensinam o critério melhor que abstrações, e
  organizações com bom acervo precisam de menos princípios.
- **Visão curta**: três a cinco afirmações que cobrem o essencial. Ver
  [visão de arquitetura](/23-architecture-leadership/architecture-vision.md).
- **Padrões**: quando a decisão é recorrente e o resultado previsível.
- **Nada**: em times pequenos, o critério compartilhado é tácito e funciona.

## Trade-offs

| Derivado de precedentes | Formulado por aspiração |
|---|---|
| Reconhecido de imediato | Precisa ser vendido |
| Exige acervo de decisões | Rápido de produzir |
| Descreve o que já se faz | Pode não descrever nada |

| Poucos princípios | Muitos |
|---|---|
| Lembrados | Cobrem mais casos |
| Exigem escolher | Evitam escolher |

## Modos de Falha

**Slogan.** Ninguém defende o inverso.

**Sem implicação.** Citado pelos dois lados de qualquer discussão.

**Conflito sem precedência.** Resolvido por poder.

**Lista longa.** Não é lembrada.

**Consenso mantido na lista.** Ocupa espaço sem decidir nada.

**Nunca revisado.** Governa com premissas de outra época.

## Erros Comuns

**Formular em oficina** sem olhar as decisões reais.

**Não declarar implicações** que comprometem quem escreve.

**Não medir citação.**

**Não remover** o que virou consenso.

**Escrever princípio** onde um padrão resolveria.

## Exemplo Real

Uma empresa de tecnologia em saúde não tinha princípios arquiteturais publicados, e a liderança de
engenharia queria criar. A proposta inicial era a usual: uma oficina de dois dias com os
arquitetos e líderes técnicos.

A área de arquitetura propôs um método diferente, com um argumento simples: a organização já
decidia de alguma forma, havia quatro anos, e desde o segundo ano registrava essas decisões em ADRs.

**Leitura dos ADRs.** Os 96 registros de decisão desses três anos foram lidos, e os critérios
citados em cada um foram tabulados.

```text
critério citado                                   ADRs
"não podemos depender de conexão da unidade"      31
"o dado clínico não pode ser alterado"            27
"quem opera precisa conseguir depurar às 3h"      19
"o time que constrói é o que responde no plantão" 17
"preferimos comprar onde não somos diferentes"    11
demais critérios, com menos de 5 citações         —
```

Os cinco critérios somavam 105 citações nas 96 decisões (vários ADRs citavam mais de um).

**Teste do inverso** aplicado aos cinco: os quatro primeiros passaram com folga; o quinto foi
contestado internamente, porque a organização tinha construído três sistemas que o mercado
oferecia. A discussão que se seguiu foi produtiva, e o princípio foi mantido com uma implicação
adicional: toda proposta de construir precisa nomear o diferencial por escrito.

**Implicações**, mínimo duas por princípio, com ao menos uma impondo obrigação a quem escreveu.
Para o princípio de plantão, a obrigação foi da liderança: nenhum time recebe responsabilidade de
plantão sem a plataforma que a torna sustentável.

**Precedência declarada** entre os dois que conflitavam (depurar às 3h e comprar onde não somos
diferentes, porque produto comprado costuma ser caixa-preta para quem está de plantão), resolvida
por domínio: no caminho do atendimento clínico, depurabilidade vence; em sistemas administrativos,
comprar vence.

O resultado foi um documento de uma página, com cinco afirmações, publicado em três semanas, mais
que os dois dias da oficina, porque incluía as escolhas de implicação e precedência que a oficina
não teria feito.

Doze meses depois:

```text
citações em ADRs novos                        44 de 51
engenheiros que citavam ao menos três         83%
princípios contestados internamente            1 — o de comprar,
                                              mantido após discussão
princípios adicionados                         0
```

A conclusão registrada: os cinco princípios não eram novidade para ninguém. Eles descreviam o
critério que a organização já usava, enunciado de forma lembrável, e é por isso que foram
reconhecidos de imediato, em vez de precisarem ser vendidos.

O custo comparável é o do levantamento: a oficina, que teria produzido aspirações, custaria oito
pessoas por dois dias; a leitura dos ADRs custou uma pessoa por três. O restante das três semanas
(a discussão do quinto princípio, as implicações, a precedência) envolveu mais gente e não foi
medido, e não entra nessa conta.

## Conceitos Relacionados

- [Princípios em Operação](/19-architecture-governance/governance-principles.md).
- [Princípios Corporativos](/15-enterprise-architecture/enterprise-principles.md).
- [Visão de Arquitetura](/23-architecture-leadership/architecture-vision.md).
- [Padrões](/23-architecture-leadership/leadership-standards.md).

## Exercício Prático

Leia as últimas trinta decisões arquiteturais registradas na sua organização e extraia os
critérios que aparecem mais de três vezes.

Compare com a lista de princípios publicada. A diferença entre as duas é a distância entre o que a
organização diz e o que ela usa.

## Perguntas de Entrevista

- Por que princípios derivados de precedentes funcionam melhor que os formulados em oficina?
- Por que um princípio que virou consenso deveria ser removido?
- Por que as implicações precisam comprometer quem escreveu o princípio?

## Para Aprofundar

- Rumelt, Richard. *Good Strategy Bad Strategy*. Crown Business, 2011.
- Richards, Mark; Ford, Neal. *Fundamentals of Software Architecture*. O'Reilly, 2020.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
