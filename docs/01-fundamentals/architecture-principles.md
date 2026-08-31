---
id: architecture-principles
title: Princípios de Arquitetura
sidebar_position: 20
description: Orientar decisão distribuída sem precisar estar em cada decisão.
doc_type: concept
level: 1
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escreve princípios que de fato orientam escolha, porque
  declaram o que se abre mão.
prerequisites: [architecture-characteristics]
related: [architecture-as-decisions, architecture-governance]
canonical_for: [princípios de arquitetura, architecture principles]
content_version: 1
last_reviewed: 2026-08-26
---

# Princípios de Arquitetura

## Visão Geral

Princípios de arquitetura são orientações declaradas que ajudam quem decide, no
momento em que decide, a escolher de forma consistente com o que a organização já
concluiu.

Existem porque quem arquiteta não está presente em cada decisão — e a alternativa
a princípios não é centralizar tudo, é inconsistência.

## Problema

A maioria dos princípios publicados por empresas não orienta nada. São frases
como "priorizamos a simplicidade", "escolhemos as melhores ferramentas para o
trabalho", "valorizamos a manutenibilidade".

O defeito é preciso: **ninguém escolheria o contrário.** Nenhuma equipe prefere
complexidade ou ferramentas piores. Um princípio que não tem oposto defensável
não elimina nenhuma opção, e portanto não ajuda em nenhuma decisão.

O teste, portanto, é: **inverta o princípio. Se a frase invertida é obviamente
absurda, o princípio original é vazio.**

"Priorizamos simplicidade" invertido vira "priorizamos complexidade" — absurdo,
logo o princípio é vazio.

"Preferimos soluções mais simples mesmo quando limitam casos de uso futuros"
invertido vira "aceitamos complexidade para cobrir casos futuros" — uma posição
defensável, que empresas de fato adotam. Logo o princípio original tem conteúdo.

## Conceitos Centrais

### Um princípio declara o que se abre mão

A forma que funciona tem três partes:

```text
Preferimos  X
a           Y
porque      razão ligada a uma característica arquitetural
```

O "a Y" é a parte que carrega o valor e a que quase sempre falta. Sem ela, o
princípio não distingue nada.

Exemplos com conteúdo:

- *Preferimos consistência eventual a consistência forte, exceto em fluxo
  financeiro, porque disponibilidade é nossa primeira característica.*
- *Preferimos serviços gerenciados a autogeridos mesmo com custo por transação
  maior, porque temos oito engenheiros e nenhum plantão de infraestrutura.*
- *Preferimos duplicar código entre contextos a criar biblioteca compartilhada,
  porque acoplamento entre times custa mais que duplicação.*

Cada um elimina opções e cada um tem um oposto que outra empresa adotaria.

### Princípio orienta; padrão prescreve

A distinção operacional que mais importa na prática:

| | Princípio | Padrão |
|---|---|---|
| Função | Orienta julgamento | Prescreve escolha |
| Aplicação | Situação nova, não prevista | Situação recorrente, já resolvida |
| Exceção | Pondera-se — não há exceção formal | Precisa de processo explícito |
| Falha típica | Vago demais para decidir | Rígido demais para o caso real |

Uma organização só com princípios decide de forma inconsistente. Só com padrões,
trava no primeiro caso não previsto. Confundir os dois produz o pior dos dois.

### Princípios derivam de características

Um princípio sem ligação com uma
[característica arquitetural](/01-fundamentals/architecture-characteristics.md) é preferência
pessoal com autoridade emprestada.

A cadeia é: o contexto de negócio determina as características dirigentes; as
características determinam os princípios; os princípios orientam decisões
individuais.

Quando alguém pergunta "por que esse princípio?", a resposta precisa chegar a uma
característica, e dali a uma restrição de negócio.

### Poucos e revisáveis

Cinco a dez princípios é o que um time consegue aplicar. Trinta é uma política
que ninguém lê.

E princípios têm prazo. Um derivado de "somos oito engenheiros" precisa ser
revisto quando forem oitenta.

## Modelo Mental

**Um princípio é uma decisão tomada uma vez para não ser tomada toda vez.**

Se a mesma discussão se repete a cada trimestre com o mesmo desfecho, ela é
candidata a virar princípio. Se o desfecho varia conforme o caso, não é —
é julgamento, e princípio não substitui julgamento.

## Quando Usar

- Quando a mesma classe de decisão reaparece em contextos diferentes com a mesma
  resposta.
- Quando times decidem de forma inconsistente e a inconsistência custa.
- Quando você não consegue participar de cada decisão e precisa que ela seja
  tomada bem sem você.
- Quando uma conclusão foi aprendida caro e precisa não ser reaprendida.

## Quando Não Usar

**Quando a resposta correta varia com o caso.** Ali, princípio vira camisa de
força e o time contorna em silêncio — o que é pior que não ter princípio, porque
a violação deixa de ser discutível.

**Quando o princípio não tem oposto defensável.** Ver o teste da inversão. Não
ajuda ninguém e ocupa espaço de atenção.

**Quando o time é pequeno o suficiente para conversar.** Com quatro pessoas na
mesma sala, princípios formais são cerimônia; a conversa resolve.

**Quando você não pretende revisá-los.** Princípio escrito e nunca reexaminado
vira restrição fantasma — moldou decisões e não vale mais.

## Alternativas

- **Padrão** — quando a decisão é recorrente e a resposta é única, prescreva em
  vez de orientar.
- **Fitness function** — quando a propriedade pode ser verificada
  automaticamente, verificar é mais barato e confiável que orientar.
- **ADR** — quando a decisão é específica e não uma classe recorrente.
- **Conversa** — quando o time é pequeno.

## Trade-offs

O eixo é **consistência versus autonomia local**.

| Mais princípios | Menos princípios |
|---|---|
| Decisões consistentes entre times | Cada time otimiza para seu contexto |
| Conclusões caras não se perdem | Cada time reaprende |
| Menos discussões repetidas | Discussão a cada caso |
| Risco de aplicar fora do contexto | Decisão sempre contextualizada |
| Custo de manter e revisar | Sem manutenção |

## Modos de Falha

**Princípio vazio.** Não tem oposto defensável. Ocupa espaço e não decide nada.

**Princípio virando regra sem exceção.** Aplicado onde não cabe, porque virou
critério de conformidade em vez de orientação.

**Princípio sem dono.** Ninguém sabe quem estabeleceu nem por quê. Não pode ser
revisado nem contestado.

**Princípio desatualizado.** Derivado de uma restrição que já não existe. Continua
eliminando opções que voltaram a estar disponíveis.

**Princípios demais.** Ninguém lê, e a existência da lista dá a impressão falsa de
que há orientação.

## Exemplo Real

Uma empresa de médio porte tinha nove princípios publicados. Sete falharam no
teste da inversão — "priorizamos qualidade", "escolhemos a ferramenta certa para
cada problema", e variações.

Os dois que sobreviveram:

> *Preferimos serviços gerenciados a componentes autogeridos, mesmo com custo por
> transação até 3× maior, porque nosso time de plataforma tem quatro pessoas e
> não há plantão dedicado.*

> *Preferimos duplicar lógica entre bounded contexts a extrair biblioteca
> compartilhada, porque acoplamento entre times atrasou três dos nossos últimos
> cinco lançamentos.*

Os dois eliminam opções, os dois têm oposto defensável, e os dois citam a razão
concreta.

O detalhe que dá o desfecho: dezoito meses depois, o time de plataforma tinha
quinze pessoas e plantão. O primeiro princípio foi revisado — não removido, mas
reescrito com um limite de custo diferente.

Ele só pôde ser revisado porque a razão estava escrita. Os sete princípios vazios
continuam lá, e ninguém saberia dizer o que precisaria mudar para revisá-los.

## Onde os princípios vivem

Um princípio que existe apenas num documento que ninguém abre não orienta nada. A
diferença entre princípio efetivo e princípio publicado está em onde ele aparece.

Os lugares que funcionam, em ordem de eficácia:

**No template de decisão.** Se o formato de ADR do time pede explicitamente
"quais princípios se aplicam e como", o princípio é consultado no momento em que
importa, e não depois.

**Na revisão de arquitetura.** Como pergunta padrão, não como cobrança: qual
princípio orientou esta escolha? A resposta "nenhum" é informação — ou falta um
princípio, ou este é um caso genuinamente novo.

**Como verificação automatizada, quando possível.** Um princípio sobre direção de
dependência pode virar teste. Ali ele deixa de depender de lembrança.

**No onboarding.** É onde o custo de não conhecer os princípios é maior e onde
o retorno de ensiná-los é imediato.

O lugar que não funciona é uma página de wiki atualizada uma vez e nunca mais
citada — que é onde a maioria dos princípios de arquitetura mora.

## Conceitos Relacionados

- [Características Arquiteturais](/01-fundamentals/architecture-characteristics.md) — de onde os
  princípios derivam.
- [Arquitetura como Conjunto de Decisões](/01-fundamentals/architecture-as-decisions.md) — o que
  os princípios orientam.
- [Governança](/19-architecture-governance/index.md) — como princípios operam
  entre times.

## Exercício Prático

Pegue os princípios de arquitetura do seu time — escritos ou tácitos.

Aplique o teste da inversão a cada um. Escreva o oposto e pergunte: alguma
empresa competente adotaria isso?

Para os que sobreviverem, verifique se declaram do que se abre mão e a qual
característica se ligam. Reescreva os que não declaram.

## Perguntas de Entrevista

- O que distingue um princípio de arquitetura útil de um vazio?
- Qual a diferença entre princípio e padrão?
- Como você lida com um princípio que não se aplica ao caso que tem em mãos?

## Para Aprofundar

- Ford, Neal; Richards, Mark. *Fundamentals of Software Architecture*. O'Reilly,
  2020.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019 — sobre
  autonomia e alinhamento entre times.
