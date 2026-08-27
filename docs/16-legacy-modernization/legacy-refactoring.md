---
id: legacy-refactoring
title: Refatoração de Legado
sidebar_position: 6
description: Melhorar a estrutura sem entender tudo — com testes de caracterização como rede.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor refatora código legado com segurança, começando por criar a
  rede que a torna possível.
prerequisites: [legacy-systems]
related: [legacy-systems, incremental-modernization, rebuilding]
canonical_for: [teste de caracterização, costura, refatoração de legado, código sem cobertura]
content_version: 1
last_reviewed: 2026-08-28
---

# Refatoração de Legado

## Visão Geral

Refatorar código legado tem um problema circular: refatorar com segurança exige testes; e
escrever testes exige, frequentemente, refatorar o código para torná-lo testável.

A saída desse ciclo é o conjunto de técnicas de
[Feathers](https://en.wikipedia.org/wiki/Michael_Feathers): **testes de caracterização**
para capturar o comportamento atual, e **costuras** para inserir pontos de teste sem
alterar comportamento.

Isso permite melhorar a estrutura de um sistema que ninguém entende completamente — que é
a situação real.

## Problema

O código legado resiste a mudança por características que se reforçam:

```text
sem testes           qualquer mudança é arriscada
difícil de testar    dependências rígidas, sem pontos de injeção
métodos longos       muitas responsabilidades, difícil de isolar
estado global        o comportamento depende de coisas invisíveis
comportamento desconhecido  ninguém sabe o que deveria acontecer
```

A tentação, diante disso, é reescrever. Ver
[reconstrução](rebuilding.md) — ela é mais cara e mais arriscada do que parece.

## Conceitos Centrais

### Teste de caracterização captura o que existe

```text
teste convencional      "o resultado deve ser 42"
teste de caracterização "o resultado é 42" — seja isso certo ou errado
```

Ele não julga o comportamento. Ele o **congela**, de forma que qualquer alteração
acidental apareça.

O procedimento:

```text
1. escreva um teste que chama o código
2. use uma asserção que vai falhar
3. rode; a falha mostra o valor real
4. ajuste a asserção para o valor real
5. repita para os casos que importam
```

Isso parece estranho — escrever testes que afirmam o comportamento atual, inclusive o
errado — e é exatamente o ponto: você não sabe o que está certo, e precisa de proteção
antes de mudar.

E os testes resultantes são documentação: a descrição executável do que o sistema faz,
derivada dele.

### Costuras: onde inserir o ponto de teste

Uma costura é um lugar onde o comportamento pode ser alterado sem editar o código
naquele ponto.

```text
por parâmetro     extrair a dependência para um argumento
por herança       tornar o método sobrescrevível, e sobrescrever no teste
por interface     extrair uma interface, injetar uma implementação de teste
por ligação       substituir a implementação em tempo de carga
```

A técnica que abre a maior parte dos casos: **extrair e sobrescrever**. O trecho
problemático — uma chamada a um sistema externo, um acesso a relógio, uma leitura de
arquivo — é extraído para um método, que o teste sobrescreve.

A alteração é mínima e mecânica, e ela torna o código testável sem mudar o
comportamento.

### Comece pelo que vai mudar

Refatorar o sistema inteiro é projeto; refatorar o que se vai tocar é trabalho.

```text
ruim   "vamos refatorar o módulo de faturamento"
bom    "vamos mudar o cálculo de desconto; primeiro, caracterizamos e isolamos"
```

Ver [modernização incremental](incremental-modernization.md).

Isso concentra o esforço onde ele rende: os módulos que mudam com frequência são os que
causam custo. Os que não mudam podem permanecer feios indefinidamente.

E tem uma consequência prática: a refatoração acontece dentro do trabalho de produto, sem
competir por orçamento.

### O método de mudança segura

A sequência que Feathers formaliza:

```text
1. identifique os pontos de mudança
2. encontre os pontos de teste
3. quebre dependências
4. escreva os testes
5. faça a mudança e refatore
```

Os passos 2 e 3 são os que as pessoas pulam, e são os que tornam o passo 5 seguro.

E a ordem importa: quebrar dependências **antes** de escrever os testes, com alterações
mecânicas e verificáveis, é o que evita introduzir defeito enquanto se tenta criar a
proteção.

### Mudanças mecânicas primeiro

Refatorações que a ferramenta faz — renomear, extrair método, mover — são seguras mesmo
sem testes, porque a ferramenta garante equivalência.

Usá-las para tornar o código compreensível **antes** de qualquer mudança de
comportamento é um caminho barato:

```text
extrair método a partir de um bloco longo
nomear a variável que era 'tmp2'
extrair a condição complexa para um método com nome
```

Cada uma torna o código mais legível sem risco, e o entendimento resultante é o que
permite decidir o que fazer.

### Quando parar

Refatoração de legado não termina — ela é contínua. O que precisa de critério é quando
parar numa sessão:

```text
o código está bom o suficiente para a mudança que precisa ser feita
```

Perseguir o ideal transforma uma mudança de dois dias numa de duas semanas, e a revisão
fica impossível.

Ver [modernização incremental](incremental-modernization.md) — o limite da refatoração
oportunista.

## Modelo Mental

**Capture o comportamento antes de mudá-lo.** A rede vem primeiro; a melhoria vem
depois.

## Quando Usar

- O modelo de domínio está certo, e a estrutura do código não.
- O sistema precisa continuar mudando.
- Reescrever é caro ou arriscado demais.
- Antes de qualquer mudança em código sem cobertura.
- Para preservar o conhecimento embutido.

## Quando Não Usar

**Quando o modelo de domínio está errado.** Refatorar organiza melhor algo que não
deveria existir daquela forma. Ver
[reconstrução](rebuilding.md).

**Sem testes de caracterização**, em código sem cobertura.

**Refatorando o sistema inteiro** em vez do que se vai tocar.

**Perseguindo o ideal** numa sessão de trabalho.

**Quando o sistema será descontinuado** em breve.

## Alternativas

- **[Reconstrução](rebuilding.md)** — quando o modelo está errado.
- **Contenção** — isolar o legado atrás de uma interface, sem melhorá-lo por dentro. Ver
  [anti-corruption layer](../08-integration-architecture/integration-anti-corruption.md).
- **Congelar** — parar de mudar o módulo, construir o novo fora.
- **Não fazer nada** — quando o módulo não muda.

## Trade-offs

| Refatorar | Reconstruir |
|---|---|
| Preserva conhecimento embutido | Perde |
| Incremental, valor contínuo | Valor no fim |
| Modelo mantido | Novo |
| Risco baixo | Alto |
| Não resolve modelo errado | Resolve |

| Caracterizar primeiro | Mudar direto |
|---|---|
| Alterações acidentais aparecem | Passam |
| Custo antes da mudança | Nenhum |
| Documentação resultante | Nenhuma |

## Modos de Falha

**Mudança acidental de comportamento.** Sem caracterização.

**Refatoração que vira projeto.** Sem critério de parada.

**Testes de caracterização frágeis.** Capturam detalhe de implementação, quebram a toda
mudança legítima.

**Costura que altera comportamento.** A extração introduziu defeito.

**Refatorar o que não muda.** Esforço sem retorno.

**Refatorar modelo errado.** Organiza melhor a coisa errada.

## Erros Comuns

**Mudar antes de caracterizar.**

**Tentar entender tudo antes de começar.**

**Refatorar o sistema inteiro.**

**Não usar refatorações mecânicas** para tornar o código legível primeiro.

**Não limitar o escopo da sessão.**

**Caracterizar detalhe de implementação** em vez de comportamento observável.

## Exemplo Real

Uma empresa de logística tinha um módulo de cálculo de frete — 4.000 linhas, um método
principal de 900, sem nenhum teste.

Mudanças ali levavam semanas e produziam defeitos com frequência. A proposta interna era
reescrever.

A abordagem escolhida foi refatoração, começando por uma mudança que o negócio precisava:
adicionar uma nova modalidade de frete.

**Semana 1 — caracterização.** Testes escritos sobre o comportamento atual, com entradas
reais extraídas de produção. Foram 220 casos, cobrindo as combinações de modalidade,
região, peso e cliente.

A caracterização revelou seis comportamentos que ninguém conhecia — incluindo um desconto
aplicado a três clientes específicos, com identificadores em código, sem comentário.

**Semana 2 — costuras.** Três dependências rígidas foram extraídas: consulta de tabela de
preços, chamada ao serviço de distância, e leitura de data. Cada extração foi mecânica,
verificada pelos testes de caracterização.

**Semana 3 — refatoração mecânica.** O método de 900 linhas foi decomposto em 14 métodos
nomeados, usando extração automática. Nenhuma mudança de comportamento; os testes
continuaram passando.

Só nesse ponto o código ficou compreensível — e a estrutura revelada mostrou que o cálculo
tinha três etapas claras que estavam entrelaçadas.

**Semana 4 — a mudança.** A modalidade nova foi adicionada em cerca de 40 linhas, num
ponto de extensão que a decomposição tinha tornado óbvio.

Total: 4 semanas, contra uma estimativa de 6 meses para reescrever.

E o efeito duradouro: as mudanças seguintes no módulo passaram a levar dias. Os 220 testes
de caracterização permaneceram como rede, e foram sendo substituídos gradualmente por
testes convencionais conforme o comportamento correto era estabelecido com o negócio.

O desconto para os três clientes foi investigado: era um acordo comercial de 2011, ainda
válido. Ele foi movido para configuração, e o negócio passou a poder alterá-lo.

O que a equipe registra: as três primeiras semanas não entregaram nada visível, e foram o
que tornou a quarta possível. A proposta de reescrever teria descartado os seis
comportamentos desconhecidos — incluindo o acordo comercial ativo.

## Conceitos Relacionados

- [Sistemas Legados](legacy-systems.md) — o conhecimento embutido.
- [Reconstrução](rebuilding.md) — quando refatorar não basta.
- [Modernização Incremental](incremental-modernization.md).
- [Refatoração](../02-software-design/refactoring.md) — os fundamentos.

## Exercício Prático

Escolha um trecho de código sem testes que seu time precisa mudar em breve.

Escreva um teste de caracterização antes de qualquer alteração — usando o procedimento de
deixar falhar para descobrir o valor real. O que você encontrar costuma surpreender.

## Perguntas de Entrevista

- O que um teste de caracterização faz que um teste convencional não faz?
- O que é uma costura, e por que ela resolve o problema circular?
- Por que refatorações mecânicas vêm antes das outras?

## Para Aprofundar

- Feathers, Michael. *Working Effectively with Legacy Code*. Prentice Hall, 2004.
- Fowler, Martin. *Refactoring*. 2ª ed. Addison-Wesley, 2018.
- Bernhardt, Gary. *Boundaries*, 2012.
