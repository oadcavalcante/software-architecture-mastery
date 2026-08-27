---
id: backoff
title: Backoff
sidebar_position: 7
description: Espaçar as tentativas — e por que sem variação aleatória o backoff sincroniza os clientes.
doc_type: concept
level: 4
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor aplica backoff exponencial com variação aleatória e
  entende por que a variação é a parte essencial, não um detalhe.
prerequisites: [retries]
related: [retries, rate-limiting, retry-storms]
canonical_for: [backoff, backoff exponencial, jitter]
content_version: 1
last_reviewed: 2026-08-27
---

# Backoff

## Visão Geral

Backoff é aumentar o intervalo entre tentativas sucessivas.

Ele existe porque [retentativa](retries.md) imediata concentra carga exatamente
quando o destino não suporta. E a parte que mais se omite — a **variação
aleatória** — é a que faz o mecanismo funcionar de fato.

## Problema

Um serviço fica indisponível por 30 segundos. Mil clientes falham.

Sem backoff, os mil repetem imediatamente. E de novo. E de novo. O serviço, que
estava se recuperando, recebe carga contínua e não consegue.

Com backoff fixo — esperar 1 segundo — os mil esperam um segundo e tentam **todos
ao mesmo tempo**. A carga não diminuiu; ela virou pulsos.

Com backoff exponencial sem variação — 1 s, 2 s, 4 s, 8 s — a mesma coisa: os
clientes que falharam juntos continuam sincronizados, e os pulsos ficam mais
espaçados e igualmente concentrados.

**A sincronização é o problema, e só a variação aleatória a resolve.**

## Conceitos Centrais

### Exponencial mais variação

A fórmula usual:

```text
espera = mínimo(teto, base × 2^tentativa)
espera = aleatório(0, espera)          ← a variação
```

A primeira linha dá o crescimento. A segunda espalha os clientes ao longo da
janela, dessincronizando-os.

Sem a segunda linha, mil clientes que falharam no mesmo instante voltam no mesmo
instante. Com ela, distribuem-se — e o destino recebe carga gradual em vez de
pulso.

Essa forma — sortear no intervalo inteiro — é conhecida como *full jitter*, e
experimentos publicados pela AWS mostraram que ela reduz tanto a contenção quanto
o tempo total de conclusão em relação às variantes que sorteiam apenas parte do
intervalo.

### O teto importa

Sem limite, a espera cresce indefinidamente: a décima tentativa esperaria mais de
17 minutos com base de 1 segundo.

Um teto — tipicamente dezenas de segundos — mantém a retentativa útil. O
crescimento existe para aliviar o destino, não para desistir por exaustão
aritmética.

### Backoff não substitui limite de tentativas

São mecanismos diferentes. Backoff controla **quando** tentar; o limite controla
**quantas vezes**.

Backoff com tentativas infinitas ocupa recurso indefinidamente e nunca falha
visivelmente — o que impede o alerta.

### `Retry-After` tem precedência

Quando o destino informa quanto esperar, essa instrução vence o cálculo local. Ele
sabe do próprio estado mais do que o cliente consegue inferir.

Ignorar `Retry-After` e usar backoff próprio é desperdiçar informação que o
servidor forneceu de propósito.

### Backoff em fila é diferente

Numa [fila](../05-system-design/queues.md), o backoff costuma ser implementado
como atraso de reentrega: a mensagem volta a ficar visível depois de N segundos.

O efeito é o mesmo e o mecanismo não é do cliente — é da fila. Configurar
retentativa no consumidor **além** do mecanismo da fila produz duas camadas de
repetição que se multiplicam.

### As variantes de variação

"Adicionar variação" admite formulações diferentes, com comportamentos distintos:

```text
variação total     espera = aleatório(0, teto_atual)
variação parcial   espera = teto_atual/2 + aleatório(0, teto_atual/2)
descorrelacionada  espera = min(teto, aleatório(base, espera_anterior * 3))
```

**Variação total** é a que mais dispersa a carga e a que dá o melhor resultado
agregado na maioria das medições. O custo é que uma tentativa individual pode
acontecer quase imediatamente, o que parece errado a quem lê o código.

**Variação parcial** garante um piso de espera. É mais intuitiva e dispersa menos.

**Descorrelacionada** cresce com base na espera anterior, não no número de
tentativas. Dispersa bem e é menos previsível de raciocinar.

Na dúvida, variação total. A objeção de "mas pode tentar de novo em 10 ms" é
exatamente o comportamento que evita o pulso sincronizado.

A base merece a mesma atenção que o teto e recebe menos. Uma base muito curta
desperdiça tentativas antes que a falha transitória tenha tempo de passar; uma base
longa demais gasta o orçamento do chamador na primeira espera. O ponto de partida
razoável é a latência típica da operação, não um valor redondo escolhido por
hábito.

## Modelo Mental

**Backoff espalha as tentativas no tempo; a variação aleatória as espalha entre
clientes.** As duas coisas são necessárias, e a segunda é a esquecida.

## Quando Usar

- Sempre que houver retentativa automática.
- Ao reconectar a um serviço que caiu.
- Ao consumir API com limite de taxa.
- Em qualquer situação em que muitos clientes possam falhar simultaneamente.

## Quando Não Usar

**Sem retentativa.** Backoff só faz sentido acompanhando repetição.

**Quando o destino informou o prazo.** Use o que ele disse.

**Para falha permanente.** Esperar não muda uma requisição inválida.

**Quando a operação tem prazo curto.** Se o usuário espera 3 segundos, um backoff
que chega a 8 já ultrapassou o orçamento — a tentativa acontece depois de o
chamador ter desistido.

**Backoff sem variação.** É pior que não ter, porque dá a impressão de proteção
enquanto mantém a sincronização.

## Alternativas

- **[Circuit breaker](../12-reliability/index.md)** — parar de tentar em vez de
  espaçar. Mais eficaz quando a falha é persistente.
- **Fila com atraso** — deixar o mecanismo de mensageria cuidar.
- **Orçamento de retentativa** — limitar a proporção em vez do intervalo.
- **Falhar rápido** — quando o prazo do chamador não comporta espera.

## Trade-offs

| Backoff longo | Backoff curto |
|---|---|
| Alivia o destino | Pressiona |
| Recuperação mais lenta | Mais rápida se transitório |
| Ocupa recurso do chamador por mais tempo | Libera antes |

| Com variação | Sem |
|---|---|
| Clientes dessincronizados | Pulsos sincronizados |
| Carga gradual no destino | Picos periódicos |
| Tempo de conclusão imprevisível por cliente | Previsível e pior no agregado |

## Modos de Falha

**Sincronização por ausência de variação.** Pulsos que impedem a recuperação.

**Sem teto.** Espera cresce até tornar a retentativa inútil.

**Backoff além do prazo do chamador.** Tentativa que acontece depois de ninguém
estar esperando.

**Duas camadas de retentativa.** Cliente e fila repetindo, multiplicando.

**Backoff ignorando `Retry-After`.**

## Erros Comuns

**Omitir a variação aleatória.** É o erro dominante, e o mais fácil de corrigir.

**Backoff sem limite de tentativas.**

**Não considerar o orçamento de tempo do chamador.**

**Reimplementar em vez de usar o do cliente HTTP ou da biblioteca de resiliência.**

## Exemplo Real

Um sistema com 3 000 instâncias de trabalhadores consumia uma API interna com
limite de taxa.

Quando o limite era atingido, a API devolvia `429`. Os trabalhadores tinham
backoff exponencial configurado — sem variação aleatória.

O comportamento observado era característico: a API alternava entre 100% de
utilização e praticamente zero, em ciclos de poucos segundos.

A causa: os trabalhadores falhavam aproximadamente juntos, esperavam o mesmo
intervalo, e voltavam juntos. A cada ciclo, o pulso estourava o limite de novo, e
todos recuavam de novo.

A utilização média da API era de cerca de 35% da capacidade, e mesmo assim os
trabalhadores demoravam horas para concluir o processamento — porque a maior parte
do tempo estavam esperando em sincronia.

A correção foi uma linha: sortear a espera no intervalo `[0, calculado]` em vez de
usar o valor calculado.

O resultado: a utilização da API estabilizou em torno de 85%, sem pulsos, e o
tempo total de processamento caiu de horas para minutos.

Nenhuma capacidade foi adicionada. O que mudou foi os clientes deixarem de
tentar todos no mesmo instante.

## Conceitos Relacionados

- [Retries](retries.md) — o mecanismo que o backoff regula.
- [Rate Limiting](../05-system-design/rate-limiting.md) — o lado do servidor.
- [Circuit Breakers](../12-reliability/index.md) — a alternativa quando a falha
  persiste.
- [Retry Storms](../12-reliability/index.md).

## Exercício Prático

Verifique a configuração de retentativa do seu sistema: existe backoff? Ele tem
variação aleatória?

Se tiver backoff sem variação, você tem clientes sincronizados — e isso só aparece
como problema quando muitos falham ao mesmo tempo.

## Perguntas de Entrevista

- Por que backoff sem variação aleatória é insuficiente?
- Por que o backoff precisa de teto?
- Quando `Retry-After` deve prevalecer sobre o cálculo local?

## Para Aprofundar

- Brooker, Marc. *Exponential Backoff and Jitter*. AWS Architecture Blog, 2015 —
  os experimentos que compararam as variantes.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
