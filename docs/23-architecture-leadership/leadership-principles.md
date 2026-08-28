---
id: leadership-principles
title: Princípios sob a Ótica de Quem Escreve
sidebar_position: 12
description: Formular princípios que eliminam opções — e removê-los quando viram consenso.
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
content_version: 1
last_reviewed: 2026-08-29
---

# Princípios sob a Ótica de Quem Escreve

## Visão Geral

O [nível anterior](../19-architecture-governance/governance-principles.md) trata de como
princípios operam no momento da decisão. Este trata de quem os **escreve** — e o trabalho de
escrita tem três problemas próprios:

```text
1. de onde vêm os princípios
2. como saber se eles funcionam
3. quando removê-los
```

O primeiro é o mais determinante. Princípios formulados numa oficina, a partir do que a
organização gostaria de ser, quase sempre viram slogans. Princípios **derivados de decisões que já
foram tomadas** descrevem o critério real da organização — e por isso são reconhecidos e usados.

## Problema

O processo típico de criação:

```text
oficina de dois dias com a liderança
brainstorming sobre valores e direção
consolidação em nove princípios
publicação no portal interno
```

O resultado previsível: afirmações que ninguém contestaria — "priorizamos qualidade", "buscamos
simplicidade" —, nenhuma das quais elimina uma opção em nenhuma decisão real.

O problema não é a oficina. É a fonte: a organização foi perguntada sobre o que gostaria de ser,
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

Isso produz princípios que descrevem o que a organização já faz — e a diferença prática é enorme:
eles são reconhecidos imediatamente, e a discussão passa a ser sobre se o critério está certo, e
não sobre se ele é o critério.

Ver [ADRs](../18-architecture-decisions/index.md).

Quando o acervo de decisões não existe, construí-lo vem antes de escrever princípios.

### Aplique o teste do inverso

```text
formule o oposto
se for absurdo, é slogan
se for uma posição defensável, é princípio
```

```text
"buscamos simplicidade"                     inverso absurdo
"preferimos comprar a construir, exceto
 onde a capacidade diferencia o negócio"    inverso defensável
```

Todo princípio real abdica de algo bom. Se nada está sendo abdicado, não há escolha. Ver
[princípios corporativos](../15-enterprise-architecture/enterprise-principles.md).

### Implicações, não apenas o enunciado

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

```text
"times decidem sua própria tecnologia"
"minimizamos o número de tecnologias em operação"
```

Ambos defensáveis, e opostos. Sem regra, cada decisão vira disputa de poder.

```text
por domínio     autonomia vence em escolha interna;
                padronização vence em superfície compartilhada
por risco       quanto maior o risco compartilhado, mais peso
                à coerência
```

Definir a precedência é responsabilidade de quem escreve, e é a parte que a oficina normalmente
não faz — porque ela exige escolher, e a oficina busca consenso.

### Cinco a oito, no máximo

O limite é de memória, não de rigor. Princípios que precisam ser consultados não orientam as
decisões que eles existem para orientar, porque essas decisões acontecem sem consulta.

Se a lista tem quinze, ela é referência de auditoria, não instrumento de decisão.

### Meça citação em decisões reais

```text
princípio citado em ADRs e revisões    está operando
nunca citado                           não está
```

Essa medição é barata — uma busca no acervo de decisões — e é o único teste honesto. Um princípio
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
[padrões](leadership-standards.md).

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

**Formulados em oficina** a partir de aspiração.

**Sem passar no teste do inverso.**

**Sem implicações.**

**Sem precedência** entre os que conflitam.

**Em número acima de oito.**

**Sem medir citação** em decisões reais.

## Alternativas

- **Acervo de ADRs** — precedentes concretos ensinam o critério melhor que abstrações, e
  organizações com bom acervo precisam de menos princípios.
- **Visão curta** — três a cinco afirmações que cobrem o essencial. Ver
  [visão de arquitetura](architecture-vision.md).
- **Padrões** — quando a decisão é recorrente e o resultado previsível.
- **Nada** — em times pequenos, o critério compartilhado é tácito e funciona.

## Trade-offs

| Derivado de precedentes | Formulado por aspiração |
|---|---|
| Reconhecido e usado | Descreve o desejado |
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

Uma empresa de varejo tinha nove princípios arquiteturais, produzidos numa oficina em 2022.

Dois anos depois, uma revisão aplicou dois testes:

```text
teste do inverso
  passaram (inverso defensável)         3
  falharam (inverso absurdo)            6

teste de citação, em 140 ADRs e 60 atas
  citados mais de cinco vezes           2
  citados ao menos uma vez              4
  nunca citados                         5
```

Os dois mais citados eram os mesmos dois que passavam no teste do inverso com folga.

E um terceiro achado: em 11 ADRs, dois princípios tinham sido citados por lados **opostos** da
mesma discussão — autonomia de time contra redução do número de tecnologias. Não havia
precedência, e as 11 decisões tinham sido resolvidas de formas inconsistentes.

A reformulação seguiu o método de derivação:

**Leitura dos 140 ADRs**, extraindo os critérios que apareciam repetidamente. Isso produziu seis
candidatos, dos quais quatro sobreviveram ao teste do inverso.

**De nove para quatro.** Os cinco nunca citados foram removidos; um dos reprovados foi
reformulado até passar.

**Implicações obrigatórias**, mínimo de duas por princípio, escritas como o que muda na prática — e
com ao menos uma impondo obrigação a quem escreveu o princípio.

**Precedência por domínio** para o conflito entre autonomia e padronização:

```text
escolha interna a um serviço, sem superfície compartilhada
  → autonomia vence
tecnologia que aparece em contrato entre times
  → padronização vence
tecnologia que entra no plantão compartilhado
  → padronização vence
```

**Dois princípios promovidos a padrão**, porque a ponderação se repetia com o mesmo resultado.

**Revisão anual** com a pergunta única sobre as condições.

No ano seguinte:

```text
princípios                            4
citações em ADRs                     38 (contra 9)
decisões com conflito de princípio    7 — todas resolvidas pela
                                      regra de precedência
princípios removidos na revisão       1
```

O removido era "preferimos serviços gerenciados a componentes operados por nós". A revisão
constatou que ele havia virado consenso: em 22 decisões do ano, nenhuma tinha considerado seriamente
operar algo internamente. Ele deixou de eliminar opções e foi aposentado.

O que a organização registra: reduzir de nove para quatro multiplicou o uso por quatro. A lista
longa não era consultada porque não cabia na cabeça de ninguém no momento da decisão — que é o
único momento em que um princípio serve.

E derivar dos ADRs, em vez de escrever do zero, foi o que fez os quatro serem reconhecidos
imediatamente: eles descreviam o que a organização já fazia.

## Conceitos Relacionados

- [Princípios em Operação](../19-architecture-governance/governance-principles.md).
- [Princípios Corporativos](../15-enterprise-architecture/enterprise-principles.md).
- [Visão de Arquitetura](architecture-vision.md).
- [Padrões](leadership-standards.md).

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
- Ford, Neal et al. *Fundamentals of Software Architecture*. O'Reilly, 2020.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
