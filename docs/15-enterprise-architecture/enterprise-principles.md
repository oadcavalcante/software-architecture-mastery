---
id: enterprise-principles
title: Princípios Corporativos
sidebar_position: 10
description: Regras que orientam decisões distribuídas — e por que a maioria delas não orienta nada.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor escreve princípios que decidem casos concretos, em vez de
  afirmações com que ninguém discorda.
prerequisites: [enterprise-architecture]
related: [standards, enterprise-governance, architecture-levels]
canonical_for: [princípio corporativo, princípio acionável, implicação de princípio]
content_version: 1
last_reviewed: 2026-08-28
---

# Princípios Corporativos

## Visão Geral

Um princípio corporativo é uma regra que orienta decisões tomadas por pessoas
diferentes, em momentos diferentes, sem coordenação.

Ele existe porque não é viável revisar toda decisão. Ver
[níveis de arquitetura](architecture-levels.md).

E a maioria dos princípios escritos não orienta nada, por uma razão simples: eles são
afirmações com que ninguém discorda.

## Problema

O conjunto de princípios típico:

```text
"buscamos simplicidade"
"priorizamos a experiência do usuário"
"a segurança é responsabilidade de todos"
"reutilizamos antes de construir"
```

Nenhum desses ajuda a decidir. Diante de duas alternativas, ambas podem ser defendidas
como simples, seguras e boas para o usuário.

O teste que expõe isso: **existe alguém na organização que defenderia o contrário?** Se
não existir, o princípio não separa opções — ele apenas declara uma virtude.

## Conceitos Centrais

### Um princípio útil tem um lado perdedor

Princípios que decidem escolhem um valor **em detrimento de outro**:

```text
inútil   "buscamos simplicidade"
útil     "preferimos simplicidade operacional a otimização de custo"
         → alguém poderia preferir o contrário, e a escolha muda a decisão
```

Mais exemplos com lado perdedor explícito:

```text
"preferimos comprar a construir, exceto no que nos diferencia"
"preferimos consistência entre times a otimização local"
"preferimos reversibilidade a acerto na primeira tentativa"
"dados pertencem a um único sistema; os demais consomem"
```

Cada um desses descarta algo. É isso que os torna decidíveis.

### Implicações são o que torna acionável

O princípio sozinho é uma frase. O que o operacionaliza são as implicações:

```text
princípio    "dados pertencem a um único sistema; os demais consomem"
implicações  nenhum sistema escreve na base de outro
             integração por API ou evento, não por acesso direto ao banco
             todo conjunto de dados tem dono declarado
             duplicação exige justificativa registrada
```

Sem implicações, cada pessoa interpreta o princípio de um jeito, e ele deixa de produzir
coerência — que era o motivo de existir.

### Poucos, e revisados

```text
5 a 8 princípios   memoráveis, usados
20+                ninguém lembra, ninguém aplica
```

Um conjunto grande é sintoma de que princípios estão sendo usados para o que
[padrões](standards.md) resolvem melhor: princípios orientam julgamento; padrões
prescrevem escolhas específicas.

E eles envelhecem: um princípio que fez sentido quando a organização tinha 30
engenheiros pode ser errado com 300. A revisão periódica é o que evita que restrições
antigas sobrevivam ao contexto que as justificava.

### Precisam ter exceção declarada

Um princípio sem caminho de exceção produz dois comportamentos ruins: contorno
silencioso, ou paralisia.

O que funciona:

```text
exceção é possível
exige justificativa registrada
com decisão de quem tem alcance para tomá-la
e prazo de revisão
```

O registro das exceções é informação valiosa: se um princípio acumula exceções, ele está
errado — não as exceções.

Essa é uma das formas mais confiáveis de descobrir que um princípio precisa mudar.

### O teste do caso concreto

Antes de publicar um princípio, aplique-o a três decisões reais recentes.

```text
ele teria apontado uma direção?           se não, é vago
a direção teria sido a certa?             se não, o princípio está errado
alguém teria discordado?                  se não, ele é óbvio
```

Princípios escritos em reunião, sem esse teste, tendem a ser declarações de virtude —
porque é isso que soa bem numa reunião.

### Princípio não é padrão nem regra técnica

```text
princípio  orienta julgamento — "preferimos X a Y"
padrão     prescreve — "use a biblioteca Z para logs"
regra      verifica — a esteira falha se não houver marcação
```

Ver [padrões](standards.md).

Misturar os três produz um documento longo em que ninguém distingue o que é orientação
do que é obrigação — e, na dúvida, tudo vira obrigação.

### Princípios competem entre si, e isso é útil

Um conjunto bem construído contém tensões: dois princípios que, em certos casos, apontam
direções diferentes.

```text
"preferimos consistência entre times a otimização local"
"preferimos autonomia dos times a padronização"
```

Isso parece defeito e é característica. A tensão explicita um trade-off real da
organização, e força a discussão a acontecer no caso concreto — que é onde ela deve
acontecer.

O que não funciona é ordenar os princípios por prioridade fixa: uma hierarquia rígida
transforma o segundo princípio em decoração, porque o primeiro sempre vence.

O que funciona é registrar, quando a tensão aparece, qual venceu e por quê. Ver
[decisões de arquitetura](../18-architecture-decisions/index.md).

Depois de alguns registros, o padrão emerge — e ele é mais informativo que qualquer
regra de precedência definida antecipadamente.

### O princípio precisa ser testável contra a decisão de amanhã

Um teste operacional que separa princípio de slogan: pegue uma decisão que ainda não foi
tomada, e verifique se o princípio aponta uma direção.

```text
decisão pendente   "vamos manter o cadastro de clientes em cada serviço,
                    ou centralizar?"
princípio 1        "dados pertencem a um único sistema"  → aponta: centralizar
princípio 2        "buscamos simplicidade"               → não aponta nada
```

O segundo pode ser usado para defender qualquer um dos lados — manter é simples porque
evita integração; centralizar é simples porque elimina reconciliação.

Essa ambiguidade não é defeito de redação. É o sinal de que o princípio não escolheu
nada.

E há um segundo teste, mais duro: pergunte a três pessoas de times diferentes o que o
princípio implica numa situação concreta. Se as respostas divergirem, as implicações não
foram escritas — e o princípio está produzindo divergência em vez de coerência.

## Modelo Mental

**Um princípio útil escolhe um lado.** Se ninguém discordaria, ele não decide nada.

## Quando Usar

- Onde decisões semelhantes são tomadas por times diferentes.
- Para orientar sem centralizar.
- Quando há tensão recorrente entre valores — custo contra velocidade, autonomia contra
  padronização.
- Para dar critério a revisões de arquitetura.

## Quando Não Usar

**Como declaração de virtude.** Se ninguém discordaria, o princípio não separa
alternativas — ele apenas afirma algo com que todos concordam.

**Em número grande.** Acima de oito ou dez, ninguém lembra, e princípios que não são
lembrados não orientam nada.

**Sem implicações.** A frase sozinha admite interpretações divergentes, e a coerência
que ela deveria produzir não acontece.

**Sem caminho de exceção.** Produz contorno silencioso, ou paralisia — e o registro das
exceções é justamente o mecanismo que revela quando o princípio precisa mudar.

**No lugar de padrão** ou de verificação automatizada. Princípios orientam julgamento;
onde a escolha específica importa e pode ser verificada, um princípio é o instrumento
errado.

**Sem revisão periódica.** Um princípio que fazia sentido com 30 engenheiros pode estar
errado com 300, e restrições que sobrevivem ao contexto que as justificava produzem
atrito sem propósito.

## Alternativas

- **[Padrões](standards.md)** — quando a escolha específica importa.
- **Caminho pavimentado** — o padrão embutido, sem depender de o time lembrar. Ver
  [plataformas internas](../14-devops-and-platform/internal-developer-platforms.md).
- **Verificação automatizada** — para o que pode ser checado.
- **Registros de decisão** — o histórico do que foi decidido e por quê, que orienta por
  precedente. Ver
  [decisões de arquitetura](../18-architecture-decisions/index.md).

A última é subestimada: um repositório de decisões passadas orienta melhor que princípios
abstratos, porque traz o contexto junto.

## Trade-offs

| Poucos princípios | Muitos |
|---|---|
| Memoráveis | Esquecidos |
| Cobrem menos casos | Cobertura ampla |
| Aplicados | Ignorados |

| Princípio | Regra verificada |
|---|---|
| Orienta julgamento | Não admite nuance |
| Depende de interpretação | Objetiva |
| Cobre o não previsto | Só o previsto |

## Modos de Falha

**Princípio vago.** Não separa alternativas.

**Conjunto grande.** Ninguém lembra.

**Sem implicações.** Interpretações divergentes.

**Sem exceção.** Contorno silencioso.

**Envelhecido.** Restringe por um motivo que já não existe.

**Usado para bloquear.** Citado apenas quando alguém quer dizer não.

## Erros Comuns

**Escrever virtudes.**

**Não testar contra decisões reais.**

**Não declarar implicações.**

**Confundir com padrão.**

**Não registrar exceções.**

**Não revisar.**

## Exemplo Real

Uma empresa de logística tinha 23 princípios de arquitetura, publicados três anos antes.

Uma revisão testou cada um contra as vinte decisões arquiteturais mais recentes:

```text
não apontaram direção nenhuma    14 princípios
apontaram, e ninguém discordaria  6
apontaram e foram decisivos       3
```

Os 14 primeiros eram declarações de virtude: "buscamos qualidade", "valorizamos a
simplicidade", "somos orientados a dados".

E, dos 23, apenas 4 tinham sido citados em alguma discussão nos três anos — sempre para
justificar uma recusa, nunca para orientar uma escolha.

A reformulação produziu 6 princípios, cada um com lado perdedor explícito e implicações:

```text
1. Preferimos comprar a construir, exceto no que nos diferencia.
   → toda proposta de construir compara com alternativas de mercado
   → capacidades classificadas como comuns não recebem investimento de engenharia

2. Dados pertencem a um único sistema; os demais consomem.
   → nenhum sistema escreve na base de outro
   → todo conjunto de dados tem dono declarado

3. Preferimos consistência entre times a otimização local.
   → tecnologias fora do caminho pavimentado exigem justificativa e assunção da operação

4. Preferimos reversibilidade a acerto na primeira tentativa.
   → decisões de porta dupla são tomadas rápido, pelo time, e revisadas depois

5. Integração é por contrato explícito, nunca por acesso ao banco alheio.

6. O time que constrói opera o que constrói.
   → nenhuma entrega é considerada pronta sem telemetria e alertas
```

Cada um com implicações listadas, exceção possível com registro, e revisão anual.

Nos dezoito meses seguintes, o registro de exceções acumulou 11 casos — e nove deles
eram do princípio 3. A revisão anual reescreveu esse princípio: a lista de tecnologias
suportadas tinha ficado estreita demais para a variedade de problemas da empresa.

O que a equipe registra: o registro de exceções foi o mecanismo mais valioso. Ele
transformou "esse princípio atrapalha" — uma reclamação — em evidência de que o princípio
precisava mudar.

## Conceitos Relacionados

- [Padrões](standards.md) — a prescrição específica.
- [Governança Corporativa](enterprise-governance.md).
- [Níveis de Arquitetura](architecture-levels.md).
- [Decisões de Arquitetura](../18-architecture-decisions/index.md).

## Exercício Prático

Pegue os princípios da sua organização e teste cada um contra três decisões reais
recentes.

Os que não teriam apontado direção, ou com que ninguém discordaria, não são princípios —
são declarações.

## Perguntas de Entrevista

- Qual o teste que distingue um princípio útil de uma declaração de virtude?
- Por que implicações são necessárias?
- O que o acúmulo de exceções indica?

## Para Aprofundar

- Open Group. *TOGAF Standard* — princípios de arquitetura.
- Ross, Jeanne et al. *Enterprise Architecture as Strategy*. HBS Press, 2006.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
