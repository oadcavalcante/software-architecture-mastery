---
id: fitness-functions
title: Funções de Aptidão
sidebar_position: 22
description: A dimensão protegida vira verificação executável — e a arquitetura passa a ter teste.
doc_type: concept
level: 7
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor converte características arquiteturais em verificações contínuas e
  sabe operá-las sem que virem ruído.
prerequisites: [evolutionary-architecture]
related: [evolutionary-architecture, measuring-architecture-outcomes, leadership-governance]
canonical_for: [aptidão como contrato, verificação de característica arquitetural, aptidão holística]
content_version: 1
last_reviewed: 2026-08-29
---

# Funções de Aptidão

## Visão Geral

Uma função de aptidão é uma verificação automática de uma característica arquitetural que se quer
preservar. Ela transforma uma intenção — "os módulos não devem ter dependência cíclica" — em algo
que falha quando é violada.

```text
regra em documento     verdadeira quando alguém lembra
função de aptidão      verdadeira sempre, ou vermelha
```

Ver [funções de aptidão como governança](/19-architecture-governance/fitness-functions-governance.md)
para o uso como mecanismo de governança; aqui o foco é o instrumento na mão de quem lidera
arquitetura — como escolher o que verificar, e como operar o conjunto sem que ele vire ruído.

## Problema

Regras arquiteturais escritas erodem em um padrão previsível:

```text
mês 1     a regra é publicada e conhecida
mês 6     a maior parte do código a segue
mês 18    metade das violações não foi notada
mês 36    ninguém sabe qual é o estado
```

E o problema de liderança é específico: **o arquiteto não pode revisar tudo**. Numa organização
com trinta times, ele vê uma fração pequena das mudanças, e a fração que ele vê não é a que mais
importa — é a que chegou até ele.

A função de aptidão resolve isso mudando o ponto de intervenção: em vez de revisar depois, a
propriedade é verificada a cada mudança, por todos, sem que ele esteja presente. Ver
[fundamentos de governança](/19-architecture-governance/governance-basics.md).

O erro comum, do outro lado: construir um conjunto grande de verificações antes de ter uma em
produção, e descobrir que a taxa de falso positivo torna todas elas ignoradas.

## Conceitos Centrais

### Atômica e holística

```text
atômica     verifica um componente isolado
            — dependência cíclica, segredo em código,
              dono declarado, tamanho de módulo
holística   verifica uma propriedade do conjunto
            — latência ponta a ponta, custo por transação,
              disponibilidade composta, tempo de entrega
```

As atômicas são baratas e imediatas; a maior parte do valor inicial vem delas. As holísticas são
caras e cobrem propriedades que só existem no todo — e são as que descobrem os problemas de maior
consequência.

Uma organização madura tem as duas. Uma que tem apenas atômicas protege o código e não a
arquitetura.

### Comece pela regra que já causou dano

```text
1. escolha uma regra que já foi violada e produziu incidente
2. implemente a verificação mais simples que a pegue
3. rode em modo de aviso por algumas semanas
4. corrija o acervo
5. só então bloqueie
```

O passo 1 é o que garante patrocínio: uma verificação ligada a um incidente conhecido não precisa
ser justificada. O passo 3 é o que evita rejeição — ligar bloqueio sobre uma base que viola em
quarenta lugares interrompe o trabalho de todos no mesmo dia.

E o passo 3 tem um efeito documentado: tornar visível resolve uma parte substancial das violações
antes de qualquer bloqueio, sem nenhuma cobrança.

### A mensagem é parte do desenho

```text
ruim   "violação da regra ARCH-014"
bom    "o módulo de pedidos importa diretamente de faturamento
       (Pedido.java:82). Use a interface PublicaFaturamento.
       Se a dependência for legítima, registre exceção em
       docs/adr/."
```

Uma verificação que falha sem explicar produz contorno, não correção. Escrever a mensagem é parte
do trabalho, e ela é lida muito mais vezes que qualquer documento de arquitetura.

### Falso positivo é a métrica de saúde

```text
abaixo de ~2%   a verificação é respeitada
acima disso     ela é contornada por reflexo, e depois removida
```

Monitorar a taxa de falso positivo de cada verificação, e ajustar ou rebaixar as que passam do
limite, é o que mantém o conjunto confiável. Uma verificação com falso positivo alto contamina a
credibilidade das outras.

### Bloquear ou avisar

```text
bloquear   quando a violação é sempre erro
avisar     quando às vezes é legítima
relatar    quando é tendência, não evento
```

A pergunta que decide: **se isto falhar, é sempre um erro?** Se a resposta for "às vezes é
legítimo", bloquear produz uma lista de exclusões crescente — e a lista é onde a erosão passa a
se esconder.

Olhar periodicamente a lista de exclusões é uma prática subestimada: ela é o registro de todas as
vezes em que a regra foi contornada.

### O que não pode ser verificado

```text
a fronteira do serviço corresponde ao domínio?
a complexidade se justifica?
o trade-off aceito era o certo?
o modelo faz sentido para o negócio?
```

Delimitar isso evita a expectativa exagerada que faz a prática ser abandonada. Funções de aptidão
substituem uma parte da governança e liberam a atenção humana para as perguntas que só ela
responde — que é o argumento mais forte a favor delas em contexto de liderança.

### Cada função precisa de dono e de revisão

Uma função de aptidão é código, com manutenção, obsolescência e falso positivo. Sem dono, ela
quebra e é desabilitada; sem revisão, verifica uma regra que já não vale.

E vale revisar também a **necessidade**: uma regra que virou consenso e nunca mais foi violada
pode ser removida, liberando atenção. Ver
[patologias de governança](/19-architecture-governance/governance-pathologies.md).

## Modelo Mental

**A característica que importa vira verificação executável.** Comece pela que já causou dano,
avise antes de bloquear, e monitore falso positivo.

## Quando Usar

- Para as dimensões arquiteturais escolhidas como protegidas.
- Depois de um incidente cuja causa é uma regra violada.
- Como substituição de itens de revisão manual recorrente.

## Quando Não Usar

**Para julgamento** — adequação, fronteira, trade-off.

**Bloqueando desde o primeiro dia.**

**Sem mensagem acionável.**

**Com falso positivo alto.**

**Sem dono.**

**Em quantidade** — muitas verificações medianas valem menos que poucas confiáveis.

## Alternativas

- **Controle preventivo** — impedir em vez de detectar; melhor quando o ambiente permite.
- **Revisão humana** — para o que exige julgamento.
- **Relatório de tendência** — quando a propriedade é gradual e não binária.
- **Gabarito** — a propriedade embutida no ponto de partida, sem verificação necessária.

A última é sempre preferível quando aplicável: uma configuração que já vem correta não precisa ser
verificada.

## Trade-offs

| Automatizado | Revisão humana |
|---|---|
| Sempre executa | Cobre julgamento |
| Só o mensurável | Depende de atenção |
| Investimento inicial | Custo recorrente |

| Bloquear | Avisar |
|---|---|
| Garante a propriedade | Não interrompe |
| Pressiona por contorno | Pode ser ignorado |

## Modos de Falha

**Falso positivo alto.** Contamina o conjunto.

**Sem mensagem útil.** Produz contorno.

**Bloqueio prematuro.** Rejeição organizacional.

**Lista de exclusões crescente.** A erosão se esconde ali.

**Sem dono.** Quebra e some.

**Expectativa de cobrir julgamento.** Frustração e abandono.

## Erros Comuns

**Construir o conjunto completo** antes de ter uma em produção.

**Não medir falso positivo.**

**Não olhar a lista de exclusões.**

**Não remover** verificações que viraram consenso.

**Só atômicas**, sem nenhuma holística.

## Exemplo Real

Uma plataforma de comércio eletrônico com 18 times tinha uma área de arquitetura de três pessoas.
Elas participavam de cerca de 12% das revisões de desenho — e a seleção não era por importância,
era por quem as convidava.

O diagnóstico que mudou a abordagem veio de uma análise de incidentes: das 34 ocorrências de
severidade alta em 12 meses, 21 tinham como causa uma regra arquitetural documentada e violada.

```text
causa da violação                                incidentes
serviço sem alarme de saturação de recurso        7
chamada síncrona a dependência externa sem prazo  6
acesso direto a dado de outro domínio             4
segredo em variável de ambiente sem cofre         4
```

Nenhuma das quatro exigia julgamento — todas eram verificáveis. E nenhuma tinha sido pega em
revisão, porque a revisão só via 12% das mudanças.

A adoção seguiu a ordem do dano, com a primeira sendo a de maior frequência:

**Fase de aviso, oito semanas.** A verificação de alarme de saturação rodou sem bloquear, com um
painel por time. Ao fim das oito semanas, 61 dos 94 serviços tinham corrigido — sem nenhuma
cobrança, apenas por ver o número.

**Acervo corrigido, depois bloqueio.** Os 33 restantes foram tratados: 26 corrigidos, 7 com
exceção registrada e prazo.

As três seguintes levaram quatro meses, no mesmo protocolo.

**Uma holística acrescentada no sexto mês:** disponibilidade composta do fluxo de compra,
calculada a partir das dependências declaradas de cada serviço. Ela falha quando o produto das
disponibilidades individuais cai abaixo do requisito contratual — e ela pegou, na primeira
execução, uma cadeia de cinco chamadas síncronas que ninguém tinha somado.

```text
disponibilidade composta calculada     98,4%
requisito contratual                   99,5%
```

Essa única verificação produziu a decisão de tornar duas das cinco chamadas assíncronas, que era
o problema arquitetural de maior consequência do sistema e que nenhuma revisão de desenho tinha
identificado — porque cada uma das cinco chamadas, isoladamente, era razoável.

Resultados após 14 meses:

```text
incidentes de severidade alta por regra violada     de 21 para 2
cobertura das verificações                          100% das mudanças
                                                    (contra 12% em revisão)
falso positivo médio                                1,9%
exceções ativas com prazo                           14
tempo da área de arquitetura em revisão de regras   -80%
```

A avaliação posterior aponta: a verificação holística foi a de maior valor e a última a ser
construída, porque parecia a mais difícil. Ela custou três semanas e encontrou, no primeiro dia, o
problema que dois anos de revisões pontuais não tinham encontrado — pela razão de sempre, que é
que ninguém somava as partes.

## Conceitos Relacionados

- [Arquitetura Evolutiva](/23-architecture-leadership/evolutionary-architecture.md) — as dimensões protegidas.
- [Funções de Aptidão como Governança](/19-architecture-governance/fitness-functions-governance.md).
- [Medição de Resultados](/23-architecture-leadership/measuring-architecture-outcomes.md).
- [Governança](/23-architecture-leadership/leadership-governance.md).

## Exercício Prático

Liste as regras arquiteturais do seu contexto e marque quais já causaram um incidente conhecido.

Implemente a verificação mais simples da primeira da lista, em modo de aviso. O número de
violações que aparecer é a erosão acumulada — e ela sempre surpreende.

## Perguntas de Entrevista

- Por que começar pela regra que já causou dano?
- Por que a taxa de falso positivo é a métrica de saúde do conjunto?
- Por que a lista de exclusões merece revisão periódica?

## Para Aprofundar

- Ford, Neal et al. *Building Evolutionary Architectures*. 2ª ed. O'Reilly, 2022.
- Ford, Neal et al. *Software Architecture: The Hard Parts*. O'Reilly, 2021.
- Kim, Gene et al. *The DevOps Handbook*. 2ª ed. IT Revolution, 2021.
