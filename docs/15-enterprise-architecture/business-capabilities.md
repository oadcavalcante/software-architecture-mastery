---
id: business-capabilities
title: Capacidades de Negócio
sidebar_position: 7
description: Discutir sistemas sem falar de sistemas — a ferramenta de maior retorno prático da seção.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor modela capacidades estáveis e as usa para revelar duplicação,
  lacuna e risco.
prerequisites: [enterprise-architecture]
related: [capability-mapping, application-portfolios, business-architecture]
canonical_for: [capacidade de negócio, modelo de capacidades, estabilidade de capacidade]
content_version: 1
last_reviewed: 2026-08-28
---

# Capacidades de Negócio

## Visão Geral

Uma capacidade de negócio é **o que a organização faz**, independentemente de como ela
faz.

```text
capacidade    "precificar apólices"
processo      o fluxo atual de precificação
sistema       o motor de cálculo que existe hoje
time          quem mantém
```

A primeira linha muda pouco ao longo de anos. As outras três mudam constantemente.

Essa estabilidade é o que torna capacidades a ferramenta mais útil desta seção: elas dão
um vocabulário comum entre negócio e tecnologia que não envelhece a cada reorganização.

## Problema

Discussões sobre investimento em tecnologia costumam acontecer em termos de sistemas:
"precisamos modernizar o sistema X", "o sistema Y está caro".

Isso tem dois problemas.

**O negócio não entende.** Um diretor comercial não sabe o que o sistema Y faz, e por
isso não consegue priorizar o investimento nele.

**A conversa não revela duplicação.** Se três sistemas fazem parcialmente a mesma coisa,
falar deles individualmente esconde isso.

Capacidades resolvem os dois: elas são compreensíveis pelo negócio, e a duplicação
aparece quando três sistemas são mapeados à mesma capacidade.

## Conceitos Centrais

### O que caracteriza uma capacidade

```text
substantivo, não verbo      "gestão de sinistros", não "gerenciar sinistros"
estável                     não muda com reorganização nem com tecnologia
mutuamente exclusiva        duas capacidades não se sobrepõem
coletivamente exaustiva     juntas, descrevem o que a organização faz
independente de como         não menciona processo, sistema nem departamento
```

O teste de estabilidade: **essa capacidade existiria há dez anos, e existirá daqui a
dez?** Se a resposta depender de tecnologia ou de estrutura organizacional atual, o que
foi modelado não é uma capacidade.

O erro mais comum é modelar o organograma. "Capacidade de atendimento ao cliente nível
2" é uma estrutura de time, não uma capacidade.

### Níveis, e onde parar

```text
nível 1   grandes áreas — 8 a 15 no total
          "gestão de clientes", "gestão de produtos", "operações"
nível 2   decomposição — 40 a 80
          "cadastro de clientes", "análise de crédito", "cobrança"
nível 3   detalhe — onde o mapeamento a sistemas fica útil
          "verificação de documentos", "cálculo de limite"
```

Três níveis bastam para a maioria das organizações. Descer ao quarto produz um modelo
que ninguém mantém — e o valor do modelo depende de ele estar atualizado.

O sinal de que se desceu demais: as capacidades do último nível começam a parecer
funcionalidades de sistema.

### O valor está no mapeamento

O modelo sozinho é um diagrama. O que produz decisão é sobrepor informação a ele:

```text
sistemas          quais atendem cada capacidade → revela duplicação e lacuna
custo             quanto se gasta por capacidade → revela desalinhamento
criticidade       o que para o negócio se falhar
diferenciação     o que distingue a organização
saúde             estado técnico dos sistemas que a suportam
```

A sobreposição de **diferenciação** e **custo** é a que mais gera discussão útil: uma
capacidade que não diferencia e consome uma fatia grande do investimento é candidata a
compra em vez de construção. Ver
[SaaS](../09-cloud-architecture/saas.md).

E a de **criticidade** com **saúde** revela o risco concreto: uma capacidade crítica
suportada por um sistema em estado ruim é a prioridade que ninguém tinha nomeado.

### Duplicação aparece sozinha

Ao mapear sistemas a capacidades, o padrão emerge:

```text
capacidade "cadastro de clientes"
  → sistema de vendas (parcial)
  → sistema de cobrança (parcial)
  → sistema de suporte (parcial)
  → portal do cliente (parcial)
```

Quatro sistemas com cadastro próprio, cada um com uma visão parcial. Isso é visível no
mapa e invisível numa conversa sobre sistemas individuais.

E a conversa que se segue é produtiva porque não começa acusando nenhum sistema — começa
constatando que uma capacidade está fragmentada.

Ver [propriedade do dado](../07-data-architecture/data-ownership.md).

### Diferenciação orienta investimento

Uma classificação simples e poderosa:

```text
diferenciadora   os clientes escolhem a organização por causa disto
                 → construir, investir, manter internamente
de apoio         necessária, não diferencia
                 → comprar, ou construir simples
comum            todo mundo tem, ninguém escolhe por isso
                 → comprar
```

Ver [SaaS](../09-cloud-architecture/saas.md) — é o mesmo critério, aplicado no nível da
organização.

O achado típico desse exercício: uma parcela relevante do investimento em engenharia
está em capacidades de apoio ou comuns. Isso não é necessariamente errado, e precisa ser
uma decisão.

### O modelo precisa ser mantido — e leve

Um modelo de capacidades desatualizado é pior que nenhum: ele produz decisões baseadas
numa realidade que não existe mais.

O que o mantém vivo:

```text
poucos níveis        três, não cinco
dono declarado       alguém responde pelo modelo
revisão periódica    semestral, com o negócio
derivado onde possível  mapeamento de sistemas alimentado pelo catálogo
uso real             se ninguém consulta, ele morre
```

A última é a que decide. Um modelo usado em discussões de orçamento e de priorização se
mantém sozinho, porque alguém precisa dele. Um construído para um projeto e arquivado
apodrece em meses.

## Modelo Mental

**Capacidade é o que a organização faz; tudo o mais é como.** A estabilidade do "o quê"
é o que torna o mapa útil ao longo do tempo.

## Quando Usar

- Discussões de investimento em tecnologia com o negócio.
- Identificação de duplicação entre sistemas.
- Decisões de construir ou comprar.
- Priorização de modernização.
- Avaliação de risco por área de negócio.
- Antes de reorganizações de time.

## Quando Não Usar

**Modelando o organograma.**

**Com mais de três níveis.**

**Sem sobrepor informação.** O modelo sozinho não decide nada.

**Sem dono nem revisão.**

**Como substituto de arquitetura técnica.** Ele orienta investimento, não desenho de
sistema.

**Construído por consultoria e arquivado.**

## Alternativas

- **Mapa de fluxo de valor** — orientado a processo, melhor para otimizar fluxo.
- **Mapeamento de domínios** — orientado a fronteiras de software. Ver
  [DDD](../04-domain-driven-design/index.md).
- **Inventário de aplicações** — mais simples, sem a lente de negócio. Ver
  [portfólio de aplicações](application-portfolios.md).

Capacidades e domínios são complementares: capacidades organizam a conversa com o
negócio; domínios organizam as fronteiras do software.

## Trade-offs

| Capacidades | Sistemas |
|---|---|
| Estável | Muda constantemente |
| Compreensível pelo negócio | Vocabulário técnico |
| Revela duplicação | Esconde |
| Abstrato demais para implementar | Concreto |

| Três níveis | Cinco |
|---|---|
| Mantível | Envelhece |
| Menos precisão | Mais detalhe |

## Modos de Falha

**Organograma disfarçado.** Muda a cada reorganização.

**Detalhe excessivo.** Ninguém mantém.

**Modelo sem uso.** Construído e arquivado.

**Sem sobreposição de dados.** Um diagrama bonito que não decide nada.

**Capacidades sobrepostas.** A mesma coisa em dois lugares do mapa.

**Vocabulário de tecnologia.** "Capacidade de API" não é capacidade.

## Erros Comuns

**Modelar o organograma.**

**Descer a quatro ou cinco níveis.**

**Não mapear sistemas.**

**Não classificar por diferenciação.**

**Não ter dono do modelo.**

**Construir para um projeto** em vez de para uso contínuo.

## Exemplo Real

Uma seguradora tinha 140 sistemas e uma discussão anual de orçamento que se repetia sem
avançar: cada área defendia os próprios sistemas, e não havia critério comum.

O modelo de capacidades foi construído em seis semanas, com três níveis e 62 capacidades
no nível 2.

O mapeamento de sistemas revelou três coisas que ninguém tinha visto:

**Duplicação.** A capacidade "cadastro de segurados" era atendida parcialmente por sete
sistemas. Cada um tinha a própria noção de quem é o segurado, e a reconciliação entre
eles consumia um time inteiro.

**Investimento desalinhado.** 34% do orçamento de engenharia estava em capacidades
classificadas como comuns — folha, contabilidade, gestão de documentos. Nenhuma delas
diferenciava a seguradora, e todas tinham produtos maduros no mercado.

**Risco não nomeado.** A capacidade "cálculo de sinistro" — crítica e diferenciadora —
era suportada por um sistema de 22 anos, com dois mantenedores, ambos próximos da
aposentadoria.

Esse terceiro achado mudou a prioridade do ano. Ele era conhecido individualmente por
várias pessoas, e nunca tinha aparecido numa discussão de investimento — porque a
conversa era sobre sistemas, e ninguém apresentava o sistema de sinistros como
prioridade estratégica.

As decisões que saíram:

**Serviço de cadastro único**, com propriedade declarada, e os sete sistemas passando a
consumi-lo. Um trabalho de dois anos, priorizado porque a duplicação ficou visível.

**Três capacidades comuns migradas para produtos comprados**, liberando cerca de 18% do
orçamento de engenharia.

**Modernização do cálculo de sinistro** como prioridade, com transferência de
conhecimento como primeira etapa.

E uma mudança de processo: a discussão de orçamento passou a acontecer sobre o mapa de
capacidades, não sobre a lista de sistemas.

Na retrospectiva: o modelo levou seis semanas e o mapeamento, mais quatro. Ele
mudou a conversa mais que qualquer análise técnica dos anos anteriores — porque o
negócio finalmente conseguia participar dela.

## Conceitos Relacionados

- [Mapeamento de Capacidades](capability-mapping.md) — o método.
- [Portfólio de Aplicações](application-portfolios.md) — o mapeamento.
- [Arquitetura de Negócio](business-architecture.md).
- [SaaS](../09-cloud-architecture/saas.md) — construir ou comprar.

## Exercício Prático

Liste as dez capacidades de negócio mais importantes da sua organização, sem mencionar
nenhum sistema nem departamento.

Depois mapeie quais sistemas atendem cada uma. As capacidades com três ou mais sistemas
são as suas duplicações.

## Perguntas de Entrevista

- O que distingue uma capacidade de um processo ou de um sistema?
- Por que a estabilidade é a propriedade central?
- Que sobreposição de dados gera mais decisão?

## Para Aprofundar

- Ulrich, William; Rosen, Michael. *The Business Capability Map*. BAI, 2011.
- Open Group. *TOGAF Standard* — arquitetura de negócio.
- Ross, Jeanne et al. *Enterprise Architecture as Strategy*. HBS Press, 2006.
