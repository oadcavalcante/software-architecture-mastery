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
content_version: 2
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

Ver [circuit breakers](/12-reliability/circuit-breakers.md) para a matemática. O ponto do bulkhead é
que ele resolve o mesmo problema por outro caminho — e sem depender de configuração
correta de limiares.

O mesmo vale entre clientes: um cliente que dispara volume anormal consome a capacidade
de todos os outros.

## Conceitos Centrais

### As dimensões de isolamento

São duas escolhas independentes, e confundi-las é o erro de leitura mais comum aqui.
A primeira é **por qual eixo** compartimentar:

```text
por dependência   um compartimento por serviço chamado
por cliente       um por inquilino, para que um não afete os outros
por criticidade   caminho de pagamento separado do de navegação, leitura de escrita
```

A segunda é **com que mecanismo**, e aqui sim há uma escala de força:

```text
pool separado       configuração; isola conexões e fios, não memória nem CPU
processo separado   isola memória e CPU, não disco nem rede
máquina separada    isola o que nenhuma configuração errada anula
```

Os dois eixos se combinam: dá para separar por cliente com pools, ou por dependência
com máquinas. Isolar por cliente não é mais forte que isolar por dependência — são
perguntas diferentes. O que cresce em força é a coluna da direita, e ela custa na mesma
ordem.

A escolha depende do que se protege e do custo aceitável.

### Dimensionar o compartimento

Um pool pequeno demais vira gargalo artificial; grande demais não isola nada.

O ponto de partida vem da lei de Little:

```text
requisições simultâneas = vazão × latência
  100 req/s × 0,15 s = 15 conexões necessárias
  → pool de 25 dá folga sem permitir monopolizar
```

Ver [desempenho versus escalabilidade](/11-scalability/performance-vs-scalability.md).

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
resolve [pontos quentes](/11-scalability/hotspots.md).

### Fila também precisa de compartimento

Uma fila única processa em ordem de chegada. Um cliente que publica milhões de
mensagens atrasa todos os outros.

Filas separadas por cliente ou por prioridade, com capacidade de consumo reservada,
resolvem. Ver
[escala dirigida por fila](/11-scalability/queue-based-scaling.md).

O erro comum é criar as filas e deixar todos os consumidores livres para pegar de
qualquer uma — o que reproduz o problema, porque a fila cheia domina o consumo.

### O bulkhead precisa rejeitar, não enfileirar

Quando o compartimento enche, a requisição precisa ser **recusada rapidamente**.

Se ela entra numa fila de espera pelo recurso, o isolamento se perde: a fila cresce, a
memória é consumida, e o dano volta a atravessar.

Rejeitar preserva o compartimento e devolve o controle ao chamador, que pode degradar
ou repetir com [backoff](/06-distributed-systems/backoff.md). Ver
[backpressure](/06-distributed-systems/backpressure.md).

### O isolamento tem que ser real

Compartimentos que compartilham algo mais abaixo não isolam:

```text
pools separados, mesmo processo    → memória e CPU compartilhadas
processos separados, mesma máquina → disco e rede compartilhados
máquinas separadas, mesma zona     → energia e rede compartilhadas
```

Ver [redundância](/12-reliability/redundancy.md) — é o mesmo problema de correlação.

Isso não significa que o isolamento parcial é inútil. Significa que ele protege contra
um conjunto específico de falhas, e é preciso saber qual.

## Modelo Mental

**Dimensionar um compartimento é decidir de antemão quanto se aceita perder.** O número
que se escolhe para o pool não é uma configuração técnica: é a resposta à pergunta
"quantas requisições desta dependência eu aceito falhar para que as outras sobrevivam?".
Quem dimensiona por intuição está respondendo essa pergunta sem saber que a fez.

## Quando Usar

- Múltiplas dependências com perfis de falha diferentes.
- Plataforma que serve vários clientes.
- Operações críticas convivendo com não críticas.
- Recursos limitados e disputados.
- Chamadas externas no mesmo processo que a lógica principal.

## Quando Não Usar

**Quando a dependência é única e o serviço não sobrevive sem ela.** Compartimentar
supõe que há algo a salvar do outro lado da parede. Um serviço que só consulta um banco
e não tem resposta degradada não tem: se o pool esgota, o compartimento protegido não
atende nada de útil. O que esse caso pede é limite de concorrência e resposta rápida de
erro, não isolamento.

**Quando rejeitar custa mais que esperar.** Bulkhead recusa para preservar o
compartimento, e isso pressupõe um chamador que sabe o que fazer com a recusa. Num lote
noturno ou numa ingestão assíncrona sem prazo, a fila é a resposta certa e a recusa
apenas transfere o trabalho para uma retentativa.

**Quando a concorrência já é limitada acima.** Consumidor de fila com paralelismo fixo,
função com concorrência reservada, servidor com pool de trabalhadores dimensionado: o
teto já existe, e um segundo teto dentro dele só acrescenta um número a manter.

**Quando o recurso que satura está abaixo do compartimento.** Pools separados no mesmo
processo não protegem contra esgotamento de memória, e cotas por cliente não protegem
contra um banco compartilhado saturado. Não é que o isolamento parcial seja inútil — ele
protege contra um conjunto de falhas —, é que ele não protege contra **esta**, e adotá-lo
achando que sim é pior que não tê-lo.

## Alternativas

- **[Circuit breaker](/12-reliability/circuit-breakers.md)** — para de chamar em vez de isolar.
  Complementares.
- **Timeout agressivo** — reduz o tempo de posse do recurso.
- **Limite de taxa** — controla na entrada. Ver
  [rate limiting](/05-system-design/rate-limiting.md).
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

**Não separar chamadas externas do pool principal.** Uma dependência de terceiros lenta consome todas as threads compartilhadas, e funcionalidades que não dependem dela param junto.

**Dimensionar por intuição.** O tamanho do compartimento precisa sair da vazão esperada e da latência da chamada. Chutado, ou desperdiça capacidade ou estrangula o fluxo que deveria proteger.

**Enfileirar em vez de rejeitar.** Uma fila ilimitada na frente do compartimento desfaz o isolamento: a espera cresce e o chamador trava do mesmo jeito, só que mais tarde.

**Não isolar por cliente** em plataformas multi-inquilino. Sem compartimento por inquilino, um cliente com uso anômalo consome a capacidade de todos — o problema do vizinho barulhento.

**Assumir isolamento onde há recurso compartilhado.** Compartimentos separados de threads que usam o mesmo pool de conexões do banco não isolam nada: o gargalo real continua comum.

**Não monitorar a utilização por compartimento.** Sem medir quanto de cada compartimento está em uso, não se sabe qual está estrangulando o fluxo e qual está ocioso.

## Exemplo Real

Uma plataforma de gestão financeira servia 900 empresas clientes numa infraestrutura
compartilhada.

Dois incidentes recorrentes tinham a mesma raiz:

**Cliente com integração defeituosa.** Uma empresa com um laço em sua integração
disparava 40 mil requisições por minuto. O pool de conexões da aplicação esgotava, e as
outras 899 empresas ficavam sem serviço.

**Relatório pesado.** Um cliente grande gerava relatórios que ocupavam trabalhadores de
fila por horas. Os relatórios dos demais ficavam na fila atrás.

As correções, em três camadas — mais uma quarta, adotada depois que as três estavam
em produção:

**Pool por dependência.** Chamadas externas — bureaus de crédito, gateways de pagamento
— passaram a ter pools separados, dimensionados pela lei de Little com folga de 60%. O
esgotamento de um deixou de alcançar o principal.

**Cota por cliente.** Cada empresa recebeu limite de requisições simultâneas,
proporcional ao plano contratado. Acima disso, recusa imediata com prazo sugerido. A
empresa com o laço passou a esgotar apenas a própria cota.

**Filas por prioridade e por porte.** Relatórios foram para fila separada, com
trabalhadores dedicados. Clientes grandes ganharam fila própria, para que não
dominassem a compartilhada.

**Isolamento por instância**, seis meses depois, para os doze maiores clientes, que
juntos representavam 45% do volume. Infraestrutura dedicada, dimensionada
separadamente. Foi a única medida que exigiu orçamento próprio, e só se justificou
depois que as três camadas anteriores mostraram onde a concentração estava.

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

- [Circuit Breakers](/12-reliability/circuit-breakers.md) — a proteção complementar.
- [Tempestades de Retentativa](/12-reliability/retry-storms.md).
- [Backpressure](/06-distributed-systems/backpressure.md) — a rejeição.
- [Pontos Quentes](/11-scalability/hotspots.md) — clientes desproporcionais.

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
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — capítulo 21
  ("Handling Overload") para cota por cliente e criticidade, capítulo 22 ("Addressing
  Cascading Failures") para esgotamento de recursos e contenção de propagação.
- Fowler, Susan. *Production-Ready Microservices*. O'Reilly, 2016.
