---
id: adr-004-kafka
title: "ADR-004 — Adotar Kafka para Eventos de Domínio"
sidebar_position: 13
description: Exemplo de ADR que supera outro — com o que mudou no contexto registrado explicitamente.
doc_type: adr
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor vê como um ADR sucessor registra o que mudou desde o antecessor, em
  vez de apenas afirmar a nova decisão.
prerequisites: [superseding-decisions]
related: [superseding-decisions, adr-context, adr-consequences]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-29
---

# ADR-004 — Adotar Kafka para Eventos de Domínio

:::note Exemplo didático

Quarto de cinco ADRs do sistema fictício **Verano**. Este supera o
[ADR-002](/18-architecture-decisions/adr-002-async-processing.md), e existe para mostrar a mecânica de
[superação](/18-architecture-decisions/superseding-decisions.md).

:::

| | |
|---|---|
| Status | aceito em 2025-07-31 — **supera o [ADR-002](/18-architecture-decisions/adr-002-async-processing.md)** |
| Sistema | Verano — plataforma de pedidos |
| Autores | equipe de plataforma |
| Decisores | líder técnica, gerente de engenharia |
| Consultados | times de pedidos, entrega, dados e antifraude |

## Contexto

### O que o ADR-002 decidiu, e sob quais premissas

Em maio de 2023, decidimos processar a confirmação de pedido de forma assíncrona usando uma
fila em tabela do PostgreSQL. As premissas registradas eram:

```text
volume                    25 pedidos/s de pico
consumidores dos eventos  1 (o processo de confirmação)
equipe                    12 pessoas, sem experiência em mensageria
prazo                     contratual, agosto de 2024
```

E as condições de reversão registradas eram: vazão sustentada acima de 150 mensagens/s,
mais de três consumidores dos mesmos eventos, acúmulo recorrente acima de 2 minutos, ou
contenção de conexões atribuída à sondagem.

### O que mudou até julho de 2025

```text
volume de pedidos              41/s de pico em 2024, 190/s em 2025
mensagens na fila              ~310/s de pico (cada pedido gera múltiplos eventos)
consumidores dos mesmos
  eventos                      5 — confirmação, entrega, antifraude,
                               analítico, notificação
acúmulo recorrente             observado em 14 dias dos últimos 90,
                               com pico de 9 minutos
contenção de conexões          confirmada: a sondagem consome em média
                               22% do limite de conexões
equipe                         31 engenheiros, 4 com experiência
                               operacional em Kafka
plataforma interna             existe desde 2024, com esteira e
                               monitoração padronizadas
```

**Três das quatro condições de reversão foram atingidas**, e a quarta — número de
consumidores — foi excedida por 2.

Restrições atuais:

- O time de dados precisa reprocessar histórico de eventos, o que a fila em tabela não
  permite: uma tarefa processada é removida.
- O time de antifraude precisa consumir os mesmos eventos sem interferir na confirmação;
  hoje isso é feito por leitura direta da tabela de fila, o que é acoplamento indevido.
- Há orçamento e capacidade operacional que não existiam em 2023.

## Decisão

Vamos adotar **Kafka** como barramento de eventos de domínio da plataforma Verano.

Os eventos de pedido, pagamento e entrega passam a ser publicados em tópicos Kafka. A
gravação continua transacional via **caixa de saída** no PostgreSQL, com publicação
posterior — a fila em tabela deixa de ser o meio de entrega e passa a ser apenas a caixa de
saída.

**Não vamos** usar Kafka para comunicação de requisição-resposta: consultas entre módulos
continuam síncronas. **Não vamos** migrar o processamento em segundo plano de tarefas
internas — agendamentos e rotinas de manutenção permanecem em tabela.

Esta decisão vale para eventos de domínio da Verano. Integrações com sistemas externos
continuam por HTTP e webhooks.

## Alternativas Consideradas

**Manter a fila em tabela, otimizada.** Descartada porque duas limitações são estruturais e
não de configuração: não há retenção nem reprocessamento, e múltiplos consumidores
independentes exigiriam replicar a tabela por consumidor. A contenção de conexões poderia
ser mitigada, o restante não.

*Voltaria a ganhar se:* o número de consumidores voltasse a um e o requisito de
reprocessamento desaparecesse — o que não é plausível.

**Serviço gerenciado de mensageria do provedor.** Descartada por um critério específico: não
oferece retenção longa com reprocessamento por posição, que é o requisito do time de dados.
Custaria menos operacionalmente e não atende ao caso principal.

*Voltaria a ganhar se:* o requisito de reprocessamento for atendido por outro meio, por
exemplo um armazém de eventos separado.

**Kafka gerenciado por terceiro** em vez de operado por nós. **Esta opção quase venceu.**
Descartada por custo: a cotação para o volume projetado ficou em ~3,2× o custo estimado de
operação própria, considerando 0,5 engenheiro/mês de esforço operacional. A equipe tem hoje
4 pessoas com experiência, o que não era verdade em 2023.

*Voltaria a ganhar se:* o esforço operacional real exceder 1,5 engenheiro/mês, ou se a
diferença de custo cair abaixo de 1,5×.

## Consequências

**Positivas (imediatas).** Consumidores independentes, sem acoplamento entre eles. Retenção
configurável com reprocessamento por posição. A contenção de conexões do banco é eliminada.

**Positivas (longo prazo).** Os eventos viram um ativo consultável, não apenas um mecanismo
de entrega.

**Negativas (imediatas).** Um agrupamento a operar, com plantão próprio. Ordem garantida
apenas por partição, o que exige escolher chave de partição com cuidado. Depuração de
fluxos assíncronos fica mais difícil e exige rastreamento distribuído.

**Negativas (longo prazo).** Os esquemas de evento viram **contratos públicos**. Alterá-los
passará a exigir versionamento e período de coexistência — hoje um evento é alterado com
uma migração.

**Neutras.** A caixa de saída continua existindo; o que muda é o destino da publicação.

**O que fica mais difícil de mudar.** Depois que os cinco consumidores estiverem em Kafka,
voltar atrás exige coordenar cinco times. Estimamos a reversão em 4 a 6 meses, contra as 3
semanas que a adoção do ADR-002 levou.

## Sinal de Alerta

- Esforço operacional acima de **1,5 engenheiro/mês** por dois trimestres — dispara a
  reavaliação do Kafka gerenciado.
- Mais de **dois incidentes por trimestre** com causa no agrupamento.
- Menos de **três consumidores ativos** em 12 meses — a premissa de reuso não se confirmou.
- Atraso de consumo acima de **1 minuto** de forma recorrente.

## O que observar neste exemplo

O contexto tem uma estrutura própria de sucessor: **o que o antecessor decidiu, sob quais
premissas, e o que mudou**. Sem isso, a decisão pareceria preferência de quem chegou
depois. Ver [superação](/18-architecture-decisions/superseding-decisions.md).

As condições de reversão do ADR-002 foram **verificadas com medição**, não julgadas. A
revisão virou verificação.

A alternativa que quase venceu — Kafka gerenciado — está registrada como tal, com o número
que a derrubou e a condição que a traria de volta. Ver
[alternativas](/18-architecture-decisions/adr-alternatives.md).

As consequências nomeiam **o que fica mais difícil de mudar**, com estimativa de reversão.
É a reversibilidade registrada como consequência.

## Conceitos Relacionados

- [Superação](/18-architecture-decisions/superseding-decisions.md), [Contexto](/18-architecture-decisions/adr-context.md).
- [ADR-002](/18-architecture-decisions/adr-002-async-processing.md) — o antecessor.
- [Mensageria](/06-distributed-systems/messaging.md).
- [Garantias de Entrega](/06-distributed-systems/delivery-guarantees.md).
