---
id: telemetry
title: Telemetria
sidebar_position: 6
description: Instrumentar, coletar e pagar por isso — o custo que cresce mais rápido que o sistema.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor projeta a pilha de telemetria com custo controlado e sem
  acoplamento ao fornecedor.
prerequisites: [observability]
related: [logs, metrics, distributed-tracing]
canonical_for: [telemetria, instrumentação, coletor de telemetria, custo de observabilidade]
content_version: 1
last_reviewed: 2026-08-28
---

# Telemetria

## Visão Geral

Telemetria é o conjunto do que o sistema emite sobre si mesmo — [logs](/13-observability/logs.md),
[métricas](/13-observability/metrics.md), [traces](/13-observability/traces.md) — e a infraestrutura que coleta, transporta,
armazena e consulta esses dados.

Ela é tratada como detalhe de ferramenta e é decisão de arquitetura, por duas razões:

**O custo é material.** Em muitos sistemas, telemetria é um dos maiores itens da conta de
infraestrutura, e cresce mais rápido que o tráfego.

**O acoplamento é real.** Instrumentação embutida no código com a biblioteca de um
fornecedor torna a troca uma reescrita.

## Problema

A telemetria cresce por acumulação, sem decisão:

Cada time instrumenta o que precisa, com a biblioteca que conhece. O volume aumenta com
o tráfego e com cada nova métrica. A conta chega no fim do mês, e a reação é cortar
retenção — que é o corte que mais dói na investigação.

E, quando alguém propõe trocar de ferramenta, descobre-se que a instrumentação está
espalhada por centenas de arquivos, acoplada a uma API específica.

## Conceitos Centrais

### Instrumentação e coleta são camadas separadas

A separação que resolve o acoplamento:

```text
instrumentação   o código emite dados em formato padrão
coleta           um agente ou coletor recebe, processa e envia
destino          onde é armazenado e consultado
```

Com instrumentação padronizada, trocar o destino é configuração no coletor — não
alteração de código.

O padrão aberto de telemetria existe exatamente para isso, e adotá-lo é a decisão que
mais preserva liberdade nesta área, a custo próximo de zero no início do projeto.

Times que instrumentam diretamente com a biblioteca do fornecedor pagam essa decisão
depois, quando o custo ou a insatisfação motivarem a troca. Ver
[dependência de fornecedor](/09-cloud-architecture/vendor-lock-in.md).

### O coletor é onde as decisões acontecem

Um coletor entre a aplicação e o destino permite:

```text
filtrar        descartar o que não é usado
amostrar       inclusive por cauda. Ver rastreamento distribuído
enriquecer     adicionar ambiente, região, versão
transformar    reduzir cardinalidade, remover atributos caros
redirecionar   destinos diferentes por tipo de sinal
proteger       remover dado sensível antes de sair
```

A última é frequentemente a razão que justifica o coletor sozinha: uma camada única onde
a filtragem de dado sensível é garantida, em vez de depender de cada serviço.

E ele desacopla a disponibilidade: se o destino fica indisponível, o coletor armazena
temporariamente em vez de a aplicação falhar ou bloquear.

### A telemetria não pode derrubar a aplicação

Regra que parece óbvia e é violada com frequência:

```text
emissão assíncrona      nunca no caminho crítico da requisição
descarte sob pressão    se o buffer encher, descarta em vez de bloquear
falha silenciosa        indisponibilidade do destino não afeta a aplicação
limite de recursos      a instrumentação não consome memória sem teto
```

Já houve incidentes causados pelo próprio sistema de observabilidade: coleta síncrona
bloqueando requisições, buffer crescendo sem limite até esgotar a memória, agente
consumindo CPU do serviço.

E há uma consequência: **o descarte precisa ser monitorado**. Um coletor descartando
silenciosamente produz lacunas que passam por ausência de eventos.

### O custo tem alavancas conhecidas

Em ordem de retorno:

```text
evento canônico          reduz volume de log por ordem de grandeza
amostragem por resultado preserva erros e lentidão, descarta o resto
cardinalidade            o multiplicador de custo de métricas
retenção escalonada      quente por dias, frio por meses
remover o não usado      métricas e campos que ninguém consulta
compressão e agregação   na borda, antes de transportar
```

A primeira e a segunda estão em [logs](/13-observability/logs.md), e são as de maior impacto.

A quinta merece disciplina: uma auditoria do que é efetivamente consultado costuma
permitir remover uma fração grande do que é coletado.

### Custo por unidade de negócio

Como em [arquitetura de custo](/09-cloud-architecture/cost-architecture.md), o número
absoluto diz pouco.

```text
custo de telemetria por requisição
custo de telemetria como fração da conta de infraestrutura
```

A segunda razão é a mais reveladora. Quando telemetria passa de uma fração razoável da
infraestrutura — algo entre 5% e 15% na maioria dos casos —, vale investigar.

E a tendência importa mais que o valor: telemetria crescendo mais rápido que o tráfego
indica instrumentação acumulando, não sistema crescendo.

### Não instrumente para preencher painéis

O critério que evita acumulação: **qual pergunta este dado responde?**

Se a resposta for "não sei, pode ser útil", provavelmente não será — e vai custar todo
mês.

A instrumentação que se paga vem de: perguntas que já foram feitas em incidentes,
[sinais dourados](/13-observability/golden-signals.md), [SLI](/12-reliability/sli.md), e métricas de
negócio.

## Modelo Mental

**Telemetria é infraestrutura com custo crescente.** Instrumente em formato padrão,
decida no coletor, e revise o que é coletado.

## Quando Usar

- Sempre — a questão é quanto e como.
- Prioridade alta em sistemas distribuídos.
- Antes de precisar: instrumentar durante o incidente não é opção.

## Quando Não Usar

**Instrumentação acoplada à biblioteca do fornecedor.**

**Emissão síncrona no caminho crítico.**

**Sem limite de recursos** para buffers.

**Sem monitorar descarte.**

**Coletando o que ninguém consulta.**

**Sem filtragem de dado sensível** antes de sair.

## Alternativas

- **Coletor gerenciado do fornecedor** — menos operação, mais acoplamento.
- **Armazenamento próprio** — mais barato em volume alto, mais operação.
- **Destinos diferentes por sinal** — métricas num sistema, logs em outro, escolhendo o
  melhor custo para cada perfil.
- **Perfilamento contínuo** — complementa os três sinais para o tempo dentro do
  processo.

## Trade-offs

| Padrão aberto | Biblioteca do fornecedor |
|---|---|
| Troca de destino sem código | Reescrita |
| Recursos avançados podem faltar | Integração completa |
| Uma instrumentação para tudo | Uma por fornecedor |

| Com coletor | Direto ao destino |
|---|---|
| Decisões centralizadas | Cada serviço decide |
| Componente a operar | Menos peças |
| Desacopla disponibilidade | Aplicação depende do destino |

## Modos de Falha

**Telemetria derrubando a aplicação.** Coleta síncrona ou buffer sem limite.

**Custo crescendo mais rápido que o tráfego.**

**Descarte silencioso.** Lacunas indistinguíveis de ausência de eventos.

**Dado sensível no destino.**

**Acoplamento impedindo a troca.**

**Coletor como ponto único.** Ele cai, e a visibilidade some no pior momento.

**Retenção cortada por custo**, removendo o que faz falta.

## Erros Comuns

**Instrumentar com a biblioteca do fornecedor.**

**Emitir de forma síncrona.**

**Não monitorar o próprio sistema de telemetria.**

**Não auditar o que é consultado.**

**Cortar retenção como primeira medida de custo.**

**Não ter coletor**, deixando cada serviço enviar direto.

## Exemplo Real

Uma plataforma de comércio teve a conta de observabilidade crescer 4 vezes em um ano,
enquanto o tráfego crescia 60%.

Ela chegou a representar 28% do custo total de infraestrutura.

A primeira reação foi cortar a retenção de logs de 30 para 7 dias. Isso reduziu a conta
em 15% e criou um problema: três investigações nos meses seguintes não puderam ser
concluídas porque os dados já não existiam.

A análise estruturada encontrou a distribuição:

```text
logs         62% da conta — volume de linhas
métricas     24% — cardinalidade
traces       11%
outros        3%
```

E as causas:

**Logs dispersos.** 22 linhas por requisição, majoritariamente de progresso.

**Cardinalidade.** Sete métricas com identificadores como rótulo, criando milhões de
séries.

**Coleta sem filtro.** Cada serviço enviava direto ao destino, sem nada removendo o que
não era usado.

**Sem auditoria.** Ninguém sabia o que era efetivamente consultado.

As correções:

**Evento canônico** substituindo os logs dispersos. Volume de logs reduzido em 90%.

**Coletor introduzido**, com filtragem, amostragem por cauda para traces, e remoção de
atributos de alta cardinalidade.

**Auditoria de uso.** De 410 métricas, 240 não tinham sido consultadas nem alertadas em
doze meses. Removidas.

**Retenção restaurada** para 30 dias — e ampliada para 90 em armazenamento frio, que
custa uma fração.

**Filtragem de dado sensível no coletor**, que a auditoria revelou não existir: tokens
e documentos apareciam em registros de erro.

**Métrica de custo por requisição**, acompanhada mensalmente.

Resultado: a conta caiu 78% em relação ao pico, com **mais** retenção e mais capacidade
de investigação.

O que a equipe aprendeu: o primeiro corte — reduzir retenção — foi o pior movimento
possível. Ele atacou a dimensão que mais importa para investigação e deixou intactas as
três causas reais.

## Conceitos Relacionados

- [Logs](/13-observability/logs.md), [Métricas](/13-observability/metrics.md) e [Traces](/13-observability/traces.md) — o que é emitido.
- [Rastreamento Distribuído](/13-observability/distributed-tracing.md) — a amostragem.
- [Arquitetura de Custo](/09-cloud-architecture/cost-architecture.md).
- [Dependência de Fornecedor](/09-cloud-architecture/vendor-lock-in.md).

## Exercício Prático

Descubra quanto a telemetria representa da sua conta de infraestrutura, e a tendência
dos últimos doze meses.

Depois audite: quantas das suas métricas foram consultadas ou usadas em alerta no último
ano?

## Perguntas de Entrevista

- Por que separar instrumentação de coleta?
- Que decisões o coletor permite que a aplicação não permite?
- Por que cortar retenção é a pior primeira medida de custo?

## Para Aprofundar

- OpenTelemetry — especificação e coletor.
- Majors, Charity et al. *Observability Engineering*. O'Reilly, 2022.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
