---
id: interfaces
title: Interfaces
sidebar_position: 6
description: O contrato entre partes — quem deve defini-lo e por que a largura importa.
doc_type: concept
level: 2
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor projeta interfaces a partir do que o consumidor precisa,
  e reconhece quando uma interface não está comprando nada.
prerequisites: [encapsulation]
related: [dependency-inversion, boundaries, solid]
canonical_for: [interface, contrato de interface]
content_version: 1
last_reviewed: 2026-08-26
---

# Interfaces

## Visão Geral

Uma interface é o contrato entre duas partes: o que uma promete oferecer e a
outra pode assumir.

A decisão mais consequente sobre uma interface não é quais métodos ela tem. É
**quem a define** — e a resposta correta, quase sempre, é o consumidor.

## Problema

Interfaces costumam ser extraídas da implementação. Alguém escreve
`RepositorioPostgres`, seleciona os métodos públicos e gera
`RepositorioDePedidos` com a mesma lista.

O resultado tem forma de abstração e não é uma. A interface reflete o que a
implementação faz, incluindo o que ela faz por causa da tecnologia. Trocar a
implementação continua exigindo mudar consumidores, porque a interface já carrega
as decisões da implementação original.

O segundo problema é largura. Interfaces extraídas assim tendem a ter todos os
métodos que a implementação tem, e cada consumidor passa a depender de operações
que não usa. É o sintoma que o **I** do [SOLID](solid.md) nomeia.

## Conceitos Centrais

### O consumidor define a interface

A interface pertence a quem a usa, não a quem a implementa.

Isso é mais que uma questão de organização de arquivos — embora seja isso
também, e o lugar onde a interface mora determina a direção da dependência (ver
[inversão de dependência](dependency-inversion.md)).

É sobre **forma**. Uma interface definida pelo consumidor expressa o que ele
precisa, no vocabulário dele. Uma extraída da implementação expressa o que a
tecnologia oferece.

```text
extraída da implementação        definida pelo consumidor
─────────────────────────        ────────────────────────
findByIdAndStatusIn(...)         pedidosPendentesDe(cliente)
executeQuery(sql)                totalFaturadoNoMes(mes)
```

### Interfaces devem ser estreitas

Uma interface com um método é mais fácil de implementar, de substituir em teste e
de raciocinar. Uma com quinze acopla o implementador a tudo e o consumidor ao que
não usa.

Consumidores diferentes com necessidades diferentes merecem interfaces
diferentes, mesmo que a mesma classe implemente as duas.

### Largura da interface versus profundidade do módulo

Ousterhout formula a relação que importa: um bom módulo é **profundo** — interface
estreita, implementação substancial. Um módulo raso tem interface larga e
implementação fina, e por isso não paga o custo de existir.

A métrica prática: quanto o consumidor deixa de saber por usar isto? Se a resposta
for "quase nada", a interface é raso.

### O contrato inclui o comportamento

Uma interface não é só a assinatura. É também o que acontece em caso de erro, o
que é garantido sobre ordenação, se a operação é idempotente, e o que vale quando
não há resultado.

Duas implementações com a mesma assinatura e semânticas diferentes não são
substituíveis — que é a violação de Liskov, aplicada a interfaces.

## Modelo Mental

**Uma interface bem projetada permite que o consumidor esqueça o outro lado.**
Cada coisa que ele precisa saber sobre a implementação é uma falha do contrato.

## Quando Usar

- Quando há mais de uma implementação real.
- Quando é preciso substituir a dependência para testar.
- Quando a interface atravessa uma fronteira que se quer manter — de módulo, de
  time, de sistema.
- Quando o consumidor e o implementador evoluem em ritmos diferentes.

## Quando Não Usar

**Quando há uma implementação e não haverá outra.** Ver
[abstração](../01-fundamentals/abstraction.md). Uma interface de um é um arquivo
a mais.

**Quando a interface é extraída da implementação sem repensar a forma.** Ela não
vai comprar substituibilidade, e adiciona indireção.

**Quando a dependência é trivialmente substituível de outra forma.** Linguagens
com tipagem estrutural ou funções de primeira classe frequentemente resolvem sem
declarar interface.

**Quando o custo é indireção sem redução de conhecimento.** Se o consumidor
continua precisando saber tudo sobre o outro lado, a interface é decorativa.

## Alternativas

- **Função como parâmetro** — quando o que varia é um comportamento simples.
- **Tipagem estrutural** — em linguagens que a oferecem, dispensa a declaração
  explícita.
- **Adaptador na fronteira** — traduzir na entrada em vez de abstrair no meio.
- **Usar o tipo concreto** — quando não há segunda implementação nem necessidade
  de teste isolado.

## Trade-offs

| Interface estreita | Interface larga |
|---|---|
| Fácil de implementar e substituir | Um lugar para tudo |
| Consumidor depende só do que usa | Consumidor depende de tudo |
| Mais tipos a manter | Menos tipos |
| Pode exigir várias por implementação | Uma serve a todos |

| Definida pelo consumidor | Extraída da implementação |
|---|---|
| Vocabulário do domínio | Vocabulário da tecnologia |
| Substituição real é possível | Substituição continua cara |
| Exige projetar, não só extrair | Barata de criar |

## Modos de Falha

**Interface espelho.** Idêntica à implementação, incluindo o que é específico da
tecnologia.

**Interface larga.** Implementadores com métodos que lançam
`UnsupportedOperation`.

**Contrato ambíguo.** Duas implementações que diferem no comportamento de erro ou
de ausência de resultado, e o consumidor quebra ao trocar.

**Vazamento de tipo.** A interface expõe tipos da biblioteca subjacente na
assinatura, amarrando o consumidor a ela.

## Erros Comuns

**Extrair em vez de projetar.** O erro estruturante.

**Colocar a interface junto do implementador.** Anula a inversão de dependência.

**Uma interface por classe, por hábito.** Produz interfaces de um.

**Documentar só a assinatura.** O comportamento em erro é parte do contrato.

**Alargar a interface para acomodar um consumidor novo.** Cada consumidor com
necessidade distinta merece a sua.

## Exemplo Real

Um serviço definia `NotificationProvider` com `send(Message)`, extraída do
cliente de e-mail que já existia. `Message` tinha `assunto`, `corpo` e
`destinatario`.

Quando push foi adicionado, `Message` ganhou `titulo`, `payload` e `acao` — todos
nulos para e-mail. Depois SMS: `corpo` limitado a 160 caracteres, `assunto`
ignorado.

Ao final, uma classe com sete campos, dos quais cada implementação usava três, e
nenhuma validação possível porque os campos válidos dependiam do provedor.

A reformulação partiu do consumidor. O que o código de negócio precisa? Notificar
um usuário sobre um evento. Ele não precisa saber o canal.

```text
NotificadorDeUsuario
  notificar(usuario, evento)
```

A escolha de canal, a formatação e as restrições de cada provedor foram para
dentro. Cada provedor passou a ter seu próprio tipo de mensagem, não
compartilhado.

O código de negócio perdeu sete campos de conhecimento sobre canais de
notificação — que é exatamente o que a interface original deveria ter escondido e
não escondia.

## Interfaces evoluem, e isso precisa ser projetado

Uma interface interna pode ser refatorada num commit. Uma interface publicada —
consumida por outro módulo com release próprio, outro time, ou outro sistema —
não pode.

Três técnicas, em ordem de custo:

**Adicionar é seguro; remover e alterar não são.** Acrescentar um método ou um
campo opcional não quebra implementadores nem consumidores existentes. Alterar
uma assinatura ou remover um método quebra.

**Métodos com implementação padrão.** Em linguagens que os oferecem, permitem
estender uma interface sem quebrar implementadores. Útil e frequentemente
esquecido.

**Versionar a interface, não os métodos.** Quando a mudança é incompatível, uma
segunda interface conviva com a primeira, e a antiga é marcada como obsoleta com
prazo. Isso é mais barato que acumular parâmetros e ramificações na mesma.

A decisão que precede as três: **declarar quais interfaces são públicas**. Uma
interface que nunca foi declarada pública acaba sendo tratada como estável por
alguém, e a primeira mudança quebra um consumidor que ninguém sabia que existia.

## Conceitos Relacionados

- [Encapsulamento](encapsulation.md) — o que a interface expõe.
- [Inversão de Dependência](dependency-inversion.md) — onde a interface mora.
- [SOLID](solid.md) — os princípios I e D.
- [Abstração](../01-fundamentals/abstraction.md) — quando vale a pena.

## Exercício Prático

Liste as interfaces do seu sistema e, para cada uma, verifique: ela foi projetada
ou extraída? O nome dos métodos usa vocabulário do domínio ou da tecnologia?

Para as extraídas, escreva como ficaria se o consumidor a tivesse definido. A
diferença mostra quanto conhecimento da implementação está vazando.

## Perguntas de Entrevista

- Quem deve definir uma interface, e por quê?
- Por que interfaces estreitas são preferíveis?
- O que faz parte do contrato além da assinatura?

## Para Aprofundar

- Ousterhout, John. *A Philosophy of Software Design*. Yaknyam Press, 2018 —
  módulos profundos versus rasos.
- Martin, Robert C. *Clean Architecture*. Prentice Hall, 2017 — o princípio de
  segregação de interface.
- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003 — interfaces no
  vocabulário do domínio.
