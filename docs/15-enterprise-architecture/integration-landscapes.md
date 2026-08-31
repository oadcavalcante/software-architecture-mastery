---
id: integration-landscapes
title: Paisagens de Integração
sidebar_position: 9
description: O mapa das conexões entre sistemas — onde o custo escondido da arquitetura mora.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor mapeia integrações reais e reconhece os padrões que produzem
  custo desproporcional.
prerequisites: [application-portfolios]
related: [application-portfolios, current-state-architecture, enterprise-data-architecture]
canonical_for: [paisagem de integração, integração ponto a ponto, acoplamento organizacional]
content_version: 1
last_reviewed: 2026-08-28
---

# Paisagens de Integração

## Visão Geral

A paisagem de integração é o mapa de como os sistemas se conectam: quem chama quem, por
qual meio, com qual acoplamento.

É onde o custo escondido da arquitetura corporativa mora. Um sistema individualmente
simples pode ter quarenta integrações — e o custo de manter essas conexões supera o de
manter o sistema.

E é a parte do estado atual que mais diverge do que as pessoas acreditam.

## Problema

Integrações crescem por acumulação. Cada necessidade nova produz uma conexão nova, feita
da forma mais rápida no momento.

O agregado, depois de alguns anos:

```text
crescimento quadrático     N sistemas podem ter até N² conexões
formas divergentes         API, arquivo, banco compartilhado, fila, tudo junto
acoplamento invisível      ninguém sabe quem depende de quem
mudança cara               alterar um sistema exige coordenar com dez
```

E o custo não é atribuído: ele aparece como "mudanças demoram", "tudo está acoplado",
"não conseguimos mexer nisso" — sem que ninguém aponte a paisagem como causa.

## Conceitos Centrais

### O crescimento é quadrático

```text
10 sistemas, todos conectados   até 45 conexões
20 sistemas                     até 190
40 sistemas                     até 780
```

Na prática nenhuma organização conecta tudo com tudo, e a tendência é clara: o número de
integrações cresce mais rápido que o número de sistemas.

Isso significa que a decisão de adicionar um sistema carrega um custo que não é o custo
do sistema — é o custo das conexões que ele vai precisar.

E é a razão de padrões de integração importarem: quarenta conexões feitas de trinta
formas diferentes são muito mais caras que quarenta feitas de três.

### Os tipos de acoplamento, em ordem de custo

```text
banco compartilhado       o pior — o esquema de um vira contrato do outro
acesso direto ao banco alheio  quase tão ruim
API síncrona              acopla disponibilidade
evento                    acopla formato, não disponibilidade
arquivo                   acoplamento mínimo, latência alta
```

Ver [arquitetura de integração](/08-integration-architecture/index.md).

Os dois primeiros são os que mais aparecem em paisagens antigas e os que mais travam:
eles tornam o modelo interno de um sistema um contrato público, impedindo qualquer
refatoração.

Ver [propriedade do dado](/07-data-architecture/data-ownership.md).

### A paisagem real difere da declarada

O mapa desenhado em reunião mostra as integrações oficiais. A realidade inclui:

```text
consultas diretas ao banco de outro sistema
processos que leem arquivos gerados por outro
tabelas replicadas por processos esquecidos
integrações feitas por uma pessoa que já saiu
consumidores de API que ninguém sabe que existem
```

A forma de encontrar é observar: registros de acesso ao banco, tráfego de rede,
rastreamento distribuído. Ver
[rastreamento distribuído](/13-observability/distributed-tracing.md).

O achado típico: entre 30% e 50% mais integrações que as documentadas.

### Os padrões que produzem custo desproporcional

Ao olhar a paisagem, alguns padrões saltam:

**Sistema com muitas conexões.** Um sistema com trinta integrações é um ponto de
acoplamento — qualquer mudança nele é cara.

**Ciclos.** A chama B, que chama C, que chama A. Difícil de raciocinar, difícil de
implantar independentemente.

**Cadeias longas.** Uma requisição que atravessa seis sistemas tem disponibilidade
composta ruim. Ver
[disponibilidade](/06-distributed-systems/availability.md).

**Duplicação de caminho.** Quatro integrações transportando o mesmo dado entre os mesmos
sistemas, feitas em momentos diferentes.

**Ponto único não reconhecido.** Um sistema de que muitos dependem, sem redundância nem
plano.

O último é o achado de maior valor: ele é risco operacional que a paisagem revela e
nenhuma análise por sistema encontra.

### O acoplamento é organizacional, não só técnico

Uma integração conecta dois sistemas e dois **times**.

```text
mudar o contrato        exige negociar com o outro time
implantar               exige coordenar
investigar um problema  exige envolver os dois
```

Um sistema com trinta integrações é um sistema cujo time negocia com muitos outros. Ver
[contratos de integração](/08-integration-architecture/integration-contracts.md).

Isso explica por que times com muitas dependências entregam devagar — e por que reduzir
integrações é uma intervenção de velocidade, não apenas de arquitetura.

### Reduzir é mais valioso que organizar

A tentação, diante de uma paisagem complexa, é introduzir um intermediário central — um
barramento por onde tudo passa.

Isso reorganiza o diagrama e mantém o acoplamento: os sistemas continuam dependendo uns
dos outros, agora com um ponto central adicional.

O que reduz de fato:

```text
eliminar duplicação        quatro caminhos para o mesmo dado viram um
propriedade clara          um dono, os demais consomem
eventos em vez de consulta os consumidores param de perguntar
aposentar sistemas         cada um removido leva as conexões dele
fronteiras melhores        menos necessidade de conversar
```

A última é a mais profunda: uma paisagem complexa frequentemente reflete fronteiras de
sistema mal traçadas. Ver
[bounded context](/04-domain-driven-design/bounded-context.md).

## Modelo Mental

**A paisagem é onde o custo agregado aparece.** Reduzir conexões vale mais que
organizá-las.

## Quando Usar

- Antes de programas de modernização.
- Para avaliar impacto de mudanças ou de aposentadoria.
- Ao investigar por que a organização entrega devagar.
- Após aquisições.
- Para identificar risco de ponto único.

## Quando Não Usar

**Mapeado só por entrevista.**

**Introduzindo intermediário central** sem reduzir o acoplamento.

**Como diagrama estático** desatualizado.

**Sem incluir integrações informais.**

**Documentando sem decidir** o que fazer com o que se encontra.

## Alternativas

- **Mapa de dependências derivado** — automático, real, sempre atual.
- **Análise por sistema** — o que cada um consome e expõe, sem o mapa global.
- **Catálogo de contratos** — o que é publicado, quem consome. Ver
  [contratos de integração](/08-integration-architecture/integration-contracts.md).

## Trade-offs

| Mapa completo | Análise focada |
|---|---|
| Revela padrões globais | Profundidade local |
| Caro de manter | Sob demanda |
| Encontra o inesperado | Só o que se procura |

| Derivado | Documentado |
|---|---|
| Real e atual | Inclui o não instrumentado |
| Limitado ao observável | Captura intenção |

## Modos de Falha

**Integração informal invisível.** Quebra ao mudar algo.

**Barramento sem redução.** Reorganiza sem desacoplar.

**Ponto único não reconhecido.**

**Ciclo entre sistemas.** Implantação independente impossível.

**Cadeia longa.** Disponibilidade composta ruim.

**Duplicação de caminho.** Quatro integrações, um propósito.

## Erros Comuns

**Mapear por entrevista.**

**Não incluir acesso direto a banco alheio.**

**Introduzir intermediário como solução.**

**Não medir o custo de manutenção das integrações.**

**Não usar a paisagem para decidir** — apenas documentá-la.

## Exemplo Real

Uma empresa de logística investigava por que as entregas de software eram lentas apesar
de times competentes e de boa automação.

A paisagem de integração, derivada de registros de acesso e de rastreamento, revelou:

```text
sistemas                   68
integrações documentadas  190
integrações reais         312
```

Cento e vinte e duas integrações não documentadas — 39% do total.

Os padrões encontrados:

**Um sistema com 47 integrações.** O cadastro de clientes, acessado diretamente no banco
por 19 sistemas. Qualquer alteração de esquema exigia coordenar com 19 times, e por isso
o esquema não mudava havia quatro anos.

**Sete ciclos.** Conjuntos de sistemas que se chamavam mutuamente, impossibilitando
implantação independente.

**Duplicação.** O dado de rota era transportado por seis caminhos diferentes entre os
mesmos sistemas — API, arquivo, replicação de banco, fila, e dois processos agendados.

**Ponto único.** Um serviço de geocodificação, mantido por uma pessoa, do qual 22
sistemas dependiam de forma síncrona.

A intervenção priorizou redução, não reorganização:

**Cadastro de clientes com propriedade declarada.** Os 19 acessos diretos ao banco foram
substituídos por API e por eventos, em dezoito meses. O esquema voltou a poder mudar.

**Ciclos quebrados** por inversão de dependência — o sistema que era chamado passou a
publicar eventos.

**Duplicação eliminada.** Os seis caminhos de dado de rota viraram um.

**Ponto único endereçado.** Cache no consumidor, alternativa de fornecedor, e
transferência de conhecimento.

Resultado em dois anos: 312 integrações para 180, e o tempo médio de entrega de uma
funcionalidade que atravessa sistemas caiu de 11 semanas para 4.

E uma decisão deliberada: a proposta de introduzir um barramento central foi recusada. A
análise mostrou que ele reorganizaria o diagrama sem reduzir o número de dependências
entre times — que era a causa da lentidão.

A lentidão era atribuída a processo e a ferramentas. A causa era
estrutural, e ficou visível só quando alguém desenhou o mapa a partir do que acontece, e
não do que está documentado.

## Conceitos Relacionados

- [Portfólio de Aplicações](/15-enterprise-architecture/application-portfolios.md).
- [Arquitetura de Integração](/08-integration-architecture/index.md).
- [Propriedade do Dado](/07-data-architecture/data-ownership.md).
- [Arquitetura do Estado Atual](/15-enterprise-architecture/current-state-architecture.md).

## Exercício Prático

Derive o mapa de dependências do seu sistema mais central a partir de registros de acesso
e de rastreamento, e compare com o que está documentado.

A diferença é a paisagem que você não sabia que tinha.

## Perguntas de Entrevista

- Por que o número de integrações cresce mais rápido que o de sistemas?
- Por que um barramento central não reduz acoplamento?
- Por que acoplamento de integração é também organizacional?

## Para Aprofundar

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*. Addison-Wesley, 2003.
- Newman, Sam. *Building Microservices*. 2ª ed. O'Reilly, 2021.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
