---
id: negotiating-tradeoffs
title: Negociação de Trade-offs
sidebar_position: 8
description: Negociar interesses, não posições — e descobrir que a discordância técnica raramente é técnica.
doc_type: concept
level: 7
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor conduz uma discordância arquitetural até um acordo, separando posições
  de interesses e criando opções que não estavam na mesa.
prerequisites: [decision-making]
related: [decision-making, stakeholder-management, cross-team-architecture]
canonical_for: [negociação de trade-off, posição contra interesse, opção intermediária, critério objetivo]
content_version: 1
last_reviewed: 2026-08-29
---

# Negociação de Trade-offs

## Visão Geral

Duas pessoas competentes olham o mesmo problema e chegam a conclusões opostas. Isso é normal, e a
razão quase nunca é conhecimento desigual — é que elas estão otimizando coisas diferentes.

```text
posição     "precisamos usar Kafka"
interesse   "preciso que o meu time não fique refém do time de
            pagamentos toda vez que o formato muda"
```

Discutir posições produz impasse. Descobrir interesses frequentemente revela que existe uma opção
que atende aos dois lados e que ninguém tinha proposto — porque cada um estava defendendo a sua.

Essa é a contribuição central de um arquiteto numa discordância entre times: não decidir quem tem
razão, mas estruturar a conversa até que a opção melhor apareça.

## Problema

O padrão de impasse:

```text
time A defende X
time B defende Y
a discussão se repete em três reuniões
alguém escala
um gestor decide sem contexto técnico
os dois times executam sem convicção
```

O que não aconteceu em nenhum momento: alguém perguntar por que cada time defende o que defende.

E há um segundo padrão, mais silencioso: a discordância que não é expressa. Um time discorda,
não diz, e simplesmente não adota. Isso é pior que o impasse, porque não há nada a resolver — só
um descumprimento invisível descoberto meses depois.

## Conceitos Centrais

### Posições escondem interesses

```text
posição      o que a pessoa diz que quer
interesse    por que ela quer
```

Perguntar "por que isso importa para você?" é a intervenção de maior retorno numa discordância
técnica. Ela costuma revelar restrições que o outro lado não conhecia:

```text
"defendo o banco compartilhado porque a minha equipe tem duas
 pessoas e não consegue operar mais um armazenamento"

"defendo o serviço separado porque o nosso requisito regulatório
 exige segregação de acesso, e hoje não conseguimos comprovar"
```

Nenhum dos dois é sobre a tecnologia em disputa. E ambos os interesses podem ser atendidos por
opções que nenhuma das duas posições contemplava.

### Separe as pessoas do problema

Discordância técnica prolongada vira pessoal com facilidade, e a partir daí a discussão deixa de
ser sobre o sistema.

```text
"o time A está sendo teimoso"        já é sobre pessoas
"o time A tem uma restrição que a
 proposta não atende"                ainda é sobre o problema
```

O papel do arquiteto inclui manter a conversa no segundo enunciado — o que às vezes exige nomear
explicitamente que ela derivou.

### Critérios antes de opções

O movimento que destrava a maior parte dos impasses:

```text
1. em que critérios vamos avaliar?
2. qual o peso de cada um?
3. só então: quais são as opções?
```

Definir critérios antes de comparar opções remove o viés de defender a própria proposta, porque
ninguém sabe ainda qual delas vence. Definir critérios depois produz critérios escolhidos para
favorecer uma conclusão — o que ambos os lados fazem sem perceber.

Ver [alternativas em ADR](../18-architecture-decisions/adr-alternatives.md).

### Crie opções que não estavam na mesa

```text
posição A     banco compartilhado
posição B     bancos separados
opção nova    bancos separados, com o time de plataforma operando
              os dois — o que atende à restrição de capacidade
              de A e à de segregação de B
```

Discussões entre duas posições tendem a produzir uma vitória ou um meio-termo ruim. A terceira
opção, construída a partir dos interesses, costuma ser melhor que ambas — e ela só aparece depois
que os interesses estão sobre a mesa.

### Use critérios objetivos, não autoridade

```text
fraco    "eu tenho mais experiência, e é assim que se faz"
forte    "vamos medir: qual das duas atende ao requisito de
         latência com a carga real? podemos testar em duas
         semanas"
```

Quando existe uma medição possível, ela encerra a discussão de forma que nenhum argumento encerra.
E quando não existe, o acordo sobre critérios é o substituto — porque ele desloca a discussão de
"quem está certo" para "o que atende melhor ao que combinamos".

### Nem toda discordância se resolve

E isso é aceitável, desde que a decisão seja tomada e a divergência registrada:

```text
"decidimos X. O time B defendeu Y, por causa da preocupação com
 o custo operacional. Aceitamos esse risco, com revisão em
 6 meses e o gatilho sendo o esforço de operação passar de
 meio engenheiro."
```

Registrar isso faz três coisas: preserva o argumento de quem discordou; dá ao time discordante o
reconhecimento de ter sido ouvido, o que reduz drasticamente o descumprimento silencioso; e cria
um gatilho de revisão objetivo em vez de uma nova discussão.

Ver [decisão em ADR](../18-architecture-decisions/adr-decision.md).

### Decisão temporária resolve muitos impasses

```text
"vamos com X por seis meses, medindo Y. Se a preocupação do
 time B se confirmar, mudamos."
```

Quando a discordância é sobre uma previsão — "isso vai ficar caro de operar", "isso não vai
escalar" —, e a previsão é testável, decidir temporariamente com medição transforma um debate de
opinião em um experimento.

Isso só funciona quando a reversão é genuinamente barata. Prometer reversibilidade que não existe
é pior que decidir de vez.

### Escalar é legítimo e caro

```text
quando       o risco é alto, o prazo é real, e o convencimento
             falhou
custo        os times aprendem que discordar terceiriza a decisão
             e passam a escalar mais
```

Escalar não é fracasso — é um instrumento. O que degrada a organização é escalar como primeiro
recurso, porque isso remove dos times a prática de resolver as próprias discordâncias.

## Modelo Mental

**Pergunte por que, defina critérios antes de opções, e crie a terceira alternativa.** A
discordância técnica raramente é sobre a tecnologia.

## Quando Usar

- Em qualquer discordância entre times que se repete.
- Antes de escalar.
- Quando duas propostas competentes chegam a conclusões opostas.

## Quando Não Usar

**Discutindo posições** sem investigar interesses.

**Definindo critérios depois** das opções.

**Escalando cedo.**

**Buscando consenso** quando a decisão precisa sair.

**Prometendo reversibilidade** que não existe.

**Sem registrar** a divergência quando ela persiste.

## Alternativas

- **Medir** — quando a discordância é sobre uma previsão testável, o experimento decide.
- **Piloto paralelo** — dois times, duas abordagens, avaliação depois; caro e conclusivo.
- **Delegar a decisão** a quem arca com a consequência.
- **Adiar com gatilho** — quando a informação que decide vai chegar.

A terceira é frequentemente a resposta correta e raramente é considerada: se a consequência é
majoritariamente de um dos lados, a decisão provavelmente é dele.

## Trade-offs

| Buscar acordo | Decidir com divergência |
|---|---|
| Adoção convicta | Rápido |
| Pode não chegar | Exige registrar a objeção |
| Constrói relação | Risco de descumprimento |

| Medir | Decidir por análise |
|---|---|
| Conclusivo | Rápido |
| Custa semanas | Inconclusivo se as posições forem firmes |

## Modos de Falha

**Debate de posições.** Impasse que se repete.

**Critérios escolhidos depois.** Cada lado escolhe os que o favorecem.

**Discordância pessoalizada.** Deixa de ser sobre o sistema.

**Escalada precoce.** Os times deixam de resolver.

**Discordância silenciosa.** Nada a resolver, descumprimento invisível.

**Divergência apagada.** Quem discordou não é reconhecido.

## Erros Comuns

**Não perguntar por quê.**

**Propor a terceira opção antes** de conhecer os interesses.

**Usar experiência como argumento** onde há medição possível.

**Não registrar** a objeção de quem perdeu.

**Escalar** antes de tentar estruturar a conversa.

## Exemplo Real

Uma empresa de comércio eletrônico tinha uma discordância travada havia quatro meses entre o time
de catálogo e o time de plataforma sobre onde ficaria o índice de busca.

```text
catálogo     "o índice tem que ser nosso; é parte do domínio e
             precisamos evoluí-lo rápido"
plataforma   "índices de busca devem ser da plataforma; já operamos
             dois e não vamos operar um terceiro modelo diferente"
```

Três reuniões, nenhum avanço, e a área de arquitetura foi chamada para "decidir".

Em vez de decidir, ela conduziu uma conversa de uma hora com uma única pergunta inicial para cada
lado: **por que isso importa para vocês?**

```text
catálogo     interesse real: cada mudança de esquema de busca
             levava 3 semanas por depender da fila da plataforma
             — e o roteiro de produto exigia mudanças frequentes
plataforma   interesse real: a equipe tinha 5 pessoas e já operava
             dois mecanismos de busca diferentes; um terceiro,
             com modelo operacional distinto, era insustentável
```

Nenhum dos dois interesses era sobre propriedade. Um era sobre velocidade de mudança; o outro,
sobre carga operacional.

**Critérios definidos antes das opções**, com peso acordado pelos dois times:

```text
tempo de mudança de esquema pelo time de catálogo    35%
carga operacional adicional na plataforma            30%
consistência com o restante da organização           20%
custo de infraestrutura                              15%
```

**Opções geradas depois, incluindo duas que não estavam na mesa:**

```text
A  índice operado pelo catálogo, modelo próprio
B  índice operado pela plataforma, fila de mudanças
C  índice operado pela plataforma, com autoatendimento de
   esquema para os times de domínio
D  índice operado pelo catálogo, usando o mesmo mecanismo
   e o mesmo modelo operacional da plataforma
```

C e D não tinham sido consideradas em quatro meses de discussão, porque cada lado estava
defendendo a própria posição.

A avaliação com os critérios acordados deu C como vencedora, com margem clara: ela reduzia o
tempo de mudança para horas — melhor até que a opção A — e não acrescentava modelo operacional
novo à plataforma.

O custo: a plataforma precisava construir o autoatendimento de esquema, cerca de seis semanas.
O financiamento veio do orçamento de arquitetura, o que removeu a objeção de capacidade.

Resultados após oito meses:

```text
tempo de mudança de esquema         de 3 semanas para 4 horas
mecanismos de busca operados        2 (inalterado)
outros times que adotaram o
  autoatendimento                   4
```

Os quatro times que adotaram depois são o resultado que ninguém previu: a solução construída para
resolver uma discordância virou capacidade de plataforma.

O que a área de arquitetura registra: as duas opções vencedoras eram óbvias em retrospecto e
invisíveis durante quatro meses. Elas só apareceram depois que a conversa mudou de "quem tem
razão" para "o que cada um precisa" — e a pergunta que produziu essa mudança levou trinta
segundos.

## Conceitos Relacionados

- [Tomada de Decisão](decision-making.md).
- [Gestão de Interessados](stakeholder-management.md).
- [Arquitetura entre Times](cross-team-architecture.md).
- [Trade-offs](../20-trade-offs/index.md).

## Exercício Prático

Pegue uma discordância técnica em andamento e escreva, para cada lado, a posição e o interesse
por trás dela.

Depois tente construir uma opção que atenda aos dois interesses. Se ela existir, ela não estava na
mesa — e é provavelmente melhor que as duas.

## Perguntas de Entrevista

- Por que definir critérios antes de opções remove viés?
- Por que a terceira opção só aparece depois que os interesses estão explícitos?
- Por que registrar a divergência reduz o descumprimento silencioso?

## Para Aprofundar

- Fisher, Roger; Ury, William. *Getting to Yes*. 3ª ed. Penguin, 2011.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Larson, Will. *Staff Engineer*. Stripe Press, 2021.
