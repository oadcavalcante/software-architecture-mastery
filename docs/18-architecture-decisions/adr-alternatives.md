---
id: adr-alternatives
title: Alternativas Consideradas
sidebar_position: 6
description: Onde o raciocínio arquitetural fica visível — e a condição sob a qual cada descarte se desfaz.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor registra alternativas com critério e condição de reversão, em vez
  de listá-las para justificar a escolha feita.
prerequisites: [adr-structure]
related: [adr-context, adr-decision, superseding-decisions]
canonical_for: [alternativa descartada, condição de reversão, critério de comparação]
content_version: 1
last_reviewed: 2026-08-29
---

# Alternativas Consideradas

## Visão Geral

A seção de alternativas é onde o **raciocínio** aparece. As demais registram o resultado;
esta registra o pensamento.

Ela cumpre três funções, em ordem crescente de valor:

```text
mostra que houve avaliação        a mais óbvia, a menos útil
evita redecidir                   alguém que proponha a opção B encontra a análise
permite reverter com informação   se a razão do descarte cair, a opção volta
```

A terceira é a que justifica o esforço. Uma alternativa registrada com a **condição sob a
qual ela voltaria a ganhar** transforma o ADR de registro histórico em instrumento vivo.

## Problema

A seção de alternativas típica:

```text
"Consideramos MySQL e MongoDB. PostgreSQL foi escolhido por ser mais
adequado ao nosso caso de uso."
```

Isso não informa. Não diz o que foi comparado, com qual critério, nem o que teria feito o
resultado ser outro.

Pior: escrita assim, ela cumpre a função de **justificar uma escolha já feita** em vez de
registrar uma comparação. É reconhecível pelo padrão — todas as alternativas têm defeitos,
a escolhida não tem nenhum.

Uma seção honesta de alternativas tem uma propriedade incômoda: ela deixa claro o que se
perdeu ao escolher.

## Conceitos Centrais

### Cada alternativa precisa de três coisas

```text
o que era              descrição suficiente para reconhecer a opção
por que foi descartada o critério específico que a eliminou
o que a traria de volta a condição que inverteria o resultado
```

A terceira é a rara. Exemplo completo:

```text
Alternativa: manter processamento síncrono

Descartada porque o parceiro de pagamento tem 4,1% de indisponibilidade
medida nos últimos 12 meses, e nosso contrato exige 99,9%. Síncrono
propagaria a indisponibilidade dele para nós.

Voltaria a ganhar se: a disponibilidade do parceiro subir acima de
99,95% de forma sustentada, ou se migrarmos para um parceiro com esse
nível. Nesse caso, o custo operacional da fila deixa de se pagar.
```

Isso é revisável. Alguém em 2027 pode medir a disponibilidade do parceiro e concluir sozinho
se a decisão ainda vale.

### Critérios explícitos, aplicados igualmente

```text
critério                    opção A   opção B   opção C
custo operacional mensal    baixo     alto      médio
experiência do time         alta      nenhuma   média
latência p99                180 ms    40 ms     90 ms
esforço de migração         0         3 meses   1 mês
risco de dependência        médio     baixo     alto
```

Uma tabela como essa força honestidade: fica visível quando a opção escolhida perde em
algum critério, e fica visível qual critério pesou mais.

O erro correspondente é escolher os critérios **depois** de saber a resposta, de modo que a
opção preferida vença em todos.

### O status quo é uma alternativa

A opção mais frequentemente omitida: **não fazer nada**.

```text
"Alternativa: manter como está.
Descartada porque o custo de manutenção cresceu 40% em 18 meses e a
equipe gasta ~30% do tempo em correções nesta área."
```

Registrar o status quo obriga a quantificar o problema. ADRs que não o consideram
frequentemente registram mudanças que não precisavam acontecer.

Ver [dívida técnica](/01-fundamentals/technical-debt.md).

### Opções descartadas cedo também contam

Uma alternativa eliminada em cinco minutos merece uma linha:

```text
"Construir do zero: descartado sem análise detalhada — o esforço
estimado (6+ meses) não cabia no prazo contratual de março."
```

Isso vale por dois motivos. Evita que alguém proponha a mesma coisa depois. E deixa
explícito que a eliminação foi rápida, o que sinaliza onde uma reavaliação teria mais
espaço.

### Alternativas descartadas por razão não técnica

As mais desconfortáveis e as mais valiosas:

```text
"Descartada porque a área de segurança não aprova provedores fora da
lista corporativa."

"Descartada porque o time não tem experiência e o prazo não permite
aprendizado."

"Descartada porque uma decisão organizacional anterior padronizou X."
```

Omitir esse tipo de razão produz ADRs que parecem tecnicamente inconsistentes anos depois —
alguém lê e não entende por que a opção melhor foi rejeitada.

E são as razões que mais mudam com o tempo, o que as torna as mais úteis como gatilho de
revisão.

### O efeito de escrever

Esta é a seção onde as decisões mudam durante a redação. O mecanismo é direto: forçar a
articulação do motivo do descarte expõe motivos que não sobrevivem à articulação.

```text
"descartamos porque é complexo"    → complexo comparado a quê? com que medida?
"descartamos porque não escala"    → até que volume? qual o nosso volume?
"descartamos porque é legado"      → isso é um critério?
```

Escrever a seção **antes** de fechar a decisão é o que captura esse valor. Escrita depois,
ela só documenta.

### Quem defendia cada opção

Um detalhe barato e de retorno alto: registrar quem sustentava cada alternativa.

```text
"A opção B foi defendida por duas pessoas do time de dados, com base
na necessidade de reprocessamento — requisito que não estava no
levantamento inicial."
```

Isso preserva duas informações que evaporam rápido. Primeiro, que a objeção existiu, o que
importa se ela se mostrar certa depois. Segundo, **quem tem o contexto** — se a decisão for
reaberta em dois anos, essas pessoas são as primeiras a consultar, e a discussão começa de
um patamar mais alto.

E há um efeito na própria discussão: alternativas com defensor nomeado costumam ser
analisadas com mais cuidado que alternativas listadas por dever de rigor.

## Modelo Mental

**Para cada descarte, a condição que o desfaz.** Sem isso, a lista justifica; com isso, ela
serve.

## Quando Usar

- Em todo ADR de decisão significativa.
- Escrita antes de fechar a decisão, não depois.
- Com tabela de critérios quando houver mais de três opções comparáveis.

## Quando Não Usar

**Como justificativa retroativa.** É o uso mais comum e o menos útil.

**Listando alternativas nunca consideradas** para parecer rigoroso.

**Sem a condição de reversão.**

**Sem o status quo** entre as opções.

**Omitindo razões não técnicas.**

**Com critérios escolhidos depois da resposta.**

## Alternativas

- **Tabela de decisão** — mais compacta que prosa, melhor para comparar mais de três
  opções.
- **Documento de comparação separado** — quando a avaliação foi extensa; o ADR referencia.
- **Prova de conceito registrada** — quando a comparação foi empírica, os números
  substituem o argumento.
- **Y-Statement** — comprime alternativas numa cláusula, para decisões menores.

## Trade-offs

| Alternativas detalhadas | Resumidas |
|---|---|
| Revisáveis | Rápidas de escrever |
| Evitam redecidir | Podem não bastar |
| Expõem o que se perdeu | Parecem mais firmes |

| Critérios em tabela | Prosa |
|---|---|
| Comparação honesta | Mais nuance |
| Difícil de enviesar | Fácil de enviesar |
| Rígido | Flexível |

## Modos de Falha

**Justificativa retroativa.** Todas as opções ruins, a escolhida perfeita.

**Sem condição de reversão.** Registro histórico sem uso futuro.

**Status quo ausente.** Mudança sem problema quantificado.

**Razões não técnicas omitidas.** ADR inexplicável depois.

**Critérios enviesados.** Escolhidos para produzir a resposta desejada.

**Alternativas inventadas.** Listadas sem terem sido consideradas de verdade.

## Erros Comuns

**Escrever a seção depois de decidir.**

**Não quantificar o descarte** — "não escala" sem número.

**Omitir a opção que quase venceu**, que é justamente a mais informativa.

**Não registrar quem defendia cada opção.**

**Tratar como formalidade** a ser preenchida antes da revisão.

## Exemplo Real

Uma empresa de comércio eletrônico decidiu em 2023 construir seu próprio serviço de busca
em vez de usar um serviço gerenciado. O ADR listava três alternativas, todas descartadas
com uma linha cada.

Em 2025, com o serviço próprio consumindo dois engenheiros em tempo integral, a decisão foi
reaberta. O ADR não ajudou: as razões registradas eram "custo" e "flexibilidade", sem
números.

A reconstrução do raciocínio original, por entrevistas, revelou:

```text
custo estimado do serviço gerenciado    ~14 mil/mês, para o volume de 2023
custo do serviço próprio, estimado      ~4 mil/mês de infraestrutura
                                        + "algum tempo de engenharia"
```

O "algum tempo de engenharia" nunca tinha sido quantificado. Medido em 2025, era de dois
engenheiros em tempo integral — cerca de 60 mil por mês em custo de pessoal.

E o volume tinha triplicado, o que teria elevado o custo do serviço gerenciado para cerca
de 30 mil — ainda metade do custo real do serviço próprio.

A alternativa vencedora, em 2023, tinha vencido por um critério que ninguém aplicou por
inteiro.

O que mudou:

**Migração para o serviço gerenciado**, concluída em cinco meses.

**Regra de custo total** nas alternativas: toda comparação de custo precisa incluir custo
de pessoal estimado, com a premissa explícita. Uma linha de "0,5 engenheiro/mês" é
suficiente e muda a conclusão com frequência.

**Condição de reversão obrigatória** por alternativa. O modelo adotado: "esta opção
venceria se ___".

**Tabela de critérios** obrigatória quando houver três ou mais opções, com os critérios
definidos e pesados **antes** da avaliação.

Numa revisão dos 40 ADRs seguintes, escritos sob as regras novas:

```text
ADRs em que a inclusão de custo de pessoal mudou a conclusão     7
ADRs em que a definição prévia de critérios mudou a conclusão    5
alternativas reabertas por condição de reversão atingida         3
```

A leitura que a equipe faz: os 7 casos em que o custo de pessoal mudou a conclusão são o
argumento mais concreto que se conseguiu produzir para a prática. Todos eram decisões de
construir contra comprar, e em todos a intuição da equipe apontava para construir.

## Conceitos Relacionados

- [Contexto](/18-architecture-decisions/adr-context.md) — as forças que definem os critérios.
- [Superação](/18-architecture-decisions/superseding-decisions.md) — o que acontece quando a condição de reversão é
  atingida.
- [Trade-offs](/20-trade-offs/index.md) — o material desta seção.
- [Dívida Técnica](/01-fundamentals/technical-debt.md) — o custo do status quo.

## Exercício Prático

Pegue um ADR do seu time e, para cada alternativa descartada, escreva a frase "esta opção
venceria se ___".

As que você não conseguir completar foram descartadas sem critério verificável — e são as
que vão ser redecididas.

## Perguntas de Entrevista

- Por que a condição de reversão é a parte mais valiosa de uma alternativa registrada?
- Como se reconhece uma seção de alternativas escrita como justificativa retroativa?
- Por que o status quo precisa ser listado como alternativa?

## Para Aprofundar

- Nygard, Michael. *Documenting Architecture Decisions*. 2011.
- *MADR — Markdown Any Decision Records* — adr.github.io/madr.
- Ford, Neal et al. *Software Architecture: The Hard Parts*. O'Reilly, 2021.
