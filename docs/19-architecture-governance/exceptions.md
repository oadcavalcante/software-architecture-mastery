---
id: exceptions
title: Exceções
sidebar_position: 6
description: O caminho legítimo para não cumprir um padrão — sem ele, o descumprimento acontece em silêncio.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor opera um processo de exceção com prazo, dono e expiração, e sabe ler
  o padrão de exceções como diagnóstico.
prerequisites: [governance-standards]
related: [governance-standards, compliance, governance-pathologies]
canonical_for: [exceção com prazo, expiração de exceção, exceção permanente, exceção como diagnóstico]
content_version: 1
last_reviewed: 2026-08-29
---

# Exceções

## Visão Geral

Todo padrão encontra um caso em que não se aplica. A questão não é se isso acontecerá, e sim
o que acontece quando acontece:

```text
sem processo de exceção   o padrão é contornado em silêncio
com processo pesado       o padrão é contornado em silêncio, mais devagar
com processo leve         o desvio fica visível, com prazo e dono
```

Um processo de exceção não é uma concessão à indisciplina. Ele é o mecanismo que **mantém a
governança informada sobre a realidade** — e uma governança que não sabe onde está sendo
descumprida não governa nada.

E há um uso secundário, mais valioso que o primeiro: o conjunto de exceções é o melhor
diagnóstico disponível sobre a qualidade dos padrões.

## Problema

Sem caminho legítimo, o descumprimento não desaparece — ele fica invisível.

```text
o time precisa entregar
o padrão não se aplica ou custa demais
pedir exceção leva seis semanas e pode ser negado
o time segue e não conta
a auditoria descobre 14 meses depois, ou nunca
```

O resultado é o pior possível: o desvio existe, ninguém sabe onde, e a organização acredita
estar conforme.

O extremo oposto tem custo diferente. Exceções concedidas sem prazo viram permanentes, e o
padrão morre por erosão — depois de trinta exceções indefinidas, não há mais padrão, apenas
um documento.

## Conceitos Centrais

### Barato de pedir, caro de manter

A assimetria correta:

```text
pedir       um formulário curto, resposta em dias
conceder    com prazo, dono e plano de saída
manter      renovação exige justificar de novo
```

Isso inverte o incentivo usual. Quando pedir é caro, contorna-se em silêncio; quando manter
é caro, a exceção tende a se resolver.

### Prazo é obrigatório

```text
exceção sem prazo    vira permanente por omissão
exceção com prazo    tem data em que alguém precisa agir
```

Um prazo de 6 a 12 meses funciona na maior parte dos casos. O que importa menos é a duração
e mais a existência: a data é o que força a reavaliação.

E a expiração precisa ser **automática**: no dia seguinte ao vencimento, o sistema aparece
como desvio, com alerta ao dono. Sem isso, a renovação depende de alguém lembrar, e ninguém
lembra. Ver [conformidade](/19-architecture-governance/compliance.md).

### O que uma exceção precisa registrar

```text
qual padrão                     o desvio específico
por quê                         a razão, com o custo de cumprir
o que se faz em vez disso       a mitigação
qual o risco aceito             e quem o aceita
prazo                           data de expiração
plano de saída                  o que precisa acontecer para convergir
dono                            quem responde
```

O plano de saída é o campo que distingue exceção de desistência. Sem ele, a exceção é uma
renúncia com data.

### Quem aprova depende do risco

```text
risco baixo, reversível        o próprio time registra, sem aprovação
risco médio                    aprovação de quem responde pelo padrão
risco de segurança ou
  regulatório                  aprovação de quem responde pelo risco
```

O primeiro nível é o mais importante e o mais ausente. Exceções de baixo risco que só
precisam ser **registradas** — não aprovadas — mantêm a visibilidade sem criar fila, e são a
maior parte dos casos.

### Exceção permanente é sinal, não é exceção

Quando uma exceção é renovada três vezes, ela deixou de ser exceção:

```text
o padrão está errado                → corrija o padrão
o padrão não se aplica àquela classe → restrinja o escopo do padrão
a migração nunca terá prioridade    → aceite formalmente e registre como dívida
```

Manter a ficção de que é temporária custa esforço de renovação e distorce as métricas de
conformidade. Ver [padrões](/19-architecture-governance/governance-standards.md).

### O conjunto de exceções é diagnóstico

Este é o uso de maior valor, e o menos explorado:

```text
um padrão com muitas exceções          o padrão está errado ou é caro demais
exceções concentradas num time         falta apoio, ou o contexto dele é diferente
exceções concentradas numa classe
  de sistema                           o escopo do padrão está largo demais
exceções pedidas sempre no fim
  do projeto                           o padrão não é conhecido a tempo
nenhuma exceção pedida                 ou o padrão é perfeito, ou é contornado
```

A última linha merece atenção. Zero exceções costuma ser sinal ruim, não bom.

### O custo de cumprir precisa ser registrado

```text
"cumprir custaria ~6 semanas de um time de 4, e o prazo contratual é
em 5 semanas"
```

Esse número é o insumo de duas decisões futuras: se a exceção merece renovação, e se o
padrão precisa de melhor caminho de adoção.

Sem ele, a discussão de renovação recomeça do zero, com argumentos qualitativos.

### A exceção não deve ser mais barata que cumprir

Um risco real de tornar o pedido fácil: a exceção vira o caminho padrão.

```text
cumprir o padrão    2 semanas de migração
pedir exceção       5 minutos de formulário
```

A assimetria correta não é eliminar essa diferença — ela é inevitável, e é a razão de o
processo existir. É garantir que a exceção **continue custando** ao longo do tempo: prazo
curto, renovação com justificativa nova, e o desvio visível num painel que o time e o gestor
enxergam.

O que mantém o incentivo é a permanência do custo, não a altura da barreira inicial.

## Modelo Mental

**Barato de pedir, com prazo e expiração automática.** Sem caminho legítimo, o desvio existe
do mesmo jeito — só que invisível.

## Quando Usar

- Sempre que houver padrão obrigatório.
- Com registro sem aprovação para desvios de baixo risco.
- Com expiração automática, sem exceção.
- Lendo o conjunto periodicamente como diagnóstico dos padrões.

## Quando Não Usar

**Sem prazo.**

**Sem plano de saída.**

**Com processo pesado para risco baixo.**

**Sem expiração automática.**

**Renovando indefinidamente** sem reconhecer que o padrão precisa mudar.

**Sem registrar o custo de cumprir.**

## Alternativas

- **Restringir o escopo do padrão** — quando as exceções se concentram numa classe, o
  problema é o escopo.
- **Corrigir o padrão** — quando as exceções são muitas.
- **Aceitar como dívida** — quando a convergência não vai acontecer, registrá-la como
  dívida é mais honesto que renovar exceção. Ver
  [dívida técnica](/01-fundamentals/technical-debt.md).
- **Padrão como recomendação** — se a exceção é a regra, ele não deveria ser obrigatório.

## Trade-offs

| Exceção fácil | Difícil |
|---|---|
| Desvio visível | Desvio silencioso |
| Risco de erosão | Padrão preservado no papel |
| Diagnóstico rico | Sem informação |

| Com prazo curto | Longo |
|---|---|
| Reavaliação frequente | Menos atrito |
| Custo de renovação | Vira permanente |
| Pressão por convergir | Estabilidade |

## Modos de Falha

**Sem processo.** Descumprimento silencioso.

**Processo pesado.** Mesma coisa, com atraso.

**Sem prazo.** Permanência por omissão.

**Sem expiração automática.** Renovação depende de memória.

**Exceção permanente mantida como temporária.** Ficção cara.

**Conjunto nunca analisado.** Perde-se o melhor diagnóstico disponível.

## Erros Comuns

**Exigir aprovação para tudo.**

**Não registrar o custo de cumprir.**

**Não ter plano de saída.**

**Tratar pedido de exceção como falha do time**, o que empurra o desvio para o silêncio.

**Não olhar o conjunto** — exceções são tratadas caso a caso e nunca lidas juntas.

## Exemplo Real

Uma seguradora tinha um processo de exceção arquitetural com aprovação de um comitê que se
reunia quinzenalmente. Prazo médio entre pedido e resposta: 24 dias.

Uma revisão de dois anos encontrou:

```text
exceções formalmente pedidas                  31
concedidas                                    28
negadas                                        3
com prazo definido                             6
expiradas e ainda em uso                      —  impossível saber
```

E uma verificação técnica independente, feita sobre os sistemas, encontrou:

```text
desvios de padrão detectados nos sistemas    147
com exceção registrada                        22
sem exceção                                  125
```

Cinco vezes mais desvios silenciosos que registrados. Nas entrevistas, o motivo apareceu de
forma consistente: 24 dias não cabiam em nenhum cronograma, e três negativas conhecidas
tinham criado a percepção de que pedir era arriscado.

O redesenho:

**Três níveis por risco.** Desvio de baixo risco é **registrado** pelo time, sem aprovação —
um formulário de cinco campos, com efeito imediato. Risco médio vai ao dono do padrão,
com resposta em até 5 dias úteis. Risco de segurança ou regulatório mantém aprovação, com
resposta em até 10 dias.

**Prazo obrigatório**, máximo de 12 meses, com expiração automática — o sistema volta a
aparecer como desvio no dia seguinte.

**Plano de saída obrigatório**, com dono nomeado.

**Custo de cumprir registrado**, em esforço estimado.

**Revisão trimestral do conjunto**, com uma pergunta: que padrões estão gerando exceções, e
por quê?

Dezoito meses depois:

```text
exceções registradas                         119
desvios sem exceção (verificação técnica)     23
prazo médio até resposta                       1,2 dia (baixo risco: imediato)
exceções expiradas e convergidas              61
exceções renovadas uma vez                    31
renovadas três vezes ou mais                   9
```

As 9 renovadas três vezes foram examinadas, e todas apontavam para o mesmo diagnóstico: dois
padrões estavam largos demais. Um deles exigia que todo serviço publicasse eventos no
barramento corporativo — o que não fazia sentido para serviços de leitura pura. O escopo foi
restringido, e 7 das 9 exceções deixaram de ser necessárias.

E a revisão trimestral encontrou outro padrão: 14 exceções concentradas num único time.
Investigado, o motivo era que aquele time mantinha sistemas herdados de uma aquisição, com
contexto tecnológico diferente. A resposta foi criar um conjunto de padrões específico para
essa classe, em vez de conceder exceções indefinidamente.

Na retrospectiva: o número de exceções **subiu** de 31 para 119, e isso foi tratado
como sucesso. O que caiu foi o desvio invisível — de 125 para 23. A métrica que importava
nunca tinha sido o número de exceções.

## Conceitos Relacionados

- [Padrões](/19-architecture-governance/governance-standards.md) — o que gera exceção.
- [Conformidade](/19-architecture-governance/compliance.md) — a expiração automática.
- [Patologias](/19-architecture-governance/governance-pathologies.md) — o processo que empurra ao silêncio.
- [Dívida Técnica](/01-fundamentals/technical-debt.md).

## Exercício Prático

Compare, no seu contexto, o número de exceções registradas com o número de desvios que uma
verificação técnica encontraria.

A razão entre os dois mede quanto do descumprimento está invisível — e é um número que
quase nenhuma organização conhece.

## Perguntas de Entrevista

- Por que zero exceções pedidas costuma ser sinal ruim?
- O que distingue uma exceção de uma desistência?
- Por que um aumento no número de exceções registradas pode indicar melhora?

## Para Aprofundar

- Ford, Neal et al. *Building Evolutionary Architectures*. 2ª ed. O'Reilly, 2022.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Dekker, Sidney. *The Field Guide to Understanding Human Error*. 3ª ed. CRC Press, 2014.
