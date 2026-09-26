---
id: incremental-modernization
title: Modernização Incremental
sidebar_position: 4
description: Entregar valor em fatias que sobrevivem a interrupções — a disciplina que faz a modernização terminar.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor divide modernização em incrementos defensáveis e evita o
  programa que só entrega no fim.
prerequisites: [migration-strategies]
related: [strangler-fig, organizational-constraints, transition-architecture]
canonical_for: [modernização incremental, fatia defensável, modernização oportunista]
content_version: 2
last_reviewed: 2026-08-28
---

# Modernização Incremental

## Visão Geral

Modernização incremental é dividir o trabalho em fatias que **entregam valor por si**, de
forma que parar em qualquer ponto deixe a organização melhor que antes.

É a disciplina que faz programas de modernização terminarem — porque a maioria deles é
interrompida, e a diferença entre um interrompido com valor e um interrompido sem valor é
a divisão.

Ver [restrições organizacionais](/16-legacy-modernization/organizational-constraints.md).

## Problema

O programa de modernização típico é sequenciado por **dependência técnica**:

```text
1. infraestrutura
2. camada de dados
3. serviços de domínio
4. interface
5. migração
6. desligamento
```

Isso é a ordem lógica de construção, e ela concentra todo o valor no fim.

Um programa assim, interrompido no passo 3, produziu infraestrutura e camada de dados que
não fazem nada — trabalho perdido.

## Conceitos Centrais

### A fatia precisa passar em três testes

```text
entrega valor    alguém está mensuravelmente melhor
é operável       funciona em produção, não é obra
é defensável     se parar aqui, o investimento se justifica
```

O terceiro é o mais exigente e o que faz a diferença. Ele força a ordenação por valor, e
não por conveniência técnica.

Ver [arquitetura de transição](/15-enterprise-architecture/transition-architecture.md).

E ele tem uma consequência desconfortável: a ordem que entrega valor cedo é
frequentemente mais trabalhosa que a ordem de construção natural — porque exige fazer
funcionar parcialmente algo que seria mais simples fazer inteiro.

Esse custo adicional é o prêmio de seguro contra interrupção, e ele se paga na maioria dos
casos.

### Vertical, não horizontal

```text
horizontal   uma camada inteira de cada vez — infraestrutura, depois dados, depois...
vertical     uma funcionalidade completa, atravessando todas as camadas
```

A fatia vertical entrega algo utilizável. A horizontal, não.

E há um ganho secundário: a fatia vertical exercita o caminho completo cedo, revelando
problemas de integração, de dados e de implantação no início, quando corrigir é barato.

O preço é operacional. Enquanto houver fatias nos dois lados, a organização mantém dois
sistemas em produção: dados sincronizados entre o modelo antigo e o novo, duas esteiras
de implantação, dois plantões e a regra de roteamento na interceptação, que cresce a cada
fatia migrada. Esse custo sobe com o número de fatias em convivência e só cai quando o
antigo perde a última funcionalidade — por isso a última fatia precisa estar no plano
desde o início. Como gerir esse período está em
[arquitetura de transição](/15-enterprise-architecture/transition-architecture.md).

### Modernização oportunista

Uma abordagem sem programa dedicado: **modernizar o que se toca**.

```text
uma mudança de produto precisa alterar o módulo X
  → aproveita-se para refatorar X
  → o custo marginal é pequeno; o trabalho já estava sendo feito ali
```

Isso tem três propriedades valiosas:

**Não compete por orçamento.** Ela acontece dentro do trabalho de produto.

**Foca no que importa.** Os módulos que mudam são os que causam custo; os que não mudam
não incomodam.

**Sobrevive a mudança de prioridade.** Não há programa para cancelar.

O limite: ela não resolve problemas estruturais que exigem mudança coordenada. Ver
[estratégias de migração](/16-legacy-modernization/migration-strategies.md).

A combinação que funciona: oportunista para o contínuo, programa dedicado para o
estrutural.

### A regra do escoteiro tem limite

"Deixe o código melhor do que encontrou" funciona para melhorias pequenas e falha para
mudanças estruturais — que exigem coordenação e não cabem numa alteração incidental.

E há um risco: refatoração oportunista sem limite transforma uma mudança pequena numa
grande, com revisão difícil e risco maior.

O equilíbrio: melhorias localizadas dentro da mudança; mudanças estruturais como trabalho
próprio, planejado.

### Medir progresso pelo que foi entregue

```text
ruim   "40% do código migrado"
bom    "3 das 8 funcionalidades críticas operando no sistema novo"
       "release mensal virou semanal para o módulo X"
       "tempo de lançamento de produto novo caiu de 3 meses para 3 semanas"
```

A primeira métrica é interna e não comunica nada a quem patrocina. As outras são
verificáveis e sustentam apoio.

E a primeira tem um problema adicional: ela cresce mesmo quando o valor não cresce — 40%
do código migrado pode ser 0% do valor, se for a parte errada.

### Fatias pequenas o suficiente para caber

Uma fatia que leva oito meses não é incremental — ela é um projeto pequeno com os mesmos
problemas do grande.

```text
alvo prático   4 a 8 semanas por fatia
```

Isso força divisão mais fina, o que é trabalho — e é o que mantém o ciclo de entrega e
de aprendizado curto.

E cabe na proporção acordada com o produto. Ver
[restrições organizacionais](/16-legacy-modernization/organizational-constraints.md).

### A primeira fatia é mais cara, e isso precisa estar na estimativa

Um padrão previsível: a primeira fatia constrói a infraestrutura que todas as demais
reaproveitam.

```text
fatia 1    7 semanas — inclui interceptação, esteira, telemetria, migração de dados
fatia 2    3 semanas
fatia 3    2 semanas
```

Estimar a primeira pela média das demais produz um atraso logo no início — o pior momento
possível, porque ele erode a confiança antes de qualquer valor ter sido entregue.

Comunicar isso antecipadamente muda a leitura: "a primeira fatia leva o triplo das
seguintes, porque ela constrói o caminho" é uma previsão que se confirma, e não um atraso.

E há uma escolha embutida: quanta infraestrutura construir na primeira fatia. Construir
demais atrasa o primeiro valor; construir de menos faz cada fatia seguinte carregar
trabalho de base.

O equilíbrio prático: apenas o necessário para a primeira fatia funcionar em produção, e
o resto conforme as seguintes exigirem.

## Modelo Mental

**Cada fatia entrega valor por si.** A interrupção é provável; a divisão é o seguro
contra ela.

## Quando Usar

- Qualquer modernização com duração acima de alguns meses.
- Onde a prioridade pode mudar.
- Quando o apoio precisa ser sustentado ao longo do tempo.
- Onde o produto não pode parar.

## Quando Não Usar

**Sistema pequeno o bastante para um corte único.** Se a substituição inteira cabe em
poucas semanas, o prêmio de fatiar — interceptação, sincronização, dois sistemas no ar —
custa mais que o risco de interrupção que ele cobre.

**Sistema que será aposentado ou apenas contido.** Fatiar pressupõe um destino; sem ele,
isolar ou desligar é mais barato. Ver
[estratégias de migração](/16-legacy-modernization/migration-strategies.md).

**Domínio sem fatia vertical viável.** Quando um banco compartilhado e processos em lote
atravessam todas as funcionalidades, nenhuma fatia entra em produção sozinha até esse
núcleo ser desmontado — e desmontá-lo é trabalho estrutural dirigido, não incremento.

**Coexistência mais cara que a interrupção.** Se manter os dois sistemas sincronizados
exige, por regulação ou consistência, reconciliação que custa mais que o risco de o
programa parar, o corte coordenado sai mais barato.

## Alternativas

- **Programa dedicado com marcos** — mais rápido, mais vulnerável.
- **Modernização oportunista pura** — sem programa, mais lenta, mais resiliente.
- **Congelar e construir ao lado** — o antigo para de evoluir. Ver
  [reconstrução](/16-legacy-modernization/rebuilding.md).
- **Contenção** — isolar em vez de modernizar.

## Trade-offs

| Incremental | Programa com marcos |
|---|---|
| Valor cedo e contínuo | Concentrado no fim |
| Sobrevive a interrupção | Desperdiça |
| Coexistência prolongada | Menos |
| Mais trabalho de divisão | Ordem natural |

| Oportunista | Dedicado |
|---|---|
| Não compete por orçamento | Compete |
| Lento | Rápido |
| Não resolve o estrutural | Resolve |

## Modos de Falha

**Fatia sem valor.** Interrompida, nada foi entregue.

**Sequência por dependência técnica.** Interrompido no meio, deixa camadas que não servem
a nada.

**Fatias longas.** Os mesmos problemas do programa grande.

**Progresso medido internamente.** O patrocinador não vê avanço.

**Refatoração oportunista sem limite.** Mudanças pequenas viram grandes.

**Coexistência que não termina.** Ver
[strangler fig](/16-legacy-modernization/strangler-fig.md).

## Erros Comuns

**Ordenar por conveniência técnica.** Começar pelo que é fácil de extrair produz progresso visível sem valor de negócio, e o apoio acaba antes de a parte difícil começar.

**Fatiar horizontalmente.** Migrar uma camada de cada vez obriga a manter as duas arquiteturas conversando em todas as funcionalidades, e nenhuma delas fica pronta até o fim.

**Não testar cada fatia contra o critério de defensabilidade.** Se a fatia não entrega algo que se sustenta sozinho, ela não pode ser interrompida — e interrupção é o cenário mais provável.

**Comunicar progresso em percentual de código.** "40% migrado" não diz nada ao negócio e esconde que os 60% restantes contêm toda a complexidade. Progresso se comunica em capacidade entregue.

**Usar oportunista para problema estrutural.** Melhorar o que se toca não corrige fronteira errada nem modelo de dados inadequado; esses exigem trabalho dirigido.

**Não limitar o tamanho da fatia.** Fatia longa demais volta a ser um projeto grande com todos os riscos que o incremento existia para evitar.

## Exemplo Real

Uma empresa de telecomunicações modernizava o sistema de provisionamento de serviços.

O plano original, por camadas:

```text
fase 1  nova infraestrutura                    4 meses
fase 2  camada de dados                        5 meses
fase 3  serviços de domínio                    8 meses
fase 4  interfaces                             4 meses
fase 5  migração e corte                       3 meses
```

Vinte e quatro meses, com o primeiro valor no mês 24.

A reformulação, antes de começar, dividiu por funcionalidade:

```text
fatia 1  provisionamento de banda larga residencial    7 semanas
fatia 2  alteração de plano                            5 semanas
fatia 3  provisionamento de telefonia                  6 semanas
fatia 4  serviços corporativos                         8 semanas
...
fatia 11 casos especiais e desligamento                9 semanas
```

Cada fatia atravessava todas as camadas para uma funcionalidade, e entrava em produção
por [strangler fig](/16-legacy-modernization/strangler-fig.md).

A primeira fatia levou as 7 semanas previstas — o plano já contava que ela construiria a
infraestrutura mínima junto. As seguintes aceleraram, reaproveitando.

Duas coisas aconteceram durante os 22 meses do programa, que incluem os quatro de
interrupção:

**Interrupção no mês 7.** Uma prioridade regulatória consumiu o time por quatro meses. O
programa parou com 4 das 11 fatias concluídas — e as quatro estavam em produção,
entregando valor. Nada foi perdido.

**Mudança de escopo no mês 15.** Uma aquisição trouxe um sistema que atendia parte do que
as fatias 8 e 9 fariam. Elas foram removidas do plano — e nada do que já tinha sido feito
precisou ser desfeito.

No plano original, ambos os eventos teriam sido fatais: a interrupção no mês 7 pegaria o
programa na fase 2, sem nada entregue; a mudança de escopo no mês 15 invalidaria trabalho
das fases anteriores.

O detalhe que a equipe destaca: a primeira fatia custou cerca de 60% a mais que custaria se a
infraestrutura tivesse sido construída antes, isoladamente. Esse foi o prêmio pago — e
ele se pagou duas vezes, nos dois eventos.

## Conceitos Relacionados

- [Strangler Fig](/16-legacy-modernization/strangler-fig.md) — o mecanismo.
- [Arquitetura de Transição](/15-enterprise-architecture/transition-architecture.md).
- [Restrições Organizacionais](/16-legacy-modernization/organizational-constraints.md).
- [Estratégias de Migração](/16-legacy-modernization/migration-strategies.md).

## Exercício Prático

Pegue o plano de modernização do seu contexto e teste cada fase: se o programa parar
logo depois dela, o que foi entregue se justifica?

As fases que falham no teste precisam ser redivididas por funcionalidade, não por camada.

## Perguntas de Entrevista

- Quais três testes uma fatia precisa passar?
- Por que fatiar verticalmente custa mais e vale a pena?
- Qual o limite da modernização oportunista?

## Para Aprofundar

- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Feathers, Michael. *Working Effectively with Legacy Code*. Prentice Hall, 2004.
- Humble, Jez; Farley, David. *Continuous Delivery*. Addison-Wesley, 2010.
