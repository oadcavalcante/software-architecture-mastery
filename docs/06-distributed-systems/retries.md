---
id: retries
title: Retries
sidebar_position: 6
description: Tentar de novo — e por que retentativa mal projetada é a causa, não a cura.
doc_type: concept
level: 4
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor decide o que é retentável, limita as tentativas, e
  reconhece a amplificação que a retentativa em cadeia produz.
prerequisites: [timeouts, idempotency]
related: [backoff, idempotency, retry-storms]
canonical_for: [retentativa, retry]
content_version: 1
last_reviewed: 2026-08-27
---

# Retries

## Visão Geral

Retentativa é repetir uma operação que falhou, na expectativa de que a falha seja
transitória.

Ela funciona porque muitas falhas em sistemas distribuídos são de fato passageiras
— um pacote perdido, uma instância reiniciando, um pico momentâneo.

E ela é, com frequência desconfortável, **a causa do incidente em vez da cura**.

## Problema

A retentativa parece uma decisão local e é sistêmica.

Quando um serviço está degradado, todos os seus clientes começam a repetir ao
mesmo tempo. A carga sobre ele **aumenta** justamente quando ele já não está dando
conta. O que era degradação vira colapso.

Pior em cadeia. Se cada nível repete três vezes:

```text
1 requisição do usuário
  → 3 tentativas no gateway
    → 9 no serviço A
      → 27 no serviço B
        → 81 no banco
```

Uma requisição vira 81. Sob degradação, quando todas as requisições estão
falhando, a carga no fundo da cadeia multiplica por 81.

Isso é [retry storm](../12-reliability/index.md), e é um dos modos de falha mais
comuns em sistemas distribuídos.

## Conceitos Centrais

### Nem toda falha é retentável

A primeira decisão, e a que mais se erra: repetir só faz sentido para falhas
**transitórias**.

| Falha | Retentável? |
|---|---|
| Timeout, conexão recusada | Sim — provavelmente transitória |
| `503`, `429` | Sim — o serviço pede que você tente depois |
| `500` | Talvez — depende da causa |
| `400`, `422` — requisição inválida | **Não** — repetir produz o mesmo erro |
| `401`, `403` | **Não** — a permissão não muda por repetir |
| `404` | **Não**, salvo em consistência eventual |
| `409` — conflito | **Não** sem resolver o conflito |

Repetir uma falha permanente é desperdício garantido: três tentativas produzem
três vezes o mesmo erro, com três vezes a carga.

### Retentativa exige idempotência

Uma operação que falhou por timeout pode ter sido executada. Repetir sem
[idempotência](idempotency.md) duplica o efeito.

Essa é a regra que não admite exceção: **se não é idempotente, não repita
automaticamente.**

Muitos clientes HTTP repetem por padrão apenas métodos considerados seguros —
`GET`, `PUT`, `DELETE` — e não `POST`. Isso é uma proteção razoável e frequentemente
contornada por quem configura retentativa genérica sem olhar.

### Limite de tentativas e orçamento

Duas formas de limitar:

**Contagem.** Três tentativas, e desiste. Simples, e sob degradação generalizada
ainda triplica a carga.

**Orçamento.** Limitar a proporção de retentativas sobre o total de requisições —
por exemplo, no máximo 10% de tentativas extras numa janela. Quando muitas coisas
falham, a retentativa se auto-limita.

O orçamento é a proteção mais eficaz contra tempestade, e a menos implementada.

### Repita em um nível, não em todos

A defesa mais simples contra a amplificação: **escolher um nível para repetir.**

Tipicamente o mais próximo da origem — o cliente ou o gateway — e desabilitar nos
intermediários. Isso mantém a resiliência e elimina o efeito multiplicativo.

Quando cada equipe configura retentativa no seu serviço sem visão do todo, a
multiplicação acontece por composição, sem ninguém ter decidido.

### Retentativa não é a resposta para sobrecarga

Se o destino está sobrecarregado, repetir agrava. A resposta correta é reduzir a
pressão: [backoff](backoff.md), circuit breaker, ou descartar carga.

Um serviço que devolve `429` está pedindo explicitamente que você espere — e
repetir imediatamente ignora o pedido.

## Modelo Mental

**Retentativa transfere trabalho do futuro para agora.** Quando o sistema está
saudável, isso é barato. Quando está degradado, é exatamente o que ele não
suporta.

## Quando Usar

- A falha é plausivelmente transitória.
- A operação é idempotente, ou é uma leitura.
- Há limite de tentativas e [backoff](backoff.md).
- O nível de retentativa foi escolhido deliberadamente.

## Quando Não Usar

**Falha permanente.** Requisição inválida, permissão negada, conflito.

**Operação não idempotente.** Duplicação garantida sob timeout.

**Em todos os níveis da cadeia.** Amplificação multiplicativa.

**Sem backoff.** Repetir imediatamente concentra a carga no pior momento.

**Sem limite.** Retentativa infinita ocupa recurso indefinidamente e nunca falha
visivelmente — o que impede o alerta.

**Quando o destino pediu para esperar.** `Retry-After` é instrução, não sugestão.

## Alternativas

- **Falhar rápido e propagar** — deixar o chamador decidir.
- **[Circuit breaker](../12-reliability/index.md)** — parar de tentar quando a taxa
  de falha indica problema persistente.
- **Fila** — em vez de repetir agora, enfileirar para depois. Ver
  [filas](../05-system-design/queues.md).
- **Degradar** — responder sem o dado.
- **Requisição de reserva** — enviar a duas réplicas simultaneamente, em vez de
  repetir após falha.

## Trade-offs

| Com retentativa | Sem |
|---|---|
| Falha transitória invisível ao usuário | Visível |
| Taxa de sucesso maior | Menor |
| Carga extra sob degradação | Carga constante |
| Latência maior no caso de falha | Falha rápida |
| Risco de duplicação | Sem risco |
| Risco de amplificação | Sem risco |

## Modos de Falha

**Tempestade de retentativa.** Todos repetem ao mesmo tempo e derrubam o destino.

**Amplificação em cadeia.** Multiplicação por nível.

**Duplicação.** Sem idempotência.

**Retentativa de falha permanente.** Desperdício.

**Retentativa infinita.** Nunca falha visivelmente; o alerta nunca dispara.

**Retentativa síncrona segurando recurso.** Três tentativas com timeout de 3
segundos ocupam a conexão por 9 segundos.

## Erros Comuns

**Configurar retentativa genérica sem distinguir o tipo de falha.**

**Repetir `POST` sem chave de idempotência.**

**Habilitar em cada serviço sem olhar a cadeia.**

**Não implementar backoff.**

**Ignorar `Retry-After`.**

## Exemplo Real

Uma plataforma de pagamentos teve indisponibilidade de 25 minutos que começou
com uma degradação de 40 segundos.

O serviço de autorização ficou lento — não caiu. As respostas passaram de 200 ms
para 4 segundos.

O gateway tinha três tentativas configuradas, sem backoff. O serviço de pedidos,
que chamava o gateway, também tinha três. O aplicativo móvel repetia duas vezes.

Uma tentativa do usuário produzia até 18 chamadas ao serviço de autorização.

Quando a latência subiu, todos começaram a repetir simultaneamente. A carga sobre
o serviço de autorização multiplicou. Ele passou de lento para inacessível.

E aí o efeito se realimentou: mais falhas, mais retentativas, mais carga.

Os 40 segundos de degradação inicial viraram 25 minutos de indisponibilidade, e a
recuperação só aconteceu quando o time desabilitou a retentativa manualmente.

As correções:

**Retentativa em um nível só** — no gateway. Serviço de pedidos e aplicativo
deixaram de repetir.

**Backoff exponencial com variação aleatória**, em vez de repetição imediata.

**Orçamento de retentativa**: no máximo 10% de tentativas extras sobre o total
numa janela. Sob falha generalizada, a retentativa praticamente se desliga
sozinha.

**Circuit breaker** no gateway: taxa de falha alta interrompe as chamadas por um
período, em vez de continuar tentando.

Numa degradação semelhante seis meses depois, o efeito foi de 90 segundos de taxa
de erro elevada e nenhuma indisponibilidade.

A degradação original nunca foi o problema. A resposta a ela é que era.

## Conceitos Relacionados

- [Timeouts](timeouts.md) — o que precede a retentativa.
- [Backoff](backoff.md) — como espaçar as tentativas.
- [Idempotência](idempotency.md) — o pré-requisito.
- [Retry Storms](../12-reliability/index.md) — o modo de falha em detalhe.

## Exercício Prático

Mapeie a cadeia de uma requisição do seu sistema e some as retentativas
configuradas em cada nível. Multiplique.

Se o número for maior que cinco, você tem amplificação — e ela só aparece quando
algo já está degradado.

## Perguntas de Entrevista

- Que falhas são retentáveis e quais não são?
- Por que retentativa pode ser a causa do incidente?
- O que é orçamento de retentativa e por que é mais eficaz que limite de
  contagem?

## Para Aprofundar

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — o capítulo
  sobre lidar com sobrecarga.
- Nygard, Michael. *Release It!* 2ª ed., 2018.
