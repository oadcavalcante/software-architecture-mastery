---
id: dashboards
title: Painéis
sidebar_position: 8
description: Para que servem — e por que o painel de acompanhamento é diferente do de investigação.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor projeta painéis com propósito definido e evita a acumulação
  que os torna inúteis.
prerequisites: [golden-signals]
related: [golden-signals, metrics, alerting]
canonical_for: [painel, painel de investigação, painel de acompanhamento, painel de serviço]
content_version: 1
last_reviewed: 2026-08-28
---

# Painéis

## Visão Geral

Um painel é uma seleção de visualizações reunidas para responder a um conjunto de
perguntas.

O problema quase universal: painéis são construídos sem que ninguém tenha escrito quais
perguntas eles respondem. O resultado é uma parede de gráficos que ninguém consegue
interpretar sob pressão.

E há uma distinção que resolve boa parte disso: **acompanhar** e **investigar** são
propósitos diferentes, e exigem painéis diferentes.

## Problema

O painel típico cresce por acumulação. Cada incidente adiciona um gráfico; cada pessoa
adiciona o que lhe interessa.

Depois de dois anos: 60 gráficos, sem hierarquia, sem indicação do que é normal, sem
ordem de leitura.

Durante um incidente, às 3h, alguém abre esse painel e precisa decidir onde olhar. O
excesso de informação não ajuda — ele atrasa.

## Conceitos Centrais

### Dois propósitos, dois painéis

```text
acompanhamento   o sistema está bem?
                 poucos números, alto nível, comparados com o esperado
                 para quem não está investigando nada

investigação     o que está acontecendo?
                 detalhado, com contexto, ordenado por hipótese
                 para quem está no meio de um incidente
```

Misturar os dois produz um painel que serve mal aos dois usos: detalhado demais para
acompanhar, raso demais para investigar.

O de acompanhamento cabe numa tela e é lido em dez segundos. O de investigação pode ser
longo, desde que ordenado.

### O painel precisa dizer o que é normal

Um gráfico que mostra latência de 340 ms não informa nada a quem não conhece o serviço.

O que torna um painel legível:

```text
limiar visível       a linha do que é aceitável
comparação temporal  mesmo período da semana anterior
faixa esperada       o intervalo normal para aquele horário
anotação de eventos  implantações, mudanças de configuração
```

A última é a de maior retorno: sobrepor as implantações no gráfico responde,
visualmente, a pergunta mais frequente de qualquer incidente — "mudou alguma coisa?".

### Ordenar por hipótese

Um painel de investigação bem construído tem ordem de leitura:

```text
1. impacto no usuário       SLI, taxa de erro por jornada
2. quais componentes        erros e latência por serviço
3. o que mudou              implantações, configuração, tráfego
4. saturação de recursos    conexões, memória, fila
5. dependências externas    latência e erro das chamadas de saída
```

Essa ordem corresponde ao caminho que a investigação naturalmente segue, e evita que a
pessoa comece pelo detalhe.

Um painel sem ordem obriga cada pessoa a construir a própria sequência, sob pressão, do
zero.

### Um painel por serviço, padronizado

A padronização vale mais que a otimização individual.

Se todos os serviços têm o mesmo painel — [sinais dourados](/13-observability/golden-signals.md), na mesma
posição, com as mesmas escalas —, alguém que investiga um serviço desconhecido sabe onde
olhar.

Painéis artesanais, cada um com layout próprio, obrigam a aprender a interpretação de
cada um.

Gerar os painéis de serviço a partir de modelo, e não à mão, é o que sustenta isso ao
longo do tempo.

### Painéis também envelhecem

Métricas mudam de nome, serviços são removidos, gráficos param de funcionar.

Um painel com três gráficos quebrados perde credibilidade inteiro — as pessoas param de
confiar no que veem.

A revisão periódica é a mesma dos [alertas](/13-observability/alerting.md): o que não é consultado, e o
que está quebrado.

### Painel não substitui alerta nem investigação livre

**Não substitui alerta.** Ninguém fica olhando painéis. Ver
[alertas](/13-observability/alerting.md).

**Não substitui consulta ad hoc.** O painel responde perguntas antecipadas; a
investigação de um incidente novo exige formular perguntas que ninguém previu. Ver
[depurabilidade](/13-observability/debuggability.md).

Um time que só consegue investigar pelo que está no painel tem monitoramento, não
observabilidade.

### O painel exibido permanentemente tem outro requisito

Um painel numa tela na área do time é lido de relance, por pessoas que não estão
investigando nada — e às vezes por quem não é do time.

Isso impõe restrições que os demais não têm:

**Legível de longe.** Poucos elementos, tipografia grande, sem gráficos densos.

**Estado, não série.** "Tudo verde" ou "checkout degradado" comunica; uma linha
temporal com variação exige interpretação.

**Sem alarme falso.** Um painel que fica vermelho por variação normal treina as pessoas
a ignorá-lo — o mesmo mecanismo da fadiga de alerta.

**Sem dado sensível.** Ele é visível a visitantes, a quem passa, e a fotos de
escritório. Valores de receita e nomes de clientes não pertencem ali.

A última é a mais esquecida e já produziu vazamentos por foto publicada em rede social.

O conteúdo que funciona nesse formato é o mesmo do painel de acompanhamento, com menos
elementos ainda: estado das jornadas críticas, incidentes ativos, e nada mais.

## Modelo Mental

**Um painel responde a um conjunto de perguntas.** Se as perguntas não foram escritas,
o painel é uma coleção de gráficos.

## Quando Usar

- Acompanhamento de saúde de serviço.
- Investigação estruturada durante incidente.
- Comunicação de estado ao negócio.
- Análise de tendência e capacidade.

## Quando Não Usar

**Como substituto de alerta.**

**Misturando acompanhamento e investigação.**

**Sem limiar nem comparação.** Números sem referência.

**Artesanal por serviço**, quando a padronização é possível.

**Sem revisão.**

**Como única forma de investigar.**

## Alternativas

- **[Alertas](/13-observability/alerting.md)** — para o que precisa de reação.
- **Consulta ad hoc** — para perguntas novas.
- **Relatório periódico** — para tendência que não precisa de tempo real.
- **Painel gerado por modelo** — em vez de construído à mão.

## Trade-offs

| Poucos gráficos | Muitos |
|---|---|
| Legível sob pressão | Completo |
| Pode faltar contexto | Ninguém acha nada |
| Fácil de manter | Envelhece |

| Padronizado | Artesanal |
|---|---|
| Familiar em qualquer serviço | Otimizado para um |
| Gerado por modelo | Manutenção manual |

## Modos de Falha

**Parede de gráficos.** Excesso que atrasa em vez de ajudar.

**Sem referência do que é normal.**

**Gráficos quebrados.** O painel perde credibilidade.

**Sem anotação de mudanças.**

**Escalas enganosas.** Eixo truncado que exagera variação normal.

**Painel de acompanhamento usado para investigar**, e vice-versa.

**Dependência do painel.** Nada além dele pode ser investigado.

## Erros Comuns

**Não escrever as perguntas** que o painel responde.

**Acumular sem remover.**

**Não sobrepor implantações.**

**Não padronizar entre serviços.**

**Não indicar limiar.**

**Confundir os dois propósitos.**

## Exemplo Real

Uma plataforma de logística tinha um painel principal com 64 gráficos, construído ao
longo de quatro anos.

Numa análise de incidentes, uma constatação: o tempo médio entre o alerta e a
identificação do componente afetado era de 22 minutos — e as pessoas relatavam abrir o
painel, não encontrar o que precisavam, e ir direto às consultas ad hoc.

O painel tinha deixado de ser usado, sem que ninguém tivesse decidido isso.

A reformulação separou os propósitos:

**Painel de acompanhamento** com 7 gráficos, cabendo numa tela: SLI das três jornadas
críticas, tráfego total, taxa de erro, orçamento de erro restante, e incidentes ativos.
Lido em dez segundos, exibido numa tela na área do time.

**Painel de investigação**, ordenado por hipótese: impacto, componentes, mudanças
recentes, saturação, dependências externas. Longo, com seções colapsáveis.

**Painéis por serviço**, gerados por modelo a partir dos sinais dourados. Os 14 serviços
passaram a ter layout idêntico.

**Anotação de implantações** em todos os gráficos temporais.

**Faixa esperada** por horário, calculada a partir do histórico — o que tornou visível o
que é variação normal.

**Remoção** dos 64 gráficos antigos, depois de verificar quais eram efetivamente
consultados: 11.

O tempo médio entre alerta e identificação caiu para 6 minutos.

O que a equipe registra: o efeito maior não veio da reorganização, veio da anotação de
implantações. Uma fração alta dos incidentes é causada por mudança recente, e a
correlação visual respondia a pergunta antes de qualquer investigação.

## Conceitos Relacionados

- [Sinais Dourados](/13-observability/golden-signals.md) — o conteúdo padrão.
- [Alertas](/13-observability/alerting.md) — o que não é painel.
- [Métricas](/13-observability/metrics.md) — a fonte.
- [Depurabilidade](/13-observability/debuggability.md) — o que o painel não cobre.

## Exercício Prático

Abra o painel principal do seu time e conte quantos gráficos você consegue interpretar
sem consultar ninguém.

Depois pergunte: quais perguntas este painel responde? Se ninguém souber responder, ele
não tem propósito definido.

## Perguntas de Entrevista

- Por que acompanhar e investigar exigem painéis diferentes?
- Por que anotar implantações tem retorno tão alto?
- Por que padronizar vale mais que otimizar cada painel?

## Para Aprofundar

- Beyer, Betsy et al. *The Site Reliability Workbook*. O'Reilly, 2018.
- Tufte, Edward. *The Visual Display of Quantitative Information*. 2ª ed., 2001.
- Wilkie, Tom. *The RED Method*, 2018.
