---
id: rate-limiting
title: Rate Limiting
sidebar_position: 13
description: Limitar o ritmo de requisições — proteção da capacidade antes de ser política comercial.
doc_type: concept
level: 3
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escolhe o algoritmo e a dimensão de limitação a partir do
  que está protegendo, e comunica o limite de forma acionável.
prerequisites: [load-balancing]
related: [queues, load-balancing, security]
canonical_for: [rate limiting, limitação de taxa, throttling]
content_version: 1
last_reviewed: 2026-08-27
---

# Rate Limiting

## Visão Geral

Rate limiting restringe quantas requisições um cliente pode fazer num intervalo.

Antes de ser política comercial — planos com cotas diferentes — ele é **proteção
de capacidade**: sem limite, um cliente sozinho pode consumir todo o recurso e
derrubar o serviço para os demais.

## Problema

Um sistema tem capacidade finita. Sem controle de ritmo, três coisas derrubam ele.

**Cliente mal comportado.** Um laço com erro fazendo mil requisições por segundo.
Raramente é malícia; quase sempre é bug.

**Retentativa em cascata.** Um serviço lento faz clientes repetirem, o que aumenta
a carga, o que o deixa mais lento. Ver
[retry storms](/12-reliability/index.md).

**Uso desigual.** Um cliente grande consome o que estava dimensionado para todos.

Sem limite, o sistema descobre a saturação caindo — e cai para todo mundo, não só
para quem causou.

## Conceitos Centrais

### Os algoritmos

| Algoritmo | Como funciona | Característica |
|---|---|---|
| **Janela fixa** | N requisições por minuto de relógio | Simples; permite rajada no limite entre janelas |
| **Janela deslizante** | N nos últimos 60 segundos | Preciso; mais caro de calcular |
| **Token bucket** | Fichas repostas a taxa constante; cada requisição gasta uma | Permite rajada até o tamanho do balde |
| **Leaky bucket** | Requisições saem a taxa constante | Suaviza; enfileira em vez de rejeitar |

**Token bucket** é o mais usado, e a razão é que ele permite rajada
controlada — o que corresponde ao uso real, em que clientes fazem várias
requisições juntas e depois ficam quietos. Limitar rigidamente por segundo
rejeita comportamento legítimo.

A janela fixa tem um defeito conhecido: com limite de 100 por minuto, um cliente
pode fazer 100 no último segundo de uma janela e 100 no primeiro da seguinte —
200 em dois segundos.

### A dimensão importa mais que o algoritmo

Limitar **por quê** decide se a proteção funciona:

**Por cliente autenticado.** O caso comum. Justo e exige autenticação.

**Por endereço IP.** Funciona para tráfego não autenticado, e pune usuários atrás
do mesmo IP — empresas, operadoras móveis.

**Por endpoint.** Uma busca custa mais que uma leitura simples; limites uniformes
protegem mal.

**Por custo estimado.** Em vez de contar requisições, contar unidades de trabalho.
É o que APIs maduras fazem, e é o que melhor corresponde à capacidade real.

Limitar por requisição quando o custo varia por ordens de grandeza protege pouco:
mil requisições baratas passam e dez caras derrubam.

### Comunicar o limite é parte do contrato

Rejeitar sem informação obriga o cliente a adivinhar. O mínimo:

```text
429 Too Many Requests
Retry-After: 30
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1735689600
```

`Retry-After` é o que evita que o cliente rejeitado repita imediatamente e piore a
situação. Sem ele, o rate limiting pode aumentar a carga em vez de reduzir.

### Limitar não é a única resposta

Rejeitar é uma escolha. As alternativas:

**Enfileirar.** Aceitar e processar depois, quando o trabalho é assíncrono. Ver
[filas](/05-system-design/queues.md).

**Degradar.** Servir uma versão mais barata da resposta.

**Priorizar.** Rejeitar tráfego de baixa prioridade e manter o crítico. É o que
permite um sistema saturado continuar atendendo o que importa.

## Modelo Mental

**Rate limiting é a decisão de quem falha quando não cabe todo mundo.** Sem ele, a
resposta é "todos".

## Quando Usar

- API pública ou exposta a clientes que você não controla.
- Recurso caro que precisa ser protegido.
- Existem planos comerciais com cotas.
- Proteção contra abuso e enumeração.
- Consumo de serviço externo que tem seu próprio limite — limitar do seu lado
  evita ser bloqueado.

## Quando Não Usar

**Entre serviços internos confiáveis, sem necessidade.** Adiciona um ponto de
falha e uma configuração a errar. Ali, [backpressure](/06-distributed-systems/backpressure.md)
e circuit breaker resolvem melhor.

**Como substituto de capacidade.** Se o limite precisa ser tão baixo que
inviabiliza o uso legítimo, o problema é dimensionamento.

**Sem comunicar.** Rejeição opaca faz o cliente repetir.

**Uniformemente, quando o custo varia muito.** Protege mal.

**Como única defesa contra abuso.** Um atacante distribui a origem.

## Alternativas

- **Enfileirar** — quando o trabalho é assíncrono.
- **Priorização e descarte de carga** — rejeitar o menos importante primeiro.
- **Cotas por período longo** — mensal em vez de por segundo, quando o que importa
  é consumo total.
- **[Backpressure](/06-distributed-systems/backpressure.md)** — o mecanismo entre
  componentes internos.

## Trade-offs

| Com limite | Sem limite |
|---|---|
| Um cliente não derruba os demais | Derruba |
| Capacidade previsível | Descoberta na saturação |
| Cliente legítimo pode ser rejeitado | Nunca rejeitado, até o sistema cair |
| Estado compartilhado a manter | Nenhum |
| Mais uma configuração a calibrar | Nenhuma |

## Modos de Falha

**Limite compartilhado mal implementado.** Contagem em memória local com várias
instâncias produz limite efetivo igual a N vezes o configurado.

**Rejeição sem `Retry-After`.** Cliente repete imediatamente.

**Limite baixo demais.** Uso legítimo bloqueado; o suporte vira o gargalo.

**Limite por IP punindo compartilhamento.** Empresa inteira bloqueada por um
usuário.

**O limitador vira gargalo.** O componente que conta requisições satura antes do
serviço.

## Erros Comuns

**Contar em memória local.** Ver
[sem estado vs. com estado](/05-system-design/stateless-vs-stateful.md).

**Não retornar `Retry-After`.**

**Limite uniforme para endpoints de custo muito diferente.**

**Não monitorar quantas rejeições estão acontecendo.** Sem isso, ninguém sabe se o
limite está protegendo ou atrapalhando.

**Aplicar antes da autenticação e depois esquecer de aplicar por cliente.**

## Exemplo Real

Uma API de consulta de crédito tinha limite de 100 requisições por minuto por
cliente, em janela fixa, contado em memória.

Três problemas.

**O limite não era 100.** Com seis instâncias, cada uma contava separado. O limite
efetivo era 600, e o dimensionamento estava feito para 100 por cliente.

**Rajada no limite da janela.** Um cliente descobriu que podia fazer 100 no
segundo 59 e 100 no segundo 61. Duzentas em dois segundos, e o serviço de bureau
de crédito por trás — que tinha seu próprio limite — bloqueava a conta da empresa
inteira por excesso.

**Custo uniforme.** Uma consulta simples e uma consulta com histórico completo
contavam igual, mas a segunda custava 40 vezes mais no bureau. Um cliente fazendo
100 consultas completas por minuto esgotava a cota mensal em dias.

As correções.

A contagem foi para o cache distribuído, e o algoritmo mudou para token bucket —
que permite rajada até o tamanho do balde e depois impõe a taxa média, sem o
defeito da janela fixa.

O limite passou a contar **unidades de custo**, não requisições: consulta simples
custa 1, consulta completa custa 40. O cliente tem um orçamento por minuto e gasta
conforme o que pede.

E as respostas passaram a trazer `Retry-After` e os cabeçalhos de cota, com a
documentação explicando o custo de cada operação.

O que resolveu o problema comercial foi a terceira mudança: os clientes passaram a
enxergar o custo do que pediam, e o uso de consultas completas caiu 60% sem que
ninguém fosse bloqueado — porque eles passaram a pedir a completa só quando
precisavam.

## Conceitos Relacionados

- [Balanceamento de Carga](/05-system-design/load-balancing.md) — frequentemente no mesmo ponto.
- [Filas](/05-system-design/queues.md) — enfileirar em vez de rejeitar.
- [Confiabilidade](/12-reliability/index.md) — retry storms e descarte de carga.
- [Segurança](/10-security/index.md) — proteção contra abuso.

## Exercício Prático

Verifique o rate limiting do seu sistema: a contagem é compartilhada entre
instâncias? A resposta traz `Retry-After`? O custo dos endpoints é comparável?

Depois olhe a métrica de rejeições. Se não existe, você não sabe se o limite está
protegendo alguém ou bloqueando clientes legítimos.

## Perguntas de Entrevista

- Qual o defeito da janela fixa e como token bucket o evita?
- Por que limitar por custo em vez de por requisição?
- Por que `Retry-After` importa?

## Para Aprofundar

- Nygard, Michael. *Release It!* 2ª ed., 2018.
- RFC 6585 — Additional HTTP Status Codes, que define o 429.
