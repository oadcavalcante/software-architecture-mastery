---
id: sla
title: SLA
sidebar_position: 12
description: O compromisso com penalidade — e por que ele deve ser mais frouxo que o alvo interno.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor negocia SLAs com folga em relação ao SLO e entende o que a
  letra miúda de fato promete.
prerequisites: [slo]
related: [slo, sli, availability-metrics]
canonical_for: [SLA, acordo de nível de serviço, crédito de serviço, exclusão contratual]
content_version: 1
last_reviewed: 2026-08-28
---

# SLA

## Visão Geral

Um SLA — acordo de nível de serviço — é um compromisso **contratual** sobre o nível de
serviço, com consequência definida se ele não for cumprido.

Ele é frequentemente confundido com [SLO](slo.md), e a diferença tem consequência
prática:

```text
SLO  alvo interno, ambicioso, sem penalidade, orienta decisão de engenharia
SLA  compromisso externo, conservador, com penalidade, orienta negociação
```

O SLA deve ser **mais frouxo** que o SLO. Se forem iguais, cada falta ao alvo interno já
é quebra de contrato — e o time perde a margem que o orçamento de erro deveria dar.

## Problema

Um SLA prometido sem base é um passivo. Ele costuma ser definido em negociação
comercial, sob pressão do cliente, sem que ninguém verifique se o sistema o sustenta.

E o inverso também acontece: um SLA conservador demais perde negócio.

Os dois erros vêm da mesma ausência — não há medição histórica que informe o que o
sistema entrega de fato, nem cálculo do que as dependências permitem prometer.

## Conceitos Centrais

### A folga entre SLO e SLA

```text
SLA prometido ao cliente   99,5%
SLO interno                99,9%
folga                      0,4 ponto — o espaço para errar sem quebrar contrato
```

O time trabalha contra o SLO. Quando ele é violado, há tempo para reagir antes de a
penalidade contratual entrar.

A folga precisa ser suficiente para absorver um incidente relevante. Uma folga de
0,01 ponto não é folga.

### O que a letra miúda decide

O número prometido importa menos que as definições em torno dele. Quatro pontos:

**O que conta como indisponibilidade.** Erro completo? Lentidão? Degradação parcial?
Muitos contratos só contam indisponibilidade total, o que significa que um serviço
inutilizável por lentidão está tecnicamente disponível.

**Como é medido, e por quem.** Medição do fornecedor, do cliente, ou de um terceiro? O
número muda substancialmente. Ver [SLI](sli.md).

**A janela.** 99,9% ao mês permite 43 minutos; ao ano, 8,8 horas concentradas num único
evento. A mesma porcentagem, compromissos muito diferentes.

**As exclusões.** Manutenção programada, falha do provedor de nuvem, ataque, força
maior, problemas de rede do cliente. Exclusões amplas esvaziam o compromisso.

A soma dessas quatro define o que o SLA vale — e um SLA de 99,99% com exclusões amplas
promete menos que um de 99,5% sem elas.

### A penalidade típica não compensa o dano

O padrão de mercado é o **crédito de serviço**: um desconto na mensalidade,
proporcional à falta.

```text
disponibilidade    crédito
99,0% a 99,9%      10% da mensalidade
95,0% a 99,0%      25%
abaixo de 95,0%    50%
```

Isso é desproporcional ao prejuízo do cliente: uma indisponibilidade de 4 horas pode
custar-lhe muito mais do que 25% de uma mensalidade.

Duas consequências, uma para cada lado:

**Para quem contrata:** o SLA não é seguro. Ele sinaliza compromisso e não cobre
prejuízo. A proteção real é arquitetural — redundância, degradação, alternativa.

**Para quem oferece:** o crédito não é o custo principal de descumprir. O custo é a
perda de confiança e a renovação que não acontece.

### A disponibilidade composta limita o que se pode prometer

Um sistema não pode ser mais disponível que suas dependências síncronas.

```text
seu serviço      99,95%
banco gerenciado 99,99%
gateway externo  99,9%
autenticação     99,95%
composto         ~99,79%
```

Prometer 99,9% com essa composição é prometer o que não se controla. Ver
[disponibilidade](../06-distributed-systems/availability.md).

Isso não impede prometer mais — impede prometer mais **sem reduzir a dependência
síncrona**: cache, degradação, alternativa, ou tornar a chamada assíncrona.

Calcular a composição antes de assinar é o passo que evita o passivo.

### SLA recebido também importa

A análise vale nos dois sentidos. Ao contratar um serviço:

**O SLA dele entra no seu cálculo.** Ver acima.

**As exclusões dele são o seu risco.** Se a manutenção programada é excluída e não tem
limite de duração, você não tem compromisso nenhum.

**A penalidade é irrelevante.** Planeje para a falha, não para o crédito.

Ver [SaaS](../09-cloud-architecture/saas.md) e
[dependência de fornecedor](../09-cloud-architecture/vendor-lock-in.md).

### Interno também pode ter acordo

Entre times, um acordo explícito — sem penalidade contratual — cumpre função parecida:
o time consumidor sabe o que esperar, e o time provedor sabe o que sustentar.

Chamar isso de SLA gera confusão. É um SLO com consumidor declarado, e funciona melhor
quando tratado assim.

## Modelo Mental

**SLA é o que você promete; SLO é o que você persegue.** A distância entre os dois é a
sua margem de erro.

## Quando Usar

- Há contrato com cliente que exige compromisso de nível de serviço.
- O produto é vendido para empresas que exigem garantias.
- É preciso diferenciar níveis de serviço por plano.
- Ao avaliar fornecedores.

## Quando Não Usar

**Igual ao SLO.** Sem margem.

**Prometido sem verificar as dependências.**

**Sem histórico de medição** que informe o que o sistema entrega.

**Como substituto de proteção arquitetural.** O crédito não cobre o prejuízo.

**Com exclusões tão amplas** que o compromisso fica vazio — do lado de quem contrata,
isso é o sinal de que não há compromisso.

**Entre times internos**, com penalidade. Vira burocracia sem valor.

## Alternativas

- **[SLO](slo.md) publicado** — transparência sem compromisso contratual. Suficiente
  para muitos produtos.
- **Painel público de disponibilidade** — histórico visível, que constrói confiança
  melhor que uma promessa.
- **Compromisso por plano** — níveis diferentes com preços diferentes.
- **Proteção arquitetural** — para quem contrata, vale mais que qualquer cláusula.

## Trade-offs

| SLA rigoroso | Frouxo |
|---|---|
| Diferencial comercial | Menos atrativo |
| Risco de penalidade | Baixo |
| Exige investimento | Menos |
| Pressão sobre engenharia | Menos |

| Janela mensal | Anual |
|---|---|
| Reage a degradação recente | Absorve um evento grande |
| Mais faltas contadas | Menos |

## Modos de Falha

**SLA acima do que as dependências permitem.**

**Sem folga em relação ao SLO.**

**Definição de indisponibilidade favorável demais ao fornecedor.** Lentidão não conta.

**Medição só do fornecedor.**

**Exclusões esvaziando o compromisso.**

**Crédito tratado como seguro.**

**Cliente medindo diferente.** Disputa sobre o número, sem critério comum.

## Erros Comuns

**Confundir com SLO.**

**Prometer sem calcular a composição.**

**Negociar sem histórico de medição.**

**Não ler as exclusões dos fornecedores.**

**Contar com o crédito** em vez de projetar para a falha.

**Não definir quem mede e como.**

## Exemplo Real

Uma empresa de tecnologia fechou contrato com um cliente corporativo prometendo 99,95%
de disponibilidade mensal, com crédito de 25% em caso de falta.

O número foi definido na negociação comercial, porque o concorrente oferecia 99,9%.

Ninguém verificou três coisas:

**A composição.** O sistema dependia de um gateway de pagamento com SLA de 99,9% e de
um provedor de identidade com 99,95%, ambos síncronos no fluxo principal. A
disponibilidade máxima teórica era cerca de 99,8% — abaixo do prometido, mesmo com o
sistema próprio perfeito.

**O histórico.** Os doze meses anteriores tinham média de 99,7%, com dois meses abaixo
de 99%.

**A definição.** O contrato contava como indisponibilidade "qualquer período em que o
serviço não responda ou responda com erro". Lentidão não estava excluída
explicitamente, o que o cliente interpretou — corretamente — como incluída.

Nos primeiros seis meses, o SLA foi descumprido em quatro. O crédito acumulado foi
significativo, e a relação com o cliente ficou tensa.

A renegociação, um ano depois, foi feita com dados:

**SLA reduzido para 99,5%**, com o histórico apresentado ao cliente como justificativa.

**SLO interno definido em 99,9%**, criando a folga que não existia.

**Definição de indisponibilidade precisada**: latência acima de 10 segundos conta;
degradação parcial de funcionalidades não essenciais não conta, com a lista de
essenciais anexada.

**Medição por terceiro**, aceita pelos dois lados, encerrando as disputas sobre o
número.

E, na engenharia, três mudanças que atacaram a composição:

**Gateway de pagamento com alternativa.** Um segundo provedor, acionado quando o
primeiro falha.

**Autenticação com cache de sessão**, tolerando indisponibilidade do provedor de
identidade por até 15 minutos.

**Degradação graciosa** para funcionalidades não essenciais. Ver
[degradação graciosa](graceful-degradation.md).

Depois disso, a disponibilidade real subiu para 99,93% — e o SLA de 99,5% passou a ter
folga confortável.

O que a equipe registra: o problema não era o sistema. Era ter prometido um número que
a arquitetura não sustentava, definido numa reunião comercial sem ninguém fazer a conta
de dez minutos que teria mostrado isso.

## Conceitos Relacionados

- [SLO](slo.md) — o alvo interno.
- [SLI](sli.md) — o que é medido.
- [Disponibilidade](../06-distributed-systems/availability.md) — a composição.
- [Degradação Graciosa](graceful-degradation.md) — como sustentar o número.

## Exercício Prático

Liste as dependências síncronas do seu fluxo principal e o SLA de cada uma. Multiplique
as disponibilidades.

O resultado é o teto do que você pode prometer. Compare com o que já foi prometido.

## Perguntas de Entrevista

- Por que o SLA deve ser mais frouxo que o SLO?
- Por que a letra miúda importa mais que o número?
- Por que o crédito de serviço não é seguro?

## Para Aprofundar

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — capítulo 4.
- Beyer, Betsy et al. *The Site Reliability Workbook*. O'Reilly, 2018.
- SLAs públicos dos principais provedores de nuvem — leia as exclusões.
