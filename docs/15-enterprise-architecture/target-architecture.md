---
id: target-architecture
title: Arquitetura Alvo
sidebar_position: 16
description: Onde se quer chegar — e por que um alvo de três anos raramente sobrevive ao segundo.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor define um alvo com horizonte adequado, expresso em
  propriedades desejadas e não em desenho detalhado.
prerequisites: [current-state-architecture]
related: [current-state-architecture, transition-architecture, architecture-roadmaps]
canonical_for: [arquitetura alvo, horizonte de planejamento, propriedade desejada]
content_version: 1
last_reviewed: 2026-08-28
---

# Arquitetura Alvo

## Visão Geral

A arquitetura alvo descreve onde a organização quer chegar — a estrutura que resolveria
os problemas que o estado atual tem.

Ela existe para dar direção a decisões distribuídas: dezenas de escolhas, feitas por
times diferentes, que somadas movem a organização para algum lugar. Sem alvo, elas se
movem em direções incompatíveis.

E ela falha de uma forma característica: um desenho detalhado de três anos, revisado
anualmente, nunca alcançado — porque o contexto muda mais rápido que o plano.

## Problema

O alvo tradicional é um desenho completo do estado futuro: todos os sistemas, todas as
integrações, toda a topologia.

Dois problemas com isso.

**Ele pressupõe estabilidade que não existe.** Aquisições, mudanças de mercado,
tecnologias novas, prioridades revistas — em três anos, boa parte das premissas muda.

**Ele não orienta a decisão de hoje.** Um time diante de uma escolha concreta não
consegue derivar dela a resposta a partir de um diagrama de estado final.

## Conceitos Centrais

### Propriedades, não desenho

O alvo útil descreve **como o sistema deve se comportar**, não como ele deve ser
desenhado:

```text
desenho       "teremos um serviço de clientes, um de pedidos, um de faturamento,
               integrados por eventos, com estes contratos"
propriedades  "cada dado tem um dono único"
              "sistemas se integram por contrato explícito"
              "capacidades diferenciadoras são construídas; as demais, compradas"
              "nenhum sistema crítico depende de uma única pessoa"
```

Propriedades sobrevivem a mudanças de contexto. Um desenho, não.

E elas orientam a decisão de hoje: um time que precisa escolher como integrar dois
sistemas consegue derivar a resposta de "integração por contrato explícito". Não consegue
derivar de um diagrama de estado final.

### O horizonte precisa caber na previsibilidade

```text
12 a 18 meses   o que a maioria das organizações consegue prever com utilidade
2 a 3 anos      direção, não plano — em propriedades, não em sistemas
além disso      declaração de intenção
```

Um alvo de três anos em desenho detalhado é ficção com aparência de plano.

E o horizonte varia com o contexto: uma empresa em mercado estável e regulado planeja
mais longe que uma em mercado em transformação.

O sinal de que o horizonte está errado: a revisão anual reescreve mais da metade.

### O alvo precisa ser derivável do problema

Um alvo que não aponta para problemas concretos do estado atual é preferência estética.

```text
problema atual                          →  propriedade alvo
cadastro duplicado em sete sistemas     →  dado com dono único
integrações por acesso direto ao banco  →  contrato explícito
sistema crítico com um mantenedor       →  conhecimento distribuído
34% do investimento em capacidade comum →  comprar o que não diferencia
```

Ver [arquitetura do estado atual](/15-enterprise-architecture/current-state-architecture.md).

Essa derivação é o que permite defender o alvo: cada propriedade tem um problema
associado, e o custo de não resolvê-lo é conhecido.

Alvos que começam por "queremos microsserviços" ou "queremos ser cloud native" pulam essa
etapa — e não conseguem responder por que.

### Não precisa ser único

Um alvo único para toda a organização força uniformidade onde ela não faz sentido.

```text
capacidades diferenciadoras   alvo mais ambicioso, investimento maior
capacidades de apoio          alvo modesto — estável e barato basta
capacidades comuns            alvo é comprar
```

Ver [capacidades de negócio](/15-enterprise-architecture/business-capabilities.md).

Isso evita o desperdício mais comum dos programas de modernização: aplicar o mesmo padrão
de excelência técnica a sistemas que só precisam funcionar.

### Ele orienta, não obriga

Um alvo usado para recusar propostas vira obstáculo. Um alvo usado para orientar
propostas vira ferramenta.

A diferença prática:

```text
como obstáculo   "isso não está no alvo, então não"
como orientação  "isso nos afasta do alvo nesta dimensão; vale a pena?"
```

A segunda formulação permite que a resposta seja sim — com a consequência conhecida e
registrada. E o acúmulo dessas decisões é informação: se muitas propostas se afastam do
alvo, o alvo pode estar errado.

Ver [princípios corporativos](/15-enterprise-architecture/enterprise-principles.md) — o mesmo mecanismo do registro
de exceções.

### Sem transição, é aspiração

Um alvo sem caminho é uma declaração de que gostaríamos que as coisas fossem diferentes.

Ver [arquitetura de transição](/15-enterprise-architecture/transition-architecture.md). É o documento que transforma
o alvo em trabalho — e é o que mais frequentemente falta.

### O alvo precisa ser conhecido por quem decide no dia a dia

Um alvo que existe num documento consultado por poucos não orienta as decisões
distribuídas que ele deveria orientar — que é a razão de ele existir.

O que o torna presente:

```text
poucas propriedades, memoráveis
citadas em revisões e em decisões registradas
visíveis onde as decisões acontecem — modelos de proposta, listas de verificação
revisitadas quando alguém se afasta delas
```

A terceira é a mais eficaz: uma pergunta no modelo de proposta de arquitetura — "esta
decisão aproxima ou afasta de qual propriedade do alvo?" — faz o alvo entrar na conversa
sem exigir que alguém o consulte.

E a quarta fecha o ciclo: cada afastamento registrado é uma oportunidade de verificar se
o alvo continua certo. Ver
[decisões de arquitetura](/18-architecture-decisions/index.md).

Um alvo que ninguém cita em decisões concretas, ao longo de um ano, não está orientando
nada — independentemente de quão bem escrito esteja.

## Modelo Mental

**O alvo descreve propriedades desejadas, derivadas de problemas concretos.** Um desenho
detalhado de três anos é ficção.

## Quando Usar

- Para dar direção a decisões distribuídas.
- Antes de programas de modernização.
- Em decisões de investimento de médio prazo.
- Após mudanças estruturais — aquisição, mudança de estratégia.

## Quando Não Usar

**Como desenho detalhado de longo prazo.**

**Sem derivação de problemas atuais.**

**Único para toda a organização.**

**Como critério de recusa.**

**Sem arquitetura de transição.**

**Revisado apenas anualmente**, em contexto que muda rápido.

## Alternativas

- **Princípios** — orientam sem descrever estado final. Ver
  [princípios corporativos](/15-enterprise-architecture/enterprise-principles.md).
- **Direção por propriedade** — sem alvo formal, apenas as propriedades a perseguir.
- **Alvo por capacidade** — em vez de um alvo organizacional único.
- **Roteiro de curto prazo** — o que fazer nos próximos seis meses, revisado
  continuamente. Ver
  [roteiros de arquitetura](/15-enterprise-architecture/architecture-roadmaps.md).

## Trade-offs

| Alvo em propriedades | Em desenho |
|---|---|
| Sobrevive a mudanças | Envelhece |
| Orienta decisão de hoje | Distante do concreto |
| Menos preciso | Específico |

| Horizonte longo | Curto |
|---|---|
| Direção de fundo | Acionável |
| Baixa precisão | Alta |
| Revisão frequente necessária | Menos |

## Modos de Falha

**Desenho detalhado obsoleto.**

**Alvo sem problema associado.** Preferência estética.

**Usado para bloquear.**

**Nunca alcançado.** Revisado antes de chegar perto.

**Uniforme demais.** Excelência técnica onde bastava funcionar.

**Sem caminho.** Aspiração sem trabalho definido.

## Erros Comuns

**Desenhar o estado final.**

**Começar pela solução** — "queremos microsserviços" — em vez do problema.

**Horizonte longo demais.**

**Um alvo para tudo.**

**Não registrar os afastamentos.**

**Não ter transição.**

## Exemplo Real

Uma empresa de varejo produziu uma arquitetura alvo de três anos: 40 microsserviços
substituindo o monólito, integrados por eventos, com um diagrama detalhado de cada
fronteira.

Dezoito meses depois:

**Duas aquisições** trouxeram sistemas que o alvo não previa.

**Uma mudança de estratégia** — expansão para um canal novo — alterou as prioridades.

**Doze dos 40 serviços** tinham sido construídos. As fronteiras dos outros 28 já não
faziam sentido com o que se aprendeu.

O alvo foi abandonado, e o efeito colateral foi pior: o programa de modernização perdeu
credibilidade, e a proposta seguinte enfrentou ceticismo.

A reformulação, feita um ano depois, mudou a natureza do artefato:

**Propriedades derivadas de problemas.** Cinco propriedades, cada uma com o problema que
a origina e o custo de não resolvê-lo:

```text
1. cada dado com dono único        → hoje, cadastro em 7 sistemas, um time de
                                     reconciliação
2. integração por contrato          → hoje, 23 acessos diretos ao banco alheio
3. capacidades comuns compradas     → hoje, 34% do orçamento em não diferenciadoras
4. sistemas críticos com 3+ pessoas → hoje, 4 sistemas com mantenedor único
5. implantação independente         → hoje, release mensal coordenada entre 9 times
```

**Alvos diferenciados por capacidade.** As capacidades diferenciadoras — precificação e
recomendação — receberam alvo ambicioso. As de apoio, alvo de "estável e barato". As
comuns, alvo de compra.

**Horizonte de 18 meses**, com revisão semestral.

**Registro de afastamentos.** Propostas que se afastam do alvo são aceitas com
justificativa registrada. Em um ano, 14 registros — e três deles, todos sobre a
propriedade 5, levaram à revisão dessa propriedade: a implantação independente não fazia
sentido para um conjunto de sistemas que compartilhavam um ciclo de negócio.

Dois anos depois, quatro das cinco propriedades tinham avançado substancialmente — e a
quinta tinha sido corrigida.

O que a equipe registra: o alvo em propriedades sobreviveu a uma aquisição e a duas
mudanças de prioridade. O desenho anterior não tinha sobrevivido a nenhuma.

## Conceitos Relacionados

- [Arquitetura do Estado Atual](/15-enterprise-architecture/current-state-architecture.md) — o ponto de partida.
- [Arquitetura de Transição](/15-enterprise-architecture/transition-architecture.md) — o caminho.
- [Roteiros de Arquitetura](/15-enterprise-architecture/architecture-roadmaps.md).
- [Capacidades de Negócio](/15-enterprise-architecture/business-capabilities.md).

## Exercício Prático

Pegue a arquitetura alvo da sua organização e verifique, para cada elemento dela: qual
problema concreto do estado atual ele resolve?

Os elementos sem problema associado são preferência, não alvo.

## Perguntas de Entrevista

- Por que propriedades sobrevivem melhor que desenho?
- Por que o alvo não precisa ser único?
- O que o registro de afastamentos revela?

## Para Aprofundar

- Ross, Jeanne et al. *Enterprise Architecture as Strategy*. HBS Press, 2006.
- Open Group. *TOGAF Standard* — arquitetura alvo e análise de lacuna.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
