---
id: delivery-guarantees
title: Garantias de Entrega
sidebar_position: 25
description: No máximo uma vez, ao menos uma vez, exatamente uma vez — e por que a terceira não é o que parece.
doc_type: concept
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor entende por que exatamente-uma-vez é propriedade de ponta
  a ponta e não recurso de ferramenta.
prerequisites: [messaging, idempotency]
related: [idempotency, duplicate-messages, ordering]
canonical_for: [garantias de entrega, ao menos uma vez, exatamente uma vez]
content_version: 1
last_reviewed: 2026-08-27
---

# Garantias de Entrega

## Visão Geral

Três garantias possíveis quando uma mensagem atravessa a rede:

**No máximo uma vez** — pode se perder, nunca duplica.
**Ao menos uma vez** — nunca se perde, pode duplicar.
**Exatamente uma vez** — nem perde nem duplica.

A terceira é a desejada, é anunciada por várias ferramentas, e **não existe como
propriedade do canal**. Entender por quê é o que evita construir sistemas sobre
uma garantia que não está lá.

## Problema

A escolha entre as duas primeiras é direta e vem da natureza da rede.

Se o produtor não espera confirmação, a mensagem pode se perder: **no máximo uma
vez**.

Se ele reenvia até ser confirmado, ela nunca se perde — e a confirmação pode se
perder, causando reenvio de algo já entregue: **ao menos uma vez**.

Não há terceira opção no nível do canal. É consequência direta do
[terceiro resultado](distributed-fundamentals.md): quando a confirmação não chega,
o produtor não sabe se a mensagem chegou.

A tentação é procurar uma ferramenta que resolva. Ela não pode — o problema é do
protocolo, não da implementação.

## Conceitos Centrais

### Por que exatamente-uma-vez não é entregável

Para não duplicar, o produtor precisaria saber se a mensagem chegou. Para saber,
precisaria da confirmação. Se a confirmação se perde, ele não sabe.

Qualquer decisão que ele tome — reenviar ou não — pode estar errada.

Isso não é limitação de engenharia. É o mesmo resultado que torna
[idempotência](idempotency.md) necessária.

### O que as ferramentas de fato oferecem

Sistemas que anunciam "exatamente uma vez" oferecem uma de duas coisas:

**Deduplicação no broker.** O produtor envia um identificador; o broker descarta
repetições dentro de uma janela. Isso resolve duplicação **na entrega ao broker**,
não no processamento pelo consumidor.

**Processamento transacional.** Ler, processar e confirmar a posição de leitura
numa única transação — possível quando a leitura e a escrita estão no mesmo
sistema.

A segunda é genuína e limitada: ela vale enquanto o efeito não sai do sistema. No
momento em que o consumidor chama um serviço externo ou grava em outro banco, a
garantia acaba — porque aquela chamada não participa da transação.

E é exatamente isso que consumidores reais fazem.

### Exatamente-uma-vez é de ponta a ponta

A formulação correta: **entrega ao menos uma vez, mais processamento idempotente,
produz efeito exatamente uma vez.**

```text
canal: ao menos uma vez  →  mensagem pode chegar N vezes
consumidor: idempotente  →  efeito acontece 1 vez
                            ─────────────────
                            efeito exatamente uma vez
```

A garantia não está no canal — está na composição. E a parte que a aplicação
controla é a idempotência.

Essa é a razão de idempotência ser o conceito central deste nível.

### No máximo uma vez tem uso legítimo

Ela é frequentemente descartada e tem lugar: telemetria de alto volume, métricas
agregadas, sinais de presença.

Perder algumas amostras entre milhões não muda nenhuma conclusão, e o custo de
garantir entrega — confirmação, retentativa, armazenamento durável — é
desproporcional.

Escolher **no máximo uma vez** deliberadamente, onde a perda é aceitável, é uma
decisão de arquitetura legítima e raramente considerada.

## Modelo Mental

**O canal escolhe entre perder e duplicar. Você escolhe tornar a duplicação
inofensiva.**

## Quando Usar

**Ao menos uma vez** — o padrão. Quase todo caso de negócio, com consumidor
idempotente.

**No máximo uma vez** — quando a perda é aceitável e o volume torna a garantia
cara: telemetria, métricas, sinais efêmeros.

**Deduplicação no broker** — como camada adicional, reduzindo a frequência de
duplicação sem substituir a idempotência.

## Quando Não Usar

**Confiar em "exatamente uma vez" da ferramenta.** Leia o escopo da garantia: ela
quase sempre cobre o trecho até o broker, não o efeito final.

**Ao menos uma vez sem idempotência.** É adotar duplicação garantida.

**No máximo uma vez para dado de negócio.** Perder uma cobrança não é aceitável.

**Depender de transação entre sistemas.** O consumidor que grava em outro banco ou
chama serviço externo saiu do escopo transacional.

## Alternativas

Não há alternativa às três garantias — o que existe é onde colocar a
responsabilidade:

- **Idempotência no consumidor** — a resposta padrão e a que sempre funciona.
- **Deduplicação por chave** — verificar se já processou antes de aplicar.
- **Operações comutativas** — se a ordem e a repetição não importam, o problema
  desaparece.
- **Reconciliação** — aceitar divergência e corrigir por processo separado.

## Trade-offs

| No máximo uma vez | Ao menos uma vez |
|---|---|
| Sem duplicação | Duplicação garantida eventualmente |
| Perda possível | Sem perda |
| Sem confirmação, mais rápido | Confirmação e retentativa |
| Consumidor simples | Precisa ser idempotente |
| Adequado a dado descartável | Adequado a dado de negócio |

## Modos de Falha

**Duplicação com consumidor não idempotente.** Cobrança dupla, e-mail duplicado,
estoque debitado duas vezes.

**Perda por confirmação prematura.** O consumidor confirma antes de processar.

**Confiança em garantia mal compreendida.** A ferramenta promete exatamente uma
vez; o efeito externo duplica mesmo assim.

**Janela de deduplicação curta.** Uma retentativa após a janela produz duplicata.

**Perda por ausência de outbox no produtor.** A mensagem nunca chega ao broker.

## Erros Comuns

**Assumir que a ferramenta resolve.**

**Não ler o escopo da garantia anunciada.**

**Tratar idempotência como opcional.**

**Não considerar no máximo uma vez onde ela caberia.**

**Confirmar antes de processar.**

## Exemplo Real

Uma equipe migrou o processamento de eventos de pagamento para uma plataforma que
anunciava semântica de exatamente uma vez, e removeu a verificação de idempotência
do consumidor — "a plataforma garante".

Funcionou por quatro meses.

O consumidor lia o evento, chamava a API do adquirente para capturar o pagamento, e
gravava o resultado num banco relacional separado.

A garantia da plataforma cobria leitura e confirmação de posição dentro dela. A
chamada ao adquirente e a escrita no banco externo **não participavam** dessa
transação.

Numa falha de rede, o consumidor capturou o pagamento com sucesso, e a confirmação
de posição falhou. A mensagem foi reentregue. O consumidor capturou de novo.

217 pagamentos capturados em duplicidade num dia.

A leitura atenta da documentação — feita depois do incidente — deixava claro o
escopo: a garantia vale para o fluxo interno da plataforma, e sistemas externos
exigem idempotência do lado da aplicação.

A correção restaurou a verificação removida, agora com chave de idempotência
enviada ao adquirente, e adicionou uma verificação local antes da chamada.

O que a equipe registrou como aprendizado principal não foi técnico: **"exatamente
uma vez" numa página de produto é uma afirmação com escopo, e o escopo está na
documentação técnica.** Remover uma proteção com base na propaganda foi a decisão
que causou o incidente.

## Conceitos Relacionados

- [Idempotência](idempotency.md) — o que torna ao menos uma vez seguro.
- [Mensagens Duplicadas](duplicate-messages.md) — o tratamento prático.
- [Mensageria](messaging.md) — o canal.
- [Falha Parcial](partial-failure.md).

## Exercício Prático

Para cada consumidor de mensagem do seu sistema, responda: o que acontece se a
mesma mensagem for processada duas vezes?

Se algum efeito sair do sistema — chamada externa, gravação em outro banco — a
garantia da ferramenta não cobre, independentemente do que ela anuncie.

## Perguntas de Entrevista

- Por que exatamente-uma-vez não existe no nível do canal?
- O que as ferramentas que a anunciam de fato oferecem?
- Quando no máximo uma vez é a escolha correta?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Helland, Pat. *Idempotence Is Not a Medical Condition*. ACM Queue, 2012.
