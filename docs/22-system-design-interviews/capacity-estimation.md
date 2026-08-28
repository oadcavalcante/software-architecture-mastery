---
id: capacity-estimation
title: Estimativa em Entrevista
sidebar_position: 3
description: Não para acertar o número — para que a arquitetura tenha uma escala declarada e as decisões tenham critério.
doc_type: concept
level: 0
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor produz estimativas rápidas que ancoram as decisões seguintes, e sabe
  quais números de fato importam.
prerequisites: [functional-vs-nonfunctional]
related: [back-of-envelope, high-level-architecture, interview-scaling]
canonical_for: [estimativa em entrevista, escala declarada, número âncora, estimativa que decide]
content_version: 1
last_reviewed: 2026-08-29
---

# Estimativa em Entrevista

## Visão Geral

A estimativa de capacidade numa entrevista não existe para produzir o número certo. Ela existe
para uma coisa: **dar à arquitetura uma escala declarada**, sem a qual nenhuma decisão seguinte
tem critério.

```text
sem estimativa   "vou usar cache"           por quê? quanto ajuda?
com estimativa   "12 mil leituras/s contra
                 100 escritas/s — cache
                 resolve 99% do problema"    a decisão tem base
```

Isso muda o que se deve estimar. Não todos os números possíveis — apenas os que mudam uma
decisão. Uma estimativa de 20 linhas em que nenhum resultado altera o desenho é tempo perdido
com aparência de rigor.

## Problema

Dois padrões de erro, opostos.

**Pular a estimativa.** O candidato vai direto ao desenho, e cada decisão seguinte fica sem
justificativa. Quando o entrevistador pergunta "por que particionar?", a resposta é uma
racionalização em vez de um cálculo.

**Estimar tudo.** O candidato calcula requisições por segundo, armazenamento, banda, número de
servidores, memória de cache, conexões simultâneas, taxa de crescimento em cinco anos — e
consome doze minutos. Metade desses números não influencia nenhuma escolha.

```text
número que decide          leitura/escrita, volume total, pico
número que raramente decide  banda de saída em GB/s, número exato
                             de servidores, crescimento em 5 anos
```

O segundo grupo aparece porque parece rigoroso. O avaliador não está contando números — está
observando se você sabe qual deles importa.

## Conceitos Centrais

### Os quatro números que quase sempre importam

```text
1. razão entre leitura e escrita
2. volume no pico, não na média
3. volume total de armazenamento
4. tamanho do dado quente — o que precisa estar em memória
```

O primeiro decide a estratégia geral: sistemas dominados por leitura pedem cache, réplicas e
materialização; dominados por escrita pedem particionamento e ingestão assíncrona.

O segundo decide o dimensionamento. Trabalhar com média é o erro mais comum, e a diferença entre
média e pico costuma ser de 3× a 10×.

O terceiro decide o armazenamento e sua hierarquia. O quarto decide se cache é viável — se o
conjunto quente cabe em memória a um custo razoável, muitas decisões ficam simples.

O quarto número é o mais esquecido e o de maior alavancagem. Ele exige uma premissa sobre a
distribuição de acesso, que quase sempre é desigual: em conteúdo, em catálogo, em links, em
perfis, uma fração pequena responde pela maior parte dos acessos. Declarar "vou assumir que 1%
dos registros responde por 90% dos acessos" é uma premissa defensável e transforma um problema
de terabytes em um problema de gigabytes.

Candidatos que não fazem essa distinção acabam propondo soluções dimensionadas para o volume
total, quando o volume que importa é o quente — e a diferença entre os dois costuma ser de duas
ordens de grandeza.

### Simplifique os números agressivamente

```text
1 dia          ≈ 100 mil segundos  (86 400, arredondado)
1 mês          ≈ 2,5 milhões de segundos
1 milhão/dia   ≈ 12/s
1 bilhão/dia   ≈ 12 mil/s
```

Arredondar para potências de dez e para números redondos é esperado e demonstra fluência.
Ninguém espera precisão; espera-se ordem de grandeza correta e aritmética que possa ser feita
falando.

Ver [cálculo de guardanapo](back-of-envelope.md) para as referências de tamanho e latência.

### Faça o cálculo em voz alta

```text
"300 milhões de usuários ativos por dia, cada um abrindo o feed
 5 vezes: 1,5 bilhão de aberturas por dia.
 Dividindo por 100 mil segundos, dá 15 mil por segundo em média.
 Com pico de 3×, chego a 45 mil por segundo."
```

O raciocínio é o que está sendo avaliado, não o total. Um candidato que erra a aritmética e
explica o caminho corretamente é avaliado melhor que um que acerta em silêncio.

E declarar cada premissa — "5 aberturas por usuário" — permite ao entrevistador ajustar: "na
verdade são 20". O número muda, o método não.

### Conecte cada número a uma decisão

Esta é a diferença entre estimar e demonstrar que se sabe estimar:

```text
"45 mil leituras/s contra 6 mil escritas/s — razão de 7 para 1.
 Isso não é extremo o suficiente para justificar materialização
 agressiva; réplicas de leitura com cache devem bastar."

"O conjunto quente é de ~200 GB. Cabe em memória distribuída a
 um custo aceitável, então cache resolve a maior parte da leitura."

"2,4 PB no total. Isso descarta manter tudo em armazenamento
 rápido; precisamos de hierarquia por idade."
```

Um número sem consequência declarada é aritmética. Um número com consequência é arquitetura.

Essa conexão também protege contra uma armadilha comum: chegar a um número e não perceber que
ele contradiz o que se pretendia propor. Um candidato que calcula 120 escritas por segundo e em
seguida propõe particionamento de escrita está ignorando o próprio cálculo — e o avaliador vai
notar. Enunciar a consequência logo após o número torna essa contradição impossível de manter.

### Estime armazenamento com o tamanho do registro

```text
1. quantos registros por dia
2. tamanho médio de cada um
3. por quanto tempo retidos
4. multiplique, e some replicação e índices
```

O passo 2 é onde a maior parte dos candidatos trava. A saída é decompor: um post de texto tem
identificador, autor, conteúdo, carimbos e metadados — algo entre 300 bytes e 1 KB. Declarar "vou
assumir 500 bytes" e seguir é a resposta correta.

E lembrar que replicação e índices multiplicam: um fator de 3× a 5× sobre o dado bruto é uma
premissa razoável e demonstra experiência.

### Saiba quando parar

```text
entrevista de 45 min      estimativa: 4 a 6 min
entrevista de 60 min      estimativa: 5 a 8 min
```

Se um número não vai mudar nada, diga isso e siga: "não vou calcular banda de saída porque não
vejo decisão dependendo dela neste desenho". Isso demonstra julgamento, que vale mais que o
cálculo.

## Modelo Mental

**Estime o que decide.** Quatro números, em voz alta, cada um seguido da consequência que ele
produz.

## Quando Usar

- Depois dos requisitos, antes do desenho.
- Sempre que uma decisão depender de escala.
- Novamente, quando o entrevistador mudar um requisito de volume.

## Quando Não Usar

**Calculando tudo.**

**Sem conectar à decisão.**

**Com precisão excessiva** — "43.287 requisições por segundo" é pior que "cerca de 45 mil".

**Usando a média** quando o pico é o que dimensiona.

**Em silêncio** — o valor está no raciocínio verbalizado.

## Alternativas

- **Declarar a ordem de grandeza** — "estamos na casa de dezenas de milhares por segundo" — quando
  o tempo aperta.
- **Estimar sob demanda** — fazer o cálculo no momento em que a decisão aparece, em vez de tudo
  no início.
- **Perguntar o número** — se o entrevistador tem um em mente, usá-lo é mais rápido e igualmente
  válido.

A segunda é subestimada e frequentemente melhor: um cálculo feito na hora em que ele decide algo
fica evidentemente conectado, sem esforço de conexão.

## Trade-offs

| Estimar cedo | Estimar sob demanda |
|---|---|
| Escala declarada desde o início | Cada número tem uso imediato |
| Alguns números não são usados | Interrompe o fluxo do desenho |
| Estrutura visível | Exige agilidade |

| Mais números | Menos |
|---|---|
| Cobertura | Foco no que decide |
| Consome tempo | Risco de faltar base |
| Parece rigoroso | Demonstra julgamento |

## Modos de Falha

**Sem estimativa.** Decisões sem critério.

**Estimativa desconectada.** Números que não influenciam nada.

**Média em vez de pico.** Dimensionamento errado por 3× a 10×.

**Precisão falsa.** Sugere que o candidato não entende a natureza do exercício.

**Travar no tamanho do registro.** Declarar uma premissa e seguir resolve.

## Erros Comuns

**Calcular banda de saída** sem que ela decida nada.

**Não estimar o conjunto quente**, que é o que decide cache.

**Não considerar replicação e índices** no armazenamento.

**Não revisitar** quando o entrevistador muda o volume.

**Fazer contas em silêncio.**

## Exemplo de Entrevista

**Problema.** "Projete um sistema de encurtamento de URL."

**Estimativa, em voz alta:**

```text
"Vou assumir 100 milhões de links criados por mês.
 Isso dá cerca de 40 por segundo em média.

 A razão leitura/escrita em encurtadores é alta — vou assumir
 100 para 1. Então 4 mil redirecionamentos por segundo em média.

 Com pico de 3×, chego a 12 mil redirecionamentos por segundo
 e 120 criações por segundo.

 Armazenamento: cada registro tem o código curto, a URL original,
 o autor e carimbos — vou assumir 500 bytes. 100 milhões por mês,
 por 5 anos, dá 6 bilhões de registros, ou cerca de 3 TB.
 Com replicação e índices, algo em torno de 10 TB.

 O conjunto quente é o que importa: a distribuição de acesso a
 links é muito desigual, e é razoável assumir que 1% dos links
 responde por 90% dos acessos. Isso dá 60 milhões de registros
 quentes, ou ~30 GB. Cabe em memória."
```

**As consequências, declaradas:**

```text
12 mil leituras/s, 120 escritas/s
  → sistema dominado por leitura; cache e réplicas resolvem
  → nenhuma necessidade de particionar escrita

30 GB de conjunto quente
  → cache em memória cobre 90% dos acessos a custo baixo
  → o banco atende os 10% restantes com folga

10 TB no total
  → cabe em um banco relacional bem particionado; não há
    necessidade de armazenamento distribuído exótico

120 escritas/s
  → geração de código pode ser simples; nenhuma contenção
    séria a resolver
```

**O que eu não vou calcular, e por quê:**

```text
"Não vou calcular banda de saída: um redirecionamento é uma
 resposta HTTP de algumas centenas de bytes, e não vejo nenhuma
 decisão dependendo desse número.

 Também não vou projetar crescimento de 5 anos: a arquitetura
 que serve 12 mil por segundo serve 50 mil com mais réplicas,
 sem mudança estrutural."
```

Declarar o que **não** se calcula é tão demonstrativo quanto calcular. Ele mostra que a escolha
foi consciente.

**Pergunta de acompanhamento provável:** "e se fossem 100 mil redirecionamentos por segundo?"

A resposta correta verifica o que muda: o conjunto quente continua cabendo em memória, então o
cache continua resolvendo; o que muda é o número de instâncias de cache e a necessidade de
distribuição geográfica. A arquitetura não muda — a capacidade muda. Reconhecer isso é o ponto.

## Conceitos Relacionados

- [Cálculo de Guardanapo](back-of-envelope.md) — as referências.
- [Funcionais vs. Não Funcionais](functional-vs-nonfunctional.md).
- [Identificação de Gargalo](bottleneck-identification.md).
- [Planejamento de Capacidade](../05-system-design/capacity-planning.md) — a versão sem pressão
  de tempo.

## Exercício Prático

Estime, em cinco minutos e em voz alta, os quatro números principais de um sistema de mensagens
com 20 milhões de usuários diários.

Depois escreva, ao lado de cada número, qual decisão de arquitetura ele produz. Os que não
produzirem nenhuma você não precisava ter calculado.

## Perguntas de Entrevista

- Por que a estimativa existe se o número não precisa estar certo?
- Quais são os quatro números que quase sempre importam?
- Por que declarar o que você não vai calcular é demonstrativo?

## Para Aprofundar

- Xu, Alex. *System Design Interview*. Byte Code, 2020.
- Dean, Jeff. *Numbers Everyone Should Know*. Google, 2009.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
