---
id: request-response
title: Request/Response
sidebar_position: 5
description: O modelo síncrono e o que ele acopla — a decisão que precede toda escolha de protocolo.
doc_type: concept
level: 3
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor reconhece o acoplamento temporal do modelo síncrono e sabe
  quando a resposta imediata é requisito e quando é hábito.
prerequisites: [apis]
related: [queues, background-processing, timeouts]
canonical_for: [request/response, acoplamento temporal, síncrono]
content_version: 1
last_reviewed: 2026-08-26
---

# Request/Response

## Visão Geral

No modelo request/response, quem chama espera a resposta antes de continuar. É o
modelo padrão de HTTP, de RPC e de chamada a banco de dados.

Ele é simples, familiar e adequado na maior parte dos casos. Também é o que
introduz **acoplamento temporal** — e reconhecer isso é o que permite decidir
quando não usá-lo.

## Problema

A pergunta que costuma ser feita é qual protocolo usar. A pergunta que precede
essa é outra: **quem chama precisa do resultado para continuar?**

Se precisa, síncrono é o modelo. Se não precisa — e frequentemente não precisa —
esperar significa que o chamador fica indisponível quando o chamado está.

O padrão que aparece nos sistemas: confirmar um pedido dispara reserva de estoque,
cobrança, notificação e registro fiscal, todas síncronas. Se o serviço de
notificação está fora, o pedido não é confirmado — embora notificar seja a menos
importante das quatro.

Isso não é decisão de protocolo. É decisão sobre o que precisa acontecer antes de
responder ao usuário.

## Conceitos Centrais

### Acoplamento temporal

Duas partes acopladas no tempo precisam estar disponíveis **simultaneamente**.

A consequência é multiplicativa: numa cadeia de chamadas síncronas, a
disponibilidade do conjunto é o produto das individuais, e a latência é a soma.

```text
4 chamadas síncronas, cada uma 99,9% disponível e 100 ms
  → 99,6% de disponibilidade, 400 ms de latência
```

Trocar síncrono por assíncrono não remove acoplamento — troca acoplamento
temporal por acoplamento de formato. Ver
[filas](/05-system-design/queues.md).

### O que precisa ser síncrono

Três condições. Basta uma:

**O chamador precisa do resultado para decidir.** Consultar saldo antes de
autorizar.

**O usuário está esperando e a operação define o que ele vê.** Uma busca.

**A operação precisa ser transacional com a chamada.** Reservar estoque no mesmo
compromisso do pedido.

Fora dessas, síncrono é escolha por hábito.

### Timeout é parte do contrato

Toda chamada síncrona precisa de timeout. Sem ele, o chamador espera
indefinidamente e esgota recursos — e a falha se propaga para cima.

O timeout precisa ser **menor** que o do chamador, senão ele desiste antes e a
cadeia trabalha para ninguém. Ver
[timeouts](/06-distributed-systems/index.md).

E o timeout não resolve a ambiguidade central: quando ele estoura, você não sabe
se a operação aconteceu.

### Resposta parcial e degradação

Nem toda chamada da requisição tem o mesmo peso. Uma página de produto que
precisa de preço, estoque e avaliações pode responder sem as avaliações.

Separar o que é essencial do que é enriquecimento permite degradar em vez de
falhar. Ver
[degradação graciosa](/12-reliability/graceful-degradation.md).

## Modelo Mental

**Pergunte o que acontece se o outro lado estiver fora.** Se a resposta for
"esperamos", há acoplamento temporal — e ele precisa ser deliberado.

## Quando Usar

- O chamador precisa do resultado para prosseguir.
- Há um usuário esperando e a operação define a resposta.
- A operação é transacional com a chamada.
- A latência total cabe no requisito.
- O número de saltos síncronos é pequeno.

## Quando Não Usar

**Quando o chamador não usa o resultado.** Notificar, registrar, indexar,
sincronizar — nada disso precisa bloquear a resposta.

**Quando a operação é demorada.** Uma requisição HTTP que espera trinta segundos
consome conexão, esgota pool e frequentemente estoura em algum proxy no caminho.
Ver [processamento em background](/05-system-design/background-processing.md).

**Quando o destino é instável.** Chamar sincronamente um serviço menos disponível
que você rebaixa a sua disponibilidade ao nível dele.

**Quando a cadeia fica longa.** Cada salto multiplica risco e soma latência.

**Quando o pico é imprevisível.** Síncrono propaga pressão para trás; fila a
absorve.

## Alternativas

- **[Fila](/05-system-design/queues.md)** — desacopla no tempo, ao custo de duplicação e ordem.
- **[Processamento em background](/05-system-design/background-processing.md)** — responder aceito e
  processar depois.
- **Evento** — quando vários interessados reagem. Ver
  [arquitetura orientada a eventos](/03-design-patterns/event-driven.md).
- **Requisição com resposta diferida** — devolver um identificador de operação e
  um caminho para consultar o resultado.

## Trade-offs

| Síncrono | Assíncrono |
|---|---|
| Resultado imediato | Confirmação de aceite |
| Erro visível ao chamador | Erro tratado longe |
| Fluxo legível de ponta a ponta | Fragmentado |
| Transação possível | Consistência eventual |
| Disponibilidade multiplicada | Cada lado independente |
| Pico propaga para trás | Absorvido pela fila |
| Sem duplicação nem ordem a tratar | Ambas a tratar |

A quarta e a sétima linhas são o que mantém síncrono como default correto na
maioria dos casos — assíncrono resolve disponibilidade e cobra em complexidade de
dados.

## Modos de Falha

**Cascata.** Um serviço lento consome as conexões de quem o chama, que fica lento
para quem o chama.

**Timeout ausente ou mal calibrado.** Espera indefinida, ou desistência antes do
tempo útil.

**Retentativa sem idempotência.** O timeout estourou, a operação aconteceu, a
retentativa duplica.

**Cadeia longa.** Latência somada acima do requisito.

**Chamada síncrona dentro de transação.** A transação fica aberta durante a espera,
segurando bloqueios no banco.

## Erros Comuns

**Tornar síncrono tudo que é fácil de chamar.**

**Não definir timeout.**

**Chamar dentro de transação.** É o erro mais caro desta lista: bloqueio de banco
mantido por uma espera de rede.

**Tratar todas as chamadas como igualmente essenciais.** Impede degradação.

**Encadear serviços.** Cada elo multiplica o risco.

## Exemplo Real

Um endpoint de confirmação de pedido fazia quatro chamadas síncronas: estoque,
pagamento, fiscal e notificação. Tudo dentro da transação do banco.

Dois problemas surgiram juntos numa terça-feira.

O serviço fiscal ficou lento — 8 segundos em vez de 200 ms. As transações do banco
ficaram abertas durante a espera, segurando bloqueios nas linhas de pedido.

Em minutos, o pool de conexões esgotou e o sistema inteiro parou. A causa raiz era
um serviço de terceiro, e o efeito foi indisponibilidade total.

A correção separou as quatro por necessidade real.

**Estoque** permaneceu síncrono e dentro da transação: se não há estoque, não há
pedido.

**Pagamento** virou síncrono fora da transação: o resultado é necessário para
responder ao usuário, mas não precisa segurar bloqueio de banco.

**Fiscal e notificação** viraram assíncronos, publicados após a confirmação. A
emissão fiscal tem prazo legal de horas, não de milissegundos — ninguém tinha
verificado isso antes.

Além disso, todas as chamadas ganharam timeout explícito, e a de pagamento ganhou
[circuit breaker](/12-reliability/circuit-breakers.md).

O que mudou não foi tecnologia. Foi perguntar, para cada chamada, se o resultado
era necessário para responder — e três das quatro não eram.

## Orçamento de timeout numa cadeia

Timeouts numa cadeia precisam ser coerentes entre si, e raramente são.

O princípio: **cada nível tem menos tempo que quem o chamou.** Se o usuário espera
no máximo 3 segundos e a requisição atravessa três serviços, cada um precisa caber
no que sobra.

```text
usuário          3 000 ms
  gateway        2 800 ms   ← reserva margem para a resposta
    serviço A    2 500 ms
      serviço B  1 500 ms
        banco      800 ms
```

O erro comum é o inverso: um serviço interno com timeout de 30 segundos chamado
por um gateway com 5. O chamador desiste aos 5 e o serviço continua trabalhando por
mais 25 — consumindo conexão, CPU e banco para produzir uma resposta que ninguém
vai receber.

Em volume, é um sistema gastando capacidade em trabalho descartado, e isso é
invisível nas métricas de erro do chamador.

A prática que resolve é **propagar o prazo restante** na chamada: quem chama
informa quanto tempo ainda tem, e quem recebe ajusta o próprio limite. Alguns
protocolos suportam nativamente; nos demais, um cabeçalho resolve.

Sem propagação, resta calibrar à mão — o que funciona até alguém mudar um timeout
sem olhar a cadeia inteira.

## Conceitos Relacionados

- [APIs](/05-system-design/apis.md) — o contrato da chamada.
- [Filas](/05-system-design/queues.md) — o modelo assíncrono.
- [Processamento em Background](/05-system-design/background-processing.md) — operações longas.
- [Sistemas Distribuídos](/06-distributed-systems/index.md) — timeouts,
  retentativa e idempotência.

## Exercício Prático

Escolha o endpoint mais importante do seu sistema e liste todas as chamadas
externas que ele faz.

Para cada uma, responda: o resultado é necessário para responder ao usuário? Ela
está dentro de uma transação de banco?

As que respondem "não" e "sim" — nessa ordem — são as que vão derrubar o sistema
quando o destino ficar lento.

## Perguntas de Entrevista

- O que é acoplamento temporal e qual sua consequência na disponibilidade?
- Por que uma chamada síncrona dentro de transação é perigosa?
- Como decidir se uma chamada precisa ser síncrona?

## Para Aprofundar

- Nygard, Michael. *Release It!* 2ª ed., Pragmatic Bookshelf, 2018 — cascata e
  padrões de estabilidade.
- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*, 2003.
