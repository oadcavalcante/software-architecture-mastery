---
id: 09-present-and-defend
title: "Exercício 09 — Apresentar e Defender"
sidebar_position: 1
description: O último exercício — você tem a arquitetura certa e trinta minutos com quem controla o orçamento.
doc_type: exercise
level: 7
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor converte uma proposta técnica em pedido, risco e custo, e antecipa as
  objeções que a derrubariam.
prerequisites: [communication]
related: [architecture-presentations, stakeholder-management, negotiating-tradeoffs, cost-management]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-29
---

# Exercício 09 — Apresentar e Defender

:::info O último do percurso

Este exercício usa **a sua própria proposta** do
[exercício 07](/16-legacy-modernization/exercises/08-modernize-legacy.md). Se você não o
fez, faça antes — não há o que apresentar sem ela.

:::

## Contexto

Você tem trinta minutos com o conselho da cooperativa. Estão na sala:

```text
presidente          produtor rural, 61 anos, no cargo há 8 anos
                    decide, e decide por consenso do conselho
diretor financeiro  responde pelo orçamento; cético com
                    tecnologia desde um ERP que custou o triplo
                    do previsto em 2019
diretora de
  operações         responde pela safra; a única coisa que não
                    pode acontecer é a compra parar em abril
gerente de TI       seu par; concorda com você e tem pouco capital
                    político
```

E, fora da sala mas com voz: as duas pessoas que mantêm o sistema há dezenove anos. O presidente
vai perguntar a opinião delas depois da reunião.

## Requisitos

Você precisa sair da sala com:

```text
aprovação para contratar 8 engenheiros
orçamento plurianual, com o primeiro ano garantido
autorização para a fase 1 começar em 60 dias
```

## Restrições

```text
30 minutos, incluindo perguntas
o conselho não tem formação técnica
o ERP de 2019 é referência viva de projeto de tecnologia
  que deu errado
a diretora de operações tem poder de veto de fato,
  ainda que não formal
o orçamento anual é aprovado em novembro; estamos em setembro
as duas pessoas do sistema não estão na sala e serão
  consultadas depois
```

## Sua Tarefa

Produza:

1. O **pedido**, em uma frase, para ser dito nos primeiros trinta segundos.
2. A **razão**, com um número que não venha da área de tecnologia.
3. O que acontece **se nada for feito**, com data.
4. As **três objeções mais prováveis** e a resposta de cada uma.
5. O que você faz nas **conversas individuais** antes da reunião — com quem, e o que pergunta.
6. O **fechamento**, com o que ficou de fora e por quê.

## Perguntas que Você Deveria Fazer

```text
qual é a moeda de cada pessoa na sala?
qual número desta proposta a área financeira reconhece
  como confiável?
o que o ERP de 2019 fez de errado, e como esta proposta
  é diferente?
o que a diretora de operações precisa ouvir para não vetar?
o que as duas pessoas do sistema vão dizer quando forem
  consultadas?
qual é a menor aprovação que destrava a fase 1?
```

A última é a mais útil. Você pode não precisar de tudo agora.

## Critérios de Avaliação

Sua resposta está boa se:

- **O pedido vem primeiro**, antes de qualquer contexto. Trinta minutos com um conselho não
  comportam a ordem de engenharia.
- **O número não vem da tecnologia.** O prazo regulatório de 30 meses com multa é do jurídico; a
  aposentadoria das duas pessoas é do RH. Números que a engenharia produz sobre si mesma são
  descontados por quem já viu um ERP estourar.
- **A consequência de não fazer tem data.** "As duas pessoas se aposentam em 2030 e 2033, e
  formar substituto levou dois anos e meio na última tentativa" é uma frase com data e histórico.
- **A objeção do ERP de 2019 é endereçada antes de ser feita.** Ela vai ser feita.
- **A diretora de operações foi conversada antes.** O veto dela é real, e o argumento que a
  desarma — nenhuma mudança nos quatro meses de safra — é do plano, não da apresentação.
- **Você identificou a menor aprovação suficiente.** Talvez a fase 1 caiba no orçamento vigente,
  e o plurianual possa esperar novembro.

Sua resposta é fraca se ela é a arquitetura do exercício 07 traduzida para uma linguagem mais
simples. Simplificar não é traduzir.

## Discussão

:::details Abra depois de tentar

**Os primeiros trinta segundos** decidem a reunião:

```text
"Peço autorização para contratar oito engenheiros e começar em
 60 meses uma modernização do sistema de compra de safra.

 A razão imediata: a norma de rastreabilidade tem prazo de 30
 meses e multa. As duas pessoas que conseguem mexer no sistema
 estimaram 14 meses para implementá-la lá dentro, e elas se
 aposentam em 2030 e 2033.

 Se não fizermos nada, chegamos em 2030 com um sistema que
 ninguém sabe alterar e uma norma para cumprir."
```

Nenhuma palavra sobre arquitetura. O conselho não decide arquitetura; decide se aloca capital
diante de um risco.

**O número que não é seu.** A multa regulatória e as datas de aposentadoria são fatos externos.
A estimativa de 14 meses é das duas pessoas, não sua — e citá-las como fonte tem um efeito
adicional: quando o presidente as consultar depois, elas vão reconhecer o próprio número.

**O ERP de 2019** vai ser levantado, e a resposta precisa estar pronta:

```text
"O ERP foi uma substituição completa, com virada de chave e
 orçamento fechado no início. Esta proposta é o oposto: cada
 fase entrega algo que funciona sozinho, e o senhor pode parar
 ao fim de qualquer uma.

 A fase 1 custa X e entrega o aplicativo do produtor em quatro
 meses. Se ela não entregar, o senhor não aprova a fase 2."
```

Isso converte um histórico de fracasso em argumento a favor: a estrutura da proposta responde
exatamente ao que deu errado antes.

**A diretora de operações** não é convencida na reunião. Ela é convencida na conversa de
quinze minutos, dois dias antes, em que você pergunta o que a preocupa — e ela diz "abril" —, e
você mostra que o cronograma tem quatro meses de congelamento por ano, e pede a ela que revise
as datas.

Na reunião, ela apoia. Isso vale mais que qualquer slide.

**As duas pessoas fora da sala** são o interessado mais fácil de esquecer e o mais capaz de
derrubar a proposta. Elas precisam ter sido conversadas antes, e o papel delas na proposta
precisa ser de autoridade — não de fonte a ser drenada antes de aposentar.

Se elas disserem ao presidente "concordamos, e o plano nos coloca decidindo o que está certo",
a aprovação é formalidade. Se disserem "vão jogar fora dezenove anos", acabou.

**A menor aprovação suficiente** é a pergunta que mais destrava reuniões: talvez a fase 1 caiba
no orçamento já aprovado, e o pedido de hoje seja apenas autorização para começar — com o
plurianual em novembro, já com resultado da fase 1 na mão.

Pedir menos, com resultado antes de pedir mais, é frequentemente o caminho mais rápido para
receber tudo.

**O fechamento:**

```text
"Resumindo: oito pessoas, começando em 60 dias, com a fase 1
 entregando o aplicativo do produtor em quatro meses e o prazo
 regulatório coberto no mês 12.

 O que não está nesta proposta: a substituição completa do
 sistema. Ela vai levar mais de 30 meses e eu não vou pedir
 orçamento para ela hoje.

 O risco que eu vejo: se não conseguirmos contratar as oito
 pessoas em três meses, o prazo regulatório aperta. Vou trazer
 o andamento da contratação em dezembro."
```

Dizer o que **não** está sendo pedido, e nomear o próprio risco, é o que separa uma proposta de
uma venda. Conselhos aprovam propostas.

:::

## Conceitos Relacionados

- [Exercício 08](/16-legacy-modernization/exercises/08-modernize-legacy.md).
- [Comunicação](/23-architecture-leadership/communication.md) e [Apresentações](/23-architecture-leadership/architecture-presentations.md).
- [Gestão de Interessados](/23-architecture-leadership/stakeholder-management.md).
- [Gestão de Custo](/23-architecture-leadership/cost-management.md).
