---
id: application-architecture
title: Arquitetura de Aplicação
sidebar_position: 3
description: Quais sistemas existem e o que cada um faz — e a pergunta de fronteira, que é a decisão real.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor decide fronteiras entre sistemas no nível organizacional, com
  critério explícito.
prerequisites: [business-capabilities]
related: [application-portfolios, integration-landscapes, enterprise-data-architecture]
canonical_for: [arquitetura de aplicação, fronteira de sistema, responsabilidade de sistema]
content_version: 1
last_reviewed: 2026-08-28
---

# Arquitetura de Aplicação

## Visão Geral

A arquitetura de aplicação descreve quais sistemas existem, o que cada um é responsável
por fazer, e como eles se relacionam.

A pergunta que ela responde e que nenhuma outra camada responde: **onde ficam as
fronteiras?**

Essa é a decisão de arquitetura corporativa de maior consequência prática. Fronteiras
bem traçadas produzem sistemas que evoluem independentemente; mal traçadas produzem uma
organização em que tudo depende de tudo.

## Problema

Fronteiras entre sistemas raramente são decididas — elas emergem.

```text
um sistema cresce e absorve responsabilidades vizinhas
uma funcionalidade nova é colocada onde é mais fácil, não onde pertence
um sistema comprado traz a fronteira do fornecedor
uma aquisição traz sistemas com fronteiras de outra organização
```

O resultado é um conjunto em que a responsabilidade de cada sistema é histórica, não
lógica — e mudanças de negócio exigem tocar em vários sistemas, porque a fronteira não
corresponde ao domínio.

## Conceitos Centrais

### Fronteira segue domínio, não tecnologia nem organograma

Os três critérios errados, na ordem em que aparecem:

```text
por camada       um sistema de interface, um de lógica, um de dados
                 → toda mudança de negócio toca os três
por tecnologia   agrupado pelo que compartilha implementação
                 → o domínio fica espalhado
por organograma  cada área tem o seu sistema
                 → a próxima reorganização desalinha tudo
```

O critério que funciona: **fronteira segue o domínio**. Ver
[bounded context](/04-domain-driven-design/bounded-context.md) e
[capacidades de negócio](/15-enterprise-architecture/business-capabilities.md).

Uma fronteira bem traçada tem a propriedade de que a maioria das mudanças de negócio
cabe dentro de um sistema.

### O teste da mudança

A verificação prática de uma fronteira:

```text
pegue as dez últimas mudanças de negócio
quantos sistemas cada uma tocou?
```

```text
maioria toca 1 sistema      fronteiras boas
maioria toca 3 ou mais      fronteiras erradas
```

Esse teste é mais confiável que qualquer análise de acoplamento técnico, porque mede o
que importa: a capacidade de mudar.

E ele é fácil de aplicar — a informação está no histórico de mudanças.

### Coesão de dados é o critério mais forte

Sistemas que compartilham o mesmo dado tendem a ser o mesmo sistema.

```text
dois sistemas que escrevem na mesma entidade
  → ou a fronteira está errada
  → ou um deles não deveria escrever
```

Ver [arquitetura de dados corporativa](/15-enterprise-architecture/enterprise-data-architecture.md) e
[propriedade do dado](/07-data-architecture/data-ownership.md).

A recíproca também vale: se dois sistemas nunca compartilham dados e nunca precisam
conversar, a separação está correta.

### Nem tudo precisa ser separado

O movimento de decomposição tem um limite, e ele é frequentemente ultrapassado.

```text
separar quando   times diferentes precisam evoluir independentemente
                 o domínio é genuinamente distinto
                 requisitos de escala ou de disponibilidade divergem
não separar quando  a mudança quase sempre atravessa
                 o mesmo time cuida dos dois
                 a separação existe apenas por preferência arquitetural
```

Ver [monolito modular](/03-design-patterns/modular-monolith.md).

Uma organização com muitos sistemas pequenos e muitas integrações pode ter custo maior
que com menos sistemas maiores. Ver
[paisagens de integração](/15-enterprise-architecture/integration-landscapes.md).

### Responsabilidade precisa ser declarada

Cada sistema deveria ter uma frase que descreve o que ele é responsável por — e a frase
não deveria conter "e".

```text
bom    "é responsável pelo ciclo de vida de apólices"
ruim   "é responsável por apólices, cobrança, e relatórios de vendas"
```

A segunda revela um sistema que absorveu responsabilidades vizinhas.

E a ausência da declaração é o estado mais comum: sistemas cuja responsabilidade ninguém
consegue enunciar sem listar funcionalidades.

### Sistemas comprados trazem fronteiras alheias

Um produto de mercado tem a fronteira que o fornecedor escolheu, e ela raramente coincide
com o domínio da organização.

Isso produz duas situações:

**O produto faz mais que o necessário.** Funcionalidades que a organização já tem em
outro lugar — e a decisão sobre qual usar precisa ser tomada, ou surge duplicação.

**O produto faz menos.** Uma parte do domínio fica fora, e precisa ser construída em
volta.

Ver [SaaS](/09-cloud-architecture/saas.md) e
[anti-corruption layer](/08-integration-architecture/integration-anti-corruption.md) —
a camada de tradução é o que impede a fronteira do fornecedor de entrar no domínio.

### Fronteira de sistema e fronteira de time se influenciam

Uma observação que vale explicitar, porque ela restringe as opções na prática: a
comunicação dentro de um time é barata e frequente; entre times, cara e episódica.

Isso significa que um sistema mantido por dois times tende a desenvolver uma fronteira
interna que espelha a divisão — e que dois sistemas mantidos pelo mesmo time tendem a
acoplar, porque nada impede.

Ver [Team Topologies](/14-devops-and-platform/platform-engineering.md) para o
tratamento organizacional.

A consequência prática é que redesenhar fronteiras de sistema sem ajustar as fronteiras
de time produz uma estrutura que não se sustenta: a comunicação encontra o caminho, e o
acoplamento reaparece onde ela é fácil.

E o inverso também vale: uma reorganização de times sem revisar as fronteiras de sistema
produz times que precisam coordenar constantemente para mudar o que é deles.

A ordem que funciona: decidir a fronteira pelo domínio, depois alinhar a alocação de
times a ela — e não o contrário.

## Modelo Mental

**Fronteira segue domínio.** Se a maioria das mudanças atravessa sistemas, a fronteira
está no lugar errado.

## Quando Usar

- Ao decidir onde colocar uma funcionalidade nova.
- Antes de decompor um sistema grande.
- Após aquisições, para consolidar.
- Quando mudanças simples exigem tocar vários sistemas.
- Ao avaliar produtos de mercado.

## Quando Não Usar

**Separando por camada técnica.** Toda mudança de negócio atravessa todas as camadas, e o que era decomposição vira coordenação obrigatória.

**Separando por organograma.** A estrutura muda mais rápido que o domínio, e as fronteiras precisam ser refeitas a cada reorganização.

**Decompondo além do necessário.** Cada fronteira adicional é um contrato a manter e uma coordenação a pagar; abaixo de certo tamanho, ela custa mais do que isola.

**Sem declarar responsabilidade de cada sistema.** Sem isso, a mesma capacidade acaba implementada em vários lugares e nenhum é autoritativo.

**Deixando a fronteira do fornecedor entrar** no domínio. Quando o modelo do produto de mercado vira o modelo da empresa, trocar de fornecedor passa a exigir redesenhar processos de negócio.

## Alternativas

- **[Bounded context](/04-domain-driven-design/bounded-context.md)** — o mesmo
  raciocínio, com o método de DDD.
- **[Capacidades de negócio](/15-enterprise-architecture/business-capabilities.md)** — a lente de negócio para
  agrupar.
- **Manter como está** — decisão legítima quando o custo de reorganizar supera o de
  conviver.

## Trade-offs

| Sistemas maiores | Menores |
|---|---|
| Menos integração | Mais |
| Mudança cabe dentro | Atravessa |
| Times maiores | Autonomia |
| Escala uniforme | Independente |

| Fronteira por domínio | Por organograma |
|---|---|
| Sobrevive a reorganização | Desalinha |
| Exige entender o domínio | Óbvio |

## Modos de Falha

**Mudança atravessando sistemas.** Fronteira errada.

**Sistema sem responsabilidade clara.** Absorveu o que estava perto.

**Decomposição excessiva.** Custo de integração maior que o benefício.

**Fronteira de fornecedor no domínio.**

**Dois sistemas escrevendo a mesma entidade.**

**Sistema órfão.** Ninguém é dono, e ele evolui por acréscimo.

## Erros Comuns

**Separar por camada.** Um sistema de front-end, um de regras e um de dados garantem que toda mudança de negócio atravesse os três — e exija coordenação de três times para entregar uma funcionalidade.

**Separar por área organizacional.** O organograma muda a cada reorganização; a capacidade de negócio, não. Fronteiras desenhadas sobre o primeiro precisam ser redesenhadas a cada mudança de estrutura.

**Não aplicar o teste da mudança.** A pergunta que valida a fronteira é qual fração das mudanças a atravessa. Sem medi-la no histórico, a decomposição é estética.

**Não declarar responsabilidade.** Sem uma frase dizendo do que cada sistema responde, a mesma capacidade aparece em três lugares e nenhum deles é a fonte da verdade.

**Decompor por preferência arquitetural.** Decidir a granularidade pelo estilo escolhido — microsserviços, por exemplo — inverte a ordem: a fronteira vem do domínio, e o estilo vem depois.

**Não isolar produtos de mercado.** Sistema de terceiro cujo modelo vaza para o resto amarra a arquitetura ao fornecedor, e a substituição deixa de ser decisão comercial.

## Exemplo Real

Uma empresa de logística tinha 68 sistemas, e uma reclamação constante: mudanças simples
levavam meses.

O teste da mudança, aplicado às vinte alterações de negócio mais recentes:

```text
tocaram 1 sistema     3
tocaram 2 sistemas    4
tocaram 3 a 5        9
tocaram mais de 5    4
```

Oitenta e cinco por cento das mudanças atravessavam sistemas.

A análise das fronteiras encontrou a causa: os sistemas tinham sido separados por
**etapa do processo logístico** — coleta, transporte, entrega, faturamento — enquanto as
mudanças de negócio eram por **tipo de serviço**: entrega expressa, carga fracionada,
transporte refrigerado.

Adicionar um tipo de serviço novo exigia mudar os quatro sistemas.

A fronteira estava alinhada ao processo, e o negócio evoluía por serviço.

A reorganização, em dois anos, moveu a fronteira:

**Sistemas por tipo de serviço**, cada um cobrindo o ciclo completo — coleta a
faturamento — do serviço dele.

**Capacidades comuns extraídas** para serviços compartilhados: rastreamento,
geocodificação, emissão de documentos.

**Consolidação.** Os 68 sistemas viraram 41 — a decomposição anterior tinha produzido
sistemas pequenos demais, com custo de integração alto.

O teste da mudança, repetido dois anos depois:

```text
tocaram 1 sistema    13
tocaram 2 sistemas    5
tocaram 3 ou mais     2
```

E o tempo médio de entrega de uma mudança de negócio caiu de 11 semanas para 3.

A fronteira original era razoável quando foi criada — a empresa
tinha um tipo de serviço, e o processo era o único eixo de variação. Ela deixou de fazer
sentido quando o negócio passou a variar por serviço, e ninguém revisitou.

## Conceitos Relacionados

- [Portfólio de Aplicações](/15-enterprise-architecture/application-portfolios.md).
- [Paisagens de Integração](/15-enterprise-architecture/integration-landscapes.md).
- [Bounded Context](/04-domain-driven-design/bounded-context.md).
- [Arquitetura de Dados Corporativa](/15-enterprise-architecture/enterprise-data-architecture.md).

## Exercício Prático

Pegue as dez últimas mudanças de negócio e conte quantos sistemas cada uma tocou.

Se a maioria tocar três ou mais, suas fronteiras não acompanham o eixo em que o negócio
varia.

## Perguntas de Entrevista

- Qual o teste prático de uma fronteira?
- Por que separar por camada técnica é errado?
- Por que decomposição excessiva pode custar mais que ajudar?

## Para Aprofundar

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Newman, Sam. *Building Microservices*. 2ª ed. O'Reilly, 2021.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
