---
id: what-is-an-adr
title: O Que É um ADR
sidebar_position: 1
description: Um registro curto de uma decisão arquitetural e do contexto que a produziu.
doc_type: foundation
level: 5
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor sabe o que um ADR é, o que ele não é, e reconhece quais decisões
  merecem um.
prerequisites: [architecture-documentation]
related: [why-adrs-matter, adr-structure, adr-status]
canonical_for: [ADR, registro de decisão de arquitetura, decisão significativa]
content_version: 1
last_reviewed: 2026-08-29
---

# O Que É um ADR

## Visão Geral

Um **ADR** — *Architecture Decision Record*, registro de decisão de arquitetura — é um
documento curto que registra uma decisão arquitetural, o contexto em que ela foi tomada,
as alternativas consideradas e as consequências aceitas.

Ele foi proposto por Michael Nygard em 2011, e a proposta inteira cabe em uma frase:
**escreva um arquivo curto, no repositório, toda vez que tomar uma decisão que seja difícil
de reverter.**

O formato é simples de propósito. O que faz um ADR funcionar não é a estrutura — é o que
ele preserva: a razão, que é a parte que o código não guarda.

## O Problema

Código registra o resultado de uma decisão, nunca o raciocínio.

```text
o código mostra   que existe uma fila entre dois serviços
não mostra        que a alternativa síncrona foi descartada
                  porque o parceiro tinha 4% de indisponibilidade
                  e o contrato exigia 99,9% no nosso lado
```

Dois anos depois, alguém propõe remover a fila. A resposta correta depende de uma
informação que não está em lugar nenhum: se o parceiro melhorou, remover é razoável; se
não, é um incidente esperando.

Sem registro, sobram três comportamentos, todos ruins:

```text
manter por medo         "não mexa, deve ter uma razão"
reverter por ignorância e redescobrir a razão via incidente
redecidir do zero       gastando de novo o esforço já gasto
```

O terceiro é o mais caro e o menos visível: organizações redecidem as mesmas questões
repetidamente porque nada registra que elas já foram decididas.

## Conceitos Centrais

### O que caracteriza um ADR

```text
curto              uma a duas páginas; se não cabe, são várias decisões
uma decisão        um ADR, uma decisão
datado             o contexto é sempre o daquele momento
imutável           não se edita; supera-se
versionado         vive no repositório, ao lado do código
numerado           referenciável — "ver ADR-014"
```

A imutabilidade é a propriedade menos intuitiva e a mais importante. Um ADR não é
documentação do estado atual — é o **registro de um evento**: em tal data, com tal
informação, decidiu-se assim. Mudar de ideia produz um ADR novo. Ver
[status](/18-architecture-decisions/adr-status.md) e [superação](/18-architecture-decisions/superseding-decisions.md).

### O que é uma decisão significativa

O critério de Nygard: **decisões arquiteturalmente significativas** — as que afetam
estrutura, características não funcionais, dependências, interfaces ou técnicas de
construção.

Um teste prático, mais operacional:

```text
é caro de reverter?              → provável ADR
afeta mais de um time?           → provável ADR
alguém vai perguntar "por quê"?  → provável ADR
foi discutida por mais de uma hora? → provável ADR
é reversível numa tarde?         → não precisa
```

Ver [decisões reversíveis e irreversíveis](/18-architecture-decisions/adr-context.md).

Escolher a biblioteca de datas não é ADR. Escolher expor a API como REST ou gRPC é.
Escolher o nome de uma variável nunca é. Escolher permitir que dois serviços compartilhem
um banco é — e é exatamente o tipo de decisão que costuma ser tomada sem registro.

### O que um ADR não é

```text
não é especificação      não descreve como implementar
não é documentação do sistema  não descreve o que existe hoje
não é proposta           a proposta vira ADR quando é aceita
não é ata de reunião     registra a decisão, não a discussão
não é política           não obriga outros sistemas
```

A segunda confusão é a mais comum. Um leitor que quer saber como o sistema é hoje deve
olhar a [descrição de arquitetura](/17-architecture-documentation/architecture-descriptions.md)
ou os diagramas. O conjunto de ADRs é um histórico, e lê-lo do começo ao fim é
arqueologia, não orientação.

### Onde ele vive

No repositório do sistema a que a decisão pertence:

```text
docs/adr/0001-usar-postgresql.md
docs/adr/0002-processar-pedidos-de-forma-assincrona.md
docs/adr/0003-separar-o-servico-de-faturamento.md
```

Isso não é detalhe de organização. ADR em wiki separado se desconecta do código, não entra
na revisão e não é encontrado por quem está lendo o sistema. Ver
[padrões de documentação](/17-architecture-documentation/documentation-standards.md).

Decisões que valem para vários sistemas pertencem a outro nível — governança — e não a um
repositório específico. Ver
[governança](/19-architecture-governance/index.md).

### O custo é baixo e o retorno é assimétrico

Escrever um ADR custa entre vinte minutos e uma hora. Isso é pouco comparado ao esforço já
gasto na decisão que ele registra — se a decisão levou duas semanas de discussão, o
registro é 1% do custo.

E o retorno é assimétrico: a maior parte dos ADRs nunca será lida, e os poucos que forem
serão lidos no momento exato em que alguém está prestes a desfazer algo importante sem
saber por quê.

É esse perfil — custo baixo, retorno raro e alto — que justifica escrever mesmo sem
demanda comprovada, ao contrário da maior parte da documentação. Ver
[princípios de documentação](/17-architecture-documentation/documentation-principles.md).

## Por Que Isso Importa

**Porque a razão é o que se perde primeiro.** Estrutura permanece visível no código;
justificativa some com as pessoas. Em times com rotatividade normal, dois anos bastam para
que ninguém saiba por que o sistema é como é.

**Porque decisões sem contexto não podem ser revistas.** Uma decisão registrada pode ser
reavaliada quando o contexto mudar — a pergunta vira "a razão ainda vale?", que é
respondível. Sem registro, a única pergunta possível é "alguém sabe por quê?", que
normalmente não é.

**Porque escrever força o raciocínio.** Ter de listar alternativas e consequências expõe
decisões tomadas por hábito. Uma parcela relevante dos ADRs muda de conclusão durante a
escrita — o autor descobre, ao tentar justificar, que não consegue.

**Porque o custo de não ter é invisível.** Ninguém mede o tempo gasto redescobrindo razões
ou redecidindo o já decidido. Ele aparece como lentidão difusa, não como item de
orçamento.

**Porque dá um lugar para o desacordo.** Uma decisão registrada com alternativas e
consequências pode ser contestada com argumento. Uma decisão tácita só pode ser contestada
com autoridade.

## Erros Comuns

**Registrar tudo.** ADR para escolha de biblioteca trivial dilui o conjunto e faz com que
ninguém leia nenhum.

**Registrar nada.** O extremo oposto, e o mais frequente.

**Editar em vez de superar.** Destrói a propriedade que dá valor ao formato.

**Escrever depois, para o histórico.** Um ADR escrito seis meses depois perde o contexto —
o autor já sabe o desfecho e reconstrói a justificativa em vez de registrá-la.

**Confundir com documentação do sistema.** Leva a manter ADRs "atualizados", o que os
destrói.

**Omitir alternativas.** Sem elas, o ADR afirma sem argumentar. Ver
[alternativas](/18-architecture-decisions/adr-alternatives.md).

**Deixar em wiki separado.** Desconectado do código, some.

## Exemplo Real

Um time de plataforma com 14 pessoas herdou um sistema de sete anos e 31 serviços. A
documentação existente eram diagramas razoavelmente corretos e nenhuma justificativa.

Durante os primeiros seis meses, o time registrou toda vez que alguém perguntou "por que
isto é assim?" e ninguém soube responder. Foram 43 ocorrências.

Nove delas geraram trabalho concreto:

```text
4 decisões revertidas, depois revertidas de novo após incidente
3 investigações longas para reconstruir a razão (2 a 5 dias cada)
2 decisões mantidas por medo, sem ninguém saber se ainda faziam sentido
```

Um caso: um serviço de notificações limitava o envio a 50 mensagens por segundo. Ninguém
sabia por quê. O limite foi elevado numa otimização, e três dias depois o provedor de SMS
bloqueou a conta por exceder o contrato — que era de 50 por segundo.

O time passou a escrever ADRs, com uma regra deliberadamente frouxa: **escreva quando a
discussão passar de uma hora, ou quando você suspeitar que alguém vai perguntar por quê.**

Em dois anos, 61 ADRs. Uma amostragem de uso mostrou:

```text
ADRs nunca consultados                        44
consultados ao menos uma vez                  17
que evitaram uma reversão indevida             6 (identificados nominalmente)
que mudaram de conclusão durante a escrita     9
```

Os 44 nunca consultados são o custo: cerca de 30 horas de escrita. Os 6 que evitaram
reversões pagaram isso várias vezes — cada reversão indevida anterior tinha custado dias.

E os 9 que mudaram de conclusão durante a escrita foram o efeito não previsto. Em todos, o
autor começou a escrever a seção de alternativas e percebeu que a opção descartada era
melhor.

O que o time registra: a regra frouxa foi acertada. Uma tentativa anterior, em outra
empresa, tinha usado critério estrito e comitê de aprovação — e produziu 4 ADRs em um ano,
todos escritos para o comitê.

## Conceitos Relacionados

- [Por Que ADRs Importam](/18-architecture-decisions/why-adrs-matter.md) — o argumento em detalhe.
- [Estrutura do ADR](/18-architecture-decisions/adr-structure.md) — as seções.
- [Status](/18-architecture-decisions/adr-status.md) — o ciclo de vida.
- [Arquitetura como Decisões](/01-fundamentals/architecture-as-decisions.md) — a base
  conceitual.

## Exercício Prático

Pense em uma decisão arquitetural do seu sistema cuja razão você não conhece.

Pergunte a três pessoas por que é assim. Se as respostas divergirem — ou se ninguém souber
— você encontrou um ADR que deveria ter sido escrito.

## Perguntas de Entrevista

- O que distingue um ADR da documentação do sistema?
- Por que um ADR não deve ser editado quando a decisão muda?
- Que teste prático decide se uma decisão merece ADR?

## Para Aprofundar

- Nygard, Michael. *Documenting Architecture Decisions*. 2011.
- Keeling, Michael. *Design It!*. Pragmatic Bookshelf, 2017.
- Ford, Neal et al. *Fundamentals of Software Architecture*. O'Reilly, 2020.
