---
id: circuit-breakers
title: Circuit Breakers
sidebar_position: 14
description: Parar de tentar quando a falha é persistente — protegendo os dois lados da chamada.
doc_type: pattern
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor aplica circuit breaker com limiares medidos e define o
  comportamento aberto de forma consciente.
prerequisites: [retry-storms]
related: [retry-storms, bulkheads, graceful-degradation]
canonical_for: [circuit breaker, disjuntor, estado semiaberto, limiar de abertura]
content_version: 2
last_reviewed: 2026-08-28
---

# Circuit Breakers

## Visão Geral

Um circuit breaker monitora as chamadas a uma dependência e, quando a taxa de falha
passa de um limiar, **para de tentar** — falhando imediatamente por um período.

Ele protege os dois lados:

**O chamador**, que deixa de gastar recursos e tempo esperando por algo que vai falhar.

**O destino**, que deixa de receber carga que não consegue atender e ganha espaço para
se recuperar.

O segundo é o mais importante e o menos citado: ele é o que quebra o ciclo de
[retentativas](/12-reliability/retry-storms.md) que impede a recuperação.

## Problema

Quando uma dependência fica indisponível, cada chamada consome uma conexão e um fio de
execução do chamador durante todo o timeout.

```text
timeout de 10s, 500 req/s ao serviço fora
  → 5.000 requisições simultâneas presas
  → conexões esgotadas, memória consumida
  → o chamador cai por causa de uma dependência não essencial
```

A falha se propaga para cima, e um serviço opcional derruba o sistema inteiro.

Ver a lei de Little em
[desempenho versus escalabilidade](/11-scalability/performance-vs-scalability.md) —
latência alta com vazão constante significa concorrência alta.

## Conceitos Centrais

### Os três estados

```text
fechado    chamadas passam; falhas são contadas
aberto     chamadas falham imediatamente, sem tentar
semiaberto após o período, algumas chamadas passam para testar
```

O estado semiaberto é o mecanismo de recuperação: em vez de voltar ao normal de uma
vez — o que geraria um pico sobre o serviço que acabou de se recuperar —, ele deixa
passar uma fração.

Se essas chamadas sucedem, fecha. Se falham, volta a abrir com período maior.

Sem o semiaberto, a reabertura produz uma tempestade contra um serviço frágil, que cai
de novo — e o sistema oscila.

### Os limiares precisam ser medidos

Os valores padrão de bibliotecas raramente servem:

```text
limiar de falha        proporção que dispara a abertura
volume mínimo          chamadas antes de avaliar
período aberto         quanto tempo antes de testar
proporção semiaberta   fração que passa no teste
```

O **volume mínimo** é o parâmetro mais esquecido: sem ele, duas falhas em três chamadas
abrem o circuito, e serviços de baixo tráfego oscilam constantemente.

E o limiar de falha precisa vir da taxa de erro normal. Um serviço que normalmente erra
2% não deveria abrir em 5%.

### Contar lentidão, não só erro

Um serviço que responde em 30 segundos com sucesso é tão danoso quanto um que falha —
ele prende recursos do chamador pelo mesmo tempo.

Circuit breakers que contam apenas erro não detectam esse caso, que é o mais comum na
prática: dependências raramente caem completamente; elas ficam lentas.

Contar chamadas acima de um limiar de latência como falha é o ajuste que faz o
mecanismo funcionar no cenário real.

### O comportamento aberto precisa ser decidido

Abrir o circuito não é a solução — é a metade dela. A outra metade é o que fazer com a
requisição:

```text
falhar rápido          o chamador trata
resposta de reserva    cache, valor padrão, versão simplificada
omitir                 a funcionalidade some
enfileirar             processar depois
```

Ver [degradação graciosa](/12-reliability/graceful-degradation.md). Um circuit breaker sem
comportamento de reserva apenas troca uma falha lenta por uma rápida — o que ajuda o
sistema e não ajuda o usuário.

### Um circuito por dependência, não por serviço

Se um serviço expõe dez operações e apenas uma está degradada, abrir o circuito para
todas remove capacidade que funcionava.

A granularidade adequada é por **operação** ou por **grupo de operações com o mesmo
perfil de falha** — o que se relaciona com [bulkheads](/12-reliability/bulkheads.md).

E, em serviços particionados, por instância ou partição: uma partição degradada não
deveria abrir o circuito para as demais.

### Ele precisa ser observável

Um circuito que abre e ninguém sabe transforma um problema visível em silencioso.

O mínimo: métrica de estado por circuito, contagem de aberturas, e alerta quando um
circuito permanece aberto além de um período.

Sem isso, o sistema opera degradado indefinidamente — e a degradação é justamente o que
o circuit breaker foi projetado para tornar aceitável.

### Não aplique a tudo

Um circuit breaker em cada chamada adiciona estado, configuração e um modo de falha
novo — abrir quando não deveria.

Ele se justifica onde: a dependência é externa ou instável, o timeout é significativo,
existe comportamento de reserva, e a chamada é frequente.

Para uma chamada rara a um serviço confiável, timeout e retentativa bastam.

## Modelo Mental

**Circuit breaker converte falha lenta em falha rápida, e dá espaço para o destino se
recuperar.** O que fazer com a falha rápida é uma decisão separada.

## Quando Usar

- Dependência externa ou historicamente instável.
- Timeout longo o suficiente para prender recursos.
- Existe comportamento de reserva.
- A chamada é frequente.
- A dependência não é essencial, ou tem alternativa.

## Quando Não Usar

**Sem comportamento de reserva definido.** Só troca o tipo de falha.

**Com limiares padrão**, sem medir a taxa de erro normal.

**Sem volume mínimo.** Serviços de baixo tráfego oscilam.

**Contando apenas erro**, ignorando lentidão.

**Um circuito por serviço** quando as operações têm perfis diferentes.

**Em toda chamada.** Complexidade sem retorno.

**Sem observabilidade.**

## Alternativas

- **Timeout agressivo** — mais simples, e não protege o destino.
- **[Bulkhead](/12-reliability/bulkheads.md)** — limita o dano sem parar de tentar.
- **Orçamento de retentativa** — controla a amplificação. Ver
  [tempestades](/12-reliability/retry-storms.md).
- **Descarte de carga no destino** — o destino se protege, em vez de depender dos
  chamadores.

A última merece nota: proteção no destino é mais confiável que proteção distribuída
entre chamadores, porque não depende de todos configurarem corretamente.

## Trade-offs

| Com circuit breaker | Sem |
|---|---|
| Falha rápida | Espera o timeout |
| Recursos preservados | Consumidos |
| Destino ganha espaço | Recebe carga |
| Estado e configuração | Nenhum |
| Pode abrir indevidamente | Sempre tenta |

| Limiar baixo | Alto |
|---|---|
| Protege cedo | Tolera mais |
| Abre por ruído | Demora a reagir |

## Modos de Falha

**Abertura indevida.** Limiar baixo ou volume mínimo ausente.

**Oscilação.** Abre e fecha repetidamente.

**Aberto permanentemente.** Ninguém percebeu, e a funcionalidade sumiu.

**Sem reserva.** Falha rápida em vez de lenta, e nada mais.

**Granularidade grossa.** Uma operação degradada derruba dez.

**Lentidão não contada.** O caso mais comum não dispara o circuito.

**Circuito por instância de chamador.** Cada instância aprende separadamente, e a
proteção demora — em serviços com muitas instâncias, o destino recebe carga de todas as
que ainda não abriram.

## Erros Comuns

**Usar limiares padrão.** Os valores de exemplo da biblioteca não conhecem a taxa de erro normal nem o volume da sua chamada. Aplicados sem calibrar, abrem cedo demais ou nunca.

**Não definir volume mínimo.** Com três chamadas, uma falha é 33% de erro. Sem exigir um volume mínimo na janela, o circuito abre por ruído estatístico.

**Não contar lentidão como falha.** A dependência que responde em 30 segundos esgota threads e derruba o chamador sem gerar erro nenhum — que é justamente o caso que o disjuntor deveria cobrir.

**Não definir o comportamento aberto.** Abrir o circuito sem decidir o que responder apenas troca lentidão por erro. O valor está na alternativa: cache, valor padrão ou degradação declarada.

**Não alertar sobre circuito aberto.** Ele protege o sistema e esconde o problema. Sem alerta, a dependência fica quebrada por dias enquanto tudo parece saudável.

**Aplicar indiscriminadamente.** Em dependência sem alternativa de resposta, abrir o circuito só antecipa a falha. Ele serve onde existe degradação possível.

## Exemplo Real

Uma plataforma de reservas de hotel chamava um serviço externo de avaliações em toda
página de resultado. O timeout era de 15 segundos.

Numa degradação do serviço externo — que passou a responder em 14 segundos, sem erro —
a plataforma inteira ficou indisponível em 6 minutos.

A causa: 400 requisições por segundo, cada uma presa por 14 segundos, geraram cerca de
5.600 requisições simultâneas. As conexões e os fios de execução se esgotaram, e a
aplicação parou de atender **qualquer** requisição — inclusive as que não precisavam de
avaliações.

Um serviço opcional derrubou a plataforma.

As correções:

**Timeout de 800 ms** para avaliações, derivado da latência normal de 120 ms com folga
generosa.

**Circuit breaker** com limiar de 30% de falha, volume mínimo de 20 chamadas, período
aberto de 30 segundos e teste com 10% do tráfego no semiaberto.

**Lentidão contada como falha.** Chamadas acima de **400 ms** contam para o limiar. O
número fica abaixo do timeout de propósito: no limiar do timeout a chamada já vira erro
sozinha, e a regra não acrescentaria nada. Entre 400 e 800 ms a chamada responde com
sucesso e ainda assim conta — que é o caso que só esta regra pega.

**Comportamento de reserva.** Circuito aberto significa exibir a página sem avaliações,
com o bloco omitido. Ver
[degradação graciosa](/12-reliability/graceful-degradation.md).

**Bulkhead.** Um pool de conexões separado para chamadas externas, limitado a 80
simultâneas — 400 req/s × 120 ms exigem 48 em regime normal, e a folga acompanha o
dimensionamento de [bulkheads](/12-reliability/bulkheads.md) — para que, mesmo sem circuit breaker, o esgotamento não alcance o pool
principal. Ver [bulkheads](/12-reliability/bulkheads.md).

**Alerta** quando um circuito fica aberto por mais de 5 minutos.

Dois meses depois, o mesmo serviço externo degradou de novo. O circuito abriu em 12
segundos, as páginas passaram a ser servidas sem avaliações, e nenhum usuário reportou
problema. O incidente foi registrado como degradação, não como indisponibilidade.

A conclusão registrada: o ajuste que mais importou foi o timeout — 15 segundos era o
que permitia a fila crescer. Contar lentidão veio depois, e é o que pega a degradação
que responde dentro do timeout sem nunca falhar. A
primeira versão do circuit breaker, instalada meses antes, contava apenas erro — e
teria ficado fechado durante o incidente original, porque o serviço respondia com
sucesso, muito devagar.

## Conceitos Relacionados

- [Tempestades de Retentativa](/12-reliability/retry-storms.md) — o que ele quebra.
- [Bulkheads](/12-reliability/bulkheads.md) — a proteção complementar.
- [Degradação Graciosa](/12-reliability/graceful-degradation.md) — o comportamento aberto.
- [Timeouts](/06-distributed-systems/timeouts.md).

## Exercício Prático

Liste as chamadas externas do seu caminho crítico com os timeouts de cada uma.

Multiplique o timeout pela taxa de requisições. Esse é o número de requisições
simultâneas presas se a dependência ficar lenta — e compare com o limite de
concorrência da sua aplicação.

## Perguntas de Entrevista

- Por que o estado semiaberto é necessário?
- Por que contar apenas erro não detecta o caso mais comum?
- Por que um circuit breaker sem comportamento de reserva ajuda pouco?

## Para Aprofundar

- Nygard, Michael. *Release It!*. 2ª ed. Pragmatic Bookshelf, 2018 — a formulação
  original.
- Fowler, Martin. *CircuitBreaker*, 2014.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — capítulo 22.
