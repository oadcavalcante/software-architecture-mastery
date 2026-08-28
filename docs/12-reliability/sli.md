---
id: sli
title: SLI
sidebar_position: 10
description: O indicador que mede o que o usuário sente — e por que a maioria mede a coisa errada.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escolhe indicadores que refletem a experiência do usuário e
  os mede no ponto certo.
prerequisites: [reliability]
related: [slo, sla, availability-metrics]
canonical_for: [SLI, indicador de nível de serviço, evento bom, janela de medição]
content_version: 1
last_reviewed: 2026-08-28
---

# SLI

## Visão Geral

Um SLI — indicador de nível de serviço — é uma medida quantitativa de um aspecto do
serviço que **importa para o usuário**.

A definição parece óbvia e é violada com frequência: a maioria dos sistemas mede o que
é fácil de medir — CPU, memória, taxa de erro do servidor — e não o que o usuário
experimenta.

O bom SLI tem uma forma característica: **a proporção de eventos bons sobre eventos
válidos**.

## Problema

Um painel mostra CPU em 40%, memória em 55%, taxa de erro em 0,3%. Tudo verde.

E os usuários não conseguem finalizar a compra, porque uma dependência do fluxo de
pagamento está devolvendo lentidão que o servidor conta como sucesso.

Métricas de recurso descrevem a saúde da infraestrutura. Elas não descrevem a
experiência — e é a experiência que define se o serviço está funcionando.

## Conceitos Centrais

### A forma: eventos bons sobre eventos válidos

```text
SLI = eventos bons / eventos válidos
```

Expressar assim força três decisões explícitas:

**O que é um evento.** Uma requisição, uma tentativa de login, um pedido processado.

**O que é bom.** Respondeu em menos de 300 ms com código de sucesso.

**O que é válido.** Requisições que o serviço deveria atender — excluindo, por
exemplo, erros de cliente que não são culpa do sistema.

A terceira decisão é a mais delicada e a mais consequente. Excluir erros de cliente é
razoável; excluir "requisições durante manutenção programada" pode virar uma forma de
o indicador nunca ficar ruim.

### As quatro categorias que cobrem quase tudo

```text
disponibilidade  proporção de requisições atendidas com sucesso
latência         proporção de requisições atendidas dentro do limite
qualidade        proporção atendida sem degradação — resposta completa
frescor          proporção de dados dentro do atraso aceitável
```

Para a maioria dos serviços, disponibilidade e latência bastam. Frescor importa em
sistemas com replicação ou processamento assíncrono; qualidade, onde há degradação
graciosa.

Note que **latência é expressa como proporção**, não como percentil. "99% das
requisições abaixo de 300 ms" é um SLI; "latência p99 de 300 ms" é a mesma informação
numa forma que não compõe bem com orçamento de erro. Ver [SLO](slo.md).

### Meça onde o usuário está

O ponto de medição muda o número:

```text
no servidor          não vê DNS, rede, balanceador, requisição que não chegou
no balanceador       melhor — vê o que entrou
no cliente           vê tudo, inclusive falha de conectividade
sondagem externa     vê o serviço como um usuário de fora
```

A diferença entre o número do servidor e o do cliente costuma ser grande, e essa
diferença é o mapa do que está quebrado fora do seu perímetro. Ver
[disponibilidade](../06-distributed-systems/availability.md).

A prática que funciona: SLI principal no ponto mais próximo do usuário que você
consegue instrumentar, com o do servidor como diagnóstico.

### Um SLI por jornada, não por endpoint

Medir cada endpoint produz dezenas de indicadores que ninguém acompanha.

O que funciona é medir as **jornadas críticas** — o que o usuário está tentando fazer:

```text
buscar produto      disponibilidade e latência
adicionar ao carrinho
finalizar compra    a mais crítica
consultar pedido
```

Três a cinco jornadas cobrem a maior parte do valor. E elas comunicam: "a finalização
de compra está em 99,2%" significa algo para o negócio; "o endpoint de checkout está
em 99,2%" significa menos.

### Nem todo evento vale o mesmo

Um sistema que atende mil requisições de listagem e uma de pagamento tem SLI dominado
pela listagem. Uma falha em todos os pagamentos mal move o número.

Duas saídas:

**SLIs separados por criticidade.** A jornada de pagamento tem o seu.

**Ponderação por importância.** Menos comum, e mais difícil de comunicar.

A primeira é preferível: ela mantém cada indicador legível.

### O que não é SLI

Vale ser explícito, porque a confusão é comum:

**Métrica de recurso.** CPU, memória, disco. São diagnóstico, não indicador de
serviço.

**Contagem absoluta.** "150 erros por hora" não diz se isso é muito — depende do
volume.

**Média.** Ela esconde a cauda. Um serviço com média de 100 ms pode ter 5% dos usuários
esperando 4 segundos.

**Tempo de atividade do processo.** O processo pode estar de pé e não atender.

## Modelo Mental

**SLI mede o que o usuário sente, na forma de proporção.** Se ele não muda quando o
usuário sofre, ele não é um SLI.

## Quando Usar

- Antes de definir qualquer SLO.
- Para jornadas críticas do produto.
- Onde a experiência do usuário precisa ser acompanhada.
- Quando há compromisso contratual a sustentar.
- Para orientar decisões de investimento em confiabilidade.

## Quando Não Usar

**Métricas de recurso como SLI.**

**Um SLI por endpoint.** Dezenas de indicadores que ninguém olha.

**Média.**

**Medido apenas no servidor**, quando é possível medir mais perto do usuário.

**Excluindo eventos até o número ficar bom.** A definição de "válido" precisa ser
defensável.

**Sem definir o limite.** "Latência boa" não é mensurável; "abaixo de 300 ms" é.

## Alternativas

- **Monitoramento sintético** — sondas que exercitam a jornada periodicamente. Cobre
  ausência de tráfego e detecta antes do usuário.
- **Medição no cliente** — a mais fiel, e exige instrumentação e amostragem.
- **Métricas de recurso** — para diagnóstico, não como indicador.

Sintético e real se complementam: o sintético cobre horários de baixo volume, onde o
real tem poucos eventos para ser confiável.

## Trade-offs

| Medido no cliente | No servidor |
|---|---|
| Vê a experiência real | Só o que chegou |
| Exige instrumentação | Já existe |
| Amostragem e privacidade | Sem preocupação |

| Poucos SLIs | Muitos |
|---|---|
| Acompanhados | Ignorados |
| Podem esconder problema local | Cobertura ampla |
| Comunicam ao negócio | Só à engenharia |

## Modos de Falha

**Indicador verde com usuário sofrendo.** Mediu recurso, não experiência.

**Volume alto diluindo falha crítica.**

**Definição de válido excluindo o inconveniente.**

**Medição só no servidor.** Falhas de rede invisíveis.

**Poucos eventos.** Em baixa volumetria, a proporção oscila e não significa nada.

**Limite escolhido sem base.** Um limite de latência definido por intuição não reflete
o que o usuário tolera.

## Erros Comuns

**Usar métricas de recurso.**

**Medir por endpoint.**

**Usar média.**

**Não definir o limite de latência com dados de comportamento.**

**Excluir eventos para melhorar o número.**

**Não medir jornadas, só componentes.**

## Exemplo Real

Uma plataforma de seguros acompanhava disponibilidade pela taxa de erro do servidor de
aplicação: 99,95%.

Os usuários reclamavam de não conseguir contratar apólices, e o número não mudava.

A investigação encontrou três razões pelas quais o indicador não via o problema:

**Medido no servidor.** Requisições que falhavam antes de chegar — timeout no
balanceador, falha de resolução de nome — não entravam na conta. Elas eram cerca de 2%
do total em horários de pico.

**Diluição por volume.** A contratação de apólice era 0,4% das requisições. Uma falha
em metade das contratações movia o indicador global em 0,2%.

**Lentidão contada como sucesso.** Requisições que levavam 30 segundos e retornavam
sucesso eram contadas como boas. O usuário desistia antes.

A reformulação:

**Quatro SLIs por jornada:** buscar cotação, contratar apólice, consultar apólice,
acionar sinistro. Cada um com disponibilidade e latência.

**Limite de latência definido com dados**, não por intuição: a análise de abandono
mostrou que acima de 4 segundos a taxa de desistência dobrava. O limite virou 4
segundos — não um número redondo escolhido em reunião.

**Medição no balanceador**, com sondagem sintética a cada minuto para cobrir os
horários de baixo volume.

**Medição no cliente** para a jornada de contratação, a mais crítica, capturando o que
acontece antes de a requisição sair do navegador.

O resultado: o SLI de contratação, medido corretamente, era **97,3%** — não 99,95%.

A conclusão registrada: o número antigo não era falso. Ele media exatamente o que
dizia medir — taxa de erro do servidor. Ele simplesmente não tinha relação com a
pergunta que importava, e ninguém tinha percebido porque a pergunta nunca foi escrita.

## Conceitos Relacionados

- [SLO](slo.md) — o alvo sobre o indicador.
- [SLA](sla.md) — o compromisso contratual.
- [Métricas de Disponibilidade](availability-metrics.md).
- [Observabilidade](../13-observability/index.md).

## Exercício Prático

Escolha a jornada mais crítica do seu produto e escreva o SLI dela na forma "eventos
bons sobre eventos válidos", com o limite explícito.

Depois pergunte: esse número muda quando o usuário sofre? Se não mudar, você mediu
outra coisa.

## Perguntas de Entrevista

- Por que a forma "bons sobre válidos" força boas decisões?
- Por que o ponto de medição muda o número?
- Por que latência deve ser expressa como proporção, e não como percentil?

## Para Aprofundar

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — capítulo 4.
- Beyer, Betsy et al. *The Site Reliability Workbook*. O'Reilly, 2018 — capítulos 2 e 3.
- Google. *SRE Fundamentals: SLIs, SLAs and SLOs*.
