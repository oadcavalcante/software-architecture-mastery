---
id: application-service
title: Application Service
sidebar_position: 15
description: Orquestrar um caso de uso sem decidir nada do negócio — e o teste que revela quando ele decide.
doc_type: pattern
level: 2
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escreve serviços de aplicação que coordenam sem conter
  regra, e reconhece o vazamento quando ele acontece.
prerequisites: [domain-service]
related: [domain-service, aggregate, clean-architecture]
canonical_for: [application service, serviço de aplicação, caso de uso]
content_version: 2
last_reviewed: 2026-08-26
---

# Application Service

## Visão Geral

Um serviço de aplicação orquestra um caso de uso: carrega os agregados, chama as
operações do domínio, persiste o resultado, controla a transação e publica os
eventos.

O que ele **não** faz é decidir qualquer coisa do negócio. Essa é a linha, e ela
é constantemente atravessada.

## Problema

Todo caso de uso precisa de coordenação: alguém tem que buscar os dados, invocar
a regra, gravar e lidar com transação.

Se essa coordenação mora na entidade, ela passa a conhecer persistência. Se mora
no controlador HTTP, o caso de uso fica amarrado ao canal e não pode ser acionado
por fila ou por terminal.

O serviço de aplicação é o lugar dessa coordenação — e é justamente por ser o
ponto onde tudo se encontra que ele atrai regra de negócio que não deveria estar
ali.

## Conceitos Centrais

### Ele coordena, não decide

A responsabilidade é uma sequência sem julgamento:

```text
CancelarPedido.executar(pedidoId, motivo):
    pedido = repositorio.buscar(pedidoId)      ← carregar
    pedido.cancelar(motivo)                     ← delegar a decisão
    repositorio.salvar(pedido)                  ← persistir
    eventos.publicar(pedido.eventos())          ← publicar
```

A decisão de **se** o pedido pode ser cancelado pertence ao pedido. O serviço só
pede.

Um `if` que decide algo do negócio dentro do serviço de aplicação é o sintoma do
vazamento.

### O teste do vazamento

Diante de um serviço de aplicação, pergunte de cada condicional: **esta decisão
existiria se não houvesse software?**

Verificar se o usuário tem permissão, se o formato da entrada é válido, se o
recurso existe — coordenação.

Verificar se um pedido enviado pode ser cancelado, se o limite de crédito
comporta, se a carência já passou — negócio, e pertence ao domínio.

### Ele é a fronteira transacional

O serviço de aplicação define onde a transação começa e termina. Isso o torna
responsável por uma decisão arquitetural: **um agregado por transação**, conforme
[aggregate](/04-domain-driven-design/aggregate.md).

Quando um caso de uso precisa alterar dois agregados, é aqui que a decisão
aparece — coordenar por evento, aceitar consistência eventual, ou reconhecer que
as fronteiras estão erradas.

### Ele é o caso de uso

Em [Clean Architecture](/02-software-design/clean-architecture.md), o serviço de
aplicação corresponde ao interator de caso de uso. Em
[Ports and Adapters](/02-software-design/ports-and-adapters.md), ele implementa
a porta primária.

Um serviço de aplicação por caso de uso — `CancelarPedido`, `ConfirmarPagamento`
— é preferível a um serviço com quinze métodos, pela mesma razão de coesão que
vale em qualquer lugar.

## Quando Usar

- Existe um caso de uso com sequência de coordenação.
- O caso de uso precisa ser acionado por mais de um canal.
- Há transação a controlar.
- O domínio precisa ser testável sem infraestrutura.

## Quando Não Usar

**Quando não há coordenação real.** Uma consulta simples que devolve dados não
precisa passar por um serviço de aplicação — pode ir direto de uma projeção de
leitura ao controlador. Ver [CQRS](/03-design-patterns/cqrs.md) de nível 2.

**Como camada obrigatória por simetria.** Serviços de aplicação que apenas
repassam para o repositório são camada anêmica. Ver
[camadas](/02-software-design/layering.md).

**Em subdomínios genéricos ou de apoio.** A separação entre os anéis raramente se
paga fora do core.

**Quando ele acumularia regra.** Se a regra insiste em migrar para lá, o problema
está no domínio: falta uma entidade ou um serviço de domínio que a acolha.

## Alternativas

- **Controlador chamando o domínio diretamente** — adequado em casos de uso
  triviais e em subdomínios simples.
- **Comando com manipulador** — a mesma ideia com outro vocabulário. Ver
  [Command](/03-design-patterns/command.md).
- **Consulta direta** — para leitura, sem passar pelo domínio.

## Trade-offs

| Serviço de aplicação | Controlador direto |
|---|---|
| Caso de uso reutilizável por vários canais | Amarrado ao canal |
| Transação num lugar | Espalhada |
| Domínio testável sem infraestrutura | Teste carrega o canal |
| Uma classe por caso de uso | Menos arquivos |
| Risco de virar camada anêmica | Sem camada extra |

## Modos de Falha

**Regra de negócio no serviço.** O modo dominante, e o que produz o modelo
anêmico.

**Serviço com quinze métodos.** Perdeu coesão; virou fachada de módulo.

**Transação atravessando vários agregados.** Fronteira errada ou consistência
eventual não reconhecida.

**Serviço que devolve entidades.** O modelo interno vaza para o canal. Deve
devolver um tipo de resposta próprio.

**Camada anêmica.** Repassa e não coordena nada.

## Erros Comuns

**Colocar `if` de negócio ali.** Aplique o teste do vazamento.

**Devolver a entidade do domínio.**

**Criar um serviço por entidade em vez de por caso de uso.**

**Injetar tudo.** Um serviço com oito dependências normalmente está fazendo
coisas demais.

## Exemplo Real

Um sistema de assinaturas tinha `AssinaturaService` com onze métodos e 700 linhas.

Dentro de `cancelar`, havia:

```text
se assinatura.status == ATIVA e diasDesdeInicio < 7:
    reembolsoIntegral = true
senao se assinatura.status == ATIVA:
    reembolsoProporcional = true
```

A regra dos sete dias é o direito de arrependimento previsto em lei. É decisão de
negócio, e estava num serviço de aplicação — onde nenhum teste de domínio a
cobria e onde o time de produto não a encontrava ao procurar.

A separação moveu a regra para `Assinatura.cancelar(dataAtual)`, que devolve o
tipo de reembolso devido. O serviço de aplicação passou a apenas executar o
reembolso que a assinatura determinou.

Dois ganhos concretos.

Quando a empresa passou a oferecer trinta dias de arrependimento como diferencial
comercial — acima do mínimo legal —, a alteração foi de uma linha na entidade, com o teste de
unidade correspondente. Antes, exigiria encontrar a regra
entre 700 linhas de coordenação.

E o mesmo cancelamento passou a valer para os três canais que o acionavam —
portal, atendimento e processo automático de inadimplência — que antes tinham
implementações ligeiramente divergentes do mesmo cálculo.

A terceira implementação, do processo automático, ainda usava 5 dias. Ninguém
sabia.

## Conceitos Relacionados

- [Domain Service](/04-domain-driven-design/domain-service.md) — onde a regra entre agregados mora.
- [Aggregate](/04-domain-driven-design/aggregate.md) — a fronteira transacional.
- [Clean Architecture](/02-software-design/clean-architecture.md) — o caso de
  uso como círculo.
- [Ports and Adapters](/02-software-design/ports-and-adapters.md).

## Exercício Prático

Escolha um serviço de aplicação do seu sistema e liste todos os condicionais dele.

Para cada um, aplique o teste: esta decisão existiria sem software?

As que existiriam são regras de negócio no lugar errado.

## Perguntas de Entrevista

- O que um serviço de aplicação não deve fazer?
- Como reconhecer regra de negócio vazando para a camada de aplicação?
- Por que um serviço por caso de uso em vez de um por entidade?

## Para Aprofundar

- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
- Martin, Robert C. *Clean Architecture*. Prentice Hall, 2017.
- Fowler, Martin. *AnemicDomainModel*, 2003.
