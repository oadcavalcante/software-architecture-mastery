---
id: factory
title: Factory
sidebar_position: 18
description: Encapsular a criação de agregados complexos — e por que ela pertence ao domínio.
doc_type: pattern
level: 2
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor reconhece quando a criação de um agregado merece uma
  fábrica de domínio e quando o construtor basta.
prerequisites: [aggregate]
related: [aggregate, repository, factory-method]
canonical_for: [factory de domínio, fábrica de domínio]
content_version: 1
last_reviewed: 2026-08-26
---

# Factory

## Visão Geral

Uma fábrica de domínio encapsula a criação de agregados ou objetos de valor cuja
construção é complexa o bastante para não caber num construtor.

É um conceito diferente do
[Factory Method do GoF](/03-design-patterns/factory-method.md): aqui o problema
não é variação de tipo por subclasse, e sim garantir que um agregado nasça
válido e completo.

## Problema

Criar um agregado às vezes envolve mais que atribuir campos.

Pode exigir montar objetos internos e garantir a consistência entre eles. Pode
exigir aplicar regras que determinam o estado inicial. Pode exigir dados de mais
de uma fonte.

Colocar isso no construtor produz um construtor com lógica, que é difícil de
testar e que mistura a decisão de "como nasce" com a estrutura do objeto.

Colocar no serviço de aplicação espalha a regra de criação — e ela é regra de
domínio.

## Conceitos Centrais

### A fábrica devolve um agregado válido

O contrato: o que sai da fábrica satisfaz todas as invariantes. Não existe estado
intermediário inválido visível.

Isso é a mesma garantia que o
[Builder](/03-design-patterns/builder.md) de parâmetros oferece, com uma
diferença: a fábrica de domínio aplica **regras de negócio** na criação, não apenas
monta.

### Ela pertence ao domínio

A regra que determina o estado inicial de um agregado é regra de negócio.

"Uma apólice nasce com carência de 30 dias, exceto para portabilidade" é decisão
do domínio, e a fábrica é onde ela mora — não o serviço de aplicação.

### Onde a fábrica vive

Três lugares, conforme o caso.

**Método estático no próprio agregado.** `Pedido.novoPara(cliente)`. Adequado
quando a criação depende apenas de dados simples.

**Método em outro agregado.** `cliente.novoPedido()`. Adequado quando o agregado
criador tem a informação e a regra.

**Classe de fábrica separada.** Quando a criação depende de vários agregados ou de
serviços de domínio, e não cabe em nenhum deles.

A terceira é a menos frequente e a que o vocabulário costuma sugerir primeiro.

### Reconstituição não é criação

Distinção que evita confusão com o [repositório](/04-domain-driven-design/repository.md).

**Criar** é dar origem a um agregado novo: as regras de criação se aplicam, um
identificador é gerado, eventos podem ser registrados.

**Reconstituir** é trazer de volta um agregado que já existia: nenhuma regra de
criação se aplica, o identificador vem do armazenamento, nenhum evento é
registrado.

O repositório reconstitui. Se ele passar pela fábrica, um pedido carregado do
banco disparará as regras de criação — e provavelmente um evento
`PedidoCriado` a cada leitura.

## Quando Usar

- A criação envolve regra de negócio.
- Montar o agregado exige coordenar vários objetos internos.
- Há mais de uma forma de criar, com regras diferentes.
- O construtor teria muitos parâmetros ou lógica.

## Quando Não Usar

**Quando o construtor basta.** Se criar é atribuir campos e validar, o construtor
resolve. A fábrica adiciona indireção.

**Para reconstituição.** É trabalho do repositório.

**Em subdomínios fora do core.** A cerimônia não se paga.

**Quando a fábrica só encaminha para o construtor.** Sem regra própria, ela é
camada anêmica.

**Quando o problema é legibilidade de parâmetros.** Ali um
[Builder](/03-design-patterns/builder.md) serve melhor — ele resolve
verbosidade, não regra de criação.

## Alternativas

- **Construtor com validação** — o caso mais comum.
- **Método de fábrica nomeado no agregado** — `Assinatura.anual(plano)`,
  `Assinatura.mensal(plano)`. Expressa as variantes sem classe separada.
- **[Builder](/03-design-patterns/builder.md)** — para muitos parâmetros
  opcionais.
- **Criação no agregado pai** — quando ele tem a informação.

## Trade-offs

| Fábrica de domínio | Construtor |
|---|---|
| Regra de criação num lugar | Espalhada ou no construtor |
| Agregado sempre válido | Depende de quem constrói |
| Variantes de criação nomeadas | Sobrecarga de construtores |
| Um tipo a mais | Nenhum |
| Indireção na criação | Direto |

## Modos de Falha

**Fábrica usada na reconstituição.** Regras de criação disparadas ao carregar do
banco.

**Fábrica anêmica.** Encaminha para o construtor sem acrescentar.

**Fábrica que persiste.** Criar e gravar são coisas diferentes; misturar amarra a
criação à infraestrutura.

**Fábrica com dependência de infraestrutura.** Deixou de ser domínio.

**Regra de criação duplicada.** Existe na fábrica e no construtor, e elas
divergem.

## Erros Comuns

**Confundir com Factory Method do GoF.** Problemas diferentes.

**Criar fábrica para tudo.**

**Usar na reconstituição.**

**Colocar a regra de criação no serviço de aplicação.** É regra de domínio.

## Exemplo Real

Um sistema de previdência criava `Plano` no serviço de aplicação:

```text
plano = new Plano()
plano.setTipo(tipo)
plano.setCarencia(tipo == PGBL ? 60 : 30)
plano.setTaxaAdmin(calcularTaxa(tipo, valorAporte))
plano.setStatus(ATIVO)
se tipo == PORTABILIDADE:
    plano.setCarencia(0)
    plano.setStatus(AGUARDANDO_TRANSFERENCIA)
```

Três problemas.

O objeto existia em estado inválido entre as chamadas — um `Plano` sem tipo, sem
carência e sem taxa era construível.

As regras de carência e de estado inicial estavam no serviço de aplicação, não no
domínio. Quando a regra de carência do PGBL mudou de 60 para 90 dias, foi preciso
procurá-la fora do domínio.

E havia três serviços de aplicação criando planos — portal, atendimento e
importação em lote. Os três repetiam a sequência, e o de importação ainda usava 60
dias.

A fábrica concentrou tudo:

```text
Plano.novo(tipo, valorAporte)         → aplica carência e taxa por tipo
Plano.porPortabilidade(origem)        → variante com regras próprias
```

Duas operações nomeadas, no vocabulário do negócio, dentro do domínio.

O construtor passou a ser privado. Não existe mais como criar um `Plano` inválido.

Quando a carência mudou de novo, seis meses depois, a alteração foi de uma linha —
e valeu para os três canais simultaneamente.

## Fábrica e reconstituição no mesmo agregado

A separação entre criar e reconstituir tem uma consequência prática que costuma
ser descoberta tarde: o agregado precisa de dois caminhos de entrada.

```text
Pedido.novoPara(cliente)              ← fábrica: aplica regras, gera id,
                                        registra evento

Pedido.reconstituir(id, estado)       ← usado pelo repositório: nenhuma regra,
                                        nenhum evento
```

O segundo caminho normalmente não é público — é acessível apenas à camada de
persistência, por visibilidade de pacote, por construtor interno, ou por um
mecanismo do mapeador.

Três consequências que valem antecipar.

**Testes precisam de um caminho de reconstituição.** Montar um agregado num estado
específico para testar uma operação não deve passar pela fábrica, porque isso
dispararia as regras de criação. Uma construção de teste dedicada resolve.

**Mapeadores objeto-relacional interferem.** Vários exigem construtor sem
argumentos e acesso direto aos campos, o que compete com a garantia de que o
agregado nasce válido. As soluções variam por ferramenta e todas envolvem alguma
concessão.

**Migração de dados usa reconstituição.** Importar histórico não deve disparar
eventos de criação, sob pena de reprocessar anos de fatos que já aconteceram.

Ignorar essa separação produz o defeito característico: eventos de criação
publicados a cada leitura do banco.

## Conceitos Relacionados

- [Aggregate](/04-domain-driven-design/aggregate.md) — o que a fábrica cria.
- [Repository](/04-domain-driven-design/repository.md) — a reconstituição, em contraste.
- [Factory Method](/03-design-patterns/factory-method.md) — o padrão do GoF,
  que resolve outro problema.
- [Builder](/03-design-patterns/builder.md) — quando o problema é verbosidade.

## Exercício Prático

Procure no seu sistema lugares onde um agregado é criado com uma sequência de
atribuições seguida de lógica condicional.

Verifique se essa sequência aparece em mais de um lugar e se as cópias divergiram.

Depois pergunte: existe algum ponto nessa sequência em que o objeto está inválido?

## Perguntas de Entrevista

- Qual a diferença entre a fábrica de domínio e o Factory Method do GoF?
- Por que o repositório não deve usar a fábrica?
- Quando o construtor basta?

## Para Aprofundar

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
