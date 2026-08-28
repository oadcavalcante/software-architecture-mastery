---
id: measuring-architecture-outcomes
title: Medição de Resultados de Arquitetura
sidebar_position: 23
description: Saber se a arquitetura está melhorando, em vez de argumentar que está.
doc_type: concept
level: 7
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor mede resultado arquitetural por efeito no negócio e na entrega, não por
  atividade nem por conformidade.
prerequisites: [fitness-functions]
related: [fitness-functions, evolutionary-architecture, cost-management]
canonical_for: [medição de resultado arquitetural, indicador de arquitetura, evidência de melhoria, atividade contra efeito]
content_version: 1
last_reviewed: 2026-08-29
---

# Medição de Resultados de Arquitetura

## Visão Geral

A diferença entre liderança arquitetural e opinião sênior é a capacidade de responder a uma
pergunta com evidência:

```text
"a arquitetura está melhorando?"
```

Sem medição, a resposta é uma narrativa — e narrativas são disputadas por quem tem mais
autoridade, não por quem tem razão. Com medição, a conversa muda de natureza: passa a ser sobre
os números, e discordar deles exige propor outros.

O problema é que arquitetura é medida quase sempre por **atividade** — decisões tomadas, ADRs
escritos, revisões realizadas, padrões publicados — e nenhuma delas informa se algo melhorou.

## Problema

O relatório de arquitetura típico:

```text
23 ADRs escritos
41 revisões de desenho realizadas
6 padrões publicados
3 iniciativas de modernização em andamento
```

Todos esses números crescem com o esforço da área e nenhum responde se a organização está em
melhor situação. Eles são, em essência, uma medição de quanto trabalho a área fez.

E há um segundo padrão: medir conformidade. "94% dos sistemas seguem o padrão X" informa sobre
adesão, não sobre resultado — o padrão pode estar errado, e 94% de conformidade com um padrão
errado é pior que 40%.

```text
atividade      cresce com o esforço
conformidade   mede adesão, não efeito
efeito         mede o que mudou para a organização
```

## Conceitos Centrais

### Meça efeito, em quatro dimensões

```text
velocidade de mudança   tempo entre decisão e produção
                        frequência de implantação
                        tempo de construção
estabilidade            taxa de falha em mudanças
                        tempo de recuperação
                        incidentes por classe de causa
custo                   custo por unidade econômica
                        capacidade em manutenção contra em
                        funcionalidade nova
capacidade              tempo de onboarding de pessoa nova
                        tempo de integração entre times
                        número de pessoas capazes de alterar
                        cada sistema
```

Essas quatro cobrem a maior parte do que arquitetura afeta, e nenhuma delas cresce com o esforço
da área de arquitetura — o que é exatamente a propriedade desejada.

As quatro primeiras métricas de velocidade e estabilidade são as de entrega de software
consolidadas pela pesquisa de desempenho organizacional. Ver
[entrega contínua](../14-devops-and-platform/ci-cd.md).

### Ligue cada iniciativa a um número, antes

```text
"esta iniciativa vai reduzir o tempo entre decisão e produção
 de 18 para menos de 7 dias, medido sobre mudanças no domínio
 de pedidos, em 12 meses"
```

Declarar o número **antes** faz duas coisas. Torna a iniciativa avaliável, o que é desconfortável
e honesto. E força a pergunta útil na fase de proposta: se não há número que melhore, por que
fazer?

Iniciativas sem número declarado são avaliadas depois por narrativa, e a narrativa sempre conclui
que foi um sucesso.

### Meça antes de começar

```text
sem linha de base    impossível demonstrar melhoria
com linha de base    a comparação é aritmética
```

Este é o erro mais comum e o mais irreversível: uma iniciativa de 12 meses que não mediu o estado
inicial não tem como demonstrar resultado, mesmo tendo produzido um.

E medir antes tem um segundo benefício: frequentemente o número inicial contradiz a percepção que
motivou a iniciativa, e a proposta muda antes de custar dinheiro.

### Segmente pelo que a arquitetura trata de forma diferente

```text
média agregada       esconde
segmentada por
  domínio, sistema
  ou time            revela
```

Um tempo médio de entrega de 8 dias pode esconder três domínios em 2 dias e um em 30. A média não
aciona nada; a segmentação aponta onde atuar.

Ver o [case de streaming](../21-case-studies/video-streaming.md), em que o p95 agregado parecia
bom e 8% dos usuários tinham experiência três vezes pior.

### Métricas de arquitetura vêm do que já existe

```text
histórico do repositório   frequência de mudança, arquivos por
                           mudança, módulos que mudam juntos
esteira                    tempo de construção, frequência de
                           implantação, taxa de falha
incidentes                 tempo de recuperação, causa por classe
fatura                     custo por unidade
pesquisa interna           carga cognitiva, autonomia percebida
```

Quase nada disso exige instrumentação nova. A informação existe e não é extraída — que é uma
observação recorrente ao longo deste percurso.

### Cuidado com o que a métrica incentiva

```text
número de ADRs               → ADRs triviais
cobertura de teste           → testes sem asserção
conformidade com padrão      → conformidade com padrão errado
tempo de entrega             → lotes menores, o que é bom,
                               e também corte de qualidade
```

Toda métrica publicada vira alvo. A mitigação usual é medir em pares que se contrabalançam:
velocidade com estabilidade, custo com confiabilidade, conformidade com resultado.

Publicar velocidade de entrega sem taxa de falha em mudanças produz exatamente o comportamento
que a organização não quer.

### Cadência e público

```text
contínuo    velocidade, estabilidade, custo — para os times
trimestral  tendência agregada — para a liderança
anual       efeito das iniciativas estratégicas — para a diretoria
```

O público muda o recorte, não a fonte. Ver
[comunicação](communication.md).

### Nem tudo é medível, e admitir isso protege as métricas

```text
medível        tempo, frequência, custo, taxa
não medível    se a fronteira do domínio está correta
               se a complexidade se justifica
               se a decisão foi a certa
```

Tentar quantificar o não quantificável produz métricas ruins que desacreditam as boas. Declarar o
limite — "isto avaliamos por julgamento, e aqui está o raciocínio" — é mais honesto e mais
defensável.

## Modelo Mental

**Meça efeito, não atividade.** Declare o número antes, meça a linha de base, e segmente pelo que
a arquitetura trata de forma diferente.

## Quando Usar

- Antes de qualquer iniciativa arquitetural relevante.
- Continuamente, com as quatro dimensões.
- Segmentado por domínio ou sistema, não em média.

## Quando Não Usar

**Medindo atividade.**

**Sem linha de base.**

**Em média agregada.**

**Sem métrica contrabalançadora.**

**Quantificando o que exige julgamento.**

**Como relatório** que não muda nenhuma decisão — se nenhuma priorização mudou por causa dos
números em um ano, o relatório é custo puro e deveria ser reduzido ou eliminado.

## Alternativas

- **Pesquisa qualitativa com os times** — mais rápida, menos precisa, frequentemente suficiente
  para diagnóstico.
- **Avaliação por pares** — arquitetos de outra área revisando; captura o que métricas não
  capturam.
- **Métricas de entrega apenas** — velocidade e estabilidade cobrem muito, e são baratas de
  obter.

A terceira é o ponto de partida recomendado: quatro números conhecidos, obtidos da esteira, já
mudam a conversa.

## Trade-offs

| Muitas métricas | Poucas |
|---|---|
| Cobertura | Foco e ação |
| Diluição | Lacunas |

| Publicar por time | Agregado |
|---|---|
| Aciona quem pode agir | Sem risco de comparação injusta |
| Risco de virar ranking | Ninguém age |

A segunda tabela esconde uma tensão real: métricas por time acionam e podem virar competição. A
mitigação é publicar tendência de cada time contra si mesmo, não contra os outros.

## Modos de Falha

**Medir atividade.** Cresce com esforço, não informa.

**Sem linha de base.** Resultado indemonstrável.

**Média que esconde.** Nada é acionado.

**Métrica sem contrapeso.** Incentiva o comportamento errado.

**Relatório sem consequência.** Custo sem uso.

**Quantificar julgamento.** Métricas ruins desacreditam as boas.

## Erros Comuns

**Relatar ADRs escritos** e revisões realizadas.

**Não medir antes** de começar.

**Publicar velocidade** sem estabilidade.

**Comparar times entre si.**

**Não usar** o que a esteira e o repositório já produzem.

## Exemplo Real

Uma empresa de software com 240 engenheiros tinha uma área de arquitetura que produzia um
relatório trimestral. Ele continha número de ADRs, revisões, padrões publicados e iniciativas em
andamento.

Numa reunião de planejamento anual, o diretor de engenharia fez uma pergunta que a área não
conseguiu responder: **"nós estamos melhores do que há dois anos?"**

A reformulação levou seis meses e começou por extrair o que já existia:

```text
fonte                     métrica obtida
esteira                   tempo de construção, frequência de
                          implantação, taxa de falha em mudanças
sistema de incidentes     tempo de recuperação, causa por classe
repositórios              tempo entre primeiro commit e produção,
                          arquivos e módulos por mudança
fatura de nuvem           custo por transação
recursos humanos          tempo de onboarding até primeira
                          entrega em produção
```

Nenhuma exigiu instrumentação nova. A extração levou três semanas.

A linha de base, medida sobre os 24 meses anteriores, produziu uma revelação desconfortável:

```text
tempo entre decisão e produção     de 14 para 19 dias (piorou)
frequência de implantação          +40% (melhorou)
taxa de falha em mudanças          de 9% para 14% (piorou)
tempo de recuperação               de 2,1 h para 1,4 h (melhorou)
custo por transação                +23% (piorou)
capacidade em manutenção           de 58% para 66% (piorou)
```

A organização estava implantando mais e piorando em quatro das seis dimensões. A narrativa
anterior — de progresso constante — não sobrevivia aos números.

**Segmentação** revelou onde:

```text
tempo entre decisão e produção, por domínio
  pagamentos      6 dias
  catálogo        8 dias
  faturamento     41 dias
  contratos       38 dias
```

Dois domínios concentravam a piora, e ambos eram os que dependiam de um sistema legado comum.

**A estratégia técnica foi refeita** a partir disso: uma frente única, atacando o sistema legado
que travava os dois domínios — em vez das cinco frentes anteriores, escolhidas por percepção.

**Cada iniciativa passou a declarar o número antes**, com linha de base e alvo.

**Métricas em pares.** Velocidade sempre publicada com taxa de falha; custo sempre com
disponibilidade.

**Publicação por domínio, contra si mesmo.** Cada time vê sua tendência, não a comparação com os
outros.

Dezoito meses depois:

```text
tempo entre decisão e produção     de 19 para 7 dias
  faturamento                      de 41 para 11
  contratos                        de 38 para 9
taxa de falha em mudanças          de 14% para 6%
custo por transação                -19%
capacidade em manutenção           de 66% para 47%
tempo de onboarding                de 11 para 5 semanas
```

O relatório trimestral passou a ter seis números e nenhuma contagem de atividade.

A leitura que a equipe faz: a linha de base foi a parte mais desconfortável e a mais valiosa. Ela
mostrou que a percepção de progresso estava errada, e a segmentação por domínio apontou a causa em
uma tarde — depois de dois anos de estratégias construídas sobre percepção.

E a pergunta do diretor virou o critério de existência do relatório: qualquer número que não
ajude a respondê-la foi removido.

## Conceitos Relacionados

- [Funções de Aptidão](fitness-functions.md).
- [Arquitetura Evolutiva](evolutionary-architecture.md).
- [Gestão de Custo](cost-management.md).
- [Medição de Governança](../19-architecture-governance/measuring-governance.md).

## Exercício Prático

Extraia da sua esteira e do seu sistema de incidentes as quatro métricas de entrega dos últimos
24 meses, e segmente-as por domínio.

Depois responda à pergunta: vocês estão melhores do que há dois anos? Se a resposta surpreender,
essa é a razão de medir.

## Perguntas de Entrevista

- Por que contar ADRs e revisões não mede arquitetura?
- Por que a linha de base é irreversível se não for medida antes?
- Por que métricas precisam de pares que se contrabalançam?

## Para Aprofundar

- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.
- Ford, Neal et al. *Building Evolutionary Architectures*. 2ª ed. O'Reilly, 2022.
- Hubbard, Douglas. *How to Measure Anything*. 3ª ed. Wiley, 2014.
