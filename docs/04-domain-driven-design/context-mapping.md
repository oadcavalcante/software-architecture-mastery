---
id: context-mapping
title: Context Mapping
sidebar_position: 8
description: Como os bounded contexts se relacionam — e por que o padrão de relacionamento é organizacional antes de ser técnico.
doc_type: concept
level: 2
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor mapeia os relacionamentos entre contextos e reconhece que
  o padrão reflete poder e dependência organizacional.
prerequisites: [bounded-context]
related: [anti-corruption-layer, strategic-ddd, integration-architecture]
canonical_for: [context mapping, mapa de contextos]
content_version: 1
last_reviewed: 2026-08-26
---

# Context Mapping

## Visão Geral

Context mapping é a prática de identificar os bounded contexts de uma organização
e o **tipo de relacionamento** entre eles.

O que torna a técnica valiosa não é o desenho. É que os padrões de
relacionamento descrevem **poder e dependência entre times**, não apenas
integração técnica — e nomear isso torna negociável o que antes era implícito.

## Problema

Contextos não vivem isolados. Cobrança precisa de dados de subscrição; logística
precisa de dados de pedido; um contexto novo precisa consumir um legado que
ninguém pode alterar.

Sem mapear esses relacionamentos, três coisas acontecem.

A integração vira ponto a ponto, sem contrato, e o cenário fica invisível.

A assimetria de poder fica implícita: um time descobre que depende de outro que
não tem obrigação de atendê-lo, e isso vira conflito recorrente sem nome.

E ninguém sabe onde a tradução deveria acontecer, então ela acontece em todo
lugar.

## Conceitos Centrais

### Os padrões de relacionamento

Evans nomeia vários; estes são os que mais aparecem e os que mais decidem.

**Parceria.** Dois times com sucesso ou fracasso conjunto. Coordenam releases e
evoluem os contratos juntos. Funciona com dois times alinhados; não escala.

**Cliente-fornecedor.** O fornecedor tem obrigação de atender às necessidades do
cliente, negociadas. Requer que o cliente tenha peso organizacional suficiente
para que a obrigação seja real.

**Conformista.** O consumidor adota o modelo do fornecedor sem tradução, porque
não tem poder de negociação. Barato e acopla completamente.

**Anti-corruption layer.** O consumidor traduz o modelo alheio para o seu. Custa
manutenção e preserva a independência. Ver
[anti-corruption layer](/04-domain-driven-design/anti-corruption-layer.md).

**Serviço aberto (*open host service*)** com **linguagem publicada.** O fornecedor
publica um protocolo estável para muitos consumidores. É a resposta quando há
consumidores demais para atender individualmente.

**Núcleo compartilhado (*shared kernel*).** Dois contextos compartilham
deliberadamente uma parte pequena do modelo. Reduz duplicação e acopla os dois
times a cada mudança.

**Caminhos separados.** Nenhuma integração. Duplicar é mais barato que integrar —
uma conclusão legítima e raramente considerada.

### O padrão reflete organização

A observação que torna a técnica útil:

| Padrão | O que ele diz sobre a organização |
|---|---|
| Parceria | Times com objetivo comum e comunicação direta |
| Cliente-fornecedor | O consumidor tem peso para negociar |
| Conformista | O consumidor não tem poder |
| Anti-corruption layer | O consumidor prefere pagar tradução a se acoplar |
| Serviço aberto | Consumidores demais para atender um a um |
| Núcleo compartilhado | Dois times aceitam coordenar |

Escolher um padrão que a organização não sustenta não funciona. Declarar
cliente-fornecedor quando o fornecedor é outra unidade de negócio sem obrigação
produz frustração recorrente — o padrão real é conformista, e nomeá-lo permite
decidir se vale construir uma anti-corruption layer.

### Upstream e downstream

O contexto a montante influencia o a jusante. A direção da influência importa
mais que a direção da chamada de rede.

Um contexto que consome eventos de outro está a jusante, mesmo sem chamá-lo. A
mudança de um evento o afeta.

### O mapa é para decidir, não para documentar

Um mapa de contextos que só descreve o presente tem pouco valor. Ele serve para
perguntar: este padrão é o que queremos? Onde a assimetria está nos custando? O
que mudaria se investíssemos numa anti-corruption layer aqui?

## Modelo Mental

**Para cada par de contextos que se falam, pergunte quem tem obrigação com quem.**
A resposta dá o padrão, e ela é organizacional.

## Quando Usar

- Ao desenhar a integração entre contextos novos.
- Ao entender um cenário existente antes de modificá-lo.
- Quando conflitos recorrentes entre times envolvem dependência técnica.
- Antes de decidir extrair um serviço — o padrão informa o custo.

## Quando Não Usar

**Num sistema com um contexto.** Não há relacionamento a mapear.

**Como documento estático.** Um mapa desenhado uma vez e arquivado não decide
nada.

**Para prescrever um padrão que a organização não sustenta.**

**Como substituto de conversa com os times envolvidos.** O mapa é resultado das
conversas, não alternativa a elas.

## Alternativas

- **Diagrama de integração técnica** — mostra as conexões e não a relação de
  poder. Complementar, não substituto.
- **Team Topologies** — a análise organizacional correspondente. Ver
  [Nível 07](/23-architecture-leadership/index.md).
- **Cenário de integração corporativo** — o mapa em escala de empresa. Ver
  [Nível 06](/15-enterprise-architecture/index.md).

## Trade-offs

Os trade-offs são por padrão escolhido:

| | Acoplamento | Custo | Independência |
|---|---|---|---|
| Conformista | Máximo | Mínimo | Nenhuma |
| Núcleo compartilhado | Alto | Coordenação | Parcial |
| Cliente-fornecedor | Médio | Negociação | Boa |
| Anti-corruption layer | Baixo | Tradução contínua | Alta |
| Caminhos separados | Nenhum | Duplicação | Total |

Descer na tabela custa mais e compra mais independência. A escolha depende de
quanto a independência vale para aquele par.

## Modos de Falha

**Padrão declarado que a organização não sustenta.** O mais comum.

**Conformista por omissão.** Ninguém decidiu; simplesmente adotou-se o modelo do
outro e o acoplamento apareceu depois.

**Núcleo compartilhado que cresce.** O que deveria ser pequeno vira metade do
modelo, e os dois times ficam acoplados em tudo.

**Mapa desatualizado.** Descreve integrações que mudaram.

**Anti-corruption layer que não é mantida.** O modelo do fornecedor evolui, a
tradução não, e o vazamento volta.

## Erros Comuns

**Tratar como exercício técnico.** É análise organizacional.

**Não nomear a assimetria.** Deixar implícito que um time depende de outro sem
obrigação recíproca produz conflito sem diagnóstico.

**Escolher anti-corruption layer para tudo.** Custa manutenção; use onde a
independência importa.

**Não considerar caminhos separados.** Duplicar é às vezes a resposta certa.

## Exemplo Real

Uma empresa de saúde tinha seis contextos e conflitos recorrentes entre o time de
agendamento e o de prontuário.

O sintoma: toda mudança no prontuário quebrava agendamento, e o time de
prontuário reagia dizendo que não tinha sido avisado do uso.

O mapeamento revelou que os dois times acreditavam estar em relacionamentos
diferentes. Agendamento achava que era cliente-fornecedor — que prontuário tinha
obrigação de manter o contrato. Prontuário achava que agendamento era conformista
— que consumia por conta e risco.

Nenhum dos dois estava errado sobre o próprio entendimento. Ninguém tinha
declarado o padrão.

A conversa que se seguiu foi organizacional, não técnica: prontuário não tinha
capacidade de manter compatibilidade com todos os consumidores, e agendamento não
tinha peso para exigir.

A decisão foi anti-corruption layer no lado de agendamento, com o custo aceito
explicitamente — cerca de duas semanas de construção e manutenção conforme
prontuário evoluísse.

Nos dezoito meses seguintes, prontuário mudou o modelo três vezes. Agendamento
ajustou a tradução em cada uma, em horas, sem quebrar em produção e sem conflito
entre os times.

O que mudou não foi a dependência técnica — ela continua. Foi o padrão ter nome,
e o custo ter dono.

## Conceitos Relacionados

- [Bounded Context](/04-domain-driven-design/bounded-context.md) — o que se mapeia.
- [Anti-Corruption Layer](/04-domain-driven-design/anti-corruption-layer.md) — um dos padrões, em detalhe.
- [DDD Estratégico](/04-domain-driven-design/strategic-ddd.md) — a síntese.
- [Integração](/08-integration-architecture/index.md) — os mecanismos.

## Exercício Prático

Liste os pares de contextos ou sistemas que se integram no seu ambiente.

Para cada par, pergunte a alguém de cada lado: qual é a obrigação de um com o
outro? Se as respostas divergirem, você encontrou uma fonte de conflito recorrente
que não tinha nome.

## Perguntas de Entrevista

- Que padrões de relacionamento entre contextos você conhece?
- Por que o padrão reflete a organização e não apenas a técnica?
- Quando "caminhos separados" é a resposta correta?

## Para Aprofundar

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003 — a parte de design
  estratégico.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
