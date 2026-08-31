---
id: strong-consistency
title: Consistência Forte
sidebar_position: 32
description: Toda leitura observa a última escrita — e o preço em latência que se paga sempre.
doc_type: concept
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor identifica as operações que exigem consistência forte e
  limita o escopo da coordenação ao necessário.
prerequisites: [consistency]
related: [eventual-consistency, consensus, pacelc]
canonical_for: [consistência forte, linearizabilidade]
content_version: 1
last_reviewed: 2026-08-27
---

# Consistência Forte

## Visão Geral

Consistência forte — na forma mais estrita, **linearizabilidade** — garante que o
sistema se comporte como se houvesse uma única cópia dos dados, com todas as
operações acontecendo instantaneamente numa ordem que respeita o tempo real.

É a garantia que torna o raciocínio simples: a leitura vê a última escrita, ponto.

E ela custa coordenação — o que significa latência, em toda operação, para sempre.

## Problema

O modelo mental de consistência forte é o que todo desenvolvedor já tem, porque é
como um programa de processo único funciona.

Isso torna a garantia atraente por default: adotá-la elimina uma classe inteira de
raciocínio sobre dado velho, conflito e convergência.

O custo é que ela não escala da mesma forma. Cada operação que precisa de garantia
forte precisa coordenar com a maioria das réplicas — e coordenação é ida e volta
de rede.

Numa configuração de região única, isso é aceitável. Numa multi-região, é
frequentemente inviável — e o cálculo é geométrico, não de otimização.

## Conceitos Centrais

### O que ela garante

**Linearizabilidade** é sobre operações individuais: existe um instante entre o
início e o fim de cada operação em que ela parece ter acontecido, e a ordem desses
instantes respeita o tempo real.

A consequência prática: se A completa antes de B começar, B enxerga o efeito de A.
Sempre, independentemente de qual réplica atende.

**Serializabilidade** é sobre transações: o resultado equivale a alguma execução
sequencial. As duas juntas — *strict serializability* — dão a garantia mais forte
disponível.

Confundir as duas é comum. Um banco pode ser serializável e não linearizável: as
transações são corretas, e uma leitura pode não ver a escrita mais recente.

### O custo é coordenação

Garantir que toda leitura veja a última escrita exige que a escrita seja conhecida
por quem responde a leitura.

As formas de conseguir isso — escrita na maioria, leitura da maioria, ou leitura do
líder — todas envolvem comunicação entre nós.

```text
região única, mesma zona          → +1 a 2 ms por operação
região única, entre zonas         → +2 a 5 ms
duas regiões, mesmo continente    → +30 ms
regiões intercontinentais         → +150 ms
```

A última linha é o que torna consistência forte global impraticável para operações
de alta frequência. Ver [PACELC](/06-distributed-systems/pacelc.md).

### Limitar o escopo é a técnica principal

A pergunta que resolve a maior parte dos casos não é "forte ou eventual?". É
**"forte em relação a quê?"**.

Consistência forte **global** — todas as réplicas do mundo coordenando — é cara.
Consistência forte **por partição** é muito mais barata: coordenar apenas entre as
réplicas daquela partição, que podem estar próximas.

Um sistema de reservas de hotel não precisa que São Paulo coordene com Tóquio. Ele
precisa que as réplicas do hotel de São Paulo coordenem entre si.

Ver [particionamento](/06-distributed-systems/partitioning.md). **Particionar reduz o escopo da
coordenação**, e é o que torna consistência forte viável em escala.

### Ela é indisponível sob partição

Por [CAP](/06-distributed-systems/cap.md), garantir consistência durante uma partição significa recusar
operações no lado minoritário.

Isso precisa ser aceito explicitamente: o sistema fica indisponível para parte dos
usuários em vez de divergir.

Para saldo bancário e estoque, é a troca certa. Para catálogo e feed, não é.

### Nem toda operação precisa

A observação que evita a maior parte do custo: num sistema típico, a fração de
operações que genuinamente exige consistência forte é pequena.

Débito de saldo, sim. Consulta de extrato, não. Reserva de assento, sim. Listagem
de voos, não.

Aplicar a garantia uniformemente paga o custo em todas para proteger poucas.

## Modelo Mental

**Consistência forte troca latência por certeza, em toda operação.** A pergunta é
para quais operações a certeza vale o preço.

## Quando Usar

- O dado controla um recurso finito — estoque, assento, saldo, cota.
- Uma decisão irreversível depende do valor lido.
- Há requisito regulatório de exatidão.
- Duas operações concorrentes produziriam estado inválido.
- O custo de estar errado supera o custo da latência.

## Quando Não Usar

**Como padrão para todas as operações.** Paga em todas para proteger poucas.

**Globalmente, quando por partição resolve.** O escopo é a variável mais
importante.

**Quando a indisponibilidade sob partição é inaceitável.** Ali a resposta é
eventual, com reconciliação.

**Para dado que não controla recurso.** Perfil, catálogo, histórico, agregados.

**Quando garantias de sessão resolvem a percepção.** Ver
[consistência eventual](/06-distributed-systems/eventual-consistency.md).

## Alternativas

- **Garantias de sessão** — resolve a percepção do usuário a custo baixo.
- **Consistência forte por partição** — reduz o escopo da coordenação.
- **Transação local** — se os dados cabem num nó, a garantia vem de graça.
- **Reserva com expiração** — em vez de coordenar globalmente, reservar
  localmente com prazo e confirmar depois.

A última é o padrão usado em bilhetagem e reservas: bloquear localmente por
minutos resolve a concorrência real sem coordenação global.

## Trade-offs

| Forte | Eventual |
|---|---|
| Raciocínio simples | Aplicação lida com dado velho |
| Sem conflito | Conflitos a resolver |
| Latência de coordenação sempre | Latência local |
| Indisponível sob partição | Disponível |
| Escala de escrita limitada | Escala |

| Escopo global | Por partição |
|---|---|
| Coordenação entre todas as réplicas | Só dentro da partição |
| Latência geográfica | Local |
| Operações entre partições simples | Precisam de coordenação extra |

## Modos de Falha

**Latência inaceitável descoberta em produção.** A coordenação foi subestimada.

**Indisponibilidade sob partição não prevista.** O negócio não sabia que o sistema
recusaria operações.

**Consistência forte presumida e não configurada.** O código assume que a leitura
vê a escrita, e a configuração lê de réplica.

**Escopo global desnecessário.** Coordenação intercontinental para dados
regionais.

**Contenção.** Muitas operações concorrentes sobre a mesma chave serializam, e a
vazão despenca.

## Erros Comuns

**Adotar uniformemente.**

**Não limitar o escopo por partição.**

**Confundir linearizabilidade com serializabilidade.**

**Não verificar o que o banco de fato garante na configuração usada.**

**Não medir o custo de latência da coordenação.**

## Exemplo Real

Um sistema de venda de ingressos para eventos precisava garantir que um assento
não fosse vendido duas vezes.

A implementação original usava consistência forte global: o banco replicado em três
regiões, com escrita exigindo maioria.

Cada reserva custava 180 ms de coordenação. Na abertura de vendas de um evento
grande, com 40 mil pessoas simultâneas, o sistema não dava conta — a coordenação
serializava.

A reformulação manteve consistência forte e mudou o escopo.

**Particionamento por evento.** Cada evento tem suas réplicas, na região onde ele
acontece. A coordenação para reservar um assento passou a ser entre réplicas
regionais: de 180 ms para 8 ms.

**Reserva com expiração.** Em vez de coordenar durante todo o fluxo de compra, a
reserva bloqueia o assento por 10 minutos — uma operação coordenada, curta. O
restante do fluxo — pagamento, cadastro — acontece sem coordenação.

**Leitura eventual para o mapa de assentos.** A visualização de disponibilidade lê
de réplica local, com atraso de segundos. O negócio aceitou: se um assento aparece
disponível e já foi reservado, a tentativa de reserva falha com mensagem clara — o
que é raro e aceitável.

Resultado: a garantia de não vender duas vezes permaneceu absoluta, e a capacidade
subiu por mais de uma ordem de grandeza.

A avaliação posterior aponta: nunca esteve em questão abrir mão de consistência forte
para a reserva. O que estava errado era o **escopo** — coordenar globalmente algo
que é intrinsecamente local a um evento.

## Conceitos Relacionados

- [Consistência](/06-distributed-systems/consistency.md) — o espectro.
- [Consistência Eventual](/06-distributed-systems/eventual-consistency.md) — o outro extremo.
- [PACELC](/06-distributed-systems/pacelc.md) — o custo permanente.
- [Consenso](/06-distributed-systems/consensus.md) — o mecanismo por trás.
- [Particionamento](/06-distributed-systems/partitioning.md) — como reduzir o escopo.

## Exercício Prático

Liste as operações do seu sistema que genuinamente exigem consistência forte — as
que produziriam estado inválido se duas acontecessem concorrentemente.

Para cada uma, pergunte: qual o menor escopo de coordenação que basta? Se a
resposta for menor que o escopo atual, há latência sendo paga sem necessidade.

## Perguntas de Entrevista

- Qual a diferença entre linearizabilidade e serializabilidade?
- Por que consistência forte custa latência mesmo sem falha?
- Como reduzir o custo sem abrir mão da garantia?

## Para Aprofundar

- Herlihy, Maurice; Wing, Jeannette. *Linearizability: A Correctness Condition for
  Concurrent Objects*. TOPLAS, 1990.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 9.
- Abadi, Daniel. *Consistency Tradeoffs in Modern Distributed Database System
  Design*. IEEE Computer, 2012.
