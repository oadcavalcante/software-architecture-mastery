---
id: technical-roadmaps
title: Roadmaps Técnicos
sidebar_position: 14
description: Sequenciar investimento técnico de forma que cada etapa entregue valor e o plano sobreviva a mudanças de prioridade.
doc_type: concept
level: 7
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor sequencia trabalho técnico por valor entregue e por reversibilidade,
  com cada fase terminando em estado estável.
prerequisites: [technical-strategy-leadership]
related: [technical-strategy-leadership, architecture-vision, risk-management]
canonical_for: [roadmap técnico, sequenciamento por valor, fase que termina estável]
content_version: 2
last_reviewed: 2026-08-29
---

# Roadmaps Técnicos

## Visão Geral

Um roadmap técnico sequencia o investimento em arquitetura. A parte difícil não é escolher o que
fazer — a estratégia já escolheu. É escolher **a ordem**.

```text
a ordem errada   nada entrega valor até o fim, e o plano é
                 cancelado no meio
a ordem certa    cada fase entrega algo, e o plano sobrevive
                 a mudanças de prioridade
```

E há uma restrição que o formato típico, descrito abaixo, não respeita e que decide se o roadmap sobrevive:
**cada fase precisa terminar em um estado em que o trabalho pode parar sem deixar nada pela
metade.**

Num horizonte de 12 a 24 meses, o risco que costuma encerrar um projeto técnico não é falta de
mérito: é mudança de prioridade, troca de liderança ou contingenciamento — e, quando ele se
realiza, o que resta é o que estava concluído.

## Problema

O roadmap técnico típico:

```text
fase 1  fundação: infraestrutura, plataforma, framework
fase 2  migração dos primeiros sistemas
fase 3  migração do resto
fase 4  desligamento do antigo
```

Doze a vinte e quatro meses, com valor entregue apenas a partir da fase 2 ou 3. Se o plano for
interrompido na fase 1 — o que acontece com frequência —, o resultado é infraestrutura sem uso e
nenhum benefício.

E há o erro de sequência oposto: começar pelo mais valioso sem construir a base, o que produz uma
primeira entrega e um custo crescente nas seguintes.

O erro comum aos dois: sequenciar por lógica técnica em vez de por valor e risco.

## Conceitos Centrais

### Sequencie por valor entregue cedo

```text
critério errado   "o que precisa vir primeiro tecnicamente"
critério certo    "o que entrega resultado observável mais cedo,
                  dado o que é tecnicamente possível"
```

Frequentemente a resposta é uma capacidade **nova**, e não uma migração — porque ela não tem
regressão a evitar e produz resultado visível. Ver o
[case de e-commerce](/21-case-studies/ecommerce.md), em que a primeira fase foi a capacidade
que não existia.

### Cada fase termina estável

É o teste de [entrega intermediária](/15-enterprise-architecture/architecture-roadmaps.md) aplicado à fase de um roadmap técnico:

```text
"ao fim da fase 2, se o projeto parar, o que fica?"
```

Se a resposta for "um sistema pela metade", a fase está mal desenhada. Reorganizá-la para terminar
em estado consistente custa algum esforço e compra sobrevivência.

Essa disciplina produz planos melhores mesmo quando a interrupção não acontece: ela força
decomposição em unidades que fazem sentido isoladamente. Ver o
[case de modernização de legado](/21-case-studies/legacy-modernization-case.md).

### A primeira fase paga as seguintes, quando possível

```text
fase 1 que reduz custo    financia o restante e reduz a
                          dependência de aprovação
fase 1 que gasta          exige que o patrocínio se sustente
                          por todo o plano
```

Nem sempre é possível, e quando é, muda a política do projeto: um plano autossustentado a partir
do quarto mês não precisa ser reaprovado. Ver o
[case de delivery](/21-case-studies/food-delivery.md).

### Marcos, não datas precisas

```text
frágil   "migração concluída em 14 de março"
robusto  "migração concluída quando os três sistemas críticos
         estiverem no novo, com equivalência comprovada"
```

Quando usar datas e como a precisão decresce com o horizonte está em
[roteiros de arquitetura](/15-enterprise-architecture/architecture-roadmaps.md). O que é próprio do roadmap técnico é o marco por condição:
ele sobrevive a atraso e pode ser verificado por quem não participou do plano.

### Declare o que cada fase não faz

```text
"a fase 1 não migra nenhum dado histórico, e não desliga
 nada do sistema antigo"
```

É a regra de [mostrar o que não está no roteiro](/15-enterprise-architecture/architecture-roadmaps.md) aplicada à fase: permite que ela seja
avaliada pelo que prometeu. Ver [comunicação](/23-architecture-leadership/communication.md).

### Roadmap técnico compete com produto

Essa é a realidade que o formato precisa acomodar: a capacidade de engenharia é uma só, e cada
item do roadmap técnico é um item que produto não recebe.

```text
apresentar isolado    parece razoável, e é aprovado sem folga real
apresentar junto      a priorização é feita com a informação certa
```

Roadmaps técnicos aprovados sem essa conversa são desfeitos na execução, quando a pressão de
entrega chega — e a desfazer acontece por omissão, sem que ninguém decida.

Ver [estratégia técnica](/23-architecture-leadership/technical-strategy-leadership.md).

### Revise por evidência, não por calendário

```text
"a fase 2 foi concluída. O que aprendemos muda o resto do plano?"
```

Planos técnicos longos são construídos com informação que a execução corrige. Revisar ao fim de
cada fase, com o que foi aprendido, produz um plano melhor que executar o original até o fim.

O que não funciona é revisar por calendário sem evidência nova — isso vira replanejamento
recorrente e desgasta o patrocínio.

## Modelo Mental

**Ordene por valor entregue cedo, e faça cada fase terminar estável.** Em 12 a 24 meses, trate a
interrupção como o caso a planejar, não como exceção; a questão é o que sobra quando ela vier.

## Quando Usar

- Depois da estratégia, para sequenciar investimento.
- Em horizontes de 12 a 24 meses.
- Com marcos por condição, não por data.

## Quando Não Usar

**Dívida difusa, sem alvo arquitetural único.** Quando o trabalho é uma soma de melhorias locais —
dependências desatualizadas, testes frágeis, módulos confusos —, não há sequência a otimizar; um
percentual fixo de capacidade resolve com menos cerimônia.

**Trabalho que cabe em um trimestre.** O faseamento existe para sobreviver a mudanças de
prioridade ao longo de muitos meses; num horizonte em que a prioridade dificilmente muda, fases
com critério de parada são custo de planejamento sem retorno, e o backlog basta.

**Organização que já opera fila única com produto.** Se itens técnicos e de produto já são
priorizados juntos, um roadmap técnico separado recria a divisão de orçamento que a fila única
eliminou.

**Destino ainda em disputa.** O roadmap ordena o que a estratégia escolheu; sequenciar antes da
escolha é antecipar a decisão pela ordem das fases. Primeiro a
[estratégia técnica](/23-architecture-leadership/technical-strategy-leadership.md).

## Alternativas

- **Trabalho contínuo sem roadmap** — alocar um percentual fixo da capacidade a melhoria técnica,
  sem plano de longo prazo. Simples e eficaz para dívida difusa.
- **Roadmap integrado ao de produto** — um único plano, com itens técnicos e de produto na mesma
  fila. É a forma mais honesta e a mais difícil de conseguir.
- **Fatiar por capacidade** em vez de por fase — cada entrega é uma capacidade completa.

A segunda é a melhor quando a organização permite: ela elimina a ficção de que existem dois
orçamentos de capacidade.

## Trade-offs

| Valor cedo | Fundação primeiro |
|---|---|
| Sobrevive a interrupção | Menos retrabalho |
| Pode exigir trabalho temporário | Nada entregue por meses |

| Marcos por condição | Datas |
|---|---|
| Sobrevive a atraso | Previsível para quem planeja |
| Difícil de coordenar com outros | Ficção em horizonte longo |

## Modos de Falha

**Fundação sem uso.** Interrompido na fase 1.

**Fase que termina pela metade.** Nada aproveitável.

**Datas precisas em horizonte longo.** Credibilidade corroída.

**Apresentado isolado.** Desfeito na execução.

**Sem revisão por evidência.** Executa um plano feito com menos informação.

## Erros Comuns

**Sequenciar por dependência técnica** sem considerar valor. O plano é escrito por quem conhece a
arquitetura, e para essa pessoa o grafo de dependências parece a ordem natural; a consequência é
uma fase 1 sem entrega visível quando chega o primeiro corte orçamentário.

**Não perguntar** o que sobra se o plano parar. A pergunta soa pessimista numa apresentação que
busca aprovação e fica de fora; o custo só aparece na interrupção, quando já não dá para
reorganizar a fase.

**Prometer datas** que dependem de decisões futuras. O patrocinador pede uma data e é ela que
destrava a aprovação; quando escorrega, a conversa passa a ser o atraso, não o que foi entregue.

**Não conversar** a competição com o roadmap de produto. Apresentado isolado, o plano é aprovado
mais rápido e com alocação maior no papel; a alocação real erode sem decisão explícita quando a
pressão de entrega chega.

**Não declarar** o escopo negativo de cada fase. Quem escreve sabe o que ficou de fora e supõe que
todos sabem; a fase entregue passa a ser julgada pelo que ninguém prometeu.

## Exemplo Real

Uma empresa de serviços com 120 engenheiros teve dois roadmaps técnicos cancelados em três anos.
Ambos seguiam a mesma estrutura: fundação, migração, desligamento.

```text
roadmap 1 (2022)   cancelado no mês 9, na fase 1
                   resultado: plataforma construída, nenhum
                   sistema migrado, ~R$ 3,1 mi gastos
roadmap 2 (2023)   cancelado no mês 7, na fase 1
                   resultado: framework interno, sem uso
```

Os dois cancelamentos vieram de mudança de prioridade comercial, não de problema técnico. E em
ambos, o que restou foi inutilizável.

O terceiro roadmap foi construído com duas regras novas:

**Cada fase precisa terminar em estado aproveitável.** A pergunta "o que sobra se pararmos aqui?"
passou a ser respondida por escrito para cada fase, e a resposta precisava ser algo com valor.

**A primeira fase precisa entregar resultado observável em até quatro meses.**

Isso obrigou a inverter a sequência. Em vez de construir a plataforma completa primeiro, o plano
ficou assim:

```text
fase 1 (4 meses)   um sistema migrado, com a fatia mínima de
                   plataforma que ele exige
                   se parar aqui: um sistema no novo modelo,
                   funcionando, com benefício medido

fase 2 (5 meses)   três sistemas, plataforma ampliada com o
                   que eles exigiram
                   se parar aqui: quatro sistemas migrados

fase 3 (6 meses)   os onze restantes, um de cada vez, com a
                   plataforma já madura pelo uso real
                   se parar aqui: quinze de quinze, com o
                   antigo ainda ligado

fase 4 (4 meses)   desligamento e migração de histórico
```

A plataforma passou a ser construída **puxada pela migração**, e não antes dela. Isso produziu
algum retrabalho — três componentes da plataforma foram refeitos ao serem generalizados na fase 2
— estimado em cerca de seis semanas.

O roadmap foi apresentado junto ao de produto, numa única priorização, com a capacidade total
visível. Isso reduziu a alocação aprovada de 30% para 22%, e a redução foi tratada como
informação: 22% acordados e sustentados valem mais que 30% aprovados e erodidos.

Resultados:

```text
fase 1 concluída no mês 4        benefício medido: -34% no tempo
                                 de entrega daquele sistema
alocação real ao longo do plano  21% (acordado: 22%)
plano interrompido?              sim — no mês 11, por 3 meses,
                                 por uma prioridade comercial
o que restou na interrupção      seis sistemas migrados (quatro
                                 das fases 1 e 2, dois da fase 3),
                                 funcionando, com benefício
plano retomado                   sim, no mês 14
conclusão                        mês 22 (previsto: 19)
retrabalho de plataforma         ~6 semanas, previsto e aceito
```

A interrupção de três meses aconteceu — como nos dois roadmaps anteriores. A diferença é que
desta vez ela não cancelou nada: o trabalho parou num estado aproveitável, e retomar foi
possível. Ela caiu no meio da fase 3, e a regra valeu também dentro da fase: cada sistema era
migrado como unidade que termina estável, e no mês 11 nenhum estava pela metade.

A leitura que a equipe faz: as seis semanas de retrabalho por construir a plataforma sob demanda
foram o preço da sobrevivência do plano, e ele foi barato. Os dois roadmaps anteriores tinham
evitado retrabalho e perdido tudo.

## Conceitos Relacionados

- [Estratégia Técnica](/23-architecture-leadership/technical-strategy-leadership.md).
- [Visão de Arquitetura](/23-architecture-leadership/architecture-vision.md).
- [Roteiros de Arquitetura](/15-enterprise-architecture/architecture-roadmaps.md).
- [Gestão de Risco](/23-architecture-leadership/risk-management.md).

## Exercício Prático

Pegue um plano técnico em andamento e responda, para cada fase: o que sobra se o trabalho parar
ao fim dela?

As fases cuja resposta for "nada aproveitável" são as que vão custar tudo se a prioridade mudar —
e, num plano de mais de um ano, a mudança de prioridade é o caso a planejar, não a exceção.

## Perguntas de Entrevista

- Por que sequenciar por lógica técnica costuma produzir planos que morrem?
- Por que construir a plataforma sob demanda pode valer o retrabalho?
- Por que marcos por condição sobrevivem melhor que datas em horizonte longo?

## Para Aprofundar

- Rumelt, Richard. *Good Strategy Bad Strategy*. Crown Business, 2011.
- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Larson, Will. *An Elegant Puzzle: Systems of Engineering Management*. Stripe
  Press, 2019.
