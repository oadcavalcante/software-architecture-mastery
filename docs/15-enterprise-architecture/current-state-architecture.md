---
id: current-state-architecture
title: Arquitetura do Estado Atual
sidebar_position: 17
description: O que existe de fato — e por que o diagrama de dois anos atrás não conta.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor mantém uma visão do estado atual derivada da realidade, com
  o nível de detalhe que o uso justifica.
prerequisites: [enterprise-architecture]
related: [target-architecture, transition-architecture, application-portfolios]
canonical_for: [estado atual, levantamento de arquitetura, dívida arquitetural visível]
content_version: 1
last_reviewed: 2026-08-28
---

# Arquitetura do Estado Atual

## Visão Geral

O estado atual é a descrição do que existe: quais sistemas, o que eles fazem, como se
integram, quem é dono, e em que estado estão.

Ele é o ponto de partida de qualquer plano — e é, na maioria das organizações, a peça
mais desatualizada.

O problema não é preguiça. É que a descrição feita à mão envelhece mais rápido do que
alguém consegue mantê-la, e o esforço de atualizar não tem retorno visível até o momento
em que ela é necessária.

## Problema

O padrão recorrente: um levantamento é feito para um projeto, produz diagramas
detalhados, e é arquivado.

Seis meses depois, ele descreve um sistema que mudou. Um ano depois, ele é enganoso —
e enganoso é pior que ausente, porque decisões são tomadas sobre ele.

E há um problema anterior: o levantamento tradicional captura a topologia declarada, não
a real. Integrações informais, acessos diretos ao banco alheio, processos que rodam numa
máquina esquecida — nada disso aparece num diagrama desenhado em reunião.

## Conceitos Centrais

### Derivar, não desenhar

A regra que decide se o estado atual sobrevive:

```text
derivado    do catálogo de serviços, do rastreamento, da infraestrutura declarada,
            da esteira, das métricas de custo
desenhado   por alguém, em reunião, a partir do que se lembra
```

Ver [rastreamento distribuído](/13-observability/distributed-tracing.md) — o mapa de
dependências real vem dali, não de entrevistas.

O que é derivado se mantém sozinho. O que é desenhado envelhece.

Nem tudo pode ser derivado — capacidades de negócio, propriedade, criticidade exigem
julgamento humano. Mas a parte que muda mais rápido — topologia, dependências, versões,
custo — pode.

### O detalhe precisa ser justificado pelo uso

```text
inventário          o que existe, quem é dono, criticidade — sempre útil
dependências        quem chama quem — útil para avaliar impacto
fluxos de dado      onde a informação nasce e circula — útil para propriedade
diagrama detalhado  de cada sistema — útil apenas para quem vai mexer nele
```

O erro de escopo mais comum: tentar documentar tudo no mesmo nível de detalhe. O
resultado é um esforço grande que produz um artefato que ninguém consulta.

O detalhe fino pertence ao time do sistema, e vive junto do código. Ver
[documentação de arquitetura](/17-architecture-documentation/index.md).

### A realidade inclui o que ninguém declarou

O levantamento que só consulta os times perde:

```text
acessos diretos ao banco de outro sistema
processos agendados em máquinas sem dono
integrações por arquivo, feitas anos atrás
sistemas que ninguém sabe que existem
consumidores desconhecidos de uma API
```

A forma de encontrar é observar, não perguntar: registros de acesso ao banco, tráfego de
rede, catálogo de recursos de nuvem, custo por recurso.

E o achado típico desse exercício é desconfortável e valioso: uma parcela das
integrações críticas não está em nenhum diagrama.

### O estado precisa incluir saúde, não só topologia

Um mapa que mostra o que existe e não mostra em que estado está serve para pouco.

```text
técnico       versões, dívida, cobertura de testes, frequência de incidente
operacional   quem mantém, quantas pessoas conhecem, sobreaviso
custo         quanto consome
negócio       criticidade, capacidade que suporta
```

A segunda linha é a que costuma revelar o risco mais imediato: um sistema crítico com um
único mantenedor é uma exposição que nenhuma métrica técnica captura.

Ver [capacidades de negócio](/15-enterprise-architecture/business-capabilities.md) — o cruzamento com criticidade é
o que transforma inventário em prioridade.

### Bom o suficiente, e atualizado

Um mapa 70% correto e atualizado semanalmente vale mais que um 95% correto e
desatualizado em dezoito meses.

Isso muda o critério de qualidade: em vez de perseguir completude, perseguir
**frescor** — e aceitar que partes do mapa serão aproximadas.

E aceitar lacunas explícitas: marcar "não sabemos" é mais honesto e mais útil que
preencher com suposição.

### Ele existe para decidir, não para documentar

O teste de valor: **que decisão este artefato ajuda a tomar?**

```text
onde investir                    → precisa de custo e criticidade
o que aposentar                  → precisa de uso e dependências
o que quebra se eu mudar isto    → precisa de dependências reais
qual o risco de pessoas          → precisa de quem mantém
```

Um levantamento que não responde a nenhuma dessas perguntas foi feito para um processo,
não para uma decisão.

## Modelo Mental

**Derivado e atualizado vale mais que completo e velho.** O estado atual existe para
decidir, não para documentar.

## Quando Usar

- Antes de qualquer plano de modernização.
- Para avaliar impacto de mudanças.
- Em decisões de investimento e aposentadoria.
- Para identificar risco de concentração de conhecimento.
- Após aquisições, para entender o que veio junto.

## Quando Não Usar

**Desenhado à mão** o que pode ser derivado.

**Com detalhe uniforme** em todos os sistemas.

**Sem incluir saúde e criticidade.**

**Consultando apenas os times**, sem observar a realidade.

**Como entregável de projeto**, sem uso contínuo.

**Perseguindo completude** em vez de frescor.

## Alternativas

- **Catálogo de serviços derivado** — a versão mínima e a mais sustentável. Ver
  [plataformas internas](/14-devops-and-platform/internal-developer-platforms.md).
- **Mapa de dependências por rastreamento** — automático e real.
- **Inventário de custo por sistema** — derivado da marcação de recursos.
- **Levantamento sob demanda** — detalhar apenas a área que vai ser mexida.

A última é a mais econômica: em vez de mapear tudo, mapear profundamente o que está
prestes a mudar.

## Trade-offs

| Derivado | Desenhado |
|---|---|
| Sempre atual | Envelhece |
| Limitado ao instrumentado | Captura julgamento |
| Baixo custo de manutenção | Alto |
| Topologia real | Topologia declarada |

| Completo | Focado |
|---|---|
| Cobertura ampla | Profundidade onde importa |
| Caro de manter | Sustentável |
| Envelhece por inteiro | Renovado sob demanda |

## Modos de Falha

**Diagrama desatualizado usado como verdade.**

**Integrações informais invisíveis.**

**Detalhe excessivo abandonado.**

**Sem saúde nem criticidade.** Um inventário que não prioriza nada.

**Levantamento como projeto.** Feito uma vez, nunca mais.

**Suposição preenchendo lacuna.** Pior que a lacuna declarada.

## Erros Comuns

**Desenhar em vez de derivar.** Diagrama feito de memória descreve a arquitetura pretendida. O estado atual sai de inventário de nuvem, repositórios, tráfego real e faturamento.

**Consultar sem observar.** As pessoas descrevem os fluxos principais e esquecem as integrações antigas, os relatórios mensais e os acessos diretos ao banco — que são exatamente o que costuma quebrar numa migração.

**Documentar tudo no mesmo detalhe.** O esforço se dilui e o que importa não fica mais visível que o resto. O detalhe deve seguir a criticidade e a intenção de mudança.

**Não incluir quem mantém.** Sistema sem responsável identificado é o achado mais acionável de todo o levantamento, e some quando o mapa registra só caixas e setas.

**Tratar como entregável.** Um retrato do estado atual desatualiza em semanas. Ou é derivado de fontes vivas, ou é um documento com data de validade curta.

**Não marcar o que não se sabe.** Lacuna não declarada é lida como ausência de problema. Marcar "não sabemos quem usa isto" é informação, e das mais úteis.

## Exemplo Real

Uma empresa de saúde iniciou um programa de modernização e começou pelo levantamento do
estado atual. A abordagem inicial: entrevistas com os times, produzindo diagramas.

O levantamento levou quatro meses e produziu 68 diagramas.

Um piloto de modernização, três meses depois, revelou o problema: ao desativar um sistema
que os diagramas mostravam sem consumidores, três processos quebraram.

Os consumidores eram: um processo agendado numa máquina virtual sem dono, um relatório
que lia direto do banco, e uma integração por arquivo feita seis anos antes.

Nenhum aparecia nos diagramas, porque ninguém entrevistado sabia deles.

A reformulação mudou o método:

**Dependências por observação.** Registros de acesso ao banco, tráfego de rede e
rastreamento distribuído passaram a alimentar o mapa. Isso revelou 40% mais integrações
que as entrevistas.

**Catálogo derivado** da esteira e da infraestrutura declarada: o que existe, qual
versão, quem publica.

**Custo por sistema**, derivado da marcação de recursos. Ver
[arquitetura de custo](/09-cloud-architecture/cost-architecture.md).

**Saúde e propriedade** — as únicas dimensões preenchidas à mão, revisadas
trimestralmente com os times. Elas exigem julgamento e mudam devagar.

**Lacunas explícitas.** Sistemas sem dono identificado ficaram marcados como tal — e a
lista deles virou uma tarefa, em vez de um espaço em branco.

Foram 14 sistemas sem dono, dos quais 4 ninguém sabia para que serviam. Dois foram
desativados após três meses de monitoramento sem acesso.

**Detalhe sob demanda.** Os 68 diagramas foram descartados. Cada iniciativa de
modernização produz o detalhe da área que vai mexer, no momento em que vai mexer.

O que a equipe registra: os quatro meses de entrevistas produziram uma descrição do que
as pessoas acreditavam existir. A observação produziu o que existia — e a diferença entre
as duas era exatamente onde os riscos estavam.

## Conceitos Relacionados

- [Arquitetura Alvo](/15-enterprise-architecture/target-architecture.md) — o destino.
- [Arquitetura de Transição](/15-enterprise-architecture/transition-architecture.md) — o caminho.
- [Portfólio de Aplicações](/15-enterprise-architecture/application-portfolios.md).
- [Paisagens de Integração](/15-enterprise-architecture/integration-landscapes.md).

## Exercício Prático

Pegue um sistema que seu inventário mostra sem consumidores e verifique nos registros de
acesso quem o consultou nos últimos 30 dias.

A diferença entre o declarado e o observado é a medida do seu estado atual.

## Perguntas de Entrevista

- Por que derivar vale mais que desenhar?
- O que a observação encontra que a entrevista não encontra?
- Por que frescor vale mais que completude?

## Para Aprofundar

- Ross, Jeanne et al. *Enterprise Architecture as Strategy*. HBS Press, 2006.
- Feathers, Michael. *Working Effectively with Legacy Code*. Prentice Hall, 2004.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
