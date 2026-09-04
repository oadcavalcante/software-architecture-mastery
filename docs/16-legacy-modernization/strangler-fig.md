---
id: strangler-fig
title: Strangler Fig
sidebar_position: 3
description: Substituir gradualmente com o antigo em operação — o padrão que torna a modernização viável.
doc_type: pattern
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor aplica estrangulamento com ponto de interceptação adequado e
  plano de desligamento.
prerequisites: [legacy-modernization]
related: [incremental-modernization, migration-strategies, transition-architecture]
canonical_for: [strangler fig, ponto de interceptação, fachada de migração, desligamento gradual]
content_version: 2
last_reviewed: 2026-08-28
---

# Strangler Fig

## Visão Geral

O padrão strangler fig substitui um sistema **gradualmente**: uma camada intercepta as
chamadas e as roteia — inicialmente todas para o sistema antigo, progressivamente mais
para o novo — até que o antigo possa ser desligado.

O nome vem de uma planta que cresce em torno de uma árvore hospedeira até substituí-la.

É o padrão que torna a modernização viável, porque remove a condição que faz reescritas
falharem: a necessidade de terminar tudo antes de entregar qualquer coisa.

## Problema

A substituição por reescrita completa tem uma dinâmica desfavorável:

```text
o sistema antigo continua evoluindo enquanto o novo é construído
o novo persegue um alvo em movimento
o valor só aparece na troca
a troca é um evento de alto risco
uma interrupção do projeto desperdiça tudo
```

Ver [reconstrução](/16-legacy-modernization/rebuilding.md).

O padrão inverte: o valor aparece desde a primeira funcionalidade migrada, e o
risco é distribuído em muitas trocas pequenas.

## Conceitos Centrais

### O ponto de interceptação decide a viabilidade

A camada que roteia precisa existir em algum lugar:

```text
gateway ou proxy HTTP    intercepta requisições — o mais simples de montar
fachada na aplicação     um módulo que decide para onde delegar
evento                   o novo consome os mesmos eventos que o antigo
interface de usuário     telas migradas uma a uma
```

Base compartilhada não entra nesta lista: ela não desvia chamada nenhuma, é arranjo de
fonte de dados durante a coexistência — tratado adiante, em "os dados são a parte
difícil".

A escolha depende de onde é possível interceptar **sem modificar o sistema antigo** — que
é frequentemente a restrição real, porque modificá-lo pode ser exatamente o que não se
consegue fazer.

Quando não há ponto de interceptação natural, criar um é o primeiro trabalho do projeto —
e ele frequentemente é subestimado.

### Escolher o que migrar primeiro

Três critérios competem:

```text
valor            a funcionalidade que resolve o motivo da modernização
risco            a que, se quebrar, causa menos dano
independência    a que tem menos dependências com o resto
```

A escolha usual e boa: **começar por algo pequeno e independente, para validar o
caminho**, e ir para o valor logo depois.

O erro comum é começar pelo mais fácil e permanecer nele — migrando o periférico por
meses, sem tocar no que motivou o projeto. Isso produz progresso visível e valor nenhum.

E o erro oposto: começar pelo mais crítico, sem ter validado o mecanismo de
interceptação, de migração de dados e de reversão.

### Os dados são a parte difícil

Interceptar chamadas é mecânico. Decidir onde os dados vivem, durante a coexistência,
não é.

```text
antigo é a fonte      o novo lê de lá — simples, e acopla ao esquema antigo
novo é a fonte        o antigo lê de lá — exige mudar o antigo
escrita dupla         os dois escrevem — divergência a gerenciar
por fatia             cada entidade tem uma fonte, conforme a migração avança
```

Ver [migração de dados](/16-legacy-modernization/data-migration.md) e
[arquitetura de transição](/15-enterprise-architecture/transition-architecture.md).

A última opção é a que costuma funcionar e a mais trabalhosa: a fonte da verdade muda por
entidade, conforme ela é migrada, e o roteamento precisa saber disso.

### Reversível a cada passo

A propriedade que torna o padrão seguro:

```text
migrou uma funcionalidade → deu problema → roteia de volta
```

Isso exige que o sistema antigo permaneça **funcional** durante toda a transição — não
apenas ligado, mas capaz de assumir.

E exige que os dados sejam compatíveis nos dois sentidos, o que é a restrição que mais
limita. Se o novo grava algo que o antigo não entende, a volta deixa de ser possível.

### O desligamento precisa ser planejado desde o início

O modo de falha característico do padrão: a coexistência vira permanente.

```text
80% migrado, os 20% restantes são os casos difíceis
o valor principal já foi entregue
a prioridade migra para outra coisa
os dois sistemas permanecem, com custo dobrado
```

Isso é comum e caro. O que evita:

**Critério de conclusão definido** no início, para cada fatia.

**Os casos difíceis mapeados cedo**, para que não sejam surpresa no fim.

**Desligamento como entrega**, com data, e não como consequência natural.

**Monitorar o que ainda usa o antigo**, para que a fatia restante seja visível.

Ver [arquitetura de transição](/15-enterprise-architecture/transition-architecture.md).

### A camada de interceptação é temporária, e frequentemente não é

Ela é construída para a migração e tende a permanecer — virando uma peça permanente com
lógica de roteamento que ninguém entende depois.

Removê-la ao fim da migração precisa estar no plano, ou ela vira o legado seguinte.

## Modelo Mental

**O novo cresce em volta do antigo até substituí-lo.** Cada passo é reversível, e o
desligamento é uma entrega, não uma consequência.

## Quando Usar

- Substituição de sistema em produção que não pode parar.
- Onde a reescrita completa é arriscada demais.
- Quando o valor precisa aparecer antes do fim.
- Onde há ponto de interceptação viável.
- Quando o sistema antigo continuará evoluindo durante a transição.

## Quando Não Usar

**Sem ponto de interceptação viável**, e sem poder criar um.

**Sem plano de desligamento.**

**Quando reescrever inteiro leva semanas, não anos.** É o limiar de
[reconstruir](/16-legacy-modernization/rebuilding.md): abaixo dele, a camada de
roteamento, a coexistência de dados e o plano de desligamento custam mais que o
sistema que se quer substituir.

**Sem compatibilidade de dados** nos dois sentidos.

**Quando o que motivou o projeto não cabe nas primeiras fatias.** Se a razão de
modernizar está no núcleo e ele só pode ser tocado no fim, o padrão entrega dois anos de
risco antes do primeiro benefício — e é assim que a migração perde o patrocínio no meio.

**Quando o antigo será descontinuado por outra razão** antes de a migração terminar.

## Alternativas

- **[Reconstrução](/16-legacy-modernization/rebuilding.md)** — quando o sistema é pequeno ou o comportamento
  precisa mudar radicalmente.
- **[Refatoração](/16-legacy-modernization/legacy-refactoring.md)** — quando o problema é interno, não de
  substituição.
- **[Replataforma](/16-legacy-modernization/replatforming.md)** — quando o problema é a infraestrutura, não o
  código.
- **Coexistência permanente** — decisão legítima quando os casos restantes não justificam
  migrar, desde que registrada.

## Trade-offs

| Estrangulamento | Reescrita completa |
|---|---|
| Valor desde cedo | Só no fim |
| Risco distribuído | Concentrado na troca |
| Coexistência prolongada | Sem coexistência |
| Camada de interceptação a manter | Nenhuma |
| Sobrevive a interrupção | Desperdiça tudo |

| Interceptar no gateway | Na aplicação |
|---|---|
| Não modifica o antigo | Exige modificá-lo |
| Granularidade de rota | Mais fina |

## Modos de Falha

**Coexistência permanente.** Os 20% difíceis nunca migram.

**Sem ponto de interceptação.** O projeto não começa.

**A camada de roteamento cai.** Ela fica no caminho de 100% do tráfego durante toda a
transição, e passa a exigir a disponibilidade da soma dos dois sistemas — mais um salto de
rede em cada chamada. É [ponto único de falha por
construção](/08-integration-architecture/api-gateways.md), e a migração costuma tratá-la
como detalhe de infraestrutura até o primeiro incidente.

**Migração do periférico.** Progresso sem valor.

**Volta impossível.** Os dados divergiram.

**Camada de interceptação virando permanente.**

**O antigo evoluindo mais rápido que a migração.**

**Casos difíceis descobertos no fim.**

## Erros Comuns

**Não planejar o desligamento.** Sem critério e data para desligar o antigo, a empresa opera e paga os dois sistemas indefinidamente — e a estratégia entrega custo em vez de economia.

**Começar pelo fácil e permanecer nele.** As partes simples saem rápido e dão sensação de progresso; o que sobra é todo o difícil, e o apoio já foi gasto.

**Não mapear os casos difíceis cedo.** Descobrir no décimo mês que uma funcionalidade não é extraível muda a viabilidade da estratégia inteira — e é informação que se obtém no primeiro.

**Não manter compatibilidade de dados nos dois sentidos.** Durante a convivência, a fonte da verdade muda de lado. Compatibilidade só de ida impede reverter a fatia.

**Não monitorar o que ainda usa o antigo.** Sem medir o tráfego residual, ninguém sabe se restou um consumidor esquecido — e o desligamento vira aposta.

**Não remover a camada de interceptação ao fim.** Ela era andaime; mantida depois do desligamento, vira indireção permanente que ninguém entende mais por que existe.

## Exemplo Real

Um banco substituiu o sistema de originação de crédito — 16 anos, monolítico, com release
trimestral — por estrangulamento.

O ponto de interceptação: um gateway HTTP na frente, roteando por endpoint.

A sequência:

**Fatia 1 — consulta de propostas.** Somente leitura, sem risco de escrita. Validou o
mecanismo de interceptação, o roteamento e a observabilidade. Três meses.

**Fatia 2 — simulação de crédito.** A funcionalidade que motivou o projeto: simulações
levavam 40 segundos e o negócio queria menos de 3. Entregue no mês 7, com o valor
principal já capturado.

**Fatias 3 a 8 — o restante da originação**, por tipo de produto.

**Fatia 9 — os casos difíceis.** Convênios com empresas parceiras, com regras específicas
por convênio, algumas negociadas individualmente.

Essa última fatia foi mapeada no mês 4, não no fim — e a decisão sobre ela mudou o
plano: dos 340 convênios, 290 seguiam três padrões, e 50 eram únicos.

Os 290 foram migrados. Os 50 foram **negociados** — os clientes migraram para um dos três
padrões, com incentivo comercial. Foi mais barato que implementar 50 exceções no sistema
novo.

Essa decisão só foi possível porque os casos difíceis apareceram cedo, com tempo para
negociar.

**Desligamento** no mês 22, tratado como entrega com data.

Dois problemas durante a execução:

**Escrita dupla divergindo.** Durante quatro meses, propostas eram gravadas nos dois
sistemas. Divergências apareceram em cerca de 0,4% dos casos — regras de arredondamento
diferentes. A reconciliação diária detectou, e a correção foi rápida porque a divergência
era visível. Ver
[consistência de dados](/07-data-architecture/data-consistency.md).

**Gateway virando permanente.** Ao fim da migração, o gateway tinha 200 regras de
roteamento. A remoção dele foi tratada como tarefa própria, no mês 24 — e foi
necessário insistir, porque "está funcionando".

O que a equipe registra: mapear os casos difíceis no mês 4 foi a decisão que mais afetou
o resultado. Ela transformou o que teria sido um bloqueio de fim de projeto numa
negociação comercial com dezoito meses de antecedência.

## Conceitos Relacionados

- [Modernização Incremental](/16-legacy-modernization/incremental-modernization.md) — a disciplina.
- [Migração de Dados](/16-legacy-modernization/data-migration.md) — a parte difícil.
- [Arquitetura de Transição](/15-enterprise-architecture/transition-architecture.md).
- [Anti-Corruption Layer](/08-integration-architecture/integration-anti-corruption.md).

## Exercício Prático

Para um sistema que você consideraria substituir, identifique onde seria possível
interceptar as chamadas sem modificá-lo.

Se não houver ponto viável, criar um é o primeiro trabalho — e ele precisa estar na
estimativa.

## Perguntas de Entrevista

- Por que o strangler fig remove a condição que faz reescritas falharem?
- Por que mapear os casos difíceis cedo importa tanto?
- Por que a coexistência tende a virar permanente?

## Para Aprofundar

- Fowler, Martin. *StranglerApplication*, 2004 — renomeado depois para
  *StranglerFigApplication*, e é por esse título que a entrada é encontrada hoje.
- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Feathers, Michael. *Working Effectively with Legacy Code*. Prentice Hall, 2004.
