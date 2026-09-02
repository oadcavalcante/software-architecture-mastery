---
id: availability-metrics
title: Métricas de Disponibilidade
sidebar_position: 1
description: O que os números significam — e o que a porcentagem esconde.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor interpreta métricas de disponibilidade sabendo o que elas
  não capturam.
prerequisites: [reliability]
related: [sli, slo, reliability-basics]
canonical_for: [tempo médio entre falhas, tempo médio de recuperação, tempo médio de detecção, duração de indisponibilidade]
content_version: 2
last_reviewed: 2026-08-28
---

# Métricas de Disponibilidade

## Visão Geral

"99,9% de disponibilidade" é a forma padrão de expressar confiabilidade, e ela esconde
mais do que revela.

Ela não diz se foram 43 minutos contínuos ou 43 interrupções de um minuto. Não diz se
atingiu todos os usuários ou 2%. Não diz se foi no pico ou de madrugada.

Essas distinções importam mais que o número, e é por isso que a disponibilidade
agregada precisa vir acompanhada de outras medidas.

## Problema

A porcentagem é atraente porque comunica facilmente. E ela agrega três dimensões
distintas num único número:

**Frequência.** Quantas vezes falhou.

**Duração.** Quanto tempo cada falha durou.

**Alcance.** Quantos usuários foram afetados.

Dois sistemas com a mesma porcentagem podem ter experiências opostas: um com uma
interrupção longa e outro com dezenas de curtas. O primeiro é um incidente; o segundo é
um produto que ninguém confia.

## Conceitos Centrais

### As três medidas que decompõem

```text
tempo médio entre falhas    frequência — com que intervalo falha
tempo médio de detecção     quanto tempo até alguém saber
tempo médio de recuperação  quanto tempo até voltar
```

A soma das duas últimas é a duração da indisponibilidade. E a decomposição orienta o
investimento:

```text
falha frequente, recuperação rápida   → investir em causa raiz
falha rara, recuperação lenta         → investir em recuperação e procedimento
detecção lenta                        → investir em observabilidade
```

O tempo de detecção é o mais negligenciado e frequentemente o maior componente: um
incidente descoberto por um cliente, e não pelo monitoramento, já consumiu boa parte da
duração antes de alguém agir.

### Reduzir a duração costuma render mais que reduzir a frequência

Contraintuitivo e prático.

Eliminar causas de falha tem retorno decrescente: as fáceis já foram, e as restantes
são cada vez mais raras e mais caras de prevenir.

Reduzir o tempo de recuperação tem retorno constante: ele se aplica a **todas** as
falhas, inclusive as que você não previu.

```text
falha a cada 30 dias, 60 min de recuperação  → 99,86%
falha a cada 30 dias, 6 min de recuperação   → 99,986%
```

Uma ordem de grandeza, sem eliminar nenhuma falha. Reversão rápida, failover
exercitado, procedimentos ensaiados e detecção automática são o que produzem isso.

### A média esconde a distribuição

Tempo médio de recuperação de 15 minutos pode ser dez incidentes de 4,5 minutos e um
de 2 horas.

O incidente de 2 horas é o que o cliente lembra, e a média não o representa.

A prática melhor: acompanhar a distribuição — mediana, percentil 90, e o pior caso do
período. E, para incidentes, o número absoluto costuma dizer mais que qualquer média,
porque a amostra é pequena.

### Disponibilidade por tempo e por requisição diferem

```text
por tempo        proporção do período em que o serviço estava disponível
por requisição   proporção de requisições atendidas com sucesso
```

Uma indisponibilidade de 10 minutos de madrugada e outra de 10 minutos no pico contam
igual na primeira, e muito diferente na segunda.

A medida por requisição reflete melhor o impacto no usuário, e é a forma usada em
[SLI](/12-reliability/sli.md). A medida por tempo é mais comum em contratos, porque é mais fácil de
verificar.

Saber qual está sendo usada muda a interpretação do número.

### Disponibilidade parcial é o caso comum

O modelo binário — disponível ou não — não descreve o que acontece na prática.

O comum é: uma funcionalidade fora, o resto funcionando; lentidão que torna o uso
inviável sem gerar erro; um subconjunto de usuários afetado.

Ver [degradação graciosa](/12-reliability/graceful-degradation.md). Medir apenas indisponibilidade
total esconde a maior parte do impacto real.

A saída é medir por jornada, com limiar de latência — o que transforma "está no ar" em
"está utilizável".

### O número precisa de contexto para significar algo

Três informações que precisam acompanhar qualquer porcentagem:

**A janela.** 99,9% ao mês e ao ano são compromissos muito diferentes.

**O ponto de medição.** Servidor, borda ou cliente. Ver [SLI](/12-reliability/sli.md).

**O que conta como indisponível.** Erro total, lentidão, degradação parcial.

Sem as três, a porcentagem não é comparável nem verificável — e é assim que ela aparece
na maioria dos relatórios.

### O número mais útil não é a disponibilidade

Uma medida que combina as três dimensões e comunica melhor ao negócio:

```text
minutos de usuário afetados = usuários afetados × duração em minutos
```

Ela distingue o que a porcentagem não distingue: dez minutos afetando 2% dos usuários
de madrugada, e dez minutos afetando todos no pico.

E ela é diretamente traduzível em impacto — número de pessoas que não conseguiram fazer
o que precisavam, e por quanto tempo.

O custo é que ela exige saber quantos usuários foram afetados, o que nem sempre é
simples em degradações parciais. A estimativa costuma bastar: a ordem de grandeza já
separa os incidentes que importam dos que não importam.

Times que adotam essa medida param de discutir se um incidente foi grave — o número
responde.

## Modelo Mental

**A porcentagem agrega frequência, duração e alcance.** Para agir, você precisa dos
três separados.

## Quando Usar

- Para acompanhar tendência ao longo do tempo.
- Como base para [SLO](/12-reliability/slo.md) e [SLA](/12-reliability/sla.md).
- Para comparar componentes e priorizar investimento.
- Em comunicação com o negócio.

## Quando Não Usar

**A porcentagem sozinha.**

**Média de recuperação** sem a distribuição.

**Disponibilidade por tempo** quando o impacto no usuário importa.

**Modelo binário** em sistemas que degradam parcialmente.

**Sem declarar janela, ponto de medição e definição.**

**Comparando números de fontes diferentes.** Definições distintas produzem números
incomparáveis.

## Alternativas

- **[SLI](/12-reliability/sli.md) por jornada** — mede a experiência, não o tempo de atividade.
- **Minutos de usuário afetados** — combina alcance e duração numa medida
  que o negócio entende.
- **Contagem de incidentes por severidade** — mais legível que média em amostras
  pequenas.
- **Distribuição de duração** — em vez de média.

A segunda merece destaque: minutos de usuário afetados captura as três dimensões e é
diretamente traduzível em impacto.

## Trade-offs

| Por tempo | Por requisição |
|---|---|
| Simples de verificar | Reflete o impacto |
| Ignora volume | Pondera pelo uso |
| Comum em contratos | Comum em SLO |

| Média | Distribuição |
|---|---|
| Um número | Vários |
| Esconde o pior caso | Revela |
| Fácil de comunicar | Exige contexto |

## Modos de Falha

**Número sem contexto.** Incomparável.

**Média escondendo o pior incidente.**

**Medição no servidor.** Não vê o que não chegou.

**Degradação parcial não contada.**

**Detecção lenta inflando a duração** sem que ninguém acompanhe esse componente.

**Manutenção programada excluída** sem limite, esvaziando o número.

## Erros Comuns

**Usar só a porcentagem.** 99,9% ao mês pode ser uma parada de 43 minutos ou quarenta e três paradas de um minuto — impactos muito diferentes com o mesmo número.

**Não separar detecção de recuperação.** São problemas distintos com soluções distintas: uma se ataca com monitoramento, a outra com automação. O tempo total não diz em qual investir.

**Investir em frequência quando a duração é o problema.** Reduzir o número de incidentes e reduzir a duração de cada um exigem trabalhos diferentes. Sem separar as métricas, o investimento vai para o lado errado.

**Não medir degradação parcial.** Disponibilidade binária conta como sucesso o sistema que responde em 30 segundos — que, para o usuário, está fora do ar.

**Comparar números de definições diferentes.** "Disponível" medido na borda, no balanceador ou pelo usuário final dá resultados distintos. Comparar sem igualar a definição não significa nada.

**Não acompanhar o pior caso.** A média entre clientes esconde o cliente que teve seis horas fora — e é ele que cancela o contrato.

## Exemplo Real

Uma plataforma de logística reportava 99,92% de disponibilidade mensal e recebia
reclamações constantes de instabilidade.

A decomposição explicou a contradição:

```text
incidentes no mês              14
duração média                  2,5 minutos
duração total                  35 minutos
tempo médio de detecção        1,8 minuto
tempo médio de recuperação     0,7 minuto
```

O número era excelente e a experiência era ruim: quatorze interrupções por mês, quase
uma a cada dois dias.

E a análise por horário mostrou concentração: onze dos quatorze aconteciam entre 8h e
10h — o horário de maior uso pelos clientes.

Duas mudanças na medição:

**Disponibilidade por requisição**, em vez de por tempo. O número caiu para 99,4% —
porque as interrupções aconteciam quando havia tráfego.

**Minutos de usuário afetados** como métrica principal, comunicada ao negócio. Ela
tornou visível o que a porcentagem escondia.

E a investigação da causa das quatorze interrupções encontrou uma raiz única: o
processo de implantação reiniciava instâncias sem desligamento gracioso, e as
implantações aconteciam de manhã.

Duas correções resolveram treze dos quatorze:

**Desligamento gracioso**, com a instância saindo do balanceamento antes de encerrar.

**Implantação fora do horário de pico**, e depois implantação gradual sem parada.

A conclusão registrada: eles tinham investido meses tentando reduzir a duração dos
incidentes — que já era de 2,5 minutos. O problema era a **frequência**, e a
decomposição levou uma tarde para revelar isso.

## Conceitos Relacionados

- [SLI](/12-reliability/sli.md) — a forma que mede experiência.
- [SLO](/12-reliability/slo.md) — o alvo.
- [Disponibilidade](/06-distributed-systems/availability.md) — a composição.
- [Fundamentos de Confiabilidade](/12-reliability/reliability-basics.md).

## Exercício Prático

Pegue os incidentes do último trimestre e separe, para cada um: tempo até detectar,
tempo até recuperar, e fração de usuários afetados.

A soma das colunas diz onde investir — e a coluna de detecção costuma ser a maior.

## Perguntas de Entrevista

- O que a porcentagem de disponibilidade esconde?
- Por que reduzir duração costuma render mais que reduzir frequência?
- Qual a diferença entre disponibilidade por tempo e por requisição?

## Para Aprofundar

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — capítulos 3 e 4.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018 — tempo de recuperação como
  indicador.
- Allspaw, John. *MTTR is more important than MTBF*, 2010.
