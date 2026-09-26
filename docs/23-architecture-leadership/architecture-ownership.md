---
id: architecture-ownership
title: Propriedade de Arquitetura
sidebar_position: 20
description: Componente sem dono apodrece — e a maior parte das organizações não sabe quantos tem.
doc_type: concept
level: 7
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor estabelece propriedade verificável de componentes e reconhece os
  órfãos antes de eles virarem incidente.
prerequisites: [team-topologies]
related: [team-topologies, organizational-architecture, leadership-governance]
canonical_for: [propriedade de arquitetura, componente órfão, dono como papel, propriedade verificável]
content_version: 3
last_reviewed: 2026-08-29
---

# Propriedade de Arquitetura

## Visão Geral

Todo componente de software precisa de um dono. Sem dono, ele não é atualizado, não é corrigido,
não é medido e não é removido — e continua rodando, porque software não para de rodar por falta
de cuidado.

```text
com dono      alguém responde por evolução, operação e decisão
sem dono      alguém aparece quando quebra, resolve o mínimo, e some
```

A diferença aparece devagar. Um componente órfão funciona bem por meses, acumula dependências
desatualizadas, deixa de ser compreendido, e vira um incidente que ninguém sabe resolver.

E a característica mais desconfortável do problema: a maior parte das organizações não sabe
quantos órfãos tem, porque a propriedade é declarada em documento e nunca verificada.

## Problema

Órfãos nascem de formas previsíveis:

```text
projeto encerrado           o time se dissolve e o sistema fica
pessoa que saiu             era dela, e não de um time
componente compartilhado    todos usam, ninguém mantém
biblioteca interna          criada por alguém, adotada por muitos
migração incompleta         o novo tem dono, o antigo não
aquisição                   veio com a empresa comprada
```

O caso do componente compartilhado é o mais insidioso: ele tem muitos usuários e nenhum
responsável, e cada usuário assume que outro cuida.

E há um segundo problema, mais sutil que a ausência: **a propriedade nominal**. Um documento diz
que o time X é dono, e o time X não sabe disso, ou sabe e não tem capacidade. Isso é pior que não
ter dono, porque cria a ilusão de cobertura.

## Conceitos Centrais

### Dono é papel, não pessoa nem time abstrato

```text
"o time de plataforma é dono"      ninguém em particular responde
"a Ana é dona"                     resolve até ela sair
"o time X, papel de mantenedor,
  atualmente a Ana"                resiste a saídas
```

A terceira forma é a que funciona. O papel pertence ao time; a ocupação é nominal e atualizada. A
saída de uma pessoa dispara a designação de outra, em vez de criar um órfão silencioso.

### Propriedade tem quatro dimensões

```text
evolução      decide o que muda, prioriza, aceita contribuições
operação      responde por disponibilidade, plantão, incidente
segurança     responde por vulnerabilidade e conformidade
decisão       decide contratos e fronteiras do componente
```

Elas podem estar separadas, e a separação precisa ser explícita. Um componente cuja operação é de
um time e cuja evolução é de outro funciona — desde que ambos saibam e o contrato entre eles
exista.

O que não funciona é a separação implícita, em que operação assume que evolução vai corrigir e
evolução assume que operação vai contornar.

### Propriedade precisa ser verificável

```text
declarada em wiki        desatualiza silenciosamente
declarada no repositório verificável, versionada, revisada
                         junto com o código
```

O padrão que funciona: um arquivo de metadados no próprio repositório, com o time e o papel, e
uma verificação automática que falha quando ele aponta para um time que não existe mais ou para
uma pessoa desligada.

Isso transforma órfãos de invisíveis em detectáveis. Ver
[funções de aptidão](/23-architecture-leadership/fitness-functions.md).

### Todo componente implantado precisa de dono

A regra que fecha o problema:

```text
todo serviço implantado tem dono declarado e válido
todo repositório ativo tem dono declarado e válido
um componente sem dono não é implantado
um componente cujo dono deixa de existir gera alerta
```

O terceiro item é o que impede a criação de órfãos novos. O quarto é o que detecta os que surgem
por mudança organizacional — que é a origem mais comum.

A regra tem efeitos colaterais que precisam de desenho próprio. O bloqueio na esteira atinge
justamente o órfão que quebrou: sem uma rota de exceção — implantação de correção autorizada pelo
plantão, registrada, com prazo para designar dono —, a regra impede o conserto no meio do
incidente. O alerta dispara em lote a cada reorganização, e se ninguém o agrupa por área ele vira
ruído que o gestor aprende a ignorar. E a verificação só é tão boa quanto o cadastro de times:
manter a integração é custo permanente, e um cadastro defasado produz falso alarme ou falso verde.

### Componentes compartilhados precisam de modelo

```text
dono único, contribuições aceitas   o mais comum e o mais simples
                                    o dono revisa e aceita mudanças
                                    de outros times
federado                            um grupo de mantenedores de
                                    times diferentes
plataforma                          um time de plataforma como dono,
                                    com o componente como produto
```

O primeiro modelo — código aberto interno — funciona bem quando o dono tem capacidade de revisar.
Ele falha quando o volume de contribuições excede essa capacidade, e aí ele vira gargalo.

O que não é modelo: "todos são donos". Isso significa que ninguém é.

### Descomissionar é responsabilidade do dono

```text
componente sem uso        deveria ser removido
sem dono                  ninguém o remove
com dono                  a remoção é decisão, com data
```

Um dos custos invisíveis de órfãos é que eles nunca morrem. Sistemas acumulam componentes que
ninguém usa e todos mantêm — atualizações de segurança, migrações, custo de infraestrutura — por
falta de alguém com autoridade para desligá-los.

### Capacidade precisa acompanhar a propriedade

Declarar um time como dono sem lhe dar capacidade produz propriedade nominal.

```text
"o time X é dono de 14 componentes, e tem 6 pessoas"
```

A carga de propriedade é parte da carga cognitiva do time, e ela precisa ser contada no
dimensionamento. Ver
[topologias de time](/23-architecture-leadership/team-topologies.md).

Quando a carga excede a capacidade, as saídas são: transferir componentes, descomissionar
componentes, ou aumentar o time. Ignorar produz propriedade que existe no papel.

## Modelo Mental

**Dono é papel, declarado no repositório e verificado automaticamente.** Sem verificação, a
propriedade desatualiza e os órfãos ficam invisíveis.

## Quando Usar

- Para todo componente implantado e todo repositório ativo.
- Como verificação automática, não como documento.
- Com as quatro dimensões explícitas quando elas se separam.

## Quando Não Usar

O mecanismo completo — arquivo no repositório, verificação diária, bloqueio na esteira — cobra
integração com o cadastro de times, triagem de alertas e rota de exceção. Ele não se paga quando:

**O repositório é experimental ou protótipo com data de expiração.** Exigir dono verificado de algo
que será apagado em semanas custa mais que o órfão que evitaria; basta a data de expiração
aplicada automaticamente.

**A organização é pequena o bastante para que todos conheçam todos os componentes.** Com um ou dois
times e poucas dezenas de componentes, a pergunta "de quem é isto?" se responde numa conversa, e a
integração com um cadastro de times que muda pouco é peso morto — até a organização crescer.

**O componente está congelado com data de desligamento.** Basta o dono de operação e segurança até
a data; exigir as quatro dimensões de propriedade de algo que não vai evoluir cria trabalho de
papel sem efeito.

## Alternativas

- **Propriedade coletiva com rodízio** — funciona em organizações pequenas com forte cultura.
- **Time de plataforma como dono** de tudo que é compartilhado; concentra e escala mal.
- **Arquivamento agressivo** — em vez de encontrar dono para componentes duvidosos, desligá-los e
  ver quem reclama.

A terceira é radical, eficaz e assustadora. Ela funciona bem em ambientes com boa observabilidade:
desligar um componente sem uso aparente por uma semana revela dependências que nenhum inventário
revela.

## Trade-offs

| Dono único | Federado |
|---|---|
| Responsabilidade clara | Distribui a carga |
| Vira gargalo | Diluição da responsabilidade |
| Decisão rápida | Decisão lenta, exige consenso entre times |
| Contexto de um time | Contexto de vários consumidores |

| Propriedade verificada | Declarada |
|---|---|
| Órfãos detectáveis | Órfãos invisíveis até o incidente |
| Exige integração com cadastro | Sem custo de construir |

## Modos de Falha

**Órfão silencioso.** Funciona até virar incidente.

**Propriedade nominal.** Ilusão de cobertura.

**Compartilhado sem modelo.** Todos usam, ninguém mantém.

**Dono sem capacidade.** Propriedade que não é exercida.

**Sem autoridade para remover.** Componentes que nunca morrem.

**Declaração em wiki.** Desatualiza sem sinal.

## Erros Comuns

**Não verificar** se o dono declarado ainda existe: a reorganização extingue o time, o arquivo
continua apontando para ele, e o órfão só aparece no incidente.

**Atribuir dono a time**, sem papel nomeado: o acionamento em incidente cai numa lista de
distribuição, e cada membro assume que outro vai responder.

**Não contar propriedade** na carga cognitiva: o time aceita o décimo quinto componente, deixa de
atualizar os mais antigos, e a propriedade vira nominal sem que nenhum registro mude.

**Não ter modelo** para bibliotecas internas: contribuições ficam sem revisor, cada consumidor mantém
um fork, e uma vulnerabilidade precisa ser corrigida em várias cópias divergentes.

**Não datar** a decisão de descomissionar: o componente fica meses marcado para remoção, continua
recebendo patches e acaba nunca sendo removido.

## Exemplo Real

Uma empresa de tecnologia com 320 engenheiros passou por um incidente que expôs o problema: um
serviço de conversão de moeda, usado por onze sistemas, ficou indisponível por 6 horas. Ninguém
sabia quem era responsável.

A investigação encontrou que ele tinha sido construído por um time dissolvido em 2022, e que os
onze consumidores tinham surgido depois — cada um assumindo que alguém cuidava.

Um inventário completo, feito depois, encontrou:

```text
serviços implantados                          287
com dono declarado em algum lugar             198
com dono declarado e válido (time existe)     141
com dono que reconhece a propriedade          109
sem nenhum dono identificável                  89
sem uso detectável nos últimos 6 meses         34
```

Oitenta e nove órfãos, e 34 componentes rodando sem uso — consumindo infraestrutura, recebendo
atualizações de segurança, e ocupando espaço mental.

As medidas, ao longo de 8 meses:

**Arquivo de propriedade obrigatório** no repositório de todo componente, com time, papel e
ocupante atual, integrado ao cadastro de times da empresa.

**Verificação automática diária.** Um componente cujo time deixou de existir, ou cujo ocupante do
papel foi desligado, gera alerta ao gestor da área e entra numa fila de resolução com prazo.

**Nenhuma implantação nova sem dono válido.** A esteira rejeita.

**Os 34 sem uso foram desligados**, em duas ondas, com uma semana de "desligamento observado"
antes da remoção definitiva. Três reclamações apareceram, todas de uso trimestral que a
observabilidade não captava — esses três foram religados, com dono designado.

**Os 89 órfãos** foram tratados individualmente:

```text
transferidos a um time com capacidade      41
descomissionados                           28
absorvidos pela plataforma                 12
mantidos em modo congelado, com dono que
  responde só por operação e segurança      8
```

Os 8 congelados são a categoria honesta: componentes que ninguém quer manter, que ainda são
usados, e cuja substituição está no roteiro. Declará-los assim é melhor que fingir propriedade
ativa.

**Os 89 com propriedade apenas nominal** — 57 apontando para time inexistente, 32 com dono que não
reconhecia o componente — foram revalidados time a time. A verificação diária encontra os
primeiros; os segundos ela não enxerga, porque o time existe, e só apareceram quando cada gestor
teve de confirmar a lista de componentes do seu time. Cada um terminou com dono que assinou o
arquivo de propriedade ou entrou nas mesmas saídas dos órfãos.

**Carga de propriedade contada.** Cada time passou a ter o número de componentes que mantém
visível, e três times que estavam acima de 12 tiveram componentes transferidos.

**Modelo para compartilhados**: bibliotecas internas passaram a exigir dono único com modelo de
contribuição, e as que não encontraram dono foram descontinuadas com prazo de migração.

Resultados após 8 meses:

```text
serviços implantados                       228 (de 287)
com dono válido e reconhecido              228 (100%)
órfãos                                     0
custo de infraestrutura                    -11%
incidentes sem responsável identificado    de 7/ano para 0
tempo médio até acionar o responsável
  em incidente                             de 47 min para 4 min
```

O último número é o que a operação valoriza mais: 43 minutos economizados por incidente,
simplesmente por saber a quem ligar.

O detalhe que a equipe destaca: os 198 componentes com dono "declarado em algum lugar" davam a impressão
de que a organização tinha 69% de cobertura. A verificação mostrou 38% — e a diferença entre
declarar e verificar é toda a diferença entre um inventário e uma ficção.

## Conceitos Relacionados

- [Topologias de Time](/23-architecture-leadership/team-topologies.md) — a carga de propriedade.
- [Arquitetura Organizacional](/23-architecture-leadership/organizational-architecture.md).
- [Funções de Aptidão](/23-architecture-leadership/fitness-functions.md) — a verificação.
- [Padrões](/19-architecture-governance/governance-standards.md).

## Exercício Prático

Escolha cinco componentes do seu sistema e pergunte a quem eles pertencem — primeiro ao
documento, depois às pessoas que ele indica.

A diferença entre as duas respostas é a medida da propriedade nominal na sua organização.

## Perguntas de Entrevista

- Por que dono precisa ser papel e não pessoa?
- Por que propriedade nominal é pior que ausência declarada?
- Por que um dono sem autoridade para descomissionar não é dono?

## Para Aprofundar

- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Larson, Will. *An Elegant Puzzle: Systems of Engineering Management*. Stripe
  Press, 2019.
