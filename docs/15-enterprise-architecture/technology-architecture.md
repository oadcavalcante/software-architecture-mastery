---
id: technology-architecture
title: Arquitetura de Tecnologia
sidebar_position: 5
description: A base sobre a qual tudo roda — e o custo de cada tecnologia adicional a operar.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor avalia a variedade tecnológica pelo custo operacional agregado
  e decide o que a organização suporta.
prerequisites: [enterprise-architecture]
related: [technology-radar, standards, platform-engineering]
canonical_for: [arquitetura de tecnologia, variedade tecnológica, custo de suporte, obsolescência]
content_version: 1
last_reviewed: 2026-08-28
---

# Arquitetura de Tecnologia

## Visão Geral

A arquitetura de tecnologia descreve a base sobre a qual as aplicações rodam:
infraestrutura, plataformas, linguagens, armazenamentos, ferramentas.

A decisão central dela não é qual tecnologia é melhor. É **quantas a organização
consegue suportar bem** — porque cada uma adicionada tem custo operacional permanente
que raramente entra na conta da decisão.

## Problema

A escolha de tecnologia é tomada por time, em função do problema local e da familiaridade
de quem decide. Isso é razoável e produz um agregado caro.

```text
cada linguagem      esteira, ferramentas, bibliotecas padrão, conhecimento
cada banco          operação, cópia, monitoramento, ajuste, sobreaviso
cada plataforma     atualização, segurança, integração
cada ferramenta     licença, aprendizado, manutenção
```

O custo não é somado — ele é multiplicado pelo número de pessoas que precisam conhecer
cada uma, e pelo número de ambientes em que cada uma precisa ser operada.

E ele é invisível na decisão local: quem escolhe o quarto banco não paga o custo de
operar quatro bancos.

## Conceitos Centrais

### O custo de uma tecnologia adicional

Sendo explícito, porque a estimativa costuma ser feita apenas do custo de licença:

```text
conhecimento         alguém precisa dominar, e mais de uma pessoa
operação             monitorar, atualizar, corrigir, responder a incidente
integração           com esteira, telemetria, identidade, rede
segurança            acompanhar vulnerabilidades, aplicar correções
contratação          um requisito a mais na busca por pessoas
sobreaviso           alguém precisa saber depurar de madrugada
```

A última linha é o teste mais direto: **existem pelo menos três pessoas capazes de
resolver um incidente nesta tecnologia às 3h?** Se não, ela é um risco, não uma escolha.

### Variedade versus adequação

A tensão real desta área:

```text
mais variedade   ferramenta certa para cada problema
                 custo operacional multiplicado
menos variedade  custo operacional baixo
                 ferramenta inadequada em alguns casos
```

Nenhum extremo funciona. Uma organização com uma única tecnologia para tudo força
soluções ruins; uma sem restrição nenhuma não consegue operar bem nenhuma delas.

O ponto de equilíbrio depende do tamanho: uma organização de 30 engenheiros suporta bem
menos tecnologias que uma de 300.

E a regra prática que funciona: **suportar poucas bem, permitir exceções com o time
assumindo a operação**. Ver
[radar tecnológico](technology-radar.md).

### Serviço gerenciado muda a conta

Uma tecnologia consumida como serviço gerenciado tem custo operacional muito menor que a
mesma autogerida.

```text
banco autogerido    custo alto de operação — conta como tecnologia suportada
banco gerenciado    custo baixo — a variedade pesa menos
```

Ver [serviços gerenciados](../09-cloud-architecture/managed-services.md).

Isso muda a decisão: adotar um armazenamento adicional gerenciado é uma decisão bem menor
que adotá-lo autogerido — e a discussão frequentemente não faz essa distinção.

### Obsolescência precisa de plano

Tecnologias envelhecem, e o custo cresce silenciosamente:

```text
versão fora de suporte        sem correções de segurança
comunidade encolhendo         menos bibliotecas, menos respostas
contratação difícil           poucas pessoas com a experiência
fornecedor descontinuando     prazo imposto de fora
```

O que evita a crise:

```text
inventário de versões, derivado
alerta de proximidade de fim de suporte
atualização como rotina, não como projeto
plano de saída para o que está em declínio
```

A terceira linha é a que decide: organizações que tratam atualização como projeto
extraordinário acumulam atraso até que a atualização vire crise.

Ver [confiança na cadeia de suprimentos](../10-security/supply-chain-trust.md).

### Consolidar tem custo e nem sempre se paga

A tentação, diante de variedade excessiva, é padronizar tudo numa tecnologia.

O custo de migrar sistemas funcionais é alto, e o benefício — menos uma tecnologia a
operar — precisa superá-lo.

```text
consolidar faz sentido   tecnologia em declínio, com risco
                         poucos sistemas usando, migração barata
                         custo operacional desproporcional
não faz sentido          sistema estável, funcionando, com equipe que domina
```

A decisão honesta frequentemente é: **parar de adicionar, e deixar o existente morrer
naturalmente** conforme os sistemas são substituídos por outros motivos.

### A plataforma é o mecanismo, não o documento

Um documento que lista tecnologias suportadas depende de alguém consultar. Uma plataforma
que oferece as suportadas prontas torna a escolha certa a mais fácil.

Ver [plataformas internas](../14-devops-and-platform/internal-developer-platforms.md) e
[padrões](standards.md).

É a diferença entre governar por documento e por caminho pavimentado.

### A variedade cresce por acréscimo e nunca por decisão

Uma dinâmica que vale nomear: adicionar uma tecnologia é uma decisão local, tomada por um
time, com benefício imediato e visível. Remover uma é uma decisão organizacional, sem
benefício visível, que exige migrar sistemas que funcionam.

O resultado estrutural: a variedade só cresce.

```text
adicionar   um time decide, benefício local, custo distribuído
remover     alguém precisa liderar, custo local, benefício distribuído
```

Essa assimetria de incentivo é a causa raiz, e ela não se corrige com disciplina. O que
funciona são mecanismos que a compensam:

**Tornar o custo visível na decisão de adicionar.** Quem propõe apresenta o custo
operacional agregado — sobreaviso, conhecimento, integração.

**Atribuir a alguém a responsabilidade de reduzir**, com legitimidade equivalente à de
quem adiciona.

**Prazo de reavaliação** em tecnologias adotadas: em doze meses, ela ainda se justifica?

A terceira é a mais simples e a menos usada. Ela transforma "adicionamos e ficou" em uma
decisão que precisa ser reafirmada com evidência.

## Modelo Mental

**Cada tecnologia adicional tem custo operacional permanente.** A pergunta não é se ela é
boa, é se a organização consegue operá-la bem.

## Quando Usar

- Ao avaliar a adoção de uma tecnologia nova.
- Ao definir o que a plataforma suporta.
- Em planejamento de obsolescência.
- Após aquisições, para avaliar o que veio junto.
- Quando o custo operacional cresce sem explicação.

## Quando Não Usar

**Avaliando apenas custo de licença.**

**Padronizando em uma tecnologia só.**

**Consolidando sistemas estáveis** sem benefício claro.

**Sem plano de obsolescência.**

**Governando por documento** em vez de plataforma.

**Sem distinguir gerenciado de autogerido** na conta de variedade.

## Alternativas

- **[Radar tecnológico](technology-radar.md)** — orientação com contexto.
- **Caminho pavimentado** — o suportado vem pronto.
- **Exceção com assunção de operação** — o time que escolhe fora assume o sobreaviso.
- **Serviços gerenciados** — reduzem o custo de variedade.

A terceira é o mecanismo que equilibra autonomia e custo: a escolha permanece possível, e
quem a faz paga por ela.

## Trade-offs

| Menos tecnologias | Mais |
|---|---|
| Operação simples | Complexa |
| Conhecimento concentrado | Disperso |
| Soluções inadequadas em alguns casos | Ferramenta certa |
| Contratação mais fácil | Mais requisitos |

| Gerenciado | Autogerido |
|---|---|
| Baixo custo de variedade | Alto |
| Menos controle | Total |
| Dependência do provedor | Autonomia |

## Modos de Falha

**Variedade sem capacidade de operar.** Sobreaviso que ninguém sabe atender.

**Obsolescência acumulada.** Atualização vira crise.

**Custo operacional invisível.** Cresce sem ser atribuído.

**Padronização excessiva.** Soluções ruins forçadas.

**Consolidação sem retorno.** Migração cara de sistemas que funcionavam.

**Tecnologia com um único conhecedor.**

## Erros Comuns

**Não contabilizar custo operacional na decisão.**

**Não verificar quantas pessoas sabem operar.**

**Tratar atualização como projeto.**

**Não distinguir gerenciado de autogerido.**

**Consolidar por princípio.**

**Governar por lista.**

## Exemplo Real

Uma empresa de tecnologia com 120 engenheiros fez um inventário de tecnologias em uso:

```text
linguagens principais      6
bancos de dados            9
sistemas de mensageria     4
plataformas de execução    3
ferramentas de esteira     4
```

Nove bancos de dados para 120 engenheiros.

A avaliação de sustentabilidade — quantas pessoas conseguem resolver um incidente em cada
um — foi reveladora:

```text
banco relacional principal    dezenas
cache                          muitas
busca                          4
série temporal                 2
grafo                          1
documento (dois diferentes)    3 e 1
colunar                        2
chave-valor secundário         1
```

Quatro tecnologias com uma ou duas pessoas capazes de atendê-las em incidente.

E a análise de uso mostrou que três delas suportavam um único serviço cada, de
criticidade baixa.

As decisões:

**Parar de adicionar.** Novas escolhas de armazenamento passaram a exigir justificativa
com o custo operacional explicitado, e aprovação de alcance amplo. Ver
[níveis de arquitetura](architecture-levels.md).

**Migrar o que era barato.** Os três serviços de baixa criticidade com tecnologias de um
conhecedor migraram para o banco relacional principal — em nenhum deles a escolha
original tinha justificativa que sobrevivesse à revisão.

**Manter o que se justificava.** A busca e a série temporal permaneceram, com
investimento em ampliar o conhecimento de 4 e 2 para 6 e 5 pessoas. As duas eram
genuinamente necessárias.

**Migrar para gerenciado** onde possível. Quatro dos nove eram autogeridos; três
migraram, reduzindo o custo operacional sem reduzir a variedade.

**O grafo permaneceu**, com uma pessoa. Foi registrado como risco aceito, com plano de
transferência de conhecimento em doze meses.

Resultado: de nove para seis bancos, e nenhum com menos de cinco pessoas capazes de
atendê-lo.

O que se registrou depois: nenhuma das nove escolhas tinha sido errada no momento em que
foi feita. Cada uma resolvia um problema real. O erro foi nunca somar — ninguém tinha,
até o inventário, a visão de que a organização operava nove armazenamentos.

## Conceitos Relacionados

- [Radar Tecnológico](technology-radar.md).
- [Padrões](standards.md).
- [Engenharia de Plataforma](../14-devops-and-platform/platform-engineering.md).
- [Serviços Gerenciados](../09-cloud-architecture/managed-services.md).

## Exercício Prático

Liste as tecnologias de infraestrutura em uso na sua organização e, para cada uma,
quantas pessoas conseguem resolver um incidente nela.

As que tiverem menos de três são risco, não escolha.

## Perguntas de Entrevista

- Por que o custo de uma tecnologia adicional é multiplicado, não somado?
- Por que serviço gerenciado muda a conta de variedade?
- Por que consolidar nem sempre se paga?

## Para Aprofundar

- Ross, Jeanne et al. *Enterprise Architecture as Strategy*. HBS Press, 2006.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Thoughtworks. *Technology Radar*.
