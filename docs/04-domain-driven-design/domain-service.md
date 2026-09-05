---
id: domain-service
title: Domain Service
sidebar_position: 14
description: Regra de domínio que não pertence a nenhuma entidade — e o risco de virar depósito de lógica.
doc_type: pattern
level: 2
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor reconhece quando uma regra pertence a um serviço de
  domínio e quando ela está fugindo da entidade que deveria contê-la.
prerequisites: [aggregate]
related: [application-service, aggregate, entity]
canonical_for: [domain service, serviço de domínio]
content_version: 2
last_reviewed: 2026-08-26
---

# Domain Service

## Visão Geral

Um serviço de domínio contém regra de negócio que não pertence naturalmente a
nenhuma entidade ou objeto de valor — tipicamente porque envolve vários deles.

Continua sendo domínio: não conhece infraestrutura, não orquestra transação, não
sabe de HTTP nem de banco.

## Problema

Nem toda regra cabe numa entidade.

"Transferir valor entre duas contas" envolve duas contas e não pertence a nenhuma
delas — colocá-la em `Conta` faria uma conta conhecer e modificar outra, o que
viola a fronteira do [agregado](/04-domain-driven-design/aggregate.md).

"Calcular elegibilidade" pode depender de três agregados diferentes.

Sem um lugar para essas regras, elas migram para o serviço de aplicação — onde
ficam misturadas com orquestração e controle de transação — ou para uma entidade
que passa a conhecer demais.

O serviço de domínio é o lugar correto para elas.

## Conceitos Centrais

### O critério

Uma regra pertence a serviço de domínio quando:

Ela é do domínio — expressa uma decisão de negócio, não coordenação técnica.

Ela não pertence a nenhuma entidade — forçá-la numa produz acoplamento
antinatural.

Ela é sem estado — o serviço não guarda nada entre chamadas.

Faltando qualquer um dos três, é outra coisa.

### Serviço de domínio versus serviço de aplicação

A distinção que mais causa confusão, e a razão de
[Onion](/02-software-design/onion-architecture.md) nomear os dois anéis.

| | Serviço de domínio | [Serviço de aplicação](/04-domain-driven-design/application-service.md) |
|---|---|---|
| Contém | Regra de negócio | Orquestração |
| Conhece infraestrutura | Não | Sim |
| Controla transação | Não | Sim |
| Decide algo do negócio | Sim | Não |
| Testável sem infraestrutura | Sim | Precisa de substitutos |

O teste prático: **se você removesse toda a tecnologia, esta regra continuaria
existindo?** Se sim, é domínio.

### Ele fala a ubiquitous language

Um serviço de domínio tem nome de operação do negócio: `AvaliadorDeElegibilidade`,
`CalculadoraDeFrete`, `TransferenciaEntreContas`.

Nomes como `PedidoManager`, `ClienteHelper` ou `ProcessadorGenerico` são sinal de
que a regra não foi entendida — e frequentemente de que o serviço virou depósito.

### O risco: fuga de responsabilidade

O modo de degeneração é conhecido: é mais fácil escrever a regra num serviço do
que descobrir onde ela pertence na entidade.

O resultado é o modelo anêmico — entidades sem comportamento e serviços com toda
a lógica. Ver
[encapsulamento](/02-software-design/encapsulation.md).

A verificação: antes de criar um serviço de domínio, aplique as três condições da
definição — é regra de domínio, não pertence a nenhuma entidade, é sem estado. "Envolve mais
de um agregado" é **heurística**, não teste: acerta na maioria das vezes, e falha em casos
como o `CalculadoraDeFrete` acima, que atende às três condições sobre um agregado só. Quando
a regra envolve um agregado e cabe nele, é dele que ela é.

## Quando Usar

- A regra envolve mais de um agregado.
- A regra é do domínio, não coordenação.
- Não há entidade onde ela caiba sem produzir acoplamento antinatural.
- A operação tem nome no vocabulário do negócio.

## Quando Não Usar

**Quando a regra envolve um agregado só.** Ela pertence a ele.

**Quando é orquestração.** É serviço de aplicação.

**Quando o serviço teria estado.** Serviços de domínio são sem estado; estado
pertence a entidades.

**Como depósito de lógica que não se sabe onde colocar.** É a degeneração mais
comum, e o sintoma é o nome genérico.

**Em subdomínios fora do core.** A distinção entre os anéis raramente se paga
ali.

## Alternativas

- **Método na entidade** — quando envolve um agregado só.
- **Objeto de valor com comportamento** — quando a regra é sobre um conceito, não
  sobre entidades.
- **Método de fábrica** — quando a regra é de criação. Ver
  [factory](/04-domain-driven-design/factory.md).
- **Política como objeto** — uma regra encapsulada como
  [Strategy](/03-design-patterns/strategy.md), quando há variantes.

## Trade-offs

| Serviço de domínio | Regra na entidade |
|---|---|
| Regra entre agregados tem lugar | Uma entidade conheceria outra |
| Testável isoladamente | Testável junto com a entidade |
| Risco de esvaziar as entidades | Modelo rico |
| Um tipo a mais | Nenhum |
| Nome do domínio explícito | Regra dentro de um método |

## Modos de Falha

**Serviço que vira depósito.** Nome genérico, muitas operações não relacionadas.

**Modelo anêmico.** Regras que pertenciam às entidades migraram para serviços.

**Serviço com estado.** Compartilhado entre requisições, produz defeito de
concorrência.

**Serviço que conhece infraestrutura.** Deixou de ser domínio.

**Serviço de domínio que orquestra.** Confusão com a camada de aplicação.

## Erros Comuns

**Criar serviço para regra de um agregado só.** O erro dominante.

**Nome genérico.** `Manager`, `Helper`, `Processor`, `Handler` — nenhum é
vocabulário de domínio.

**Injetar repositório no serviço de domínio.** É debatido; a posição deste
material é que o serviço de domínio deve receber os agregados já carregados,
mantendo o acesso a dados na camada de aplicação. Isso preserva a testabilidade
sem substitutos.

**Confundir com serviço de aplicação.**

## Exemplo Real

Um sistema bancário tinha `TransferenciaService` com 400 linhas, contendo:
validação de saldo, cálculo de tarifa, verificação de limite diário, registro de
auditoria, notificação por e-mail e controle de transação.

Seis responsabilidades: três de domínio e três não. Duas pertenciam a `Conta`, uma a um
serviço de domínio, e as outras três — auditoria, notificação e controle de transação — à
camada de aplicação e a efeitos.

A separação:

**Regra que pertencia à entidade.** Validação de saldo e limite diário são
invariantes de `Conta`. Foram para lá — `conta.debitar(valor)` lança se o saldo ou
o limite não permitirem.

**Regra que pertencia a serviço de domínio.** O cálculo de tarifa depende do tipo
das duas contas, do valor e do horário. Não pertence a nenhuma conta.
Virou `CalculadoraDeTarifa`, sem estado, testável com dois objetos em memória.

**Coordenação.** Carregar as contas, chamar o débito e o crédito, calcular a
tarifa, persistir, controlar a transação, publicar o evento — tudo isso foi para o
serviço de aplicação.

**Efeitos.** Auditoria e notificação viraram consumidores de
[evento de domínio](/04-domain-driven-design/domain-event.md), fora do fluxo transacional.

O resultado mais relevante não foi a organização. Foi que `CalculadoraDeTarifa`
passou a ter 40 testes de unidade que rodam em milissegundos, cobrindo
combinações de tipo de conta, valor e horário que antes exigiam montar duas
contas no banco.

A regra de tarifa mudava três ou quatro vezes por ano por decisão comercial. O
ciclo de alteração caiu de dias para horas.

## Conceitos Relacionados

- [Application Service](/04-domain-driven-design/application-service.md) — a orquestração.
- [Aggregate](/04-domain-driven-design/aggregate.md) — onde a maior parte das regras pertence.
- [Entity](/04-domain-driven-design/entity.md) — o lugar padrão de uma regra.
- [Arquitetura Onion](/02-software-design/onion-architecture.md) — o
  vocabulário dos anéis.

## Exercício Prático

Liste as classes do seu sistema cujo nome termina em `Service`, `Manager` ou
`Handler`.

Para cada operação delas, responda: é regra de negócio ou coordenação? Envolve um
agregado ou vários?

As regras que envolvem um agregado só estão no lugar errado.

## Perguntas de Entrevista

- Qual o critério para uma regra pertencer a um serviço de domínio?
- Como distinguir serviço de domínio de serviço de aplicação?
- Por que serviços de domínio não devem ter estado?

## Para Aprofundar

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
- Fowler, Martin. *AnemicDomainModel*, 2003.
