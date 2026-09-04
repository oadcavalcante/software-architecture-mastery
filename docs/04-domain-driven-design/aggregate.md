---
id: aggregate
title: Aggregate
sidebar_position: 13
description: A unidade de consistência transacional — e por que agregados grandes são o erro mais comum do DDD tático.
doc_type: pattern
level: 2
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor desenha agregados a partir das invariantes que precisam
  ser garantidas na mesma transação, e reconhece o custo de agregados grandes.
prerequisites: [entity, value-object]
related: [entity, domain-event, repository]
canonical_for: [aggregate, agregado, aggregate root, raiz de agregado]
content_version: 3
last_reviewed: 2026-08-26
---

# Aggregate

## Visão Geral

Um agregado é um conjunto de objetos tratado como uma unidade para fins de
consistência. Ele tem uma **raiz** — uma entidade — que é o único ponto de acesso
de fora.

A regra que o define: **tudo dentro do agregado é consistente ao final de cada
transação.** Entre agregados, a consistência é eventual.

Isso torna o desenho de agregados a decisão tática de maior consequência do DDD.

## Problema

Sem uma unidade de consistência definida, duas patologias aparecem.

**Modificação descontrolada.** Qualquer código pode alterar qualquer objeto, e as
invariantes que dependem de mais de um objeto ficam sem guardião. "O total do
pedido é a soma dos itens" é violado assim que alguém altera um item sem
recalcular.

**Transações grandes demais.** Sem fronteira, a tentação é carregar e gravar tudo
junto, o que produz bloqueios longos e conflitos de concorrência.

O agregado resolve os dois ao declarar: **estas coisas mudam juntas e são
consistentes juntas; aquelas não.**

## Conceitos Centrais

### A raiz é o único acesso

Objetos internos do agregado não são referenciados de fora. Quem precisa alterar
um item de pedido chama o pedido:

```text
❌  item = repositorio.buscarItem(id); item.alterarQuantidade(5)
✅  pedido.alterarQuantidadeDoItem(itemId, 5)
```

A segunda forma permite ao pedido validar a invariante — limite de itens, valor
mínimo, disponibilidade — antes de aceitar.

Se objetos internos são acessíveis de fora, o agregado não protege nada.

### Referencie outros agregados por identidade

A regra que mais reduz o tamanho dos agregados:

```text
❌  class Pedido { Cliente cliente; }
✅  class Pedido { ClienteId clienteId; }
```

Guardar o objeto inteiro convida a carregá-lo, a modificá-lo, e a estender a
transação a ele. Guardar o identificador declara a fronteira.

### Agregados pequenos

O erro mais comum do DDD tático é o agregado grande — um `Cliente` que contém
pedidos, que contêm itens, que contêm histórico.

Os custos aparecem juntos: carregar exige buscar tudo; gravar bloqueia tudo; dois
usuários alterando partes diferentes conflitam; e a memória cresce com o
histórico.

O critério para incluir algo no agregado é único: **existe uma invariante que só
pode ser garantida se estes objetos mudarem na mesma transação?**

Se a resposta for não, são agregados separados. E a resposta é não com muito mais
frequência do que a intuição sugere.

### Uma transação, um agregado

A regra prática de Vernon: **modifique um agregado por transação.**

Quando uma operação precisa alterar dois, isso é sinal de que as fronteiras estão
erradas — ou de que a consistência entre eles é eventual, e a coordenação deve ser
por [evento de domínio](/04-domain-driven-design/domain-event.md) ou por
[saga](/06-distributed-systems/sagas.md).

### Concorrência

Como o agregado é a unidade de consistência, ele é também a unidade de controle de
concorrência. Bloqueio otimista com número de versão na raiz é a implementação
usual — e é o que impede duas alterações simultâneas de violarem a invariante.

## Quando Usar

- Existe invariante que envolve mais de um objeto.
- A invariante precisa valer ao final de cada transação.
- Há um ponto de entrada natural no domínio — o pedido, a apólice, a conta.
- O conjunto é pequeno o bastante para carregar e gravar junto.

## Quando Não Usar

**Quando não há invariante entre os objetos.** Se eles apenas se relacionam, são
agregados separados que se referenciam por identidade.

**Quando a consistência pode ser eventual.** Estoque e pedido não precisam ser
consistentes na mesma transação na maioria dos negócios — e assumir que precisam
produz o agregado grande.

**Em subdomínios de apoio ou genéricos**, onde o custo de descobrir e modelar a invariante
não se paga contra CRUD direto — não há regra a proteger, só dado a guardar. Ver
[DDD tático](/04-domain-driven-design/tactical-ddd.md).

**Quando o conjunto é grande ou cresce sem limite.** Um agregado com uma coleção
que cresce indefinidamente — histórico, log, mensagens — é inviável.

**Quando o custo de concorrência é alto demais.** Se muitos usuários alteram
partes diferentes do mesmo agregado, o bloqueio vira gargalo. Ali, agregados
menores ganham.

## Alternativas

- **Agregados menores com consistência eventual** — a resposta mais frequente.
- **Serviço de domínio** — quando a regra envolve vários agregados. Ver
  [domain service](/04-domain-driven-design/domain-service.md).
- **[Saga](/06-distributed-systems/sagas.md)** — quando a coordenação atravessa
  fronteiras transacionais.
- **Modelo sem agregados** — legítimo fora do core.

## Trade-offs

| Agregado grande | Agregados pequenos |
|---|---|
| Invariantes amplas garantidas | Só as locais |
| Uma transação resolve | Coordenação entre eles |
| Carga e gravação pesadas | Leves |
| Conflitos de concorrência frequentes | Raros |
| Consistência forte no conjunto | Eventual entre agregados |
| Modelo mais simples de raciocinar | Exige pensar em consistência |

A quinta linha é a decisão real, e ela pertence ao negócio: **quanto tempo de
inconsistência entre estes dois conceitos é aceitável?**

## Modos de Falha

**Agregado grande.** Carga lenta, bloqueio longo, conflito frequente.

**Coleção sem limite.** Um agregado com histórico cresce até não caber em
memória.

**Acesso direto a objeto interno.** A invariante deixa de ser protegida.

**Duas modificações por transação.** Fronteira errada, ou consistência eventual
não reconhecida.

**Invariante inventada.** Uma regra que ninguém do negócio confirmou, usada para
justificar juntar objetos.

## Erros Comuns

**Modelar por relação de banco.** Chave estrangeira não é invariante.

**Incluir tudo que "pertence" conceitualmente.** Pertencer não é o critério; a
invariante transacional é.

**Guardar objetos de outros agregados em vez de identificadores.**

**Não limitar coleções.**

**Assumir consistência forte sem perguntar ao negócio.**

## Exemplo Real

Um sistema de e-commerce modelava `Cliente` como raiz, contendo `Pedidos`,
`Enderecos`, `HistoricoDeCompras` e `Preferencias`.

Carregar um pedido para alterar a quantidade de um item trazia todo o histórico de
compras do cliente — em clientes antigos, milhares de registros.

Além do custo, havia conflito: como a unidade de controle de concorrência é a raiz, dois
operadores alterando **pedidos diferentes** do mesmo cliente colidiam no bloqueio otimista
de `Cliente` — nada no negócio ligava um pedido ao outro, mas o modelo ligava.

A remodelagem aplicou o critério da invariante.

*Existe regra que exige que pedido e histórico do cliente mudem na mesma
transação?* Não.

*E pedido e itens?* Sim — o total do pedido é a soma dos itens, e o limite de
itens por pedido precisa valer sempre.

Resultado: `Pedido` com seus `Itens` e um `ClienteId`. `Cliente` como agregado
separado. `HistoricoDeCompras` como [projeção de leitura](/03-design-patterns/cqrs.md), não
como parte de nenhum agregado.

Tempo de carga de um pedido caiu de 800 ms para 15 ms, e os conflitos **entre pedidos do
mesmo cliente** desapareceram. Dois operadores no mesmo pedido continuam colidindo, e devem
mesmo: ali a colisão é real.

O caso interessante apareceu depois: o negócio pediu "cliente com mais de três
pedidos em aberto não pode fazer um quarto". Isso parece exigir consistência entre
pedidos.

A conversa com o negócio revelou que uma janela de segundos era aceitável — se um
quarto pedido escapasse ocasionalmente, ele seria bloqueado na etapa de
aprovação. A regra virou um [serviço de domínio](/04-domain-driven-design/domain-service.md) — ela
decide sobre o negócio e existiria sem software, então não pertence à camada que só
orquestra —, consultado com consistência eventual.

Sem essa conversa, a regra teria justificado um agregado `Cliente` contendo todos
os pedidos abertos — e o problema teria voltado.

## Conceitos Relacionados

- [Entity](/04-domain-driven-design/entity.md) — a raiz é uma.
- [Value Object](/04-domain-driven-design/value-object.md) — o que compõe o agregado.
- [Domain Event](/04-domain-driven-design/domain-event.md) — a coordenação entre agregados.
- [Repository](/04-domain-driven-design/repository.md) — um por agregado.

## Exercício Prático

Escolha um agregado do seu sistema e liste as invariantes que ele garante — as
regras que precisam valer ao final de toda transação.

Para cada objeto dentro dele, verifique: ele participa de alguma dessas
invariantes? Os que não participam são candidatos a agregados separados.

## Perguntas de Entrevista

- Qual é o critério para incluir um objeto num agregado?
- Por que referenciar outros agregados por identidade?
- O que significa "um agregado por transação" e o que fazer quando não dá?

## Para Aprofundar

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Vernon, Vaughn. *Effective Aggregate Design*, 2011 — a série de três artigos,
  com o tratamento mais detalhado das regras de tamanho e de referência entre
  agregados.
