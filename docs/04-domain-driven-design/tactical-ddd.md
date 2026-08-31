---
id: tactical-ddd
title: DDD Tático
sidebar_position: 19
description: Os blocos de construção do modelo — caros, e por isso restritos ao core.
doc_type: foundation
level: 2
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor decide onde aplicar DDD tático a partir da classificação
  de subdomínio e da complexidade real da regra.
prerequisites: [aggregate, repository]
related: [strategic-ddd, core-domain, clean-architecture]
canonical_for: [DDD tático, tactical design]
content_version: 1
last_reviewed: 2026-08-26
---

# DDD Tático

## Visão Geral

DDD tático é o conjunto de blocos de construção que implementam um modelo dentro
de um bounded context: entidades, objetos de valor, agregados, serviços de
domínio, eventos, repositórios e fábricas.

É a parte mais conhecida do DDD e a mais cara. A pergunta que este documento
responde não é como aplicá-la — os documentos individuais fazem isso — mas
**onde**.

## O Problema

O tático é aplicado uniformemente com frequência: se o time "adotou DDD", todo
módulo ganha agregados, repositórios e objetos de valor.

Isso desperdiça em duas direções.

**Onde a regra é simples**, a cerimônia domina. Um cadastro com validação de
formato ganha um agregado, um repositório, uma fábrica e três objetos de valor —
para fazer o que trinta linhas fariam.

**Onde a regra é complexa**, a atenção fica diluída. O core recebe o mesmo cuidado
que o resto, e não o cuidado desproporcional que merece.

O tático se paga quando **a regra de negócio é genuinamente complexa e muda com
frequência**. Fora disso, custa.

## Conceitos Centrais

### Os blocos e o que cada um resolve

| Bloco | Problema que resolve |
|---|---|
| [Entity](/04-domain-driven-design/entity.md) | Identidade estável ao longo do tempo |
| [Value Object](/04-domain-driven-design/value-object.md) | Conceito definido por valores, válido por construção |
| [Aggregate](/04-domain-driven-design/aggregate.md) | Unidade de consistência transacional |
| [Domain Service](/04-domain-driven-design/domain-service.md) | Regra que envolve vários agregados |
| [Application Service](/04-domain-driven-design/application-service.md) | Orquestração de caso de uso |
| [Domain Event](/04-domain-driven-design/domain-event.md) | Coordenação entre agregados |
| [Repository](/04-domain-driven-design/repository.md) | Acesso a agregados sem acoplar à persistência |
| [Factory](/04-domain-driven-design/factory.md) | Criação com regra de negócio |

### O gradiente de custo e retorno

Os blocos não custam o mesmo nem rendem o mesmo. Ordenados por retorno em relação
ao esforço:

**[Value Object](/04-domain-driven-design/value-object.md)** — o de melhor relação. Barato de introduzir,
elimina uma classe inteira de defeitos, e vale mesmo fora do core.

**[Ubiquitous language](/04-domain-driven-design/ubiquitous-language.md)** — não é um bloco, e é o de maior
retorno de todos. Custa conversas.

**[Entity](/04-domain-driven-design/entity.md) com comportamento** — barato, e é o que evita o modelo
anêmico.

**[Aggregate](/04-domain-driven-design/aggregate.md)** — o mais consequente e o mais difícil de acertar. Só
no core.

**[Domain Event](/04-domain-driven-design/domain-event.md)** — alto retorno em sistemas com vários
contextos; custo de infraestrutura real.

**[Repository](/04-domain-driven-design/repository.md) e [Factory](/04-domain-driven-design/factory.md)** — os mais cerimoniais.
Fora do core, raramente se pagam.

Isso significa que "adotar DDD tático" não é uma decisão binária. É possível — e
frequentemente correto — adotar objetos de valor e entidades ricas sem adotar
agregados, repositórios e fábricas.

### A decisão vem do estratégico

A classificação de [subdomínio](/04-domain-driven-design/subdomain.md) informa diretamente:

**[Core](/04-domain-driven-design/core-domain.md)** — tático completo se justifica. É onde a regra é
complexa, muda, e precisa ser testável e auditável.

**[Supporting](/04-domain-driven-design/supporting-domain.md)** — objetos de valor e entidades ricas, sim.
Agregados, repositórios e fábricas, raramente. Um serviço direto com acesso a
dados costuma bastar.

**[Generic](/04-domain-driven-design/generic-domain.md)** — nenhum. Você comprou ou adotou; não modele.

Sem essa classificação, não há critério — e a aplicação vira uniforme.

### O sinal de que não se paga

Três sintomas de tático aplicado onde não cabe:

A relação entre linhas de cerimônia e linhas de regra passa de dois para um.

Os agregados são anêmicos: contêm campos e nenhuma invariante real.

Os repositórios têm um método `salvar` e um `buscarPorId`, e nada mais — porque
não há operação de domínio que exija mais.

## Por Que Isso Importa

**Porque o tático é a parte visível e a que consome esforço.** Aplicá-lo no lugar
errado é o desperdício mais comum de quem adota DDD.

**Porque a adoção parcial é legítima.** Reconhecer que se pode adotar dois blocos
e não os oito remove a barreira de entrada — e produz mais valor que a adoção
integral no lugar errado.

**Porque conecta com a decisão de investimento.** Onde aplicar o tático é a mesma
pergunta de onde alocar os melhores engenheiros, e a resposta vem do negócio.

## Erros Comuns

**Aplicar uniformemente.** O erro dominante.

**Aplicar sem o [estratégico](/04-domain-driven-design/strategic-ddd.md).** Sem as fronteiras certas, os
blocos são construídos no lugar errado.

**Tratar como tudo ou nada.** A adoção parcial é frequentemente a correta.

**Confundir vocabulário com adoção.** Nomear classes de `...Aggregate` e
`...Repository` sem invariantes nem inversão de dependência é convenção de
nomenclatura.

**Modelo anêmico.** O modo de falha mais comum: os blocos existem e o
comportamento está nos serviços. Ver
[encapsulamento](/02-software-design/encapsulation.md).

**Aplicar a CRUD.** Se a operação é criar, ler, atualizar e apagar com validação
de formato, não há modelo a construir.

## Exemplo Real

Uma plataforma de logística adotou DDD tático em toda a base: onze módulos, todos
com agregados, repositórios, fábricas e objetos de valor.

A revisão feita dois anos depois mediu a relação entre código de cerimônia e
código de regra em cada módulo.

**Roteirização e precificação** — os dois módulos de core. Relação de 1 para 3:
para cada linha de estrutura, três de regra. Os agregados tinham invariantes
reais, os objetos de valor carregavam comportamento, os eventos coordenavam
genuinamente. O tático estava pagando.

**Cadastro de motoristas, veículos, clientes e tabelas de referência** — quatro
módulos de apoio. Relação de 3 para 1, invertida: três linhas de estrutura para
cada linha de regra. Os agregados tinham um campo e nenhuma invariante. Os
repositórios tinham dois métodos. As fábricas encaminhavam para o construtor.

**Autenticação e notificação** — genéricos, e construídos internamente, o que era
outro problema.

A simplificação dos quatro módulos de apoio — removendo agregados, repositórios e
fábricas, mantendo objetos de valor onde havia validação real — removeu cerca de
40% do código desses módulos sem perder nenhuma funcionalidade nem nenhum teste
de negócio.

O tempo médio para adicionar um campo a um cadastro caiu de dois dias para
algumas horas.

A avaliação posterior aponta: os objetos de valor foram mantidos em todos os módulos,
inclusive nos de apoio, porque continuavam se pagando — validação de documento,
de placa e de coordenada valem em qualquer lugar. Os demais blocos saíram.

Essa é a adoção parcial que o material recomenda, chegada por medição.

## Conceitos Relacionados

- [DDD Estratégico](/04-domain-driven-design/strategic-ddd.md) — o que vem antes e decide onde.
- [Core Domain](/04-domain-driven-design/core-domain.md) — onde o tático se paga.
- [Aggregate](/04-domain-driven-design/aggregate.md) — o bloco mais consequente.
- [Clean Architecture](/02-software-design/clean-architecture.md) — a estrutura
  que costuma acompanhar.

## Exercício Prático

Escolha dois módulos do seu sistema: um que você considera core e um de apoio.

Em cada um, conte as linhas de estrutura — declarações de classe, construtores,
acessadores, interfaces de repositório, mapeamentos — e as linhas de regra de
negócio.

A relação entre as duas contagens diz se o tático está se pagando ali.

## Perguntas de Entrevista

- Onde DDD tático se paga, e por quê?
- É legítimo adotar apenas parte dos blocos?
- Que sinais indicam que o tático foi aplicado no lugar errado?

## Para Aprofundar

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003 — as partes II e III.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
- Vernon, Vaughn. *Effective Aggregate Design*, 2011.
