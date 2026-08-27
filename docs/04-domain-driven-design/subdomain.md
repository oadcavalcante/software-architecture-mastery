---
id: subdomain
title: Subdomínio
sidebar_position: 2
description: A divisão do domínio em áreas com características distintas — e a decisão de investimento que ela informa.
doc_type: foundation
level: 2
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor divide um domínio em subdomínios e usa a classificação
  para decidir onde investir esforço de engenharia.
prerequisites: [domain]
related: [core-domain, supporting-domain, generic-domain, bounded-context]
canonical_for: [subdomínio, subdomain]
content_version: 1
last_reviewed: 2026-08-26
---

# Subdomínio

## Visão Geral

Um subdomínio é uma área do domínio com coesão própria. Uma seguradora tem
subscrição, sinistro, cobrança, corretagem, contabilidade, atendimento.

A divisão em subdomínios não é organização de código — é análise de negócio. Ela
existe independentemente do software, e o software deveria refletí-la.

## O Problema

Sem essa análise, todo o domínio recebe o mesmo tratamento: mesma qualidade de
modelagem, mesmo esforço de engenharia, mesma prioridade de time.

Isso é sempre errado, em uma de duas direções.

Áreas que diferenciam a empresa recebem menos atenção do que merecem, porque
competem com o resto por recursos.

E áreas que não diferenciam nada — emissão de nota fiscal, autenticação, envio de
e-mail — recebem esforço de engenharia que poderia ser comprado pronto.

A divisão em subdomínios existe para tornar essa alocação deliberada.

## Conceitos Centrais

### Subdomínio pertence ao espaço do problema

Distinção que causa confusão constante:

**Subdomínio** é uma divisão do **problema** — do negócio, tal como ele é.

**[Bounded context](bounded-context.md)** é uma divisão da **solução** — do
software que você constrói.

O ideal é que cada subdomínio corresponda a um bounded context. Na prática, um
subdomínio pode ser atendido por dois contextos, ou um contexto legado pode
cobrir três subdomínios.

Quando divergem, isso é informação: aponta onde o software não acompanha o
negócio.

### Os três tipos

A classificação que orienta a decisão de investimento:

| Tipo | O que é | Decisão |
|---|---|---|
| [Core](core-domain.md) | Onde a empresa se diferencia | Invista o melhor esforço |
| [Supporting](supporting-domain.md) | Necessário, específico, não diferencia | Construa de forma simples |
| [Generic](generic-domain.md) | Necessário, resolvido pelo mercado | Compre ou adote pronto |

O erro mais comum é tratar tudo como core.

### Como encontrar os subdomínios

Três abordagens que funcionam, em ordem de custo:

**Pela estrutura organizacional.** Áreas e departamentos costumam corresponder a
subdomínios, porque a organização também se dividiu pelo negócio. É uma primeira
aproximação barata e frequentemente boa.

**Pelo vocabulário.** Onde o mesmo termo muda de significado, há fronteira entre
áreas. "Apólice" para subscrição e para cobrança são coisas diferentes.

**Por *event storming*.** A técnica mais eficaz: reunir especialistas, mapear os
eventos de negócio numa linha do tempo, e observar onde eles se agrupam. Os
agrupamentos são candidatos a subdomínio, e o processo revela conhecimento que
não estava documentado em lugar nenhum.

### A classificação muda

Um subdomínio core hoje pode virar generic amanhã, quando o mercado o resolver.

Recomendação de produto era core para muitas empresas há dez anos; hoje há
serviços prontos que a maioria delas deveria usar. Continuar investindo esforço
próprio ali é gastar onde não se diferencia mais.

Revisar a classificação periodicamente é barato e às vezes libera capacidade de
engenharia significativa.

## Por Que Isso Importa

**Porque a capacidade de engenharia é finita.** A decisão que a classificação
informa é onde alocá-la — e essa é uma decisão de negócio, não técnica.

**Porque orienta onde aplicar DDD tático.** Os padrões táticos são caros e só se
pagam no core. Ver [DDD tático](tactical-ddd.md).

**Porque expõe desalinhamento.** Quando o subdomínio core do negócio é o que
recebe menos investimento, isso é um problema estratégico que a análise torna
visível.

## Erros Comuns

**Classificar tudo como core.** Se tudo é prioritário, nada é.

**Confundir subdomínio com bounded context.** Problema versus solução.

**Classificar pelo que é interessante tecnicamente.** O subdomínio mais desafiador
tecnicamente frequentemente não é o que diferencia a empresa.

**Não revisar a classificação.** O mercado muda o que é generic.

**Deixar a classificação para a engenharia.** É decisão de negócio, informada por
engenharia.

## Exemplo Real

Uma empresa de gestão de frotas mapeou sete subdomínios.

A classificação inicial, feita pela equipe técnica, marcou cinco como core —
incluindo roteirização, que era o problema mais interessante e onde três
engenheiros trabalhavam havia dois anos.

A revisão com a diretoria mudou o quadro. O que os clientes citavam ao renovar
contrato era a **manutenção preditiva**: prever falha de componente antes que ela
parasse o veículo. Nenhum concorrente fazia isso bem.

Roteirização, apesar de ser o problema mais difícil, era comparável à dos
concorrentes e havia bibliotecas maduras que resolviam 90% dos casos.

A reclassificação: manutenção preditiva virou o único core; roteirização virou
supporting, com adoção de biblioteca; emissão fiscal e autenticação, generic,
comprados.

Os três engenheiros de roteirização foram para manutenção preditiva.

O que interessa aqui não é a decisão específica. É que a classificação feita pela
engenharia e a feita com o negócio divergiram completamente — e a segunda é a que
importa.

## Como a divisão sobrevive ao tempo

Subdomínios mudam menos que sistemas, e é isso que os torna uma base melhor para
fronteiras do que a estrutura técnica.

Uma empresa de seguros tem subscrição, sinistro e cobrança há décadas. As
tecnologias mudaram várias vezes; a divisão do negócio, não.

Três observações práticas decorrem disso.

**Fronteiras alinhadas a subdomínios envelhecem bem.** Um módulo que corresponde a
uma capacidade de negócio continua fazendo sentido depois de trocar o banco, o
framework e metade da equipe.

**Fronteiras alinhadas a tecnologia envelhecem mal.** Um módulo "de integração" ou
"de relatórios" reflete uma escolha técnica de um momento, e deixa de fazer
sentido quando a escolha muda.

**Mudança na divisão de subdomínios é sinal de mudança estratégica.** Quando o
negócio cria uma área nova ou funde duas, isso costuma preceder uma reorganização
do sistema — e antecipar isso é uma das poucas formas de previsão arquitetural que
funciona.

Vale registrar a divisão de subdomínios em algum lugar durável e revisitá-la
anualmente. É um documento de meia página que orienta decisões por anos.

## Conceitos Relacionados

- [Core Domain](core-domain.md), [Supporting](supporting-domain.md) e
  [Generic](generic-domain.md) — os três tipos.
- [Bounded Context](bounded-context.md) — a divisão da solução.
- [Domínio](domain.md) — o todo.
- [Contexto de Negócio](../01-fundamentals/business-context.md).

## Exercício Prático

Liste os subdomínios do seu negócio e classifique cada um nos três tipos.

Depois compare com onde o esforço de engenharia foi de fato alocado no último ano
— por número de pessoas e por tempo.

O desalinhamento entre as duas listas é o achado.

## Perguntas de Entrevista

- Qual a diferença entre subdomínio e bounded context?
- Como identificar os subdomínios de um negócio?
- Por que classificar tudo como core é um problema?

## Para Aprofundar

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Brandolini, Alberto. *EventStorming*, 2013.
- Vernon, Vaughn. *Domain-Driven Design Distilled*. Addison-Wesley, 2016.
