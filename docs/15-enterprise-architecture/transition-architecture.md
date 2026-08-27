---
id: transition-architecture
title: Arquitetura de Transição
sidebar_position: 18
description: Os estados intermediários entre o que existe e o que se quer — o documento que mais falta.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor define estados intermediários viáveis, cada um entregando
  valor por si.
prerequisites: [target-architecture]
related: [target-architecture, current-state-architecture, architecture-roadmaps]
canonical_for: [arquitetura de transição, coexistência, ponto de não retorno]
content_version: 1
last_reviewed: 2026-08-28
---

# Arquitetura de Transição

## Visão Geral

A arquitetura de transição descreve os **estados intermediários** entre o que existe e o
que se quer — cada um deles um sistema que funciona, não um estado de obra.

É a peça que mais frequentemente falta. Organizações têm estado atual e estado-alvo, e
entre os dois um espaço em branco preenchido com "vamos migrando".

E é onde o trabalho de fato acontece: a maior parte da vida de um programa de
modernização é passada nos estados intermediários, não no alvo.

## Problema

Sem estados intermediários definidos, a migração tem duas formas ruins.

**Salto único.** Constrói-se o novo em paralelo por dois anos e troca-se de uma vez. O
risco é concentrado, a validação acontece tarde, e o valor só aparece no fim — se
aparecer.

**Deriva.** Começa-se a migrar sem destino intermediário definido. Meses depois, o
sistema está meio migrado, com as duas versões convivendo indefinidamente, e ninguém
sabe se avançar ou voltar.

A segunda é mais comum e mais cara: a coexistência prolongada tem custo permanente, e ela
se torna o estado final por inércia.

## Conceitos Centrais

### Cada estado intermediário precisa ser viável por si

O critério que define um bom estado intermediário:

```text
funciona          é um sistema operável, não uma obra
entrega valor     alguém está melhor por causa dele
é defensável      se o programa parar aqui, não foi desperdício
é reversível      ou o custo de voltar é conhecido
```

A terceira linha é a mais importante. Programas de modernização são interrompidos —
prioridades mudam, orçamento muda, pessoas mudam. Um estado intermediário que só faz
sentido como etapa de um plano completo vira dívida quando o plano é abandonado.

E isso muda o sequenciamento: em vez de ordenar por dependência técnica, ordenar por
valor entregue — de forma que parar em qualquer ponto deixe a organização melhor que
antes.

### A coexistência é a regra, não a exceção

Durante a transição, o velho e o novo convivem. Isso precisa ser projetado:

```text
qual é a fonte da verdade em cada momento
como os dois lados se mantêm coerentes
quem escreve onde
como o tráfego é dividido
quando e como o velho é desligado
```

A primeira linha é a que mais causa dano quando fica implícita: dois sistemas escrevendo
o mesmo dado, sem uma fonte definida, produzem divergência que ninguém detecta. Ver
[consistência de dados](../07-data-architecture/data-consistency.md).

E a última é a que mais frequentemente não acontece: o sistema antigo permanece ligado
"por precaução", indefinidamente, com o custo de manter os dois.

### Padrões de transição

```text
estrangulamento    o novo intercepta e assume funcionalidades gradualmente,
                   o velho encolhe até poder ser desligado
escrita dupla      escreve nos dois, lê de um; troca a leitura quando confiar
sombra             o novo processa em paralelo sem responder, para comparar
divisão por fatia  um segmento de usuários, uma região, um tipo de operação
```

Ver [modernização de legado](../16-legacy-modernization/index.md) para o tratamento
completo.

A escolha depende do risco e da reversibilidade: sombra é a mais segura e a mais cara;
divisão por fatia é a que entrega valor mais cedo.

### Pontos de não retorno precisam ser explícitos

Alguns passos não têm volta:

```text
migração de dados com transformação irreversível
desligamento do sistema antigo
mudança de contrato com terceiro
descarte do conhecimento — pessoas que saem
```

Cada um desses merece decisão explícita, com verificação antes: **o novo está de fato
funcionando, com volume real, por tempo suficiente?**

O erro característico é desligar o antigo cedo demais, porque manter os dois é caro — e
descobrir depois um caso de uso que só ele atendia.

### O custo da transição é maior que a soma das partes

Durante a coexistência, paga-se:

```text
operar os dois sistemas
manter a sincronização entre eles
lidar com divergências
duas vezes o trabalho de mudanças que afetam ambos
carga cognitiva de duas realidades
```

Isso significa que **transições longas são caras de forma composta**, e que encurtá-las
tem retorno alto.

E significa que um plano de transição precisa incluir o custo de estar no meio — que
frequentemente é omitido das estimativas, produzindo programas que custam muito mais que
o previsto.

### Definir o critério de conclusão

Um estado intermediário sem critério de saída se torna permanente.

```text
ruim   "quando terminarmos de migrar"
bom    "quando 100% do tráfego estiver no novo por 30 dias sem incidente,
        e nenhum acesso ao antigo for registrado por 60 dias"
```

O segundo permite desligar com confiança e dá um marco verificável. O primeiro produz a
coexistência indefinida.

## Modelo Mental

**Cada estado intermediário é um sistema que funciona e entrega valor.** Se parar ali é
desperdício, o estado foi mal definido.

## Quando Usar

- Qualquer migração que leve mais de alguns meses.
- Modernização de sistemas em produção.
- Substituição de fornecedor.
- Consolidação após aquisição.
- Mudanças de fronteira entre sistemas.

## Quando Não Usar

**Salto único** em sistemas críticos.

**Sem definir a fonte da verdade** durante a coexistência.

**Sem critério de conclusão** de cada estado.

**Sem plano de desligamento** do antigo.

**Ordenando por dependência técnica** em vez de por valor.

**Sem contabilizar o custo da coexistência.**

## Alternativas

- **Salto único** — legítimo para sistemas pequenos, com reversão viável.
- **Reescrita paralela com troca** — quando o sistema antigo é impossível de
  interceptar.
- **Congelar e construir ao lado** — o antigo para de evoluir, o novo cresce.
- **Não migrar** — decisão legítima quando o sistema atende e o custo de mudar não se
  paga.

A última merece consideração séria e raramente é considerada.

## Trade-offs

| Muitos estados | Poucos |
|---|---|
| Valor cedo, risco distribuído | Menos coexistência |
| Coexistência prolongada | Salto maior |
| Reversível em vários pontos | Menos pontos de volta |

| Estrangulamento | Reescrita paralela |
|---|---|
| Valor incremental | Valor no fim |
| Complexidade de interceptação | Construção limpa |
| Risco distribuído | Concentrado |

## Modos de Falha

**Coexistência permanente.** O antigo nunca é desligado.

**Divergência de dados.** Duas fontes sem verdade definida.

**Estado que não entrega valor.** Se o programa parar, foi desperdício.

**Desligamento prematuro.** Um caso de uso esquecido.

**Custo subestimado.** A coexistência não entrou na conta.

**Programa interrompido no meio.** Sem estado defensável.

## Erros Comuns

**Não definir estados intermediários.**

**Não definir a fonte da verdade.**

**Não ter critério de conclusão.**

**Ordenar por dependência técnica.**

**Não planejar o desligamento.**

**Omitir o custo da coexistência.**

## Exemplo Real

Um banco iniciou a substituição do sistema de cadastro de clientes — 18 anos, usado por
23 sistemas.

O plano original: construir o novo em paralelo, migrar os dados, e trocar as 23
integrações num fim de semana.

Estimativa: 14 meses. Após 20 meses, o novo estava construído e a troca nunca acontecia —
cada tentativa de agendar encontrava um sistema que não estava pronto, e o risco de
trocar 23 integrações de uma vez paralisava a decisão.

A reformulação definiu estados intermediários, ordenados por valor:

**Estado 1 — leitura pelo novo.** O novo passou a ser preenchido por replicação a partir
do antigo, e os sistemas que apenas **leem** cadastro migraram para ele. Sete sistemas,
em três meses.

Valor entregue: os sete pararam de sobrecarregar o sistema antigo, cuja capacidade era
o gargalo conhecido.

**Estado 2 — escrita dupla.** Cadastros novos passaram a ser escritos nos dois, com o
antigo como fonte da verdade. Isso permitiu validar o novo com dados reais, comparando
os dois lados continuamente.

Três meses de comparação revelaram 14 divergências de regra de negócio — casos que o
sistema antigo tratava de formas não documentadas.

**Estado 3 — inversão da fonte da verdade.** O novo virou fonte, o antigo passou a
receber por replicação. Os sistemas de escrita migraram em ondas, por criticidade — os
menos críticos primeiro.

**Estado 4 — desligamento.** Após 90 dias sem nenhum acesso registrado ao antigo, ele foi
desligado.

Critério de conclusão de cada estado explícito, com métricas verificáveis.

Tempo total: 16 meses a partir da reformulação — mais que os 14 originais, e com valor
entregue a partir do terceiro mês, e sem nenhum fim de semana de troca.

E dois estados intermediários teriam sido defensáveis como parada: após o estado 1, o
gargalo de capacidade estava resolvido; após o estado 2, as divergências de regra
estavam mapeadas.

O que a equipe registra: os 20 meses do plano original não produziram nenhum valor
utilizável. O que travava não era técnico — era que o único momento de valor era o
último, e ele era arriscado demais para alguém aprovar.

## Conceitos Relacionados

- [Arquitetura Alvo](target-architecture.md) — o destino.
- [Arquitetura do Estado Atual](current-state-architecture.md).
- [Roteiros de Arquitetura](architecture-roadmaps.md).
- [Modernização de Legado](../16-legacy-modernization/index.md).

## Exercício Prático

Pegue uma migração em andamento no seu contexto e pergunte: se ela parar hoje, o que foi
entregue é defensável?

Se a resposta for não, o estado intermediário atual foi mal definido — e o programa está
vulnerável à próxima mudança de prioridade.

## Perguntas de Entrevista

- O que caracteriza um bom estado intermediário?
- Por que ordenar por valor em vez de por dependência técnica?
- Por que o custo da coexistência é frequentemente omitido?

## Para Aprofundar

- Fowler, Martin. *StranglerFigApplication*, 2004.
- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Open Group. *TOGAF Standard* — arquiteturas de transição.
