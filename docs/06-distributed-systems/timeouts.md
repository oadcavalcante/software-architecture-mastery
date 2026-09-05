---
id: timeouts
title: Timeouts
sidebar_position: 5
description: A única ferramenta para lidar com o silêncio — e a que mais é configurada sem critério.
doc_type: concept
level: 4
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor calibra timeouts a partir da distribuição real de latência
  e propaga o prazo restante numa cadeia.
prerequisites: [latency]
related: [retries, latency, circuit-breakers]
canonical_for: [timeout, orçamento de tempo]
content_version: 3
last_reviewed: 2026-08-27
---

# Timeouts

## Visão Geral

Um timeout é a decisão de desistir de esperar.

É a **única** ferramenta disponível para lidar com o silêncio de uma chamada de
rede — e como o silêncio é indistinguível entre sucesso lento, falha e partição,
o timeout não resolve a ambiguidade. Ele apenas decide quando parar de esperar.

## Problema

Sem timeout, uma chamada pode esperar indefinidamente. As consequências se
encadeiam:

A thread ou a conexão fica ocupada. Sob volume, o pool esgota. Requisições novas
esperam por recurso. O serviço fica lento para quem o chama, e a lentidão sobe
pela cadeia.

Um serviço lento sem timeout derruba todos os que dependem dele. É a
cascata clássica, e a ausência de timeout é a causa mais comum.

Mas o timeout mal calibrado tem seus próprios problemas — e são menos óbvios.

**Curto demais:** corta chamadas que teriam sucesso. Se o p99 é 800 ms e o timeout
é 500 ms, 1% ou mais das chamadas legítimas falha por decisão sua.

**Longo demais:** não protege. Um timeout de 30 segundos num sistema com p99 de
800 ms só dispara quando algo está catastroficamente errado — e até lá o recurso
ficou ocupado.

## Conceitos Centrais

### Calibrar pela distribuição, não por número redondo

Timeouts costumam ser 1, 5 ou 30 segundos — números escolhidos por serem redondos.

A calibração correta parte da medição: **algo acima do p99, com margem**. Se o p99
é 800 ms, um timeout de 2 segundos corta o que é genuinamente anormal e preserva
o que é apenas lento.

O critério: o timeout deve disparar quando algo está errado, não quando o sistema
está no seu pior caso normal.

E precisa ser reavaliado — o p99 muda com o volume e com mudanças no sistema.

### O orçamento numa cadeia

Numa cadeia de chamadas, os timeouts precisam ser coerentes. O princípio: **cada
nível tem menos tempo que quem o chamou.**

```text
usuário          3 000 ms
  gateway        2 800 ms
    serviço A    2 500 ms
      serviço B  1 500 ms
        banco      800 ms
```

O erro comum é o inverso: um serviço interno com timeout de 30 segundos chamado
por um gateway com 5. O chamador desiste aos 5 e o serviço continua trabalhando
por mais 25 — consumindo recurso para produzir uma resposta que ninguém receberá.

Em volume, é capacidade gasta em trabalho descartado, e isso não aparece nas
métricas de erro do chamador.

### Propagar o prazo restante

A solução robusta é o chamador informar **quanto tempo ainda tem**, e quem recebe
ajustar o próprio limite:

```text
gateway → serviço A:  "você tem 2 500 ms"
serviço A → serviço B: "você tem 1 800 ms"  (já gastei 700)
```

Alguns protocolos suportam nativamente. Nos demais, um cabeçalho resolve.

Sem propagação, resta calibrar à mão — o que funciona até alguém alterar um
timeout sem olhar a cadeia inteira.

### Timeout não cancela o trabalho

Detalhe frequentemente ignorado: desistir de esperar **não interrompe** o
processamento do outro lado. O servidor continua trabalhando, continua consumindo
recurso, e possivelmente conclui a operação.

É por isso que timeout mais retentativa sem [idempotência](/06-distributed-systems/idempotency.md) produz
duplicação: a primeira execução completou, o chamador não soube, e repetiu.

Cancelamento real exige que o protocolo o suporte e que o servidor o respeite —
ambos raros.

### Tipos de timeout

Um "timeout" costuma ser vários, e configurar só um deixa lacunas:

**De conexão** — estabelecer a conexão. Curto: se o destino está acessível, conecta
rápido.

**De leitura ou de resposta** — esperar os dados. É o que a maioria configura.

**Total da requisição** — o tempo máximo, incluindo retentativas e redirecionamentos.

Configurar apenas o de leitura deixa o de conexão no padrão da biblioteca, que
frequentemente é longo ou infinito.

## Modelo Mental

**Timeout é a decisão de que o silêncio já durou demais.** Ele não diz o que
aconteceu — apenas que você para de esperar.

## Quando Usar

- Toda chamada de rede, sem exceção.
- Toda aquisição de recurso — conexão de pool, lock.
- Todo trabalho em background, para não ocupar um trabalhador indefinidamente.

## Quando Não Usar

**Não há chamada de rede que dispense timeout.** O que varia é o valor.

**Timeout uniforme para operações de custo diferente.** Uma consulta simples e um
relatório não merecem o mesmo limite.

**Confiar no padrão da biblioteca.** Vários clientes HTTP têm timeout infinito por
padrão — o que significa que não configurar é escolher esperar para sempre.

**Timeout como único mecanismo.** Ele evita a espera; não evita a sobrecarga do
destino. Ver [circuit breakers](/12-reliability/circuit-breakers.md).

## Alternativas

Timeout não tem alternativa; ele tem complementos:

- **[Circuit breaker](/12-reliability/circuit-breakers.md)** — parar de chamar um destino que
  está falhando, em vez de esperar e desistir repetidamente.
- **Prazo propagado** — a forma robusta.
- **Requisição de reserva** — enviar a duas réplicas e usar a primeira resposta.
- **Degradação** — responder sem o dado que não chegou.

## Trade-offs

| Timeout curto | Timeout longo |
|---|---|
| Libera recurso rápido | Recurso ocupado |
| Falha rápido e visível | Demora a detectar |
| Corta chamadas legítimas da cauda | Tolera a cauda |
| Mais retentativas | Menos |
| Protege o chamador | Protege a taxa de sucesso |

A calibração é uma escolha entre disponibilidade do chamador e taxa de sucesso das
chamadas — e ela depende de qual custa mais no caso concreto.

## Modos de Falha

**Sem timeout.** Espera indefinida, pool esgotado, cascata.

**Timeout maior que o do chamador.** Trabalho descartado.

**Timeout menor que o p99.** Falhas induzidas por configuração.

**Só o de leitura configurado.** O de conexão fica no padrão.

**Timeout mais retentativa sem idempotência.** Duplicação.

**Timeout que não é reavaliado.** Calibrado para um volume que mudou.

## Erros Comuns

**Escolher número redondo.** Trinta segundos não vem de medição nenhuma; vem de ser um número confortável. O prazo precisa sair da distribuição de latência real da chamada.

**Não medir o p99 antes de calibrar.** Um prazo abaixo da cauda normal transforma chamadas que teriam sucesso em erro, e o sistema passa a falhar sozinho sob carga que ele suportaria.

**Não propagar o prazo.** Se o cliente já desistiu, todo trabalho a jusante é desperdício — e é desperdício justamente durante a sobrecarga, quando a capacidade é escassa.

**Assumir que o timeout cancela o trabalho do outro lado.** Ele encerra a espera, não a execução. O servidor continua processando e pode concluir o efeito que o cliente considera fracassado.

**Configurar um só tipo.** Conexão, leitura e prazo total falham por motivos diferentes. Um prazo total generoso sem prazo de conexão deixa a chamada presa tentando alcançar uma máquina que não existe mais.

## Exemplo Real

Um serviço de consulta de crédito ficou indisponível por 40 minutos, e a causa não
foi o serviço.

O bureau de crédito externo teve degradação: o p99 subiu de 400 ms para 25
segundos. Não caiu — ficou lento.

O cliente HTTP do serviço não tinha timeout de leitura configurado. A biblioteca
usava infinito por padrão.

As requisições ficaram esperando. O pool de 50 conexões esgotou em cerca de dois
minutos. A partir daí, toda requisição ao serviço — inclusive as que não
consultavam o bureau — esperava por uma conexão livre.

Um serviço externo degradado derrubou completamente um serviço interno que
dependia dele em apenas 30% das operações.

As correções, em ordem de efeito:

**Timeout de 3 segundos**, calibrado a partir do p99 medido de 400 ms com folga
generosa. Isso sozinho teria contido o incidente: as chamadas ao bureau
falhariam, e os outros 70% das requisições continuariam funcionando.

**Circuit breaker.** Após uma taxa de falha alta, para de chamar o bureau por um
período e falha imediatamente — sem nem gastar os 3 segundos.

**Pool separado** para chamadas ao bureau. Mesmo que ele esgote, o pool das outras
operações permanece.

**Degradação.** A consulta passou a devolver resposta parcial, marcando o dado do
bureau como indisponível, em vez de falhar inteira.

A última foi a que mudou a conversa com o negócio: uma consulta sem o dado do
bureau ainda tem valor para o operador decidir, e ninguém tinha perguntado isso
antes.

## Conceitos Relacionados

- [Latência](/06-distributed-systems/latency.md) — a distribuição que calibra o timeout.
- [Retries](/06-distributed-systems/retries.md) — o que vem depois de desistir.
- [Idempotência](/06-distributed-systems/idempotency.md) — o que torna a retentativa segura.
- [Circuit Breakers](/12-reliability/circuit-breakers.md) — o complemento.

## Exercício Prático

Liste as chamadas externas do seu sistema e, para cada uma, verifique: existe
timeout configurado? Qual o valor? Como ele se compara ao p99 medido?

Depois verifique os padrões da sua biblioteca HTTP. Vários têm timeout infinito, e
não configurar é escolher esperar para sempre.

## Perguntas de Entrevista

- Como calibrar um timeout?
- Por que timeouts precisam decrescer numa cadeia?
- Por que timeout não cancela o trabalho do outro lado?

## Para Aprofundar

- Nygard, Michael. *Release It!* 2ª ed., 2018 — o capítulo sobre padrões de
  estabilidade.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
