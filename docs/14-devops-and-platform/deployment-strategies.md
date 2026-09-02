---
id: deployment-strategies
title: Estratégias de Implantação
sidebar_position: 4
description: Como a versão nova substitui a antiga — e o critério para escolher entre as opções.
doc_type: tradeoff
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escolhe a estratégia de implantação a partir do risco da
  mudança e do custo de reverter.
prerequisites: [ci-cd]
related: [blue-green, canary, rolling-deployments]
canonical_for: [estratégia de implantação, implantação sem interrupção, janela de exposição, compatibilidade entre versões]
content_version: 2
last_reviewed: 2026-08-28
---

# Estratégias de Implantação

## Visão Geral

A pergunta que as estratégias respondem: **como a versão nova substitui a antiga sem
derrubar o serviço, e o que acontece se ela estiver errada?**

As três principais:

```text
em ondas     substitui gradualmente as instâncias
blue-green   dois ambientes completos, troca instantânea
canary       fração pequena do tráfego, com comparação e decisão
```

Elas não são alternativas de gosto. Cada uma tem um custo e protege contra coisas
diferentes, e a escolha vem do risco da mudança.

## Problema

Num sistema estável, a mudança é a principal fonte de incidentes — o que faz da implantação
o momento em que o risco se concentra. É a premissa do capítulo 27 de Beyer et al. (2016),
listado em Para Aprofundar, e a razão de ele tratar implantação como problema de
confiabilidade e não de processo.

Isso não significa implantar menos — o oposto, ver
[integração contínua](/14-devops-and-platform/ci-cd.md). Significa que **como** se implanta importa.

Sem estratégia, a implantação é uma troca abrupta: a versão nova substitui a antiga, e
se ela estiver errada, todos os usuários sentem, até alguém perceber e reverter.

## Conceitos Centrais

### O que cada estratégia protege

```text
em ondas     protege contra indisponibilidade durante a troca
             não protege contra versão ruim — ela vai para todos, aos poucos
blue-green   protege contra indisponibilidade e permite reversão instantânea
             não detecta o problema — alguém precisa perceber
canary       detecta o problema automaticamente e limita a exposição
             mais complexo, exige métricas comparáveis
```

Ver [implantação em ondas](/14-devops-and-platform/rolling-deployments.md),
[blue-green](/14-devops-and-platform/blue-green.md) e [canary](/14-devops-and-platform/canary.md).

A distinção central: **em ondas e blue-green são mecanismos de substituição; canary é um
mecanismo de verificação.** Eles se combinam — uma implantação canary bem-sucedida
costuma terminar com uma implantação em ondas do restante.

### Compatibilidade entre versões é o pré-requisito

Durante qualquer implantação gradual, as duas versões coexistem. Isso impõe:

```text
esquema de banco     compatível nas duas direções
formato de mensagem  a versão antiga precisa ler o que a nova escreve
contrato de API      sem mudança incompatível
estado compartilhado sessão, cache — legíveis por ambas
```

Ver [evolução de esquema](/08-integration-architecture/schema-evolution.md).

Sem isso, a única estratégia possível é parar tudo e trocar — que é o que se quer
evitar.

O padrão que resolve: **expandir, migrar, contrair**. Adicionar o novo mantendo o
antigo; migrar; remover o antigo numa implantação posterior. Três implantações em vez de
uma, e nenhuma incompatível.

### A janela de exposição é o que se otimiza

```text
troca abrupta   100% dos usuários, imediatamente
em ondas        fração crescente, ao longo de minutos
blue-green      0% ou 100%, com reversão instantânea
canary          1% a 5%, por tempo definido, antes de expandir
```

Quanto menor a fração exposta e mais rápida a detecção, menor o dano de uma versão ruim.

Canary minimiza os dois. Custa infraestrutura de comparação e exige volume: a fração sozinha
não diz nada, e o que conta é quantos eventos chegam a cada lado no período. Ver
[canary](/14-devops-and-platform/canary.md), onde o critério está desenvolvido.

### Reverter precisa ser mais fácil que corrigir

O princípio operacional que orienta tudo: sob pressão, reverter primeiro e investigar depois,
com o sistema estável. Mas isso só é a decisão certa **enquanto a reversão for barata** — e é
por isso que os quatro requisitos abaixo são requisitos, e não recomendações. Onde a migração
já rodou ou o estado já divergiu, reverter deixa de ser automático e passa a ser uma decisão
com risco próprio, que precisa ser pensada no meio do incidente. Manter a reversão barata é o
que evita essa situação.

A reversão precisa ser:

```text
rápida       minutos, não a duração de uma implantação completa
automática   ou com um comando, sem procedimento longo
segura       sem perda de dados, sem estado incompatível
testada      exercitada, não presumida
```

A terceira é a que costuma falhar: reverter o código é fácil; reverter uma migração de
banco que já rodou, não. É por isso que migrações compatíveis são pré-requisito.

Ver [resiliência](/12-reliability/resilience.md) — reversibilidade vale mais que
acerto.

### A escolha vem do risco

```text
mudança de baixo risco, boa cobertura     em ondas
mudança que exige reversão instantânea    blue-green
mudança de comportamento, risco alto      canary
mudança de infraestrutura ou de versão    blue-green
mudança de algoritmo com efeito medível   canary com comparação
```

E há uma combinação comum e boa: **canary para verificar, em ondas para completar**. A
fração inicial valida; o resto vai gradualmente.

### Implantar não é liberar

Ver [feature flags](/14-devops-and-platform/feature-flags.md). Com flags, o código pode ir a produção desativado,
e a liberação vira uma decisão separada, reversível em segundos.

Isso muda o cálculo: a implantação passa a ser de baixo risco — o código novo não faz
nada — e o risco se concentra na liberação, que é controlável independentemente.

Times que combinam as duas técnicas implantam com frequência alta e liberam com cuidado.

## Modelo Mental

**A estratégia decide quantos usuários vêem a versão errada, e por quanto tempo.** O
resto é consequência.

## Quando Usar

- **Em ondas:** mudanças rotineiras, com boa cobertura de testes.
- **Blue-green:** quando a reversão precisa ser instantânea, ou a mudança é de
  infraestrutura.
- **Canary:** mudanças de comportamento com risco, onde há métricas comparáveis.
- **Combinado:** canary para verificar, ondas para completar.

## Quando Não Usar

**Qualquer estratégia gradual sem compatibilidade entre versões.**

**Canary abaixo do volume que torna a comparação significativa** — o
[critério](/14-devops-and-platform/canary.md) é o número de eventos por lado, não a fração.

**Blue-green sem capacidade para o ambiente duplicado.**

**Sem reversão testada.**

**Sem monitoramento durante a implantação.** Gradual sem observação é só lento.

## Alternativas

- **Implantação com parada** — legítima para sistemas que toleram janela, e muito mais
  simples.
- **[Feature flags](/14-devops-and-platform/feature-flags.md)** — separam implantar de liberar, reduzindo o risco
  de ambos.
- **Implantação sombra** — a versão nova recebe cópia do tráfego sem responder ao
  usuário. Verifica comportamento com risco zero, ao custo de dobrar a carga.

A última vence quando o comportamento novo pode ser comparado com o antigo sem que o usuário
receba a resposta — mudança de algoritmo, de ranqueamento, de motor de consulta — e o custo de
processar o tráfego duas vezes é aceitável.

## Trade-offs

| Em ondas | Blue-green | Canary |
|---|---|---|
| Sem capacidade extra | Dobra o ambiente | Pouca extra |
| Reversão gradual | Instantânea | Instantânea |
| Não detecta | Não detecta | Detecta |
| Simples | Simples | Complexo |
| Duas versões coexistem | Coexistem na troca | Coexistem |

## Modos de Falha

**Versões incompatíveis coexistindo.**

**Reversão impossível.** Migração já aplicada.

**Detecção tardia.** A versão ruim já foi para todos.

**Capacidade insuficiente durante a troca.** Em ondas com instâncias fora reduz
capacidade.

**Estado compartilhado incompatível.** Sessão escrita pela versão nova, lida pela
antiga.

**Implantação sem observação.** Gradual, e ninguém olhando.

**Reversão que não reverte.** O código voltou, o dado migrado não.

## Erros Comuns

**Não tornar migrações compatíveis.**

**Escolher a estratégia por hábito**, não por risco.

**Não testar a reversão.**

**Canary sem critério automático** de promoção ou reversão.

**Não monitorar durante a implantação.**

**Blue-green sem verificar o ambiente novo** antes de trocar.

## Exemplo Real

Uma plataforma de reservas usava implantação em ondas para tudo, com reversão manual.

Um incidente expôs os limites: uma mudança no cálculo de disponibilidade tinha um erro
que só aparecia com dados reais de certos hotéis — cerca de 4% das buscas retornavam
resultado errado, sem erro nem lentidão.

A plataforma atendia cerca de 240 buscas por segundo. A implantação em ondas levou a versão
a todas as instâncias em 12 minutos, e o problema foi detectado 6 horas depois, por um
parceiro — mais de 200 mil buscas com disponibilidade incorreta, algumas delas viradas em
reservas que precisaram ser canceladas.

Nenhuma métrica técnica mudou: latência normal, sem erros, tráfego normal.

As mudanças:

**Canary para mudanças de comportamento**, com comparação automática de métricas de negócio —
taxa de conversão, distribuição de resultados, valor médio. A fração e a janela saíram do
[critério de significância](/14-devops-and-platform/canary.md), não de um número redondo:

```text
5% de 240 buscas/s por 45 min   ~32 mil buscas por lado
defeito em 4% delas             ~1,3 mil casos no canary
```

Os 2% por 30 minutos que a equipe tinha proposto primeiro dariam 8,6 mil buscas e 350 casos —
detectável, mas com margem estreita demais para um limiar automático que não pode disparar por
ruído. O desenho do canary está no canônico; o que este documento decide é **quando** usá-lo.

A comparação de **distribuição de resultados** foi o que teria pego o problema: a versão
nova retornava significativamente menos opções para um subconjunto de buscas.

**Em ondas mantido** para mudanças de baixo risco, que são a maioria.

**Blue-green para mudanças de infraestrutura** — versão de tempo de execução, migração
de biblioteca base.

**Reversão automatizada**, disparada pela comparação do canary, com tempo medido de 90
segundos.

**Migrações compatíveis** obrigatórias, verificadas na revisão.

**Classificação de risco** na abertura da mudança, definindo a estratégia — com o autor
declarando se altera comportamento observável.

Nos doze meses seguintes, o canary reverteu automaticamente sete implantações. Três
seriam incidentes de comportamento silencioso como o original.

O ponto que a equipe sublinha: a implantação em ondas nunca foi errada — ela protege contra
indisponibilidade, e fazia isso bem. Ela simplesmente não protege contra o que
aconteceu, e ninguém tinha feito essa distinção.

## Conceitos Relacionados

- [Blue-Green](/14-devops-and-platform/blue-green.md), [Canary](/14-devops-and-platform/canary.md),
  [Implantação em Ondas](/14-devops-and-platform/rolling-deployments.md).
- [Feature Flags](/14-devops-and-platform/feature-flags.md) — separar implantar de liberar.
- [Integração Contínua](/14-devops-and-platform/ci-cd.md).
- [Evolução de Esquema](/08-integration-architecture/schema-evolution.md).

## Exercício Prático

Classifique as últimas vinte mudanças implantadas em três grupos: as que alteram
comportamento observável pelo usuário, as que alteram só infraestrutura, e as que não alteram
nenhum dos dois. Depois confira qual estratégia cada uma usou.

A pergunta é quantas mudanças do primeiro grupo foram implantadas com uma estratégia que
protege contra indisponibilidade e não contra comportamento errado. Esse é o mesmo descasamento
do Exemplo Real, e ele costuma estar invisível porque nenhuma dessas implantações falhou.

Esse número é o limite inferior da duração de qualquer incidente causado por
implantação.

## Perguntas de Entrevista

- O que cada estratégia protege, e o que ela não protege?
- Por que compatibilidade entre versões é pré-requisito?
- Por que reverter deve ser mais fácil que corrigir?

## Para Aprofundar

- Humble, Jez; Farley, David. *Continuous Delivery*. Addison-Wesley, 2010.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — capítulo 27.
