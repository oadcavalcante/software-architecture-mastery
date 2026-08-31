---
id: adr-005-hexagonal
title: "ADR-005 — Portas e Adaptadores nos Módulos de Domínio"
sidebar_position: 14
description: Exemplo de ADR com escopo estreito e discordância registrada — adotar hexagonal só onde ela se paga.
doc_type: adr
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor vê como delimitar o escopo de uma decisão de desenho e como
  registrar objeção legítima sem apagá-la.
prerequisites: [adr-structure]
related: [adr-decision, adr-alternatives, adr-consequences]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-29
---

# ADR-005 — Adotar Portas e Adaptadores nos Módulos de Domínio

:::note Exemplo didático

Último dos cinco ADRs do sistema fictício **Verano**. Este exemplo mostra **escopo estreito
declarado** e **discordância registrada**.

:::

| | |
|---|---|
| Status | aceito em 2026-01-15 |
| Sistema | Verano — plataforma de pedidos |
| Autores | equipe de plataforma |
| Decisores | comitê técnico da plataforma |
| Consultados | os cinco times de produto |

## Contexto

Três anos depois do [ADR-001](/18-architecture-decisions/adr-001-modular-monolith.md), o monólito modular continua
sendo a estrutura da Verano, e continua sustentando o negócio. Mas duas pressões apareceram.

**Extração.** O módulo de entrega passou a ter perfil de carga muito diferente do resto —
picos concentrados em duas janelas do dia, com necessidade de escala independente. A
condição "módulo isolado exigindo capacidade acima de 3× a dos demais", registrada como
sinal de alerta no ADR-001, foi atingida em novembro de 2025.

**Substituição de infraestrutura.** Nos últimos 18 meses trocamos o provedor de pagamento,
o de notificação por mensagem e o de geolocalização. Cada troca levou entre 6 e 11 semanas,
e a medição de onde o tempo foi gasto mostrou o padrão:

```text
lógica de negócio tocada em cada troca     entre 40 e 70 arquivos
lógica que precisaria mudar de verdade     ~0
tempo em adaptação de chamadas espalhadas  ~70% do esforço
```

Situação em janeiro de 2026:

```text
módulos                       7 (catálogo, carrinho, pedido, pagamento,
                              entrega, notificação, antifraude)
engenheiros                   38, em 5 times
módulos com lógica de
  domínio substantiva         3 — pedido, entrega, antifraude
módulos majoritariamente
  de integração ou consulta   4
```

Restrições:

- Não temos capacidade para reescrever sete módulos. Qualquer mudança precisa ser
  incremental.
- A equipe está distribuída entre cinco times com autonomia; uma decisão que exija
  reaprendizado em todos custa caro.

O que não sabíamos: se o módulo de entrega seria de fato extraído, ou se a escala
independente poderia ser resolvida sem extração.

## Decisão

Vamos adotar **portas e adaptadores** nos três módulos com lógica de domínio substantiva —
**pedido, entrega e antifraude**.

Nesses módulos, a lógica de domínio passa a depender apenas de interfaces declaradas por
ela mesma. Banco, provedores externos, mensageria e transporte entram como adaptadores.

**Não vamos** aplicar o padrão aos quatro módulos restantes — catálogo, carrinho,
notificação e pagamento continuam com acesso direto a banco e a clientes de integração. Nos
módulos que são essencialmente integração ou consulta, a inversão acrescentaria camada sem
lógica para proteger.

**Não vamos** reescrever os três módulos de uma vez: a adoção é incremental, aplicada ao
código novo e às áreas tocadas por mudança, com prazo de 12 meses.

## Alternativas Consideradas

**Aplicar a todos os sete módulos.** Descartada porque quatro deles não têm lógica de
domínio a isolar — a camada adicional seria custo sem retorno, e o padrão perderia
credibilidade justamente onde ele importa.

*Voltaria a ganhar se:* algum desses quatro desenvolver lógica de domínio própria. Catálogo
é o candidato mais provável, com as regras de precificação no roteiro.

**Não adotar; extrair o módulo de entrega diretamente.** Descartada porque a extração sem
isolamento prévio exigiria desemaranhar as dependências durante a extração — que é o
momento de maior risco. Fazer o isolamento antes permite extrair depois com o domínio já
independente.

*Voltaria a ganhar se:* a extração fosse urgente e a lógica do módulo já fosse isolada.

**Anti-corruption layer apenas nas integrações externas**, sem inverter as dependências de
persistência. Descartada como insuficiente para o objetivo de extração — o acoplamento ao
banco é o que mais dificulta separar um módulo. Mas foi adotada como **passo intermediário**
nos três módulos, por ser mais barata e dar resultado antes.

## Consequências

**Positivas (curto prazo).** Trocas de provedor passam a tocar apenas o adaptador. Com base
nas três trocas anteriores, estimamos redução de 6–11 semanas para 2–3.

**Positivas (longo prazo).** O módulo de entrega fica extraível sem desemaranhar
dependências. Testes de domínio deixam de exigir banco.

**Negativas (imediatas).** Mais interfaces e mais arquivos. Navegar do endpoint até a regra
passa por uma indireção a mais, o que incomoda especialmente quem está chegando.

**Negativas (longo prazo).** Dois estilos convivendo na mesma base de código, por decisão
deliberada. Isso exige que o critério seja conhecido, ou vira inconsistência aparente.

**Neutras.** Um documento curto explicando o critério de aplicação passa a ser necessário
na integração de pessoas novas.

**Risco aceito.** O padrão pode vazar para os quatro módulos por imitação, sem o critério.
Vamos verificar isso nas revisões de código.

## Discordância Registrada

Três engenheiros, de dois times, defenderam aplicar o padrão a todos os sete módulos. O
argumento: dois estilos na mesma base de código produzem confusão maior que o custo da
camada extra, e o critério "tem lógica de domínio substantiva" é subjetivo o bastante para
gerar discussão a cada módulo novo.

A decisão foi tomada aceitando esse risco, com duas mitigações: o critério foi escrito
explicitamente no guia de contribuição, e a questão será reavaliada em 12 meses com base em
quantas discussões sobre "este módulo se aplica?" tiverem ocorrido.

## Sinal de Alerta

- Mais de **cinco discussões** em 12 meses sobre se um módulo se enquadra no critério.
- Tempo médio de troca de provedor **acima de 4 semanas** após a adoção.
- Qualquer um dos quatro módulos excluídos adotando o padrão **sem decisão registrada**.
- Reclamação recorrente de pessoas novas sobre navegabilidade nos três módulos.

## O que observar neste exemplo

O escopo é **estreito e declarado nos dois sentidos**: três módulos sim, quatro não, com o
critério explícito. Ver [decisão](/18-architecture-decisions/adr-decision.md).

A discordância tem seção própria, com o argumento de quem discordou preservado e a
mitigação registrada. Se o risco se materializar, a objeção estará lá — e ela era boa. Ver
[consequências](/18-architecture-decisions/adr-consequences.md).

Uma alternativa descartada foi **parcialmente adotada** como passo intermediário. Isso é
comum na prática e raramente registrado.

O contexto liga esta decisão ao sinal de alerta do [ADR-001](/18-architecture-decisions/adr-001-modular-monolith.md),
atingido dois meses antes. A cadeia de decisões da Verano é navegável de ponta a ponta —
que é o efeito que o registro contínuo produz.

## Conceitos Relacionados

- [Decisão](/18-architecture-decisions/adr-decision.md) — escopo e discordância.
- [Arquitetura Hexagonal](/02-software-design/hexagonal-architecture.md).
- [ADR-001](/18-architecture-decisions/adr-001-modular-monolith.md) — a decisão estrutural que este complementa.
- [Anti-Corruption Layer](/08-integration-architecture/integration-anti-corruption.md).
