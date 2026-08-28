---
id: enterprise-data-architecture
title: Arquitetura de Dados Corporativa
sidebar_position: 4
description: Dados que atravessam sistemas — propriedade, dados mestres e o custo da ausência de decisão.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor define propriedade e fluxo de dados no nível organizacional, e
  reconhece o custo da fragmentação.
prerequisites: [enterprise-architecture]
related: [integration-landscapes, application-architecture, data-ownership]
canonical_for: [dados mestres, fragmentação de dados, fluxo de dados corporativo, sistema de registro]
content_version: 1
last_reviewed: 2026-08-28
---

# Arquitetura de Dados Corporativa

## Visão Geral

Os fundamentos de dados estão em
[arquitetura de dados](../07-data-architecture/index.md). Aqui interessa o que muda no
nível organizacional: **dados que atravessam sistemas**.

A decisão central é de propriedade — qual sistema é a fonte da verdade de cada dado — e
ela é, entre todas as decisões de arquitetura corporativa, a de maior alcance e a menos
tomada explicitamente.

Sem ela, o mesmo dado existe em versões divergentes em vários lugares, e a organização
gasta esforço contínuo reconciliando.

## Problema

O padrão de fragmentação surge naturalmente:

```text
sistema de vendas precisa de cadastro de cliente   → cria o seu
sistema de cobrança precisa                        → cria o seu
sistema de suporte precisa                         → cria o seu
portal do cliente precisa                          → cria o seu
```

Nenhum time errou. Cada um precisava do dado e não havia fonte disponível.

O custo aparece depois, e é permanente:

```text
o mesmo cliente com dados diferentes em cada sistema
processos de reconciliação, com pessoas dedicadas
relatórios que não batem
o cliente informa uma mudança e ela não propaga
impossível responder "quantos clientes temos?"
```

## Conceitos Centrais

### Sistema de registro

Para cada dado, um sistema é a **fonte da verdade**. Os demais consomem.

```text
sistema de registro   detém o dado, aceita escrita, é autoritativo
consumidor            lê, mantém cópia se precisar, nunca é autoritativo
```

Isso não significa banco único — significa **autoridade única**. Cópias podem existir
para desempenho ou autonomia; elas são derivadas, e a divergência se resolve sempre a
favor da fonte.

Ver [propriedade do dado](../07-data-architecture/data-ownership.md).

A decisão de qual sistema é o registro de cada entidade é o núcleo desta área, e ela
frequentemente não existe — os sistemas se estabeleceram como fonte por acidente
histórico.

### Dados mestres são o caso difícil

Alguns dados são usados por praticamente todos os sistemas:

```text
cliente
produto
fornecedor
funcionário
estrutura organizacional
```

Eles são os que mais fragmentam, porque todo sistema precisa deles e nenhum quer depender
de outro.

As abordagens, em ordem de custo:

**Registro por consenso.** Um sistema existente é declarado a fonte; os demais migram
para consumir. Barato, e depende de o sistema escolhido conseguir servir.

**Serviço dedicado.** Um sistema cuja única função é ser a fonte. Custa um time, e
resolve bem.

**Consolidação virtual.** Um índice que aponta para os registros nos sistemas de origem,
sem mover dados. Menos invasivo, e não resolve a divergência.

**Hub com sincronização.** Um sistema central que reconcilia e distribui. Complexo, e a
reconciliação nunca é perfeita.

A primeira é a que mais frequentemente funciona e a menos considerada — porque exige
escolher um sistema existente, o que gera disputa política.

### A fragmentação tem um custo mensurável

Torná-lo visível é o que destrava a decisão:

```text
pessoas dedicadas a reconciliação
tempo gasto investigando divergências
retrabalho por dado errado
integrações mantidas apenas para sincronizar
oportunidades perdidas por não conseguir responder perguntas
```

Ver [paisagens de integração](integration-landscapes.md) — uma fração alta das
integrações de uma organização existe apenas para propagar dados que estão duplicados.

### Fluxo importa tanto quanto propriedade

Além de quem é dono, importa **como o dado circula**:

```text
onde nasce
quem transforma
quem consome
com qual latência
qual a qualidade esperada em cada ponto
```

O mapa de fluxo revela problemas que o de propriedade não revela: transformações que
perdem informação, latências acumuladas que tornam o dado inútil no destino, e pontos em
que a qualidade degrada.

### Qualidade precisa de dono

Dado sem dono não tem qualidade. E "todos são responsáveis" significa ninguém.

O que funciona:

```text
dono por conjunto de dados     um time responde
definição de qualidade         o que significa correto, completo, atual
medição contínua               não uma auditoria anual
processo de correção           quem corrige, em quanto tempo
```

Ver [consistência de dados](../07-data-architecture/data-consistency.md) — a
reconciliação periódica é o mecanismo que torna a qualidade verificável.

### Dados analíticos precisam de propriedade também

O mesmo raciocínio se aplica aos dados analíticos: um warehouse alimentado por
transformações sem dono produz números que ninguém pode defender.

Ver [data warehouse](../07-data-architecture/data-warehouses.md) e
[propriedade do dado](../07-data-architecture/data-ownership.md).

A ideia de tratar dados analíticos como produto, com dono e contrato, resolve o mesmo
problema no lado analítico.

## Modelo Mental

**Para cada dado, uma fonte da verdade.** Cópias são derivadas, e a fragmentação tem
custo permanente que precisa ser medido.

## Quando Usar

- Onde o mesmo dado existe em vários sistemas.
- Antes de programas de integração ou de modernização.
- Quando relatórios não batem.
- Após aquisições.
- Onde há requisito regulatório sobre dados.

## Quando Não Usar

**Buscando banco único.** Autoridade única não é armazenamento único.

**Criando hub central** sem resolver propriedade.

**Sem medir o custo da fragmentação.**

**Sem dono por conjunto de dados.**

**Consolidando tudo.** Nem todo dado precisa de fonte única — dados locais de um sistema
são dele.

## Alternativas

- **Registro por consenso** — declarar um sistema existente como fonte.
- **Serviço dedicado de dados mestres.**
- **Consolidação virtual** — índice sem mover dados.
- **Aceitar a fragmentação** — decisão legítima quando o custo de resolver supera o de
  conviver, desde que registrada.

A última merece consideração séria: consolidar dados mestres é um projeto de anos, e nem
sempre se paga.

## Trade-offs

| Fonte única | Fragmentado |
|---|---|
| Consistência | Divergência |
| Dependência entre sistemas | Autonomia |
| Projeto de consolidação | Custo contínuo de reconciliação |
| Responde perguntas globais | Não responde |

| Serviço dedicado | Sistema existente como fonte |
|---|---|
| Neutro politicamente | Disputa |
| Custa um time | Barato |
| Desenhado para servir | Pode não servir bem |

## Modos de Falha

**Sem fonte definida.** Divergência permanente.

**Hub sem propriedade.** Reconcilia sem resolver.

**Cópia tratada como autoritativa.**

**Qualidade sem dono.**

**Consolidação sem migração dos consumidores.** A fonte nova existe, e ninguém a usa.

**Latência acumulada.** O dado chega ao destino velho demais para servir.

## Erros Comuns

**Não declarar sistema de registro.**

**Confundir autoridade única com banco único.**

**Criar hub como solução.**

**Não medir o custo da fragmentação.**

**Não atribuir dono de qualidade.**

**Consolidar tudo** em vez de escolher o que importa.

## Exemplo Real

Uma rede de saúde tinha dados de pacientes em nove sistemas. Cada um com cadastro
próprio, alimentado por caminhos diferentes.

O custo, quando medido:

```text
6 pessoas em tempo integral reconciliando cadastros
cerca de 4% dos atendimentos com dados divergentes
impossível responder quantos pacientes únicos a rede atendia
uma multa regulatória por dados inconsistentes em relatório
```

Nove sistemas, e nenhum era a fonte — cada um se considerava.

A abordagem escolhida foi registro por consenso: o sistema de agendamento, que já tinha o
cadastro mais completo e era o ponto de entrada da maioria dos pacientes, foi declarado a
fonte.

Isso gerou disputa — três áreas defenderam que o sistema delas deveria ser a fonte — e a
decisão foi tomada com critério declarado: onde o dado nasce com mais frequência, e onde
a qualidade é maior.

A execução, em fases:

**Fase 1.** Os nove sistemas passaram a consultar a fonte para leitura, mantendo os
cadastros próprios para escrita. Isso já reduziu divergências visíveis ao paciente.

**Fase 2.** A escrita foi centralizada. Cada sistema, um por vez, deixou de aceitar
cadastro e passou a redirecionar para a fonte.

**Fase 3.** Os cadastros locais foram removidos, restando cópias em cache, explicitamente
derivadas.

Tempo total: 26 meses.

Resultado: as 6 pessoas de reconciliação foram realocadas, as divergências caíram para
menos de 0,2%, e a pergunta de quantos pacientes únicos passou a ter resposta.

E uma decisão em sentido contrário: dados de agendamento de cada unidade permaneceram
locais. Eles não são compartilhados, e consolidá-los teria custo sem benefício.

A conclusão registrada: a parte técnica foi a menor. A decisão de qual sistema seria a
fonte levou quatro meses de negociação, e ela era o pré-requisito de tudo.

## Conceitos Relacionados

- [Propriedade do Dado](../07-data-architecture/data-ownership.md) — os fundamentos.
- [Paisagens de Integração](integration-landscapes.md) — o custo da propagação.
- [Arquitetura de Aplicação](application-architecture.md).
- [Consistência de Dados](../07-data-architecture/data-consistency.md).

## Exercício Prático

Escolha uma entidade central da sua organização — cliente, produto — e liste em quantos
sistemas ela existe.

Depois pergunte, para cada um: este é a fonte, ou uma cópia? Se mais de um responder
"fonte", você encontrou a fragmentação.

## Perguntas de Entrevista

- Por que autoridade única não é banco único?
- Por que registro por consenso é frequentemente melhor que hub central?
- Por que a decisão de qual sistema é a fonte é política antes de ser técnica?

## Para Aprofundar

- Dehghani, Zhamak. *Data Mesh*. O'Reilly, 2022.
- Loshin, David. *Master Data Management*. Morgan Kaufmann, 2008.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
