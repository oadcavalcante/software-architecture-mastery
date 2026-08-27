---
id: metrics
title: Métricas
sidebar_position: 2
description: Números agregados com custo constante — e a cardinalidade, que é o que os torna caros.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escolhe o tipo de métrica adequado e controla cardinalidade
  antes que ela exploda o custo.
prerequisites: [observability]
related: [logs, golden-signals, dashboards]
canonical_for: [métrica, contador, medidor, histograma, cardinalidade de métrica]
content_version: 1
last_reviewed: 2026-08-28
---

# Métricas

## Visão Geral

Métricas são números agregados ao longo do tempo: quantas requisições, qual latência,
quanta memória.

A propriedade que as distingue de [logs](logs.md): o custo é **constante em relação ao
tráfego**. Um contador que registra um milhão de requisições ocupa o mesmo espaço que um
que registra dez.

Isso as torna a escolha certa para tendência, alerta e painel. E cria a armadilha
específica delas: a **cardinalidade**, que transforma esse custo constante em
explosivo.

## Problema

Métricas são baratas até que não são.

Cada combinação distinta de rótulos cria uma série temporal separada. Adicionar um
rótulo com muitos valores possíveis multiplica o número de séries:

```text
requisicoes{rota, metodo, status}          → 50 × 4 × 6 = 1.200 séries
+ rótulo cliente_id (10.000 clientes)      → 12.000.000 séries
```

O segundo caso derruba a maioria dos sistemas de métricas, ou custa uma fortuna.

E o erro é fácil de cometer: adicionar o identificador do usuário como rótulo parece
útil, e é exatamente o que não se deve fazer.

## Conceitos Centrais

### Os tipos e o que cada um responde

```text
contador     só cresce — requisições, erros, bytes
             pergunta: quantos, e a que taxa
medidor      sobe e desce — memória, conexões ativas, profundidade de fila
             pergunta: quanto agora
histograma   distribuição — latência, tamanho de resposta
             pergunta: qual a distribuição, quais os percentis
```

O erro típico é usar medidor para o que deveria ser contador. Um medidor amostrado a
cada 15 segundos perde os picos entre as amostras; um contador não perde nada, porque
registra tudo e a taxa é derivada.

E histograma para latência, nunca medidor: a latência de uma requisição individual não
tem significado agregado, a distribuição tem.

### Percentis não somam

Uma propriedade que causa erros de interpretação frequentes.

```text
serviço A: p99 = 100 ms
serviço B: p99 = 100 ms
A + B em sequência: p99 ≠ 200 ms
```

Percentis de fontes diferentes não podem ser somados nem promediados. A média dos p99
de dez instâncias **não é** o p99 do serviço.

Isso exige que os histogramas sejam agregados corretamente — somando os intervalos, não
os percentis calculados. Sistemas que armazenam apenas o percentil calculado por
instância não permitem agregação correta.

Ver [latência](../06-distributed-systems/latency.md).

### Cardinalidade é o custo

A regra prática:

```text
bom rótulo    poucos valores, estáveis, conhecidos
              rota, método, status, região, versão
mau rótulo    muitos valores, ilimitados, imprevisíveis
              identificador de usuário, de pedido, de sessão, URL completa
```

O caso da URL completa é o mais insidioso: `/pedidos/4471` como rótulo cria uma série
por pedido. A rota precisa ser o padrão — `/pedidos/{id}` — não o valor.

E há um efeito de composição: dois rótulos de cardinalidade média multiplicam. Cem
valores em um e cem no outro produzem dez mil séries.

Quando a pergunta genuinamente exige alta cardinalidade — "quais clientes específicos
estão sofrendo?" —, a resposta são [logs](logs.md) ou [traces](traces.md), não
métricas.

### Agregação perde informação, irreversivelmente

Uma métrica é agregada no momento da coleta. Depois disso, não há como recuperar o
detalhe.

```text
métrica   "a latência p99 foi 2s às 14h" → não diz quais requisições
log       permite encontrar exatamente quais
```

Isso define a divisão de trabalho: métricas para saber **que** algo está errado e
quando; logs e traces para saber **o quê** e **por quê**.

Um sistema com métricas excelentes e sem logs detecta problemas rapidamente e não
consegue investigá-los.

### Métricas de negócio importam tanto quanto as técnicas

Pedidos por minuto, contratações por hora, valor transacionado.

Elas detectam o que as métricas técnicas não detectam: um sistema tecnicamente saudável
que parou de fazer o que deveria — porque uma integração quebrou, uma regra ficou
errada, ou um botão sumiu da interface.

E são as que comunicam com o negócio. Um alerta de "pedidos caíram 40% em relação ao
esperado para este horário" é acionável e compreensível por todos.

Ver [sinais dourados](golden-signals.md) e [SLI](../12-reliability/sli.md).

### Métricas envelhecem

Uma métrica criada para investigar um problema específico permanece depois que o
problema foi resolvido.

Elas acumulam, custam, e enchem painéis. A revisão periódica — quais métricas não são
consultadas nem alertadas há doze meses — costuma permitir remover uma fração
significativa.

## Modelo Mental

**Métricas dizem que algo está errado; logs e traces dizem o quê.** A cardinalidade é o
que separa as duas.

## Quando Usar

- Tendência ao longo do tempo.
- [Alertas](alerting.md).
- [Painéis](dashboards.md).
- [SLI](../12-reliability/sli.md).
- Dimensionamento e planejamento de capacidade.
- Métricas de negócio.

## Quando Não Usar

**Com rótulos de alta cardinalidade.**

**Para investigar casos individuais.**

**Medidor para o que é contador.**

**Média em vez de percentil**, para latência.

**Agregando percentis de fontes diferentes.**

**Sem revisar** as que deixaram de ser usadas.

## Alternativas

- **[Logs](logs.md)** — para contexto individual e cardinalidade alta.
- **[Traces](traces.md)** — para o caminho e a decomposição do tempo.
- **Eventos agregáveis** — armazenar eventos ricos e agregar na consulta, em vez de
  agregar na coleta. Custa mais armazenamento e preserva a capacidade de fazer
  perguntas novas.
- **Exemplares** — métricas que carregam ponteiros para traces representativos,
  ligando o agregado ao individual.

A última merece nota: ela resolve parcialmente a perda de informação da agregação, e é
subutilizada.

## Trade-offs

| Métricas | Logs |
|---|---|
| Custo constante | Cresce com o tráfego |
| Consulta rápida | Mais lenta |
| Só o instrumentado | Perguntas novas |
| Cardinalidade limitada | Alta possível |
| Detecta | Explica |

| Contador | Medidor |
|---|---|
| Não perde picos | Perde entre amostras |
| Taxa derivada | Valor instantâneo |

## Modos de Falha

**Explosão de cardinalidade.** O sistema de métricas cai ou o custo dispara.

**Percentis agregados incorretamente.**

**Medidor perdendo picos.**

**Métrica sem contexto.** Sabe-se que subiu, não se sabe o quê.

**Métricas acumuladas.** Centenas que ninguém consulta.

**Coleta com atraso.** A métrica chega tarde demais para alertar.

**Reinício zerando contador** sem que o sistema trate — produz taxa negativa.

## Erros Comuns

**Usar identificador como rótulo.**

**URL completa em vez de padrão de rota.**

**Média para latência.**

**Não instrumentar métricas de negócio.**

**Não revisar métricas obsoletas.**

**Tentar investigar caso individual por métrica.**

## Exemplo Real

Uma plataforma de assinaturas teve o sistema de métricas indisponível por 6 horas, no
meio de um incidente.

A causa: uma métrica adicionada duas semanas antes incluía o identificador do plano do
cliente como rótulo. Os planos eram poucos — cerca de vinte. Mas o campo usado era o
identificador da **assinatura**, não do plano, por um erro de nomenclatura no código.

Com 340 mil assinaturas ativas, a métrica gerou 340 mil séries temporais. O sistema
degradou por duas semanas e colapsou durante um pico.

O incidente que estava sendo investigado quando as métricas caíram durou mais três horas
por falta de visibilidade.

As correções:

**Limite de cardinalidade** por métrica, com rejeição e alerta ao ser excedido. Uma
métrica mal instrumentada passou a falhar sozinha, sem derrubar o resto.

**Revisão de rótulos** em todas as métricas. Foram encontrados mais três casos de alta
cardinalidade — URL completa em vez de rota, em dois serviços, e identificador de
sessão em um.

**Divisão de trabalho explícita**, documentada: métricas para agregado, logs para
individual. A métrica que motivou o problema foi substituída por um campo no evento
canônico de log.

**Exemplares** ligando as métricas de latência a traces representativos — o que resolveu
a necessidade original que levou alguém a adicionar o identificador como rótulo.

**Revisão semestral** de métricas não consultadas. A primeira removeu 40% delas.

O que a equipe registra: o erro que causou tudo foi um nome de variável trocado. O que
o transformou em incidente de 6 horas foi não haver limite de cardinalidade — uma
proteção que o sistema de métricas oferecia e ninguém tinha configurado.

## Conceitos Relacionados

- [Logs](logs.md) — para o individual.
- [Traces](traces.md) — para o caminho.
- [Sinais Dourados](golden-signals.md) — o que instrumentar.
- [Alertas](alerting.md).

## Exercício Prático

Liste os rótulos das suas métricas mais usadas e conte os valores distintos possíveis de
cada um.

Multiplique. Se o resultado passar de algumas dezenas de milhares, você tem um problema
de cardinalidade em formação.

## Perguntas de Entrevista

- Por que percentis não podem ser promediados?
- O que torna um rótulo bom ou ruim?
- Por que métricas detectam e não explicam?

## Para Aprofundar

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — capítulo 10.
- Majors, Charity et al. *Observability Engineering*. O'Reilly, 2022.
- OpenTelemetry — especificação de métricas.
