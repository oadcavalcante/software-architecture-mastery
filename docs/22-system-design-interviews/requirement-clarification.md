---
id: requirement-clarification
title: Clarificação de Requisitos
sidebar_position: 1
description: O enunciado é vago de propósito — e a primeira coisa avaliada é se você percebe isso.
doc_type: concept
level: 0
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor conduz os primeiros minutos da entrevista com perguntas que
  restringem o problema, em vez de começar a desenhar.
prerequisites: [system-design]
related: [functional-vs-nonfunctional, interview-structure, interview-common-mistakes]
canonical_for: [clarificação de requisitos, pergunta de escopo, premissa declarada, enunciado vago]
content_version: 1
last_reviewed: 2026-08-29
---

# Clarificação de Requisitos

## Visão Geral

"Projete o Twitter." "Projete um encurtador de URL." "Projete o Uber."

Esses enunciados são vagos deliberadamente. Nenhum deles é respondível como está, e a primeira
competência avaliada é se o candidato percebe isso — ou se começa a desenhar caixas.

```text
o enunciado não é o problema
o enunciado é o convite para descobrir o problema
```

Os primeiros cinco a dez minutos de uma entrevista de system design são de clarificação. Eles
determinam o restante: uma arquitetura excelente para um problema que ninguém pediu é uma
resposta errada.

## Problema

O padrão que faz entrevistas darem errado nos primeiros dois minutos:

```text
entrevistador   "projete um sistema de encurtamento de URL"
candidato       "ok, vou usar um hash da URL original, guardar num
                banco chave-valor, com cache na frente..."
```

O candidato já decidiu escala, modelo de dados, tecnologia e topologia — sobre um problema que
não conhece. Ele não sabe se são mil ou um bilhão de URLs, se os links expiram, se há
personalização, se há análise de cliques, se é público ou interno.

Cada uma dessas respostas muda a arquitetura. E o avaliador, que sabe disso, já formou uma
opinião.

O erro oposto também existe e é menos comum: gastar vinte minutos perguntando, incluindo coisas
irrelevantes, e não sobrar tempo para desenhar. Clarificação é uma fase com orçamento, não uma
demonstração de rigor.

## Conceitos Centrais

### Perguntas que restringem, não perguntas que enchem

```text
boa    "os links expiram? há prazo de validade?"
       → muda modelo de dados e política de limpeza
boa    "precisamos de análise de cliques por link?"
       → muda o volume de escrita em ordens de grandeza
ruim   "qual banco de dados vocês usam?"
       → o entrevistador quer que você decida
ruim   "quantos usuários?" sem contexto
       → pergunta genérica; melhor propor e confirmar
```

O critério: **a resposta muda alguma decisão de arquitetura?** Se não muda, a pergunta consome
tempo e não demonstra nada.

### Comece pelo escopo, depois pela escala

A ordem importa e é frequentemente invertida:

```text
1. quem usa e para quê          define o produto
2. quais operações existem      define os requisitos funcionais
3. o que está fora              define a fronteira
4. qual a escala                define a arquitetura
5. quais qualidades importam    define os trade-offs
```

Perguntar escala antes de escopo produz números sobre um sistema que ainda não foi delimitado. E
perguntar "o que está fora" é a pergunta mais subestimada da lista: ela evita que você projete
autenticação, faturamento e painel administrativo num problema sobre encurtar URLs.

### Proponha e confirme, em vez de perguntar em aberto

```text
em aberto     "quantos usuários vamos ter?"
proposta      "vou assumir 100 milhões de usuários ativos mensais,
              gerando 10 milhões de links por dia. Faz sentido, ou
              você tem um número em mente?"
```

A segunda forma é melhor por três razões. Ela demonstra que você tem referência de escala; ela
mantém o ritmo, porque o entrevistador só precisa confirmar; e ela deixa explícito que o número é
uma premissa, o que protege a análise seguinte.

Entrevistadores frequentemente respondem "o que você achar razoável" — e nesse caso a proposta já
resolveu o impasse.

### Toda premissa dita em voz alta é uma âncora

```text
"vou assumir leitura muito maior que escrita, na ordem de 100 para 1"
"vou assumir que a análise de cliques pode ter atraso de minutos"
"vou assumir que não precisamos de links personalizados nesta versão"
```

Premissas declaradas fazem duas coisas. Elas permitem ao entrevistador corrigir o rumo cedo —
"na verdade, personalização é importante" — em vez de tarde, quando a arquitetura já foi
desenhada sobre elas. E elas registram que a decisão foi consciente, e não omissão.

Uma premissa não declarada e errada derruba a resposta. A mesma premissa declarada e errada é
corrigida em dez segundos.

### Requisitos implícitos existem e valem pontos

Alguns requisitos nunca são ditos e são esperados:

```text
o sistema precisa estar disponível
os dados não podem se perder
não pode haver acesso não autorizado
o custo importa
alguém vai operar isso
```

Mencioná-los brevemente — "vou assumir que disponibilidade importa mais que consistência forte
neste caso, porque um link temporariamente indisponível é pior que um contador de cliques
levemente atrasado" — demonstra maturidade sem consumir tempo.

### Anote e volte

Escreva os requisitos em um canto do quadro, funcionais de um lado e não funcionais do outro. Ver
[funcionais contra não funcionais](/22-system-design-interviews/functional-vs-nonfunctional.md).

Isso serve a três propósitos: mantém você honesto sobre o que prometeu resolver; permite ao
entrevistador ver que você não esqueceu nada; e dá algo a que voltar quando o tempo apertar —
"não vou cobrir o painel de análise, que estava na lista de menor prioridade".

### O orçamento de tempo

```text
entrevista de 45 min      clarificação: 5 a 8 min
entrevista de 60 min      clarificação: 8 a 10 min
```

Passar disso é sinal de que as perguntas não estão restringindo. Ficar abaixo é sinal de que
você aceitou o enunciado como está.

## Modelo Mental

**O enunciado é o convite, não o problema.** Pergunte o que muda decisão, proponha em vez de
perguntar em aberto, e declare toda premissa.

## Quando Usar

- No início de toda entrevista de system design.
- Sempre que o entrevistador introduzir uma variação no meio.
- Ao perceber que uma decisão depende de algo não dito.

## Quando Não Usar

**Perguntando o que o entrevistador quer que você decida** — escolha de tecnologia, topologia,
banco. Perguntar isso transfere a decisão e desperdiça a oportunidade de mostrar critério.

**Perguntando sem orçamento de tempo.**

**Perguntando por rigor**, com questões cuja resposta não muda nada.

**Aceitando o enunciado como está** e começando a desenhar.

**Sem anotar** — requisitos que não estão no quadro somem.

## Alternativas

- **Propor e confirmar** — em vez de perguntar em aberto; mais rápido e mais demonstrativo.
- **Declarar premissa e seguir** — quando o entrevistador não responde ou diz "você decide".
- **Perguntar em bloco** — três a quatro perguntas juntas, em vez de uma a uma, mantém o ritmo.

## Trade-offs

| Perguntar mais | Perguntar menos |
|---|---|
| Problema bem delimitado | Mais tempo para desenhar |
| Risco de consumir o tempo | Risco de resolver o problema errado |
| Demonstra método | Demonstra decisão |

| Perguntar em aberto | Propor e confirmar |
|---|---|
| Não presume | Mostra referência de escala |
| Mais lento | Mantém o ritmo |
| Pode receber "você decide" | Já resolve esse caso |

## Modos de Falha

**Desenhar antes de perguntar.** O erro mais comum e o mais visível.

**Perguntar sem restringir.** Consome tempo e não demonstra nada.

**Não declarar premissas.** Erros ficam invisíveis até tarde.

**Ignorar requisitos implícitos.**

**Estourar o orçamento de clarificação.**

**Não anotar** — e prometer coisas que não serão cobertas.

## Erros Comuns

**Perguntar a escala antes do escopo.**

**Perguntar qual tecnologia usar.**

**Fazer uma pergunta de cada vez**, com longas pausas.

**Não perguntar o que está fora do escopo.**

**Tratar clarificação como formalidade** e voltar ao roteiro decorado depois.

## Exemplo de Entrevista

**Problema.** "Projete um sistema de encurtamento de URL."

**Perguntas a fazer**, em ordem, agrupadas:

```text
escopo
  quem usa: público na internet, ou interno de uma empresa?
  além de encurtar e redirecionar, o que mais?
  links personalizados são necessários?
  o que está fora: autenticação, faturamento, painel?

escala
  proponho 100 M de links criados por mês e leitura 100× maior.
  faz sentido?

qualidades
  o redirecionamento pode falhar? qual disponibilidade?
  um link recém-criado precisa funcionar imediatamente em
  qualquer região?
  os links expiram?
  precisamos de análise de cliques? com qual atraso?
```

**Premissas declaradas**, caso o entrevistador delegue:

```text
100 M de criações/mês, 10 bilhões de redirecionamentos/mês
leitura 100× a escrita
links não expiram por padrão, com expiração opcional
análise de cliques com atraso de até 5 minutos é aceitável
redirecionamento precisa de disponibilidade muito alta;
  criação pode tolerar menos
personalização de link fora de escopo nesta versão
```

**O que cada resposta mudaria:**

```text
se os links expirassem        → política de limpeza, e o modelo
                                de dados ganha vigência
se a análise fosse em tempo
  real                        → o volume de escrita passa de 100 M/mês
                                para 10 bi/mês; muda tudo
se houvesse personalização    → unicidade deixa de ser garantida por
                                geração e vira verificação com contenção
se fosse interno              → escala cai em ordens de grandeza, e a
                                arquitetura fica trivial
```

O último item merece atenção: perguntar "público ou interno" leva cinco segundos e pode reduzir
o problema em quatro ordens de grandeza. É a pergunta de maior retorno da lista, e é a que mais
se esquece.

Há uma razão para esquecê-la: o candidato assume que o enunciado se refere ao sistema famoso —
"encurtador de URL" evoca serviços públicos de grande escala. Assumir isso é razoável e é uma
premissa, e a diferença entre assumir em silêncio e declarar em voz alta é toda a diferença. Um
candidato que diz "vou assumir escala pública, na casa de bilhões de redirecionamentos" e segue
está fazendo exatamente a coisa certa; um que simplesmente desenha para essa escala sem dizer
está torcendo para acertar.

**Pergunta de acompanhamento provável:** "e se quiséssemos suportar links personalizados?"

A resposta correta começa reconhecendo o que muda: unicidade deixa de ser propriedade da geração
e passa a exigir verificação, o que introduz contenção e um caminho de erro que não existia.

## Conceitos Relacionados

- [Funcionais vs. Não Funcionais](/22-system-design-interviews/functional-vs-nonfunctional.md).
- [Estrutura da Entrevista](/22-system-design-interviews/interview-structure.md) — o orçamento de tempo.
- [Erros Comuns](/22-system-design-interviews/interview-common-mistakes.md).
- [Comunicação de Trade-offs](/22-system-design-interviews/communicating-tradeoffs.md).

## Exercício Prático

Pegue um enunciado vago — "projete um sistema de notificações" — e escreva dez perguntas.

Depois risque as que não mudam nenhuma decisão de arquitetura. As que sobrarem são as que você
faria numa entrevista; as riscadas são as que consomem o seu tempo.

## Perguntas de Entrevista

- Por que o enunciado é vago de propósito?
- Por que propor e confirmar é melhor que perguntar em aberto?
- Que perguntas não se deve fazer numa entrevista de system design?

## Para Aprofundar

- Xu, Alex. *System Design Interview*. Byte Code, 2020.
- Ford, Neal et al. *Fundamentals of Software Architecture*. O'Reilly, 2020.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
