---
id: golden-signals
title: Sinais Dourados
sidebar_position: 10
description: Quatro medidas que cobrem a maior parte dos problemas — e por onde começar quando não se sabe o que instrumentar.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor instrumenta os quatro sinais por serviço e sabe o que cada um
  revela.
prerequisites: [observability]
related: [metrics, alerting, dashboards]
canonical_for: [sinais dourados, taxa de tráfego, saturação de recurso, sinal de erro]
content_version: 1
last_reviewed: 2026-08-28
---

# Sinais Dourados

## Visão Geral

Quando não se sabe o que instrumentar, quatro medidas cobrem a maior parte dos
problemas de um serviço:

```text
latência    quanto tempo leva
tráfego     quanta demanda existe
erros       que proporção falha
saturação   quão perto do limite está
```

Elas não são exaustivas. São o ponto de partida que evita o padrão comum — instrumentar
dezenas de métricas específicas e não ter as básicas quando o incidente chega.

## Problema

A instrumentação típica cresce por acumulação: alguém adiciona uma métrica para
investigar um problema, ela fica, e o painel vai enchendo.

O resultado é um conjunto grande de medidas específicas, com lacunas nas fundamentais.
Durante um incidente, as perguntas são sempre as mesmas — está lento? quanto tráfego?
quantos erros? o que está no limite? — e frequentemente não há resposta direta.

Os quatro sinais existem para garantir que essas perguntas tenham resposta, em todo
serviço, sempre.

## Conceitos Centrais

### Latência: separe sucesso de falha

Medir latência agregando sucessos e erros produz números enganosos nos dois sentidos.

```text
erros rápidos      puxam a média para baixo — o serviço parece melhor do que está
erros por timeout  puxam para cima — escondem que os sucessos estão bem
```

A prática correta: latência de requisições bem-sucedidas e de requisições com erro,
separadas.

E sempre em **percentis**, nunca em média. A média de um serviço com 99% em 50 ms e 1%
em 10 segundos é 149 ms — um número que não descreve a experiência de ninguém. Ver
[latência](../06-distributed-systems/latency.md).

### Tráfego: o denominador de tudo

Requisições por segundo, mensagens processadas por minuto, transações por hora — a
unidade depende do serviço.

Ele importa por três razões:

**Contextualiza os outros sinais.** Cem erros por minuto significa coisas diferentes
com mil ou com um milhão de requisições.

**Detecta anomalias por ausência.** Uma queda súbita de tráfego é frequentemente o
primeiro sinal de que algo quebrou antes do seu serviço.

**Alimenta o dimensionamento.** Ver
[planejamento de capacidade](../11-scalability/scaling-capacity-planning.md).

A segunda é subestimada: monitorar queda de tráfego detecta problemas que nenhum sinal
de erro detecta, porque as requisições simplesmente não chegam.

### Erros: os explícitos e os implícitos

```text
explícito   código de erro retornado
implícito   resposta com código de sucesso e conteúdo errado
             ou latência tão alta que o cliente desistiu
```

Os implícitos são os que causam mais dano e os que menos aparecem. Ver
[fundamentos de confiabilidade](../12-reliability/reliability-basics.md).

Detectá-los exige verificação semântica: validar invariantes, comparar com fonte
alternativa, contar respostas acima do limite de latência como falha.

E a classificação importa: erros de cliente e erros de servidor precisam ser contados
separadamente. Um pico de erros de cliente pode indicar mudança de comportamento de um
integrador; um pico de erros de servidor é problema seu.

### Saturação: o mais difícil e o mais preditivo

Saturação mede quão perto do limite o recurso mais restrito está.

A dificuldade é identificar **qual** recurso:

```text
CPU               fácil de medir, raramente o limitante
memória           mais comum, especialmente com coleta de lixo
conexões          o limitante mais frequente e o menos monitorado
fios de execução  pool esgotado
fila              profundidade crescente
disco             operações por segundo, não só espaço
cota externa      limite de terceiro
```

A terceira linha merece destaque: conexões saturam antes da CPU na maioria dos sistemas.
Ver [escala de banco de dados](../11-scalability/database-scaling.md).

E saturação é o sinal **preditivo**: latência e erros indicam que o problema já está
acontecendo; saturação indica que ele vai acontecer.

### Quatro sinais, por serviço

O erro de aplicação: medir os quatro apenas na borda.

Cada serviço da cadeia precisa dos seus. Sem isso, sabe-se que a requisição está lenta e
não onde ela gasta o tempo — ver
[rastreamento distribuído](distributed-tracing.md).

E cada dependência externa também: latência, tráfego, erros e saturação das chamadas que
você faz para fora. É onde a maior parte dos problemas se origina, e é o que costuma
não ser instrumentado.

### Variações por tipo de componente

Os quatro sinais foram formulados para serviços que atendem requisições. Para outros
componentes, a tradução:

```text
fila            profundidade, idade da mensagem mais antiga, taxa de entrada e saída
processamento   itens por segundo, atraso em relação à origem, taxa de falha
armazenamento   operações, latência, espaço, taxa de erro
lote            duração, fração da janela consumida, registros processados
```

A **idade da mensagem mais antiga** é o equivalente de latência para filas, e é a medida
mais útil delas. Ver
[escala dirigida por fila](../11-scalability/queue-based-scaling.md).

## Modelo Mental

**Quatro perguntas, sempre as mesmas, em todo serviço.** Elas não cobrem tudo, e cobrem
o suficiente para começar a investigar.

## Quando Usar

- Como instrumentação mínima de todo serviço.
- Como ponto de partida quando não se sabe o que medir.
- Como base para [alertas](alerting.md).
- Em cada dependência externa.
- Ao revisar a instrumentação existente, para encontrar lacunas.

## Quando Não Usar

**Como instrumentação completa.** Eles são a base, não o teto.

**Só na borda.**

**Latência agregando sucesso e erro.**

**Latência em média.**

**Saturação medida só por CPU.**

**Sem adaptar** ao tipo de componente.

## Alternativas

- **Método USE** — utilização, saturação e erros, por recurso. Orientado a
  infraestrutura, complementa os sinais dourados, que são orientados a serviço.
- **Método RED** — taxa, erros e duração. Essencialmente os sinais dourados sem
  saturação.
- **[SLI](../12-reliability/sli.md)** — mede a experiência do usuário; os sinais
  dourados medem o serviço. São complementares, não substitutos.

A última distinção importa: um SLI ruim com sinais dourados bons indica que o problema
está fora do serviço — rede, cliente, dependência não instrumentada.

## Trade-offs

| Quatro sinais | Métricas específicas |
|---|---|
| Cobertura uniforme | Profundidade em um ponto |
| Comparável entre serviços | Contexto próprio |
| Não explica a causa | Pode explicar |
| Barato e padronizável | Custo por métrica |

## Modos de Falha

**Latência em média.** Esconde a cauda.

**Erros implícitos não contados.**

**Saturação do recurso errado.** CPU baixa com conexões esgotadas.

**Queda de tráfego não monitorada.**

**Sinais só na borda.** Não localizam o problema.

**Dependências externas sem instrumentação.**

## Erros Comuns

**Não separar latência de sucesso e de erro.**

**Usar média.**

**Medir CPU como saturação.**

**Não instrumentar chamadas de saída.**

**Não adaptar para filas e processamento em lote.**

**Não alertar sobre queda de tráfego.**

## Exemplo Real

Uma plataforma de pagamentos tinha 340 métricas instrumentadas e um painel com 60
gráficos.

Durante um incidente de latência, a equipe levou 50 minutos para localizar a origem —
apesar de toda a instrumentação.

A revisão encontrou o problema: as 340 métricas eram específicas, acumuladas ao longo
de anos, e as básicas estavam incompletas.

```text
latência          agregada, em média, só na borda
tráfego           medido, sem alerta de queda
erros             só os explícitos, sem separar cliente e servidor
saturação         apenas CPU e memória
dependências      nenhuma instrumentação de saída
```

A reformulação:

**Quatro sinais em cada um dos 14 serviços**, padronizados: latência em percentis 50,
95 e 99, separada por resultado; tráfego; erros por classe; saturação do recurso
limitante de cada um.

**Saturação identificada por serviço.** A análise mostrou que em nove dos catorze o
limitante era o pool de conexões, não CPU — e nenhum tinha essa métrica.

**Instrumentação de saída** para as 23 dependências externas. Isso revelou que um
provedor de antifraude respondia em 2,8 segundos no percentil 95, contra os 400 ms
contratados. O problema existia havia meses.

**Alerta de queda de tráfego**, que no primeiro mês detectou duas quebras de integração
antes de qualquer cliente reportar.

**Latência de fila** substituída por idade da mensagem mais antiga.

No incidente seguinte, de perfil semelhante, a localização levou 4 minutos.

E as 340 métricas antigas foram auditadas: 190 não tinham sido consultadas em doze
meses e foram removidas, reduzindo o custo de telemetria em cerca de um terço.

O que a equipe registra: eles tinham muito mais instrumentação do que precisavam, e
faltavam as quatro medidas que respondem às primeiras perguntas de qualquer incidente.

## Conceitos Relacionados

- [Métricas](metrics.md) — como implementá-los.
- [Alertas](alerting.md) — o que fazer com eles.
- [Painéis](dashboards.md).
- [SLI](../12-reliability/sli.md) — a medida da experiência.

## Exercício Prático

Escolha um serviço do seu sistema e verifique se os quatro sinais existem — com latência
em percentis, separada por resultado, e saturação do recurso que de fato limita.

A lacuna mais comum é a última: a maioria mede CPU, e o limitante é outra coisa.

## Perguntas de Entrevista

- Por que latência deve separar sucesso de erro?
- Por que saturação é o sinal preditivo?
- Por que monitorar queda de tráfego?

## Para Aprofundar

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — capítulo 6.
- Gregg, Brendan. *The USE Method*, 2012.
- Wilkie, Tom. *The RED Method*, 2018.
