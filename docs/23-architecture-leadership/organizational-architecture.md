---
id: organizational-architecture
title: Arquitetura Organizacional
sidebar_position: 17
description: Desenhar times, fronteiras e fluxos de decisão como parte do desenho do sistema.
doc_type: concept
level: 7
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor propõe mudanças de estrutura organizacional como parte de uma proposta
  arquitetural, com o custo da transição declarado.
prerequisites: [conways-law]
related: [conways-law, team-topologies, architecture-ownership]
canonical_for: [arquitetura organizacional, desenho de fronteira organizacional, custo de reorganização]
content_version: 3
last_reviewed: 2026-08-29
---

# Arquitetura Organizacional

## Visão Geral

Se a estrutura organizacional determina a arquitetura possível, então propor arquitetura sem
propor organização é propor metade.

```text
proposta incompleta   "vamos separar em cinco serviços por domínio"
proposta completa     "vamos separar em cinco serviços por domínio,
                      com cinco times donos, o que exige mover 23
                      pessoas e vai custar cerca de quatro meses
                      de produtividade reduzida"
```

A segunda é mais difícil de aprovar e é a única que descreve o que de fato precisa acontecer. A
primeira produz o resultado do case do [nível anterior](/23-architecture-leadership/conways-law.md): cinco serviços no papel e
um sistema acoplado na prática.

## Problema

Arquitetos frequentemente tratam a organização como dado: uma restrição a contornar, não uma
variável a propor. Isso acontece por três razões, todas compreensíveis:

```text
não é a alçada do arquiteto
propor reorganização parece invasão de território
o custo de reorganizar é alto e visível
```

O resultado é uma classe de propostas que não pode funcionar, e cujo fracasso é atribuído a
execução.

O erro simétrico existe e é mais raro: propor reorganização como primeira resposta a qualquer
problema. Reorganizar custa meses de produtividade, desestabiliza pessoas, e frequentemente
resolve por sorte o que uma mudança de processo resolveria por desenho.

## Conceitos Centrais

### As três estruturas que importam

```text
estrutura formal      quem reporta a quem; define carreira e orçamento
estrutura de trabalho quem trabalha com quem no dia a dia
estrutura de decisão  quem decide o quê, e quem precisa concordar
```

A arquitetura reproduz a segunda, não a primeira. E a terceira é a que determina a velocidade.

Isso abre uma possibilidade frequentemente ignorada: **mudar a estrutura de trabalho e de decisão
sem mexer na formal**. É muito mais barato, não exige processo de recursos humanos, e resolve boa
parte dos casos.

```text
mesma hierarquia, mas
  o time passa a decidir sua tecnologia sem aprovação
  duas equipes passam a ter ritual conjunto semanal
  a propriedade de um componente é transferida
  uma pessoa é alocada por três meses em outro contexto
```

### Fronteira de time é fronteira de arquitetura

O que define uma fronteira organizacional bem desenhada é a mesma coisa que define uma fronteira
arquitetural: **o que muda junto fica junto**.

```text
bom      time por domínio de negócio; mudanças de produto
         são locais
ruim     time por camada técnica; toda mudança atravessa
ruim     time por projeto; a fronteira desaparece quando
         o projeto acaba, e o código fica órfão
```

O terceiro caso merece atenção porque é o mais comum em organizações que operam por projeto: o
sistema fica sem dono no dia em que o projeto encerra. Ver
[propriedade de arquitetura](/23-architecture-leadership/architecture-ownership.md).

### Autonomia exige três coisas

Times autônomos são o objetivo declarado de quase toda reorganização, e ela falha quando alguma
das três falta:

```text
escopo       o time tem tudo que precisa para entregar
capacidade   o time tem as competências necessárias
autoridade   o time pode decidir dentro do seu escopo
```

Dar escopo sem capacidade produz um time que depende de outros e não pode dizer isso. Dar escopo e
capacidade sem autoridade produz um time que sabe o que fazer e precisa pedir permissão, e a
fila dessa permissão passa a ditar o ritmo de entrega, como no exemplo ao fim deste documento.

E a plataforma é o que torna as três viáveis sem duplicar tudo. Ver
[topologias de time](/23-architecture-leadership/team-topologies.md).

### O custo da reorganização é real e temporário

```text
queda de produtividade       3 a 6 meses, tipicamente 20% a 40%
perda de contexto            pessoas mudando de domínio
custo de relacionamento      confiança entre pessoas se reconstrói
risco de saída               reorganizações provocam desligamentos
```

Declarar esse custo numa proposta é o que a torna crível. Uma proposta de reorganização que não
menciona a queda de produtividade será desacreditada assim que ela ocorrer, e ela vai ocorrer.

Declarada de antemão, a mesma queda é uma previsão cumprida, o que aumenta a credibilidade em vez
de reduzi-la.

### Reorganizar tem um custo de repetição

```text
uma reorganização a cada 3 anos    absorvida
uma por ano                        as pessoas param de investir
                                   em contexto que sabem que vão perder
duas por ano                       cinismo organizacional
```

Isso significa que reorganizações precisam ser poucas e bem desenhadas. Um arquiteto que propõe
mudança de estrutura precisa ter alta confiança de que a fronteira proposta é a certa, porque a
próxima correção vai custar muito mais que a primeira.

Ver [contextos delimitados](/04-domain-driven-design/bounded-context.md): a fronteira de
domínio é a melhor evidência disponível.

### Fluxos de decisão são desenháveis

Menos visível que a estrutura de times, e às vezes mais impactante:

```text
quem decide tecnologia dentro de um time
quem decide contrato entre times
quem aprova investimento acima de um limite
quem resolve discordância entre times
quanto tempo cada decisão leva
```

Mapear isso frequentemente revela que a lentidão não é técnica nem de estrutura de times, e sim de
quantidade de pessoas que precisam concordar. Ver
[governança](/23-architecture-leadership/leadership-governance.md).

### Distribuição geográfica é arquitetura

```text
mesma cidade                fronteiras podem ser fluidas
fusos com sobreposição      fronteiras precisam de contrato
fusos sem sobreposição      fronteiras precisam de contrato rígido;
                            a colaboração síncrona é inviável e cada
                            troca assíncrona custa um dia
```

Colocar um domínio sob responsabilidade de duas equipes em fusos sem sobreposição é uma decisão
arquitetural, ainda que ninguém a registre como tal. Ela vai produzir uma fronteira interna
naquele domínio, quer alguém a desenhe ou não.

## Modelo Mental

**Proposta arquitetural sem proposta organizacional é meia proposta.** E mudar a estrutura de
trabalho é muito mais barato que mudar a formal.

## Quando Usar

- Sempre que a arquitetura proposta exigir fronteiras que a estrutura atual não sustenta.
- Ao diagnosticar lentidão sem falta de capacidade.
- Ao propor autonomia de times.
- Antes de uma migração estrutural grande.

## Quando Não Usar

**Quando o mapa de decisão aponta o gargalo.** Se a lentidão está numa fila de aprovação ou num
comitê, mover pessoas preserva a fila, como no caso do exemplo abaixo.

**Quando houve reorganização nos últimos 12 a 18 meses.** A anterior ainda não foi absorvida, e a
nova cai na faixa de custo de repetição em que as pessoas param de investir em contexto.

**Quando a fronteira proposta não foi validada** contra os
[contextos delimitados](/04-domain-driven-design/bounded-context.md): reorganizações repetidas
custam mais que a primeira, e uma fronteira errada garante a repetição.

**Quando a estrutura de trabalho resolveria**: um ritual conjunto, uma alocação temporária ou a
transferência de propriedade de um componente, sem mexer na formal.

**Quando não há patrocínio da liderança** de engenharia: a proposta morre na aprovação e consome
o capital político do arquiteto para a próxima.

## Alternativas

- **Mudar a estrutura de trabalho**: rituais, alocação temporária, propriedade transferida, sem
  tocar a formal.
- **Mudar o fluxo de decisão**: remover aprovadores, delegar limites (frequentemente mais
  efetivo e mais barato).
- **Adaptar a arquitetura** ao que a estrutura suporta.
- **Rotação de pessoas**: transfere contexto e cria comunicação onde não havia.

As duas primeiras deveriam ser sempre consideradas antes da reorganização formal, e raramente
são.

## Trade-offs

| Reorganizar | Adaptar a arquitetura |
|---|---|
| Fronteiras sustentáveis | Sem custo de transição |
| Custo de meses | Arquitetura limitada |
| Exige patrocínio | Autonomia do arquiteto |

| Estrutura formal | Estrutura de trabalho |
|---|---|
| Alinha carreira e orçamento | Barata e reversível |
| Cara e lenta | Pode conflitar com a formal |

## Modos de Falha

**Arquitetura proposta sem organização.** Não se materializa.

**Reorganização sem custo declarado.** Perde credibilidade quando a queda vem.

**Reorganizações frequentes.** Cinismo e perda de contexto.

**Autonomia sem capacidade.** Times que dependem e não podem dizer.

**Times por projeto.** Sistemas órfãos ao fim.

**Fronteira geográfica ignorada.** Divisão emergente dentro do domínio.

## Erros Comuns

**Tratar a organização como dado.** A proposta separa serviços que continuam com o mesmo time, e o
acoplamento volta pelo canal de comunicação que ninguém mudou.

**Propor reorganização formal** quando a de trabalho bastaria. Paga-se de 3 a 6 meses de queda de
produtividade por um resultado que um ritual ou uma alocação temporária entregaria em semanas.

**Não mapear o fluxo de decisão** antes de mexer em times. Os times mudam, os aprovadores ficam, e
a lentidão sobrevive à reorganização.

**Não declarar a queda de produtividade.** Quando ela chega, é lida como fracasso da proposta, e a
pressão é por reverter antes de o novo desenho estabilizar.

**Reorganizar por modelo** em vez de por diagnóstico. Copiar um desenho pronto (por produto, por
camada, por domínio) sem saber onde está o gargalo produz a sequência de 2022 a 2024 do exemplo:
três reorganizações, cada uma motivada por um sintoma, nenhuma tocando a causa.

## Exemplo Real

Uma empresa de mídia com 210 engenheiros passou por três reorganizações em quatro anos. A queixa
recorrente nas pesquisas internas era "as coisas mudam antes de funcionarem".

Uma revisão do histórico encontrou o padrão:

```text
2022   reorganização por produto        motivo: entrega lenta
2023   reorganização por camada         motivo: falta de padronização
2024   reorganização por domínio        motivo: entrega lenta
```

As três foram motivadas por sintomas e nenhuma por diagnóstico. E a de 2023 tinha desfeito
exatamente o que a de 2022 tentava construir.

Antes da quarta, a liderança de engenharia pediu um diagnóstico à área de arquitetura, com uma
restrição: **a recomendação não podia ser reorganizar**, a menos que nenhuma alternativa
funcionasse.

O que o diagnóstico encontrou:

```text
estrutura de times            razoável — por domínio, desde 2024
estrutura de trabalho         nove times de fluxo dependiam do time
                              de dados para qualquer mudança de esquema
estrutura de decisão          escolha de tecnologia exigia aprovação
                              de um comitê com fila de 3 semanas
                              qualquer contrato entre times exigia
                              aprovação de dois gerentes
fluxo de aprovação de
  investimento acima de
  R$ 200 mil                  seis assinaturas, média de 11 semanas
```

Nenhum desses problemas era de estrutura de times. Todos eram de estrutura de decisão.

As mudanças, sem nenhuma reorganização:

**Escolha de tecnologia delegada** aos times dentro de uma lista curta, com exceção registrada
para fora dela. O comitê foi extinto. Ver
[padrões](/23-architecture-leadership/leadership-standards.md).

**Contratos entre times** deixaram de exigir aprovação gerencial; passaram a exigir apenas
registro e verificação automática de compatibilidade.

**Mudança de esquema delegada.** O time de dados passou de executor a habilitador com prazo:
transferiu competência de modelagem e qualidade a cada time de domínio ao longo de sete meses, e
manteve verificação automática como serviço.

**Aprovação de investimento** reduzida de seis para duas assinaturas abaixo de R$ 1 milhão.

Resultados após 10 meses:

```text
tempo médio de entrega                    -38%
tempo de aprovação de investimento        de 11 para 2 semanas
mudanças de esquema por time, por mês     de 0,4 para 3,1
pesquisa interna: "consigo tomar as
  decisões do meu escopo"                 de 2,4 para 4,1 (escala 5)
reorganizações                            0
```

A conclusão registrada: as três reorganizações anteriores tinham custado, somadas, cerca de
14 meses de produtividade reduzida, e nenhuma tocava a causa. A causa estava no fluxo de decisão,
que não aparece em nenhum organograma e não exigia mover ninguém.

E a restrição imposta ao diagnóstico ("não pode ser reorganizar") foi o que forçou a procurar
em outro lugar. Ela ficou como prática: toda proposta de reorganização passou a exigir uma seção
mostrando que mudanças de estrutura de trabalho e de decisão foram consideradas e por que não
bastam.

## Conceitos Relacionados

- [Lei de Conway](/23-architecture-leadership/conways-law.md).
- [Topologias de Time](/23-architecture-leadership/team-topologies.md).
- [Propriedade de Arquitetura](/23-architecture-leadership/architecture-ownership.md).
- [Governança](/23-architecture-leadership/leadership-governance.md): o fluxo de decisão.

## Exercício Prático

Mapeie, para uma decisão típica do seu contexto, quantas pessoas precisam concordar e quanto tempo
o processo leva.

Depois pergunte quantas dessas aprovações já negaram alguma coisa nos últimos dois anos. As que
nunca negaram são atrito sem função.

## Perguntas de Entrevista

- Por que mudar a estrutura de trabalho é frequentemente melhor que reorganizar?
- Que três coisas a autonomia de um time exige?
- Por que reorganizações repetidas custam mais que a primeira?

## Para Aprofundar

- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Larson, Will. *An Elegant Puzzle: Systems of Engineering Management*. Stripe Press, 2019.
