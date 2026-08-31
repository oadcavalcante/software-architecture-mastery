---
id: vertical-scaling
title: Escala Vertical
sidebar_position: 1
description: Uma máquina maior — a resposta certa com mais frequência do que a literatura sugere.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor considera escala vertical antes da horizontal e conhece o
  limite real de uma máquina única hoje.
prerequisites: [scalability]
related: [horizontal-scaling, database-scaling, performance-vs-scalability]
canonical_for: [escala vertical, limite da máquina única]
content_version: 1
last_reviewed: 2026-08-28
---

# Escala Vertical

## Visão Geral

Escalar verticalmente é usar uma máquina maior: mais CPU, mais memória, disco mais
rápido.

É tratado como solução ingênua, superada pela escala horizontal. Essa reputação está
desatualizada: uma instância moderna comporta centenas de núcleos e terabytes de
memória, e a maioria dos sistemas nunca chega perto disso.

O que a escala vertical entrega e a horizontal não: **ausência de coordenação**. Não
há consistência distribuída, particionamento, balanceamento nem consenso. E essa
ausência vale muito.

## Problema

A discussão sobre escala pula direto para distribuição, e com ela vem um conjunto de
problemas que não existia:

Estado precisa sair do processo. Consistência vira decisão. Ordenação deixa de ser
garantida. Diagnóstico exige rastreamento distribuído. Falha parcial vira caso normal.
Ver [sistemas distribuídos](/06-distributed-systems/index.md).

Cada um desses é complexidade permanente, paga todo dia. Assumi-la para atender um
volume que caberia numa máquina maior é um mau negócio comum.

## Conceitos Centrais

### O limite é mais alto do que a intuição

Números de referência para instâncias disponíveis comercialmente:

```text
CPU        até algumas centenas de núcleos
memória    até vários terabytes
disco      milhões de operações por segundo em armazenamento local
rede       dezenas de gigabits por segundo
```

Um banco de dados relacional numa instância grande sustenta dezenas de milhares de
transações por segundo e dezenas de terabytes.

A maior parte dos sistemas que "precisa escalar" opera com uma fração disso — e a
verificação de quão distante o sistema está do limite raramente é feita antes de
decidir distribuir.

### O que se evita ao não distribuir

Vale enumerar, porque é o argumento central:

**Consistência.** Uma transação local resolve o que, distribuído, exige
[saga](/06-distributed-systems/sagas.md) ou coordenação.

**Ordenação.** Garantida dentro de um processo.

**Diagnóstico.** Um perfilador e um depurador respondem perguntas que, distribuídos,
exigem rastreamento correlacionado.

**Falha parcial.** Ou o processo está vivo, ou não está — sem o estado "não sei". Ver
[falha parcial](/06-distributed-systems/partial-failure.md).

**Latência de rede entre componentes.** Chamadas viram chamadas de função.

O tempo de engenharia economizado é o item mais relevante, e o menos contabilizado nas
comparações de custo.

### Onde o teto realmente aparece

A escala vertical para por razões específicas, e reconhecê-las é o que indica o
momento de mudar:

**Disponibilidade.** Uma máquina é um ponto único. Este é o motivo mais legítimo, e
frequentemente é resolvido com duas máquinas — primária e réplica — sem
particionamento.

**Custo não linear.** As instâncias maiores custam desproporcionalmente mais. Existe
um ponto em que duas médias saem mais baratas que uma grande.

**Limite físico atingido.** Quando o maior tipo disponível não basta.

**Reinício.** Mudar de tamanho exige parada. Com uma máquina, isso é indisponibilidade.

**Contenção interna.** Acima de certo número de núcleos, o próprio software pode não
escalar — bloqueios internos, estruturas compartilhadas. Dobrar os núcleos não dobra a
vazão.

A última é a que surpreende: nem todo software aproveita uma máquina muito grande.

### Vertical para o estado, horizontal para o resto

O desenho que resolve a maioria dos casos reais:

```text
camada de aplicação   horizontal — sem estado, fácil de multiplicar
banco de dados        vertical — uma instância grande, com réplica
cache                 horizontal ou vertical, conforme o volume
```

Isso combina o melhor dos dois: a camada que escala facilmente escala horizontalmente;
a camada onde a coordenação custa caro permanece única.

Distribuir o banco é a decisão mais cara desta seção, e é a que mais frequentemente é
tomada antes de necessária. Ver
[escala de banco de dados](/11-scalability/database-scaling.md).

### Escalar verticalmente exige medir primeiro

Aumentar a máquina sem saber qual recurso satura é desperdício.

Ver [desempenho versus escalabilidade](/11-scalability/performance-vs-scalability.md). Se o gargalo é
uma consulta sem índice, uma máquina maior compra alguns meses e o problema volta.

A sequência que funciona: identificar o gargalo, corrigir o que for corrigível,
verificar quanto da capacidade da máquina está sendo usada, e só então considerar
crescer.

## Modelo Mental

**Vertical compra tempo sem comprar complexidade.** Antes de distribuir, verifique
quão longe você está do teto — costuma ser mais longe do que a discussão pressupõe.

## Quando Usar

- O sistema está longe do limite da máquina disponível.
- A carga é previsível e não tem picos extremos.
- A complexidade distribuída não se justifica.
- O componente é o banco de dados.
- O time é pequeno.
- A urgência é imediata — crescer a máquina leva minutos; distribuir leva meses.

## Quando Não Usar

**Quando disponibilidade exige mais de uma máquina.** Uma é ponto único.

**Quando o limite físico foi atingido.**

**Quando o custo já é desproporcional** em relação a duas máquinas médias.

**Quando o software não aproveita** — contenção interna acima de certo tamanho.

**Sem medir.** Crescer sem saber o que satura.

**Para picos que duram minutos.** Redimensionar exige reinício.

## Alternativas

- **[Escala horizontal](/11-scalability/horizontal-scaling.md)** — quando o teto foi atingido ou a
  disponibilidade exige.
- **Réplica de leitura** — distribui leitura sem particionar. Ver
  [replicação para escala](/11-scalability/scaling-replication.md).
- **Cache** — reduz a carga que chega à máquina. Ver
  [cache para escala](/11-scalability/scaling-cache.md).
- **Assíncrono** — tira trabalho do caminho crítico. Ver
  [processamento assíncrono](/11-scalability/async-processing.md).
- **Otimização** — frequentemente rende mais que qualquer aumento de capacidade.

## Trade-offs

| Vertical | Horizontal |
|---|---|
| Sem coordenação | Coordenação em tudo |
| Consistência trivial | Decisão a tomar |
| Diagnóstico simples | Rastreamento distribuído |
| Ponto único de falha | Tolerância a falha |
| Teto físico | Teto de contenção |
| Reinício para redimensionar | Sem parada |
| Custo não linear no topo | Linear |

## Modos de Falha

**Teto atingido sem plano.** O maior tipo não basta, e distribuir leva meses.

**Ponto único.** A máquina cai e o sistema junto.

**Reinício para redimensionar.** Indisponibilidade planejada.

**Custo desproporcional.** A instância grande custa mais que a arquitetura
distribuída.

**Software não aproveitando.** Núcleos ociosos por contenção interna.

**Aumento sem efeito.** O gargalo era consulta, não capacidade.

## Erros Comuns

**Descartar por reputação.**

**Não medir quanto da capacidade está em uso.**

**Aumentar sem identificar o gargalo.**

**Não ter plano para o teto.**

**Ignorar que redimensionar exige parada.**

**Distribuir o banco cedo demais.**

## Exemplo Real

Uma plataforma de gestão de frotas decidiu migrar o banco para uma arquitetura
distribuída, com particionamento por região. O projeto foi estimado em oito meses.

Antes de começar, a medição do banco existente:

```text
CPU no pico              34%
memória em uso           45% de 128 GB
operações de disco       18% do limite provisionado
conexões                 85 de 200
transações por segundo   1.400, no pico
```

O banco estava operando a cerca de um terço da capacidade da instância — que não era
das maiores disponíveis.

A projeção de crescimento do negócio, para três anos, apontava 4.000 transações por
segundo. Uma instância duas categorias acima sustentaria isso com folga.

A decisão foi adiar o particionamento e fazer três coisas:

**Instância maior**, com o dobro de memória. Custou uma janela de manutenção de 8
minutos.

**Réplica de leitura** para relatórios, que respondiam por 40% da carga e não
precisavam de dados do instante.

**Correção de duas consultas** que faziam varredura completa em tabelas grandes — o
que sozinho reduziu a CPU no pico de 34% para 21%.

Três anos depois, com o volume projetado atingido, o banco opera a 48% de utilização.
O particionamento continua não sendo necessário.

E o que a equipe considera mais relevante: nesses três anos, o time entregou
funcionalidades que estavam na fila. Os oito meses do projeto de particionamento
teriam consumido a maior parte da capacidade de engenharia do período.

Duas decisões complementares foram tomadas na época:

**Plano para o teto.** Foi documentado o que seria feito quando a utilização passasse
de 70% de forma sustentada — incluindo o desenho de particionamento, pronto para ser
executado quando necessário.

**Alerta de tendência**, não só de valor absoluto: se a utilização crescer a um ritmo
que atinja 70% em menos de seis meses, o alerta dispara.

A lição registrada: a decisão de distribuir tinha sido tomada a partir de uma
projeção de crescimento, sem nenhuma medição do que a infraestrutura atual comportava.
A conta que faltava — quanto da máquina estamos usando — levou uma hora.

## Conceitos Relacionados

- [Escala Horizontal](/11-scalability/horizontal-scaling.md) — a alternativa.
- [Escala de Banco de Dados](/11-scalability/database-scaling.md).
- [Desempenho versus Escalabilidade](/11-scalability/performance-vs-scalability.md).
- [Computação em Nuvem](/09-cloud-architecture/cloud-compute.md).

## Exercício Prático

Descubra a utilização de CPU, memória, disco e conexões da sua máquina mais crítica no
percentil 95 dos últimos 30 dias.

Compare com o próximo tamanho de instância disponível. Se a folga cobrir a projeção de
crescimento de dois anos, a discussão sobre distribuir pode esperar.

## Perguntas de Entrevista

- O que a escala vertical entrega que a horizontal não entrega?
- Quais são os motivos legítimos para abandonar a vertical?
- Por que distribuir o banco é a decisão mais cara desta área?

## Para Aprofundar

- Gunther, Neil. *Guerrilla Capacity Planning*. Springer, 2007.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Gregg, Brendan. *Systems Performance*. 2ª ed. Addison-Wesley, 2020.
