---
id: governance-principles
title: Princípios em Operação
sidebar_position: 3
description: Como um princípio é de fato usado no momento da decisão — e o teste que separa princípio de slogan.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor testa princípios pela capacidade de eliminar opções e sabe resolver
  conflito entre dois princípios válidos.
prerequisites: [governance-basics]
related: [governance-standards, governance-review, governance-basics]
canonical_for: [teste do inverso, conflito entre princípios, princípio como critério, hierarquia de princípios]
content_version: 2
last_reviewed: 2026-08-29
---

# Princípios em Operação

## Visão Geral

Princípios orientam julgamento em situações que ninguém previu. Essa é a função, e ela
define o critério de qualidade: **um princípio que não elimina nenhuma opção não orienta
nada.**

O teste mais eficiente cabe numa pergunta — **alguém defenderia o inverso?**

```text
"buscamos soluções escaláveis e seguras"     ninguém defende o inverso → slogan
"preferimos comprar a construir, exceto
 onde a capacidade é diferencial competitivo" o inverso é defensável → princípio
```

Ver [princípios corporativos](/15-enterprise-architecture/enterprise-principles.md) para
a formulação; aqui o foco é como eles operam no momento da decisão, e o que fazer quando
dois deles apontam para lados opostos.

## Problema

A maior parte das listas de princípios arquiteturais de organizações reais é composta de
afirmações que ninguém contestaria:

```text
"priorizamos a experiência do usuário"
"buscamos simplicidade"
"segurança é responsabilidade de todos"
"decisões devem ser baseadas em dados"
```

Nenhuma dessas elimina uma opção. Diante de uma escolha real — construir ou comprar, um
banco ou dois, síncrono ou assíncrono — nenhuma ajuda.

O efeito prático é pior que a ausência: a organização acredita ter princípios, o exercício
de formulá-los foi feito e considerado concluído, e a decisão continua sendo tomada por
quem grita mais alto.

E há um segundo problema, que aparece quando os princípios são bons: **eles conflitam**. Um
princípio que favorece autonomia de time e outro que favorece padronização vão colidir, e
sem regra de precedência a colisão é resolvida por poder.

## Conceitos Centrais

### O teste do inverso

```text
formule o oposto do princípio
se o oposto for absurdo, o princípio é slogan
se o oposto for uma posição defensável, o princípio é uma escolha
```

Exemplos aplicados:

```text
"preferimos consistência forte a disponibilidade nas operações financeiras"
inverso: "preferimos disponibilidade a consistência" → defensável → princípio

"escrevemos código de qualidade"
inverso: "escrevemos código ruim" → absurdo → slogan
```

Todo princípio real é uma escolha entre coisas boas. Se não há nada bom sendo abdicado, não
há princípio.

Ver [trade-offs](/20-trade-offs/index.md).

### Princípio precisa de implicação

Um princípio sem implicação declarada é interpretado de formas incompatíveis:

```text
princípio    "preferimos comprar a construir, exceto onde a capacidade
             é diferencial competitivo"

implicações  toda proposta de construir precisa nomear o diferencial
             a avaliação de compra inclui custo de pessoal na comparação
             capacidade de diferenciação é decidida com produto, não só
             com engenharia
```

As implicações são o que torna o princípio acionável numa revisão. Sem elas, ele é citado
por ambos os lados de qualquer discussão.

### Princípios conflitam, e a precedência precisa existir

```text
"times decidem sua própria tecnologia"
"minimizamos o número de tecnologias em operação"
```

Ambos defensáveis, e opostos. Sem regra, cada decisão vira disputa.

Três formas de resolver, em ordem crescente de utilidade:

```text
ordem fixa          princípio A sempre vence B — simples e rígido
por domínio         autonomia vence em escolha interna; padronização vence
                    em superfície compartilhada
por risco           quanto maior o risco compartilhado, mais peso à coerência
```

A segunda e a terceira funcionam melhor porque nomeiam **onde** cada princípio governa, em
vez de declarar um superior em abstrato.

### Princípios têm exceção; padrões têm processo de exceção

Uma distinção operacional que resolve muita confusão:

```text
princípio   é ponderado — ceder a ele em um caso não o viola
padrão      é cumprido ou não — não cumprir exige exceção registrada
```

Isso significa que "abrimos exceção ao princípio X" é uma frase mal formada. Princípio se
pondera contra outro princípio, com justificativa. Padrão se descumpre, com registro.

Ver [padrões](/19-architecture-governance/governance-standards.md) e [exceções](/19-architecture-governance/exceptions.md).

### Quando um princípio deveria virar padrão

```text
a mesma ponderação se repete             → a decisão já é conhecida
o resultado é sempre o mesmo             → prescreva e pare de reavaliar
o custo de decidir excede o de padronizar → padronize
o contexto varia de verdade              → mantenha como princípio
```

Deixar como princípio algo que já foi decidido dezenas de vezes da mesma forma é desperdício
de julgamento: cada time refaz uma análise cujo resultado é previsível.

### Poucos, e usados

```text
5 a 8 princípios     lembráveis, aplicáveis
15 ou mais           lista de referência que ninguém consulta
```

E o sinal de saúde não é o número: é a **citação em decisões reais**. Um princípio que nunca
aparece num ADR ou numa revisão não está operando, independentemente de quão bem escrito
esteja.

Ver [medição](/19-architecture-governance/measuring-governance.md).

### Princípios precisam de revisão

Um princípio é uma decisão sobre como decidir, e envelhece como qualquer decisão:

```text
"preferimos construir, pela falta de opções maduras no mercado"  2018
o mercado amadureceu                                             2024
```

Sem revisão periódica, princípios de uma era continuam governando outra. A cadência anual,
com a pergunta "as condições que produziram este princípio ainda valem?", basta.

## Modelo Mental

**Se ninguém defende o inverso, não é princípio.** E se dois princípios não têm regra de
precedência, quem decide é o poder.

## Quando Usar

- Para orientar decisões que não podem ser antecipadas.
- Quando o contexto varia de verdade entre casos.
- Como critério explícito de pauta em revisões.
- Onde padronizar seria rígido demais.

## Quando Não Usar

**Como slogan.**

**Sem implicações declaradas.**

**Sem regra de precedência** entre princípios que conflitam.

**Em número alto.**

**Para decisões recorrentes de resultado previsível** — isso é padrão.

**Sem revisão periódica.**

## Alternativas

- **[Padrões](/19-architecture-governance/governance-standards.md)** — quando a decisão já é conhecida.
- **Gabaritos** — o princípio embutido no ponto de partida.
- **[ADRs](/18-architecture-decisions/what-is-an-adr)** — precedente concreto vale mais que
  abstração; um conjunto de decisões bem registradas ensina o critério da organização.
- **Nada** — em times pequenos, o critério compartilhado é tácito e funciona.

A terceira merece nota: organizações com bom acervo de ADRs frequentemente precisam de
menos princípios, porque o critério fica visível nos precedentes.

## Trade-offs

| Princípios | Padrões |
|---|---|
| Cobrem o não previsto | Decidem o recorrente |
| Exigem julgamento | Não exigem |
| Interpretáveis | Verificáveis |
| Não travam | Podem travar |

| Poucos princípios | Muitos |
|---|---|
| Lembrados e usados | Cobrem mais casos |
| Conflitam menos | Lista de consulta |
| Exigem escolha dura | Evitam escolher |

## Modos de Falha

**Slogan.** Ninguém defende o inverso.

**Sem implicação.** Citado pelos dois lados.

**Conflito sem precedência.** Resolvido por poder.

**Princípio que deveria ser padrão.** Julgamento desperdiçado.

**Lista longa.** Não é consultada.

**Nunca revisado.** Governa com condições de outra época.

## Erros Comuns

**Formular princípios em oficina** e nunca usá-los numa decisão.

**Não aplicar o teste do inverso.**

**Não declarar onde cada princípio governa.**

**Confundir princípio com padrão** — e abrir "exceção a princípio".

**Não medir citação** em decisões reais.

## Exemplo Real

Uma empresa de varejo com 12 times tinha nove princípios arquiteturais, formulados numa
oficina de dois dias e publicados no portal interno.

Dois anos depois, uma revisão aplicou dois testes.

**Teste do inverso**, aplicado aos nove:

```text
passaram (o inverso é defensável)     3
falharam (o inverso é absurdo)        6
```

Os seis reprovados incluíam "priorizamos qualidade", "buscamos soluções simples" e
"segurança é prioridade".

**Teste de citação**, buscando os princípios em 140 ADRs e 60 atas de revisão do período:

```text
citados ao menos uma vez              4
citados mais de cinco vezes           2
nunca citados                         5
```

Os dois mais citados eram os mesmos dois que tinham passado no teste do inverso com folga.

E um terceiro achado, não previsto: em 11 ADRs, dois princípios tinham sido citados por
**lados opostos** da mesma discussão — autonomia de time contra redução do número de
tecnologias. Não havia regra de precedência, e as 11 decisões tinham sido resolvidas de
formas inconsistentes.

A reformulação:

**De nove para quatro princípios.** Os cinco nunca citados foram removidos; um dos
reprovados foi reformulado até passar no teste do inverso.

**Implicações obrigatórias**, com no mínimo duas por princípio, escritas como o que muda na
prática.

**Precedência por domínio** para o conflito entre autonomia e padronização:

```text
escolha interna a um serviço, sem superfície compartilhada  → autonomia vence
tecnologia que aparece em contrato entre times              → padronização vence
tecnologia que entra no plantão compartilhado               → padronização vence
```

**Dois princípios promovidos a padrão.** As ponderações se repetiam com o mesmo resultado —
escolha de banco relacional e de protocolo de integração síncrona. Ver
[padrões](/19-architecture-governance/governance-standards.md).

**Revisão anual** com a pergunta única: as condições que produziram este princípio ainda
valem?

No ano seguinte:

```text
princípios                                     4
citações em ADRs                              38 (contra 9 no ano anterior)
decisões com conflito de princípio            7 — todas resolvidas
                                              pela regra de precedência
princípios removidos na revisão anual         1
```

O princípio removido era "preferimos serviços gerenciados a componentes operados por nós".
A revisão constatou que ele havia se tornado consenso e não eliminava mais nenhuma opção em
discussão — tinha virado descrição, não escolha.

A conclusão registrada: reduzir de nove para quatro aumentou o uso em quatro vezes. A lista
longa não era consultada porque não cabia na cabeça de ninguém no momento da decisão, que é
o único momento em que um princípio serve.

## Conceitos Relacionados

- [Princípios Corporativos](/15-enterprise-architecture/enterprise-principles.md) — a
  formulação.
- [Padrões](/19-architecture-governance/governance-standards.md) — quando prescrever.
- [Revisão](/19-architecture-governance/governance-review.md) — onde o princípio é aplicado.
- [Trade-offs](/20-trade-offs/index.md) — o que todo princípio abdica.

## Exercício Prático

Pegue a lista de princípios da sua organização e aplique o teste do inverso a cada um.

Depois busque cada princípio nos ADRs e atas do último ano. Os que falharem nos dois testes
não estão operando.

## Perguntas de Entrevista

- Por que "buscamos simplicidade" não é um princípio?
- Como se resolve o conflito entre dois princípios igualmente válidos?
- Quando um princípio deveria ser promovido a padrão?

## Para Aprofundar

- Ford, Neal et al. *Fundamentals of Software Architecture*. O'Reilly, 2020.
- *TOGAF Standard* — Architecture Principles. The Open Group.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
