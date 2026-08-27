---
id: problem-space
title: Espaço do Problema
sidebar_position: 5
description: O que precisa ser verdade, antes e independentemente de como será resolvido.
doc_type: foundation
level: 1
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor separa a descrição de um problema da solução implícita
  nela, e reconhece quando está debatendo solução sem ter acordado o problema.
prerequisites: [business-context]
related: [solution-space, functional-requirements]
canonical_for: [espaço do problema, problem space]
content_version: 1
last_reviewed: 2026-08-26
---

# Espaço do Problema

## Visão Geral

O espaço do problema é o conjunto do que precisa ser verdade para que a
necessidade esteja atendida — expresso sem referência a como será construído.

Manter essa separação é mais difícil do que parece, porque a linguagem natural
embute soluções. "Precisamos de uma fila" já é uma solução. O problema
correspondente pode ser "o processamento não pode bloquear a resposta ao
usuário", e fila é uma das formas de resolvê-lo.

## O Problema

Discussões de arquitetura descarrilham por um motivo específico e recorrente: as
pessoas debatem soluções sem ter acordado o problema.

O sintoma é reconhecível. Duas pessoas defendem opções diferentes com igual
convicção, os argumentos não se tocam, e a discussão gira. Quase sempre, cada uma
está resolvendo um problema diferente e nenhuma percebeu.

A causa raiz é que problemas chegam já embrulhados em solução. O stakeholder não
diz "preciso saber se o pedido está atrasado"; diz "preciso de um dashboard".
O time debate tecnologia de dashboard. Ninguém pergunta que decisão será tomada
com aquela informação — e a resposta poderia ser "cancelar o pedido", o que
sugere um alerta, não um dashboard.

## Conceitos Centrais

### O problema não menciona mecanismo

Um enunciado de problema bem formado descreve estado desejado, restrição ou
consequência. Não menciona tecnologia, componente ou padrão.

| Enunciado com solução embutida | Problema correspondente |
|---|---|
| "Precisamos de cache" | "A mesma consulta é repetida 200×/s e leva 400 ms" |
| "Precisamos de microsserviços" | "Dois times bloqueiam um ao outro a cada release" |
| "Precisamos de Kafka" | "Precisamos reprocessar eventos dos últimos 7 dias" |
| "Precisamos de um dashboard" | "Operadores não sabem quais pedidos exigem ação" |

A coluna da direita é útil porque admite mais de uma resposta. A da esquerda já
escolheu, e escondeu a escolha dentro do enunciado.

### Recuar até o problema

A técnica é perguntar "por quê" até a resposta parar de mencionar mecanismo. Na
prática, duas ou três iterações bastam.

```text
"Precisamos de um cache distribuído."
    por quê?
"A consulta de catálogo está lenta."
    por quê isso é um problema?
"A página de produto demora 2 s e a conversão cai."
    ↓
Problema: a página de produto precisa responder abaixo de 500 ms
          para não custar conversão.
```

Chegando ali, o espaço de soluções se abre: cache distribuído, cache local,
índice melhor, desnormalização, pré-cálculo, ou reduzir o que a página precisa
carregar. Algumas dessas são drasticamente mais baratas que a proposta original.

O objetivo do recuo não é rejeitar a solução sugerida. Frequentemente ela vence.
O objetivo é que ela vença por comparação, e não por ter sido dita primeiro.

### O problema tem dono; a solução tem autor

Quem tem o problema é quem sofre a consequência de ele não ser resolvido —
normalmente do lado do negócio ou da operação.

Quem propõe a solução é quem conhece o espaço técnico.

Confundir os dois papéis produz dois erros conhecidos: o negócio especificando
mecanismo ("use uma fila"), e a engenharia decidindo o que importa ("achamos que
tempo real não é necessário"). O primeiro fecha o espaço de solução cedo demais;
o segundo altera o problema sem autorização.

### Nem todo problema deve ser resolvido

Explicitar o problema também torna possível não resolvê-lo.

Um problema cujo custo de ocorrência é baixo e cuja solução é cara é um problema
a aceitar. Essa conclusão só é alcançável quando o problema está declarado
separadamente da solução — enquanto estiver embrulhado, a discussão é sobre qual
solução, nunca sobre se alguma vale a pena.

## Modelo Mental

**Problema é o que precisa ser verdade. Solução é o que vamos construir.**

Um bom teste: se o enunciado sobrevive à troca completa da stack tecnológica, é
problema. Se deixa de fazer sentido, é solução.

"A página precisa responder abaixo de 500 ms" sobrevive a qualquer stack.
"Precisamos de Redis" não.

## Por Que Isso Importa

**Porque o espaço de solução só pode ser avaliado contra um problema declarado.**
Sem isso, comparar alternativas é impossível — não há critério. É por isso que
[case studies](../21-case-studies/index.md) começam por contexto e requisitos, e
só depois listam opções.

**Porque revela desacordo cedo.** Duas pessoas que discordam sobre a solução
podem estar de acordo sobre o problema, e aí a conversa é produtiva. Ou podem
discordar sobre o problema, e aí discutir solução é perda de tempo até que isso
apareça. Explicitar o problema faz a distinção em minutos.

**Porque protege contra a solução favorita.** Todo time tem uma tecnologia que
quer usar. Um problema declarado antes da discussão é a defesa mais barata
contra a tecnologia procurando um problema.

## Erros Comuns

**Aceitar o enunciado do stakeholder como problema.** Ele quase sempre chega como
solução. Recuar não é desrespeito — é o trabalho.

**Recuar demais.** Levado ao extremo, todo problema vira "a empresa precisa ganhar
dinheiro", o que é verdadeiro e inútil. Pare no nível em que o problema ainda é
específico o suficiente para eliminar soluções.

**Confundir o problema com o sintoma.** "O banco está sobrecarregado" é sintoma.
O problema pode ser um padrão de acesso, uma consulta sem índice ou uma
funcionalidade que não deveria existir. Tratar sintoma como problema leva a
escalar o banco quando o certo era corrigir a consulta.

**Declarar o problema depois de escolher a solução.** Acontece com frequência em
documentos de arquitetura: a seção de problema é escrita para justificar a
decisão já tomada. É reconhecível porque o problema descrito tem exatamente uma
solução possível.

## Exemplo Real

Uma equipe recebe: *"Precisamos migrar para microsserviços."*

Recuando: *por quê?* — "Nossos deploys são arriscados e demorados."
*Por que são arriscados?* — "Qualquer mudança exige regredir o sistema inteiro,
e a suíte leva 40 minutos."
*Por que exige?* — "Não confiamos que uma mudança num módulo não quebre outro."

O problema declarado: **não existe confiança de que uma mudança seja local**.

Contra esse enunciado, microsserviços é uma das soluções — e uma das caras. As
alternativas ficam visíveis: impor fronteiras entre módulos com verificação
automatizada, quebrar a suíte por módulo, aumentar cobertura nos pontos de
acoplamento, adotar release gradual.

A equipe escolheu impor fronteiras primeiro. Dezoito meses depois, extraiu dois
serviços — os dois módulos cujas fronteiras haviam se mostrado estáveis, e por
motivos organizacionais que só ficaram claros nesse intervalo.

O recuo não impediu a migração. Impediu que ela fosse feita cedo, inteira, e sem
saber onde as fronteiras deveriam ficar.

## Conceitos Relacionados

- [Espaço da Solução](solution-space.md) — o outro lado.
- [Contexto de Negócio](business-context.md) — de onde os problemas vêm.
- [Requisitos Funcionais](functional-requirements.md) — a formalização do que o
  sistema precisa fazer.

## Exercício Prático

Pegue os três últimos pedidos que chegaram ao seu time. Para cada um, escreva o
enunciado como foi recebido e recue até um enunciado sem mecanismo.

Depois liste, para cada problema recuado, três soluções possíveis — incluindo a
originalmente pedida.

Em quantos casos a solução pedida continua sendo a melhor? Em quantos existe uma
alternativa mais barata que ninguém tinha considerado?

## Perguntas de Entrevista

- Como você responde a um stakeholder que pede uma tecnologia específica?
- Como distingue o problema do sintoma?
- Já concluiu que um problema não deveria ser resolvido? Como chegou lá?

## Para Aprofundar

- Gause, Donald; Weinberg, Gerald. *Are Your Lights On?* Dorset House, 1990 —
  o texto de referência sobre definição de problema.
- Wiegers, Karl; Beatty, Joy. *Software Requirements*. 3ª ed., Microsoft Press,
  2013 — capítulos sobre elicitação.
