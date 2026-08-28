---
id: bulkheads
title: Bulkheads
sidebar_position: 15
description: Compartimentar recursos para que a falha de uma parte não afunde o navio.
doc_type: pattern
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor isola recursos por dependência e por classe de cliente, com
  limites dimensionados.
prerequisites: [reliability]
related: [circuit-breakers, graceful-degradation, retry-storms]
canonical_for: [bulkhead, isolamento de recursos, pool dedicado, isolamento por cliente]
content_version: 1
last_reviewed: 2026-08-28
---

# Bulkheads

## Visão Geral

O nome vem da construção naval: um casco dividido em compartimentos estanques não
afunda quando um deles é perfurado.

Aplicado a software, é **isolar recursos** — conexões, fios de execução, memória — de
forma que o esgotamento causado por uma parte não alcance as demais.

É a proteção que funciona quando as outras falham: mesmo sem circuit breaker, sem
timeout adequado e sem degradação, um bulkhead limita o dano ao compartimento.

## Problema

Recursos compartilhados propagam falha por construção.

```text
pool único de 200 conexões
  dependência lenta consome 200
  → todas as requisições esperam, inclusive as que não a usam
  → o serviço inteiro para por causa de uma dependência
```

Ver [circuit breakers](circuit-breakers.md) para a matemática. O ponto do bulkhead é
que ele resolve o mesmo problema por outro caminho — e sem depender de configuração
correta de limiares.

O mesmo vale entre clientes: um cliente que dispara volume anormal consome a capacidade
de todos os outros.

## Conceitos Centrais

### As dimensões de isolamento

```text
por dependência   pool de conexões e fios separados por serviço chamado
por cliente       cota por inquilino, para que um não afete os outros
por operação      leitura e escrita, ou crítico e não crítico
por criticidade   caminho de pagamento separado do de navegação
por instância     processos ou máquinas dedicados
```

A força cresce na lista: separar pools é configuração; separar processos é isolamento
real; separar máquinas é isolamento que nenhuma configuração errada anula.

A escolha depende do que se protege e do custo aceitável.

### Dimensionar o compartimento

Um pool pequeno demais vira gargalo artificial; grande demais não isola nada.

O ponto de partida vem da lei de Little:

```text
requisições simultâneas = vazão × latência
  100 req/s × 0,15 s = 15 conexões necessárias
  → pool de 25 dá folga sem permitir monopolizar
```

Ver [desempenho versus escalabilidade](../11-scalability/performance-vs-scalability.md).

E a soma dos compartimentos pode exceder o total disponível, deliberadamente — o
chamado excesso de reserva, apostando que nem todos saturam ao mesmo tempo. Isso
melhora a utilização e reduz a garantia; a decisão precisa ser consciente.

### Isolamento por cliente é o que sustenta multi-inquilino

Numa plataforma que serve vários clientes, o comportamento de um afeta os demais por
padrão.

```text
sem isolamento   cliente com laço defeituoso consome toda a capacidade
com cota         ele esgota a própria cota; os demais não sentem
```

A cota pode ser de requisições, de conexões, de trabalhadores de fila ou de capacidade
de processamento.

E os clientes de maior volume podem receber compartimento dedicado — o que também
resolve [pontos quentes](../11-scalability/hotspots.md).

### Fila também precisa de compartimento

Uma fila única processa em ordem de chegada. Um cliente que publica milhões de
mensagens atrasa todos os outros.

Filas separadas por cliente ou por prioridade, com capacidade de consumo reservada,
resolvem. Ver
[escala dirigida por fila](../11-scalability/queue-based-scaling.md).

O erro comum é criar as filas e deixar todos os consumidores livres para pegar de
qualquer uma — o que reproduz o problema, porque a fila cheia domina o consumo.

### O bulkhead precisa rejeitar, não enfileirar

Quando o compartimento enche, a requisição precisa ser **recusada rapidamente**.

Se ela entra numa fila de espera pelo recurso, o isolamento se perde: a fila cresce, a
memória é consumida, e o dano volta a atravessar.

Rejeitar preserva o compartimento e devolve o controle ao chamador, que pode degradar
ou repetir com [backoff](../06-distributed-systems/backoff.md). Ver
[backpressure](../06-distributed-systems/backpressure.md).

### O isolamento tem que ser real

Compartimentos que compartilham algo mais abaixo não isolam:

```text
pools separados, mesmo processo    → memória e CPU compartilhadas
processos separados, mesma máquina → disco e rede compartilhados
máquinas separadas, mesma zona     → energia e rede compartilhadas
```

Ver [redundância](redundancy.md) — é o mesmo problema de correlação.

Isso não significa que o isolamento parcial é inútil. Significa que ele protege contra
um conjunto específico de falhas, e é preciso saber qual.

## Modelo Mental

**Bulkhead limita o dano ao compartimento.** Ele é a proteção que funciona quando as
outras foram mal configuradas.

## Quando Usar

- Múltiplas dependências com perfis de falha diferentes.
- Plataforma que serve vários clientes.
- Operações críticas convivendo com não críticas.
- Recursos limitados e disputados.
- Chamadas externas no mesmo processo que a lógica principal.

## Quando Não Usar

**Compartimentos que enfileiram em vez de rejeitar.**

**Dimensionados sem medir.** Gargalo artificial.

**Granularidade excessiva.** Dezenas de pools que ninguém dimensiona nem monitora.

**Quando o isolamento não é real.** Pools separados no mesmo processo não protegem
contra esgotamento de memória.

**Em aplicação simples** com uma dependência.

## Alternativas

- **[Circuit breaker](circuit-breakers.md)** — para de chamar em vez de isolar.
  Complementares.
- **Timeout agressivo** — reduz o tempo de posse do recurso.
- **Limite de taxa** — controla na entrada. Ver
  [rate limiting](../05-system-design/rate-limiting.md).
- **Processos ou instâncias separados** — isolamento mais forte, custo maior.

## Trade-offs

| Com bulkhead | Recurso compartilhado |
|---|---|
| Falha contida | Propaga |
| Utilização menor | Maior |
| Dimensionamento por compartimento | Um número |
| Rejeição possível com folga em outro | Usa tudo até acabar |

| Isolamento por processo | Por pool |
|---|---|
| Protege memória e CPU | Só o recurso do pool |
| Custo de operação | Configuração |
| Comunicação entre processos | Chamada local |

## Modos de Falha

**Compartimento pequeno demais.** Rejeita com capacidade sobrando em outro.

**Fila de espera pelo recurso.** O isolamento se perde.

**Isolamento aparente.** Compartilham memória ou CPU abaixo.

**Excesso de reserva mal calibrado.** Todos saturam juntos e o total estoura.

**Compartimentos demais.** Ninguém dimensiona, todos ficam errados.

**Consumidores livres entre filas.** A fila cheia domina o consumo.

## Erros Comuns

**Não separar chamadas externas do pool principal.**

**Dimensionar por intuição.**

**Enfileirar em vez de rejeitar.**

**Não isolar por cliente** em plataformas multi-inquilino.

**Assumir isolamento onde há recurso compartilhado.**

**Não monitorar a utilização por compartimento.**

## Exemplo Real

Uma plataforma de gestão financeira servia 900 empresas clientes numa infraestrutura
compartilhada.

Dois incidentes recorrentes tinham a mesma raiz:

**Cliente com integração defeituosa.** Uma empresa com um laço em sua integração
disparava 40 mil requisições por minuto. O pool de conexões da aplicação esgotava, e as
outras 899 empresas ficavam sem serviço.

**Relatório pesado.** Um cliente grande gerava relatórios que ocupavam trabalhadores de
fila por horas. Os relatórios dos demais ficavam na fila atrás.

As correções, em três camadas:

**Pool por dependência.** Chamadas externas — bureaus de crédito, gateways de pagamento
— passaram a ter pools separados, dimensionados pela lei de Little com folga de 60%. O
esgotamento de um deixou de alcançar o principal.

**Cota por cliente.** Cada empresa recebeu limite de requisições simultâneas,
proporcional ao plano contratado. Acima disso, recusa imediata com prazo sugerido. A
empresa com o laço passou a esgotar apenas a própria cota.

**Filas por prioridade e por porte.** Relatórios foram para fila separada, com
trabalhadores dedicados. Clientes grandes ganharam fila própria, para que não
dominassem a compartilhada.

**Isolamento por instância** para os doze maiores clientes, que juntos representavam
45% do volume. Infraestrutura dedicada, dimensionada separadamente.

Dois problemas apareceram durante a implementação:

**Compartimentos mal dimensionados.** A primeira versão dos pools externos foi definida
por intuição — 10 conexões — e virou gargalo: requisições eram recusadas com o sistema
ocioso. A medição da vazão e da latência reais corrigiu.

**Consumidores livres entre filas.** As filas separadas foram criadas, e os
trabalhadores podiam consumir de qualquer uma. A fila de relatórios, sempre cheia,
dominava — reproduzindo o problema original com mais peças. A correção foi dedicar
trabalhadores a cada fila, com proporção mínima garantida.

Nos doze meses seguintes, quatro clientes tiveram integrações defeituosas. Nenhuma
afetou os demais.

Na retrospectiva: o isolamento por cliente foi o de maior impacto, e era o mais
óbvio — a plataforma servia 900 empresas num pool único desde o primeiro dia, e ninguém
tinha questionado.

## Conceitos Relacionados

- [Circuit Breakers](circuit-breakers.md) — a proteção complementar.
- [Tempestades de Retentativa](retry-storms.md).
- [Backpressure](../06-distributed-systems/backpressure.md) — a rejeição.
- [Pontos Quentes](../11-scalability/hotspots.md) — clientes desproporcionais.

## Exercício Prático

Verifique se as chamadas externas do seu sistema usam o mesmo pool de conexões que a
lógica principal.

Se usarem, calcule quantas requisições ficam presas se a dependência mais lenta parar
de responder — e compare com o tamanho do pool.

## Perguntas de Entrevista

- Por que o bulkhead precisa rejeitar em vez de enfileirar?
- Como a lei de Little dimensiona um compartimento?
- Por que pools separados no mesmo processo isolam parcialmente?

## Para Aprofundar

- Nygard, Michael. *Release It!*. 2ª ed. Pragmatic Bookshelf, 2018.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — capítulo 21.
- Fowler, Susan. *Production-Ready Microservices*. O'Reilly, 2016.
