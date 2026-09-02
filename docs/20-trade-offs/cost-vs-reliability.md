---
id: cost-vs-reliability
title: Custo vs. Confiabilidade
sidebar_position: 4
description: Cada nono adicional custa cerca de uma ordem de grandeza — e quase nunca vale o último.
doc_type: tradeoff
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor define alvo de confiabilidade a partir do custo da indisponibilidade
  para o negócio, e não por aspiração.
prerequisites: [reliability-basics]
related: [consistency-vs-availability, managed-vs-self-hosted, speed-vs-quality]
canonical_for: [custo contra confiabilidade, custo do nono adicional, confiabilidade proporcional, alvo derivado do negócio]
content_version: 2
last_reviewed: 2026-08-29
---

# Custo vs. Confiabilidade

## Visão Geral

Confiabilidade tem preço, e o preço não é linear. Cada nono adicional de disponibilidade
custa aproximadamente **uma ordem de grandeza** a mais que o anterior.

```text
99%       3,65 dias de indisponibilidade por ano    uma instância, cópia de segurança
99,9%     8,76 horas                                redundância, monitoração, plantão
99,95%    4,38 horas                                multizona, automação de recuperação
99,99%    52,6 minutos                              multirregião, testes de caos, equipe dedicada
99,999%   5,26 minutos                              raro fora de telecomunicações e finanças
```

```text
eixo real   o custo de um minuto de indisponibilidade, para este sistema,
            justifica o custo de evitar aquele minuto?
```

A pergunta é aritmética, e quase nunca é feita. O alvo é escolhido por aspiração — "queremos
alta disponibilidade" — e o custo aparece depois, distribuído em infraestrutura, plantão e
complexidade.

## Problema

Duas falhas simétricas.

**Confiabilidade uniforme.** Todos os sistemas com o mesmo alvo, independentemente do que
custa a queda de cada um.

```text
sistema de checkout          queda custa ~R$ 90 mil/hora
painel administrativo interno queda custa ~R$ 0 por 2 horas
mesmo alvo de 99,95%          mesmo custo de infraestrutura e plantão
```

O painel consome redundância multizona, plantão noturno e alarme de página que acorda gente
— para um sistema cuja indisponibilidade ninguém nota antes das nove da manhã.

**Alvo sem lastro.** O número no contrato ou na apresentação não corresponde ao que a
arquitetura entrega, e ninguém verificou.

```text
alvo declarado    99,95%
topologia real    três instâncias na mesma zona
```

Ver [diagramas de implantação](/17-architecture-documentation/deployment-diagrams.md) — a
verificação de correspondência entre alvo e topologia é barata e raramente feita.

## Conceitos Centrais

### O alvo deriva do custo da indisponibilidade

```text
receita perdida por hora fora do ar
multa contratual por minuto além do acordado
custo de recuperação e retrabalho manual
efeito de reputação, quando estimável
custo de oportunidade da equipe durante o incidente
```

Com esse número, o alvo é derivado, não escolhido:

```text
custo de 1 h fora   ~R$ 90 mil
99,9%  → 8,8 h/ano  → ~R$ 790 mil de perda esperada
99,95% → 4,4 h/ano  → ~R$ 395 mil
delta de perda evitada    ~R$ 395 mil/ano
custo de subir o alvo     ~R$ 180 mil/ano
                          → vale
```

E o mesmo cálculo, um nono acima:

```text
99,99% → 0,9 h/ano  → ~R$ 79 mil
delta                ~R$ 316 mil/ano
custo de subir       ~R$ 900 mil/ano
                     → não vale
```

### O custo tem três componentes, e o terceiro é esquecido

```text
infraestrutura   réplicas, regiões, capacidade ociosa
engenharia       automação, testes de falha, ferramental
operação         plantão, resposta a incidente, carga cognitiva
```

O terceiro é o que mais pesa e o menos orçado. Um alvo de 99,99% implica resposta em
minutos, o que implica plantão com escala real — e plantão tem custo financeiro, custo de
rotatividade e custo de atenção.

Ver [engenharia de plataforma](/14-devops-and-platform/platform-engineering.md).

### Confiabilidade proporcional por componente

Nem todo componente de um sistema precisa do mesmo alvo:

```text
autorização de pagamento    99,99%   sem ela, não há venda
catálogo                    99,9%    cache absorve queda curta
recomendação                99%      degrada para lista padrão
relatórios                  99%      podem esperar
```

A degradação desenhada é o que torna isso possível: o sistema continua vendendo com a
recomendação fora. Ver
[degradação graciosa](/12-reliability/graceful-degradation.md).

Aplicar o alvo do componente mais crítico a todos multiplica o custo sem efeito
proporcional.

### O nono que não se compra com dinheiro

Acima de certo ponto, confiabilidade deixa de ser questão de redundância:

```text
99,9%    redundância resolve
99,95%   redundância + automação de recuperação
99,99%   + eliminar classes inteiras de erro humano
99,999%  + o processo de mudança vira o gargalo
```

No último patamar, a principal causa de indisponibilidade é **mudança** — implantações,
configurações, migrações. Chegar lá exige reduzir a frequência de mudança ou torná-la
extremamente segura, e ambos têm custo em velocidade de entrega.

Ver [velocidade vs. qualidade](/20-trade-offs/speed-vs-quality.md).

### Orçamento de erro

Uma inversão útil: em vez de perseguir o máximo, definir quanto de indisponibilidade é
aceitável e **gastar** esse orçamento.

```text
alvo 99,9%             43 min de indisponibilidade por mês
consumido no mês        12 min
saldo                   31 min → há espaço para arriscar mudanças
saldo esgotado          → congela mudanças até o mês seguinte
```

Isso transforma confiabilidade de aspiração em recurso administrável, e resolve a tensão
entre entregar e estabilizar com uma regra em vez de com discussão.

Ver [SLO e orçamento de erro](/12-reliability/slo.md).

### Sinais de escolha errada

```text
pagando demais
  alvo igual para sistemas de criticidade diferente
  redundância multirregião em sistema interno
  plantão noturno para serviço que ninguém usa à noite
  orçamento de erro nunca consumido — sobra todo mês

pagando de menos
  incidentes com custo acima do investimento em evitá-los
  recuperação manual em sistema crítico
  alvo declarado incompatível com a topologia real
  orçamento de erro estourado com frequência
```

O sinal "orçamento nunca consumido" é o mais ignorado: um sistema que fica meses sem gastar
o orçamento está mais confiável do que precisa, e pagando por isso.

### Custo de mudar de ideia

```text
baixo → alto    caro e demorado: exige mudar topologia, automação e operação
alto → baixo    barato de fazer, difícil de aprovar
```

A assimetria é organizacional, não técnica. Reduzir um alvo de confiabilidade é
tecnicamente simples e politicamente difícil — ninguém quer assinar a redução.

Isso favorece **começar no alvo derivado do custo**, e não acima dele "por segurança": o
excedente vira permanente.

## Modelo Mental

**Derive o alvo do custo da queda.** Cada nono custa dez vezes o anterior, e o último quase
nunca se paga.

## Quando Usar

Invista em confiabilidade quando:

- O custo da indisponibilidade excede o custo de evitá-la, com números.
- Há multa contratual ou requisito regulatório.
- A recuperação seria manual ou demorada.
- O componente é indispensável para a operação do negócio.

Aceite menos confiabilidade quando:

- A queda é absorvida por degradação desenhada.
- O uso é concentrado em horário comercial.
- O sistema é interno e a espera é tolerável.
- O orçamento de erro sobra consistentemente.

## Quando Não Usar

**Com alvo uniforme** para todos os sistemas.

**Com alvo escolhido por aspiração**, sem o custo da queda.

**Sem verificar** se a topologia entrega o alvo declarado.

**Sem contar o custo operacional** — plantão é o componente mais caro.

**Perseguindo nonos** acima do que o negócio paga.

## Alternativas

- **Degradação desenhada** — mantém a operação com parte fora; frequentemente mais barata
  que redundância.
- **Recuperação rápida em vez de prevenção** — reduzir o tempo de recuperação pode ser mais
  barato que reduzir a frequência de falha.
- **Serviço gerenciado** — transfere parte do custo operacional. Ver
  [gerenciado vs. autogerido](/20-trade-offs/managed-vs-self-hosted.md).
- **Alvo por componente** — em vez de por sistema.

A segunda merece destaque: disponibilidade é função de frequência **e** duração da falha, e
reduzir a duração costuma ser a metade barata da conta.

## Trade-offs

| Confiabilidade alta | Custo baixo |
|---|---|
| Menos perda por queda | Menos infraestrutura e plantão |
| Complexidade operacional | Risco de perda maior |
| Mudança mais lenta | Mudança mais livre |

| Prevenir falha | Recuperar rápido |
|---|---|
| Menos incidentes | Incidentes curtos |
| Caro, com teto | Mais barato por ponto ganho |
| Redundância | Automação e observabilidade |

## Modos de Falha

**Alvo uniforme.** Sistemas irrelevantes com custo de sistema crítico.

**Alvo sem lastro.** Declarado e não entregue pela topologia.

**Custo operacional não orçado.** O plantão aparece depois.

**Orçamento de erro sobrando.** Confiabilidade paga e não usada.

**Perseguir o nono acima do que o negócio paga.**

**Reduzir alvo bloqueado politicamente.** O excedente vira permanente.

## Erros Comuns

**Escolher o alvo antes de calcular o custo da queda.**

**Ignorar degradação** como alternativa à redundância.

**Não separar por componente.**

**Não medir a topologia contra o alvo.**

**Investir só em prevenção**, ignorando tempo de recuperação.

## Exemplo Real

Uma empresa de logística tinha 52 sistemas, todos com alvo de 99,95% e plantão 24×7,
definido três anos antes como política única.

Uma revisão calculou, sistema a sistema, o custo de uma hora de indisponibilidade:

```text
faixa de custo por hora fora do ar      sistemas
acima de R$ 50 mil                       4
R$ 5 mil a R$ 50 mil                      9
R$ 500 a R$ 5 mil                        14
abaixo de R$ 500                         25
```

Vinte e cinco sistemas — quase metade — tinham custo de indisponibilidade inferior a R$ 500
por hora e consumiam redundância multizona, alarme de página e plantão noturno.

O custo agregado de manter esses 25 no alvo de 99,95%:

```text
infraestrutura redundante         ~R$ 1,1 milhão/ano
plantão atribuível                ~R$ 900 mil/ano
esforço de engenharia em
  automação e testes de falha     ~2,5 pessoas em tempo integral
```

E o orçamento de erro desses 25 sistemas sobrava todo mês, sem exceção, havia dois anos.

A reclassificação:

**Quatro níveis de criticidade**, derivados do custo por hora, não de julgamento:

```text
crítico     99,99%   4 sistemas   multirregião, plantão 24×7, teste de caos
alto        99,9%    9 sistemas   multizona, plantão 24×7
médio       99,5%   14 sistemas   multizona, plantão horário estendido
baixo       99%     25 sistemas   zona única, plantão horário comercial
```

**Degradação desenhada** nos sistemas de nível alto, o que permitiu manter o efeito para o
usuário com menos redundância — dois deles passaram a servir dados de cache com indicação de
idade durante indisponibilidade da fonte.

**Investimento redirecionado para tempo de recuperação** nos quatro críticos, em vez de para
mais redundância: automação de recuperação, restauração testada e ensaios de falha regional.

**Orçamento de erro publicado por sistema**, com congelamento automático de mudanças quando
esgotado.

**Verificação automática** de que a topologia corresponde ao alvo — grupo de escala com
sub-rede única em sistema de nível alto ou crítico falha a esteira.

Resultados após 15 meses:

```text
custo de infraestrutura                       -34%
horas de plantão noturno                      -61%
rotatividade na equipe de operação            de 22% para 9% ao ano
disponibilidade dos 4 sistemas críticos       de 99,94% para 99,99%
incidentes com impacto em receita             -40%
orçamento de erro consumido nos 25 de
  nível baixo                                 média de 38% ao mês
```

O dado que a equipe mais destaca: os sistemas críticos ficaram **mais** confiáveis depois da
mudança. A atenção da equipe de operação, antes distribuída entre 52 sistemas com o mesmo
alarme, passou a se concentrar nos quatro que importavam.

O aprendizado que ficou: a política única de 99,95% tinha sido criada com boa intenção — evitar
que alguém decidisse mal. Ela não evitou decisão ruim; ela impediu qualquer decisão, e o
custo apareceu como redundância inútil e plantão desgastado.

## Conceitos Relacionados

- [SLO](/12-reliability/slo.md) — o orçamento de erro.
- [Métricas de Disponibilidade](/12-reliability/availability-metrics.md) — frequência e duração.
- [Degradação Graciosa](/12-reliability/graceful-degradation.md) — a alternativa barata.
- [Gerenciado vs. Autogerido](/20-trade-offs/managed-vs-self-hosted.md).
- [Diagramas de Implantação](/17-architecture-documentation/deployment-diagrams.md) — a
  verificação de lastro.

## Exercício Prático

Estime o custo de uma hora de indisponibilidade para três sistemas do seu contexto e compare
com o alvo de confiabilidade de cada um.

Se os três tiverem o mesmo alvo e custos de ordem diferente, dois estão no nível errado.

## Perguntas de Entrevista

- Por que cada nono adicional custa aproximadamente uma ordem de grandeza?
- Por que um orçamento de erro que sobra todo mês é um sinal de problema?
- Por que reduzir tempo de recuperação costuma ser mais barato que reduzir frequência de
  falha?

## Para Aprofundar

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Beyer, Betsy et al. *The Site Reliability Workbook*. O'Reilly, 2018.
- Allspaw, John. *Blameless PostMortems*. Etsy, 2012.
