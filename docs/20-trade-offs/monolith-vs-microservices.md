---
id: monolith-vs-microservices
title: Monólito vs. Microsserviços
sidebar_position: 8
description: A pergunta é sobre pré-requisitos organizacionais, não sobre estrutura de código.
doc_type: tradeoff
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor avalia a decisão pelos pré-requisitos operacionais e pela
  estabilidade das fronteiras, não pela moda ou pelo tamanho do código.
prerequisites: [microservices]
related: [centralization-vs-decentralization, coupling-vs-duplication, sync-vs-async]
canonical_for: [monólito contra microsserviços, pré-requisito operacional, granularidade de implantação, fronteira instável]
content_version: 2
last_reviewed: 2026-08-29
---

# Monólito vs. Microsserviços

## Visão Geral

A pergunta é feita como se fosse sobre estrutura de código. Não é.

```text
eixo real   os pré-requisitos organizacionais existem, e as fronteiras
            do domínio estão estáveis o bastante para serem fixadas?
```

Microsserviços resolvem um problema **organizacional**: permitir que times implantem e
escalem de forma independente. Se esse problema não existe — porque há um time, ou porque a
implantação conjunta não incomoda —, a arquitetura entrega custo sem benefício.

E há um pré-requisito técnico: separar em serviços **fixa fronteiras**. Fixar uma fronteira
errada é caro de corrigir, e a fronteira certa raramente é conhecida no início.

## Problema

A decisão é frequentemente tomada pelos motivos errados:

```text
"o monólito está grande"          → tamanho não é o critério
"microsserviços escalam melhor"   → escala é resolvida por réplicas, não por divisão
"assim ficam desacoplados"        → serviços mal divididos acoplam mais, pela rede
"é o que as empresas grandes usam" → elas têm os pré-requisitos, e você talvez não
```

E o custo aparece depois, distribuído:

```text
transação local vira transação distribuída
chamada de método vira chamada de rede, com falha parcial
depuração exige rastreamento distribuído
ambiente local exige N serviços rodando
mudança que atravessa fronteira exige coordenar times
cada serviço precisa de esteira, monitoração, alarme, plantão
```

O erro simétrico existe: manter um monólito quando a organização já tem 40 times disputando
uma única implantação, e a coordenação virou o gargalo dominante.

## Conceitos Centrais

### Pré-requisitos, não preferências

Microsserviços exigem capacidades que precisam existir **antes**:

```text
implantação automatizada, independente por serviço
observabilidade distribuída — rastreamento, correlação, agregação de registros
provisionamento por autoatendimento
times donos de serviço, com plantão próprio
capacidade de operar comunicação assíncrona
gestão de contratos entre serviços, com versionamento
```

Sem eles, o custo de cada serviço adicional é alto e recai sobre os times. Uma organização
que adota microsserviços sem plataforma paga o custo da distribuição sem receber a
autonomia.

Ver [engenharia de plataforma](/14-devops-and-platform/platform-engineering.md).

### Fronteira instável é o principal impedimento

```text
domínio conhecido, fronteiras estáveis     dividir é viável
domínio em descoberta                      dividir fixa erros
```

Uma fronteira errada dentro de um monólito modular é corrigida movendo código. Entre
serviços, corrigi-la exige migrar dados, coordenar implantações e versionar contratos.

Isso favorece a sequência: **monólito modular primeiro, extração depois**, quando a
fronteira tiver se provado estável ao longo de meses de mudança real.

Ver [contextos delimitados](/04-domain-driven-design/bounded-context.md).

### Tamanho do código não é o critério

```text
monólito de 500 mil linhas, um time, fronteiras internas claras  → está bem
12 serviços, um time de 6 pessoas                                → está mal
```

O critério é o número de **times que precisam implantar de forma independente**, e a
disputa que a implantação conjunta gera.

Um sinal mensurável: tempo de espera para implantar, e frequência com que uma mudança é
bloqueada por outra.

### O monólito modular é a opção mais subestimada

```text
uma unidade implantável
módulos com fronteira explícita e esquema próprio
acesso entre módulos apenas por interface pública
verificação automática das fronteiras
```

Ele entrega a maior parte do benefício organizacional de fronteiras claras sem nenhum dos
custos da distribuição, e mantém a opção de extrair depois.

O modo de falha é conhecido: sem verificação automática, as fronteiras erodem em prazo de
meses. Com ela, a erosão fica visível e mensurável — e passa a se concentrar na lista de
exclusões, que é onde ela se esconde. Ver
[funções de aptidão](/19-architecture-governance/fitness-functions-governance.md).

### Granularidade: quantos serviços

Quando a divisão se justifica, ela é frequentemente feita fina demais:

```text
serviço por contexto de domínio       geralmente certo
serviço por entidade                  quase sempre errado
serviço por time                      bom ponto de partida
serviço por camada                    errado — acopla tudo em cada mudança
```

Poucos serviços grandes erram menos que muitos serviços pequenos, porque cada fronteira é
uma decisão que pode estar errada. Ver
[fronteiras de serviço](/05-system-design/service-boundaries.md).

### Sinais de escolha errada

```text
dividiu cedo demais
  mudança de funcionalidade exigindo alterar 3+ serviços com frequência
  transações distribuídas onde havia transação local
  ambiente local exigindo mais serviços do que a máquina aguenta
  tempo de depuração dominado por correlacionar registros
  mais serviços que engenheiros

manteve monólito além da hora
  fila de implantação, com mudanças bloqueando umas às outras
  um componente exigindo escala muito acima dos demais
  times esperando uns pelos outros para entregar
  janela de implantação negociada entre equipes
  falha em um módulo derrubando funcionalidades não relacionadas
```

O primeiro sinal de cada lista é o mais confiável.

### Custo de mudar de ideia

```text
monólito modular → serviços   moderado, e viável: as fronteiras já existem
serviços → monólito           caro e raro, mas acontece — exige reunificar
                              dados e desfazer contratos
monólito não modular → serviços  muito caro: desemaranhar antes de extrair
```

A terceira linha é a situação mais comum na prática, e a razão de a modularização valer a
pena mesmo para quem pretende nunca dividir: ela é o que mantém a opção aberta a custo
baixo.

## Modelo Mental

**Microsserviços são uma solução organizacional com pré-requisitos técnicos.** Sem os
pré-requisitos e sem o problema, é custo puro.

## Quando Usar

Prefira **microsserviços** quando:

- Múltiplos times precisam implantar de forma independente, e a fila já existe.
- Os pré-requisitos operacionais estão construídos.
- As fronteiras do domínio são conhecidas e estáveis.
- Componentes têm perfis de escala muito diferentes.
- Há requisito de isolamento — regulatório, de segurança, de disponibilidade.

Prefira **monólito modular** quando:

- Há um ou poucos times.
- O domínio ainda está em descoberta.
- Não há plataforma de operação.
- A escala é atendida por réplicas do conjunto.
- O prazo não permite construir os pré-requisitos.

## Quando Não Usar

**Decidindo por tamanho de código.**

**Adotando microsserviços sem os pré-requisitos.**

**Dividindo por camada ou por entidade.**

**Mantendo monólito não modular** — o pior dos dois, e é onde a maioria está.

**Como decisão irreversível** — a sequência modular → extração é legítima e preferível.

## Alternativas

- **Monólito modular** — a opção certa com mais frequência do que qualquer dos extremos.
- **Extração seletiva** — separar um ou dois componentes com perfil distinto, mantendo o
  resto junto.
- **Serviços por time, não por domínio** — granularidade grossa, alinhada à necessidade
  organizacional real.
- **Monólito com réplicas especializadas** — a mesma base de código implantada com
  configurações diferentes por perfil de carga.

A última resolve o caso "um componente precisa de escala diferente" sem dividir nada.

## Trade-offs

| Microsserviços | Monólito modular |
|---|---|
| Implantação independente | Implantação simples |
| Escala por componente | Escala do conjunto |
| Falha isolada | Falha compartilhada |
| Transação distribuída | Transação local |
| Exige plataforma | Não exige |
| Fronteiras fixadas | Fronteiras móveis |

| Poucos serviços grandes | Muitos pequenos |
|---|---|
| Menos fronteiras erradas | Mais autonomia |
| Menos coordenação | Mais coordenação |
| Menos overhead operacional | Mais |

## Modos de Falha

**Divisão sem pré-requisitos.** Custo da distribuição, sem a autonomia.

**Fronteira errada fixada.** Mudanças atravessando serviços sempre.

**Monólito não modular.** Nem simples, nem separável.

**Granularidade fina demais.** Mais serviços que engenheiros.

**Fila de implantação ignorada.** O monólito passou da hora.

**Modularidade sem verificação.** Erosão silenciosa, descoberta na primeira extração.

## Erros Comuns

**Decidir por tamanho** em vez de por número de times e fila de implantação.

**Dividir antes de conhecer o domínio.**

**Não construir a plataforma antes.**

**Não modularizar o monólito** enquanto ele é a escolha certa.

**Tratar a decisão como permanente.**

## Exemplo Real

Uma empresa de educação com 22 engenheiros em 4 times migrou seu monólito para
microsserviços em 2022. O motivo declarado: "o monólito está difícil de manter".

Dezoito meses depois, com 31 serviços:

```text
engenheiros                                     22
serviços                                        31
mudanças de funcionalidade tocando 3+ serviços  61% das entregas
tempo médio de entrega                          de 6 para 17 dias
incidentes por mês                              de 4 para 14
tempo de subida do ambiente local               45 min, quando funcionava
transações distribuídas implementadas à mão      7
```

A causa não era a arquitetura em si. Era a ausência de pré-requisitos e a instabilidade das
fronteiras:

```text
plataforma de implantação            não existia; cada serviço com esteira própria
rastreamento distribuído             ausente
plantão                              um único, para 31 serviços
fronteiras                           derivadas da estrutura de tabelas do monólito,
                                     não do domínio
```

As fronteiras derivadas de tabelas eram o problema estrutural: elas produziam serviços que
não correspondiam a nenhuma unidade de mudança do negócio, o que explica os 61%.

A correção, em 14 meses, foi de reconsolidação:

**De 31 para 9 serviços**, reagrupados por contexto de domínio identificado a partir do
histórico de mudanças — módulos que sempre mudavam juntos voltaram a ser um.

**Um monólito modular** absorveu 19 dos 31 serviços, com fronteiras internas verificadas
automaticamente.

**Quatro serviços mantidos separados**, cada um com justificativa registrada: perfil de
escala distinto no processamento de vídeo, isolamento regulatório no serviço de dados de
menores, cadência de mudança muito diferente no serviço de integração com escolas, e
requisito de disponibilidade próprio na autenticação.

**Plataforma construída** durante o processo — esteira comum, observabilidade distribuída,
provisionamento por autoatendimento.

Resultados após a reconsolidação:

```text
serviços                                        9
mudanças tocando 3+ serviços                    14% das entregas
tempo médio de entrega                          5 dias
incidentes por mês                              3
tempo de subida do ambiente local               4 min
transações distribuídas                         2, ambas necessárias
```

E dois anos depois, com a empresa em 9 times, dois módulos do monólito modular foram
extraídos — desta vez com fronteiras provadas por dois anos de mudanças, e com a plataforma
pronta. As extrações levaram 5 e 7 semanas, sem incidente.

A avaliação posterior aponta: o monólito de 2022 era de fato difícil de manter, e o diagnóstico
estava certo. O erro foi de tratamento — o problema era ausência de fronteiras internas, e a
resposta aplicada foi distribuição, que fixa fronteiras antes de conhecê-las.

Modularizar teria resolvido o problema real, e a metade do trabalho foi exatamente isso,
dois anos depois e com custo muito maior.

## Conceitos Relacionados

- [Microsserviços](/03-design-patterns/microservices.md) e
  [Monólito Modular](/03-design-patterns/modular-monolith.md).
- [Fronteiras de Serviço](/05-system-design/service-boundaries.md).
- [Centralização vs. Descentralização](/20-trade-offs/centralization-vs-decentralization.md).
- [Síncrono vs. Assíncrono](/20-trade-offs/sync-vs-async.md) — o custo que a divisão traz.

## Exercício Prático

Meça, nas últimas 30 entregas do seu sistema, quantas tocaram mais de um serviço ou módulo.

Acima de 40%, as fronteiras não correspondem às unidades de mudança do negócio — e dividir
mais vai piorar.

## Perguntas de Entrevista

- Por que tamanho de código não é critério para esta decisão?
- Que pré-requisitos precisam existir antes de dividir?
- Por que fronteira instável é o principal impedimento à divisão?

## Para Aprofundar

- Newman, Sam. *Building Microservices*. 2ª ed. O'Reilly, 2021.
- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Ford, Neal et al. *Software Architecture: The Hard Parts*. O'Reilly, 2021.
