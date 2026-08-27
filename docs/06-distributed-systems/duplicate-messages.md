---
id: duplicate-messages
title: Mensagens Duplicadas
sidebar_position: 27
description: A duplicação é certa — o que varia é se ela produz efeito.
doc_type: concept
level: 4
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor implementa deduplicação no consumidor e escolhe entre
  chave persistida e janela conforme o volume.
prerequisites: [delivery-guarantees, idempotency]
related: [idempotency, delivery-guarantees, poison-messages]
canonical_for: [mensagens duplicadas, deduplicação]
content_version: 1
last_reviewed: 2026-08-27
---

# Mensagens Duplicadas

## Visão Geral

Num sistema com [entrega ao menos uma vez](delivery-guarantees.md), a mesma
mensagem chegará duas vezes. Não é hipótese — é certeza estatística ao longo do
tempo.

O que a arquitetura decide não é se a duplicação acontece. É **se ela produz
efeito**.

## Problema

A duplicação tem várias origens, e nenhuma delas é evitável:

**Retentativa do produtor.** A confirmação se perdeu; ele reenvia.

**Reentrega do broker.** O consumidor não confirmou a tempo — porque estava lento,
não porque falhou.

**Rebalanceamento.** Consumidores trocam de partição e reprocessam mensagens em
andamento.

**Reprocessamento deliberado.** Alguém reposiciona a leitura para corrigir um
defeito, e mensagens já processadas voltam.

A última é frequentemente esquecida no projeto e é a mais comum na operação: toda
correção de defeito num consumidor implica reprocessar.

## Conceitos Centrais

### Duas estratégias

**Idempotência da operação.** O efeito é o mesmo executando uma ou N vezes. Ver
[idempotência](idempotency.md). É a solução mais robusta, porque não depende de
detectar a duplicata.

**Deduplicação explícita.** Registrar identificadores já processados e descartar
repetições.

A primeira é preferível quando possível — ela funciona mesmo com identificador
perdido ou janela expirada. A segunda é necessária quando o efeito não pode ser
tornado idempotente.

Na prática, sistemas maduros usam as duas: idempotência onde dá, deduplicação como
rede.

### Identificador de mensagem versus identificador de negócio

Detalhe que decide a correção da deduplicação.

O **identificador da mensagem**, gerado pelo broker, muda quando o produtor
reenvia — porque é uma mensagem nova, com o mesmo conteúdo. Deduplicar por ele não
detecta duplicação de produtor.

O **identificador de negócio** — o pedido, a transação, a operação — identifica a
intenção e é estável entre reenvios.

**Deduplique pelo identificador de negócio.** É o mesmo princípio da chave de
idempotência: a chave identifica a intenção, não a tentativa.

### Persistida ou por janela

| | Chave persistida | Janela em cache |
|---|---|---|
| Garantia | Completa | Dentro da janela |
| Custo | Escrita por mensagem | Memória |
| Volume alto | Caro | Viável |
| Reprocessamento antigo | Detectado | Não detectado |

A janela é adequada para volume alto onde a duplicação realista acontece em
segundos ou minutos. A chave persistida é necessária quando o reprocessamento
pode ser de dias atrás.

O erro comum é usar janela e esquecer que reprocessamento deliberado ultrapassa
qualquer janela razoável.

### A verificação e o efeito precisam ser atômicos

Se o consumidor verifica a chave, processa, e depois registra — existe uma janela
em que dois consumidores verificam ao mesmo tempo e ambos processam.

A forma correta é a inserção da chave **fazer parte da mesma transação** do efeito,
com restrição de unicidade fazendo o trabalho:

```text
BEGIN
  INSERT INTO processados (chave) VALUES (:chave)   -- falha se já existe
  ... aplica o efeito ...
COMMIT
```

A violação de unicidade indica duplicata, e a transação inteira é descartada. Sem
janela de corrida.

### Deduplicação não resolve tudo

Se o efeito sai do sistema — uma chamada a serviço externo — a deduplicação local
não impede que a chamada aconteça duas vezes se o processo morrer entre a chamada
e a confirmação.

Ali a idempotência precisa estar **do outro lado**, com chave enviada na chamada.

### O tamanho da janela vem do comportamento real

Escolher a janela de deduplicação por intuição — "uma hora parece razoável" — é
como o mecanismo falha em produção.

A janela precisa cobrir o maior intervalo possível entre duas entregas da mesma
mensagem, que é a soma de três coisas mensuráveis:

```text
janela ≥ atraso máximo de reentrega do intermediário
       + atraso máximo do consumidor
       + margem para reprocessamento operacional
```

O terceiro termo é o que mais surpreende. Se a operação inclui reprocessar um
período depois de um incidente, a janela precisa cobrir esse período inteiro — e
aí ela deixa de ser uma janela e passa a ser deduplicação persistente.

A regra prática: se o sistema tem qualquer procedimento de reprocessamento, a
janela não serve.

## Modelo Mental

**A mensagem vai chegar duas vezes. A pergunta é se o mundo nota.**

## Quando Usar

- Todo consumidor de mensagem, sem exceção.
- Toda operação com efeito colateral externo.
- Especialmente onde o efeito é irreversível — cobrança, envio, emissão de
  documento.

## Quando Não Usar

**Quando a operação é naturalmente idempotente.** Definir um valor absoluto,
marcar um estado. Vale verificar se continua sendo — idempotência natural quebra
com o tempo.

**Quando o efeito duplicado é inofensivo e barato.** Um log duplicado. Vale
reconhecer explicitamente, não presumir.

**Deduplicação por janela quando o reprocessamento é comum.** A janela não cobre.

**Deduplicação pelo identificador da mensagem.** Não detecta reenvio do produtor.

## Alternativas

- **Idempotência da operação** — a preferível.
- **Restrição de unicidade no banco** — o próprio armazenamento rejeita a
  duplicata, sem código de deduplicação.
- **Operações comutativas e absolutas** — reformular de "some" para "defina".
- **Reconciliação** — aceitar e corrigir depois, quando a detecção em tempo real é
  cara.

## Trade-offs

| Deduplicar | Não deduplicar |
|---|---|
| Efeito único garantido | Duplicação possível |
| Escrita adicional por mensagem | Nenhuma |
| Armazenamento de chaves a manter | Nada |
| Latência ligeiramente maior | Menor |

| Persistida | Janela |
|---|---|
| Garantia completa | Dentro da janela |
| Custo por mensagem | Custo de memória |
| Detecta reprocessamento antigo | Não |

## Modos de Falha

**Deduplicação não atômica.** Dois consumidores processam simultaneamente.

**Chave errada.** Identificador da mensagem em vez do de negócio.

**Janela curta.** Reprocessamento ultrapassa.

**Chaves sem expiração.** Vazamento no armazenamento.

**Efeito externo não protegido.** A deduplicação local não cobre a chamada que já
saiu.

## Erros Comuns

**Assumir que o broker resolve.**

**Deduplicar pelo identificador da mensagem.**

**Verificar e processar em transações separadas.**

**Não considerar reprocessamento deliberado ao dimensionar a janela.**

**Não expirar as chaves.**

## Exemplo Real

Um consumidor de eventos de venda gravava comissões de vendedores.

A deduplicação usava o identificador da mensagem, guardado em cache com janela de
uma hora.

Dois incidentes.

**O primeiro** foi um defeito no cálculo de comissão para um tipo de produto.
Corrigido o código, a equipe reposicionou a leitura para reprocessar as vendas do
mês. As mensagens tinham identificadores novos — eram entregas novas — e a janela
de uma hora era irrelevante para eventos de semanas atrás.

Todas as comissões do mês foram lançadas de novo. Os vendedores receberam o dobro,
e o estorno gerou conversa com o jurídico trabalhista.

**O segundo** foi mais sutil. Sob carga, dois consumidores processaram a mesma
mensagem: um verificou o cache, e antes de gravar a chave, o outro verificou
também. Ambos passaram.

A reformulação trocou as duas decisões.

**Chave de negócio** — o identificador da venda — em vez do identificador da
mensagem. Reprocessar a mesma venda passa a ser detectado independentemente de
quantas vezes a mensagem seja reentregue ou reenviada.

**Persistência com unicidade, na mesma transação** do lançamento da comissão. A
inserção da chave e o lançamento acontecem juntos ou nenhum acontece. A corrida
deixou de ser possível.

E as chaves ganharam expiração de 90 dias — prazo maior que qualquer
reprocessamento plausível, e curto o bastante para não acumular indefinidamente.

O reprocessamento seguinte, seis meses depois, correu sem incidente: as vendas já
comissionadas foram descartadas silenciosamente, e apenas as novas foram lançadas.

## Conceitos Relacionados

- [Idempotência](idempotency.md) — a estratégia preferível.
- [Garantias de Entrega](delivery-guarantees.md) — por que a duplicação é certa.
- [Ordenação](ordering.md) — o problema irmão.
- [Poison Messages](poison-messages.md).

## Exercício Prático

Para cada consumidor do seu sistema, responda: como ele detecta duplicata? Pela
chave de negócio ou da mensagem? A verificação e o efeito são atômicos?

Depois faça a pergunta operacional: se você precisasse reprocessar o último mês, o
que aconteceria?

## Perguntas de Entrevista

- Por que deduplicar pelo identificador da mensagem é insuficiente?
- Por que a verificação e o efeito precisam ser atômicos?
- Quando janela em cache é suficiente e quando não é?

## Para Aprofundar

- Helland, Pat. *Idempotence Is Not a Medical Condition*. ACM Queue, 2012.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
