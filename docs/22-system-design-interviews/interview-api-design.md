---
id: interview-api-design
title: Desenho de API na Entrevista
sidebar_position: 5
description: Poucos endpoints, escritos rápido — eles delimitam o escopo melhor que qualquer discussão.
doc_type: concept
level: 0
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escreve a API mínima que expressa o sistema e usa isso para fixar o
  escopo antes do desenho interno.
prerequisites: [functional-vs-nonfunctional]
related: [interview-data-modeling, high-level-architecture, interview-structure]
canonical_for: [desenho de API em entrevista, contrato como fronteira, granularidade de endpoint]
content_version: 1
last_reviewed: 2026-08-29
---

# Desenho de API na Entrevista

## Visão Geral

Escrever a API logo depois dos requisitos parece um desvio e é um atalho. Três a cinco endpoints,
escritos em dois minutos, fazem duas coisas que nenhuma discussão faz:

```text
fixam o escopo      o que não tem endpoint não está no sistema
revelam o modelo    os parâmetros e as respostas expõem as entidades
```

E há um efeito prático: uma vez que a API está no quadro, o desenho interno passa a ter um alvo
concreto. Você não está projetando "um encurtador de URL"; está projetando o que atende àqueles
cinco endpoints.

## Problema

Dois padrões de erro.

**Pular a API.** O candidato vai dos requisitos direto às caixas, e o escopo fica fluido. Vinte
minutos depois, ele está desenhando um subsistema de análise que ninguém pediu, porque nada
delimitou o que o sistema expõe.

**Detalhar a API.** O candidato gasta oito minutos escrevendo códigos de erro, cabeçalhos,
versionamento, formato de paginação e esquema de validação. Nada disso é avaliado, e o tempo
saiu do desenho.

```text
avaliado           quais operações existem, com quais parâmetros
                   e o que retornam
não avaliado       código HTTP exato, nome do cabeçalho,
                   formato do corpo de erro
```

A API na entrevista é um instrumento de escopo, não um documento de contrato.

## Conceitos Centrais

### Poucos endpoints, escritos rápido

```text
POST   /urls              {url, expira_em?}  →  {codigo, url_curta}
GET    /{codigo}          →  302 para a URL original
GET    /urls/{codigo}     →  {url, criado_em, cliques}
DELETE /urls/{codigo}     →  204
```

Quatro linhas, um minuto de escrita. Elas dizem tudo: o sistema cria, redireciona, consulta e
remove — e nada mais. Se o entrevistador quiser análise detalhada de cliques, ele vai pedir, e aí
a API ganha um endpoint.

Escrever essas quatro linhas tem um efeito de contenção que é difícil de obter de outra forma. Um
candidato que não escreveu a API tende a acrescentar funcionalidades enquanto desenha — um painel
aqui, uma notificação ali — porque nada estabeleceu a fronteira. Com a API no quadro, acrescentar
algo exige acrescentar um endpoint, e isso é um ato visível que provoca a pergunta "isso estava
no escopo?".

### Os parâmetros revelam o modelo

Escrever a assinatura força decisões que a prosa deixa vagas:

```text
POST /urls {url, expira_em?}
  → há expiração; ela é opcional; o modelo tem vigência

GET /{codigo} → 302
  → o redirecionamento é a operação de maior volume, e é
    a mais simples possível: uma leitura por chave

GET /urls/{codigo} → {cliques}
  → há contagem; é lida por link, não agregada
```

Cada uma dessas observações leva segundos e produz uma consequência para o modelo de dados. Ver
[modelagem na entrevista](interview-data-modeling.md).

### Separe as operações por perfil

Um hábito de alto retorno: agrupar os endpoints por características não funcionais.

```text
altíssimo volume, leitura, latência crítica
  GET /{codigo}

baixo volume, escrita, latência tolerante
  POST /urls, DELETE /urls/{codigo}

baixo volume, leitura, tolerante a atraso
  GET /urls/{codigo}
```

Essa separação é o que orienta o desenho: o primeiro grupo domina o dimensionamento e merece
cache e réplicas; o segundo é irrelevante para escala; o terceiro pode ser servido de dados
agregados.

Fazer isso em voz alta demonstra que você entende que operações do mesmo sistema têm requisitos
diferentes. Ver
[funcionais vs. não funcionais](functional-vs-nonfunctional.md).

E esse agrupamento é o que permite, mais adiante, propor degradação desenhada com naturalidade:
se o grupo de baixo volume ficar indisponível, o sistema continua servindo o que importa. Um
candidato que já separou as operações por perfil tem essa resposta pronta quando o entrevistador
perguntar "e se o banco cair?".

### Granularidade: nem uma operação por campo, nem uma que faz tudo

```text
fina demais    POST /urls, PUT /urls/{c}/titulo, PUT /urls/{c}/tags,
               PUT /urls/{c}/expiracao
grossa demais  POST /operacao {tipo: "criar_url", ...}
adequada       POST /urls, PATCH /urls/{codigo}
```

A granularidade adequada segue as unidades de mudança do domínio: o que muda junto fica junto.
Numa entrevista, a regra prática é uma operação por intenção do usuário.

### Assíncrono quando a operação é longa

```text
síncrono    POST /urls  →  201 {codigo}
assíncrono  POST /relatorios  →  202 {id_tarefa}
            GET  /relatorios/{id_tarefa}  →  {estado, resultado?}
```

Reconhecer qual operação é longa e propor o padrão de aceite com consulta posterior demonstra
maturidade, e abre a conversa sobre estado intermediário — que é uma boa conversa de ter.

Ver [síncrono vs. assíncrono](../20-trade-offs/sync-vs-async.md).

### Mencione o que você não vai detalhar

```text
"vou assumir autenticação por token no cabeçalho, paginação por
 cursor onde houver lista, e não vou detalhar códigos de erro —
 me diga se quiser que eu volte a isso"
```

Uma frase resolve. Ela mostra que você sabe que essas coisas existem e escolheu não gastar tempo,
o que é diferente de esquecer.

Essa distinção — entre omitir por escolha e omitir por desconhecimento — aparece o tempo todo na
avaliação, e explicitá-la custa segundos. Ela também abre uma porta: o entrevistador que quiser
discutir versionamento vai pedir, e você terá o assunto no lugar certo da conversa em vez de no
lugar em que ele consome tempo do desenho.

### O estilo importa menos do que parece

REST, gRPC ou GraphQL — a escolha raramente é o ponto da entrevista, e defendê-la longamente
consome tempo. Uma frase basta:

```text
"vou usar REST porque é o mais simples de discutir aqui; se
 houvesse requisito de latência muito baixa entre serviços
 internos, eu consideraria gRPC"
```

Isso demonstra que a escolha foi consciente e devolve a conversa ao que importa.

Há uma exceção: quando o enunciado envolve comunicação entre muitos serviços internos com
requisito de latência apertado, ou quando o cliente é móvel com conexão ruim e vários recursos a
buscar, a escolha de estilo passa a ter consequência real. Nesses casos ela merece um minuto, não
uma frase — e reconhecer a diferença entre os dois contextos é em si um sinal de julgamento.

## Modelo Mental

**A API delimita o escopo em dois minutos.** Poucas operações, agrupadas por perfil, com o que
não será detalhado dito em voz alta.

## Quando Usar

- Logo após os requisitos, antes do desenho interno.
- Como instrumento de escopo, não como especificação.
- Agrupando as operações por características não funcionais.

## Quando Não Usar

**Detalhando erros, cabeçalhos e versionamento.**

**Com muitos endpoints** — mais de seis ou sete indica que o escopo não foi delimitado.

**Debatendo estilo** por vários minutos.

**Sem conectar ao modelo de dados** e ao desenho.

**Antes dos requisitos não funcionais** — sem eles, não há como agrupar por perfil.

## Alternativas

- **Descrever as operações em texto** — quando o tempo aperta; menos preciso e mais rápido.
- **Começar pelo modelo de dados** — funciona igualmente bem em domínios centrados em dados.
- **Pular para o desenho** — legítimo se o entrevistador indicar que quer chegar rápido à
  arquitetura.

## Trade-offs

| Escrever a API | Pular |
|---|---|
| Escopo fixado | Mais tempo para desenho |
| Modelo revelado | Risco de escopo fluido |
| Dois minutos | Nenhum |

| Poucos endpoints | Muitos |
|---|---|
| Escopo claro | Cobertura completa |
| Foco no que decide | Consome tempo |

## Modos de Falha

**Escopo fluido.** Sem API, o sistema cresce durante a entrevista.

**API detalhada demais.** Tempo gasto no que não é avaliado.

**Sem agrupar por perfil.** Perde-se a informação que orienta o desenho.

**Debate de estilo.** Consome tempo sem demonstrar nada.

**Endpoint que não corresponde a requisito.** Sinal de que o candidato está recitando.

## Erros Comuns

**Escrever dez endpoints** para um sistema com quatro requisitos.

**Não marcar qual operação domina o volume.**

**Detalhar paginação e erros.**

**Esquecer a operação de maior volume** — em encurtadores, o redirecionamento.

**Não dizer o que ficou de fora.**

## Exemplo de Entrevista

**Problema.** "Projete um serviço de feed de notícias."

**API, escrita em dois minutos:**

```text
POST /posts            {conteudo, midia?}  →  {id, criado_em}
GET  /feed             ?cursor=&limite=    →  {posts[], proximo_cursor}
POST /follows          {usuario_id}        →  204
DELETE /follows/{id}                       →  204
POST /posts/{id}/reacoes {tipo}            →  204
```

**Agrupamento por perfil, dito em voz alta:**

```text
"GET /feed é a operação que dimensiona o sistema: 300 milhões
 de usuários diários, cinco aberturas cada, dá 15 mil por segundo.
 Ela é leitura, tolera 30 segundos de defasagem, e precisa de
 p95 abaixo de 500 ms.

 POST /posts é 500 milhões por dia, ou ~6 mil por segundo —
 quarenta vezes menos. Precisa de durabilidade, tolera latência
 de 1 segundo.

 POST /reacoes é o de maior volume absoluto, mas é fogo e esquece:
 pode ser assíncrono, e a contagem pode ser aproximada.

 follows são raros: alguns milhares por segundo, sem requisito
 especial."
```

**O que essa API já decidiu:**

```text
paginação por cursor no feed
  → o feed é uma sequência ordenada, não um conjunto
  → sugere lista materializada, não consulta agregada

reação como operação separada, sem retorno de contagem
  → a contagem não precisa ser imediata nem exata

follow como operação simples
  → o grafo é consultado, não retornado; ele é interno
```

**O que fica de fora, declarado:**

```text
"não vou detalhar autenticação, códigos de erro nem versionamento.
 Também não vou incluir busca nem mensagens diretas, que estavam
 fora do escopo que combinamos."
```

**Pergunta de acompanhamento provável:** "como o cliente sabe que há posts novos?"

A resposta abre uma decisão real: consulta periódica, conexão persistente, ou notificação. E
cada uma tem consequência de escala — com 300 milhões de usuários, conexões persistentes são um
subsistema próprio. Ver o [case de mensageria](../21-case-studies/messaging-platform.md).

## Conceitos Relacionados

- [Modelagem na Entrevista](interview-data-modeling.md).
- [Arquitetura de Alto Nível](high-level-architecture.md).
- [Contratos de Integração](../08-integration-architecture/integration-contracts.md).
- [APIs](../05-system-design/apis.md).

## Exercício Prático

Escreva, em dois minutos, a API de um sistema de agendamento de consultas.

Depois marque, ao lado de cada endpoint, o volume esperado e o requisito de latência. Se algum
endpoint não tiver perfil declarado, você não sabe se ele importa para o dimensionamento.

## Perguntas de Entrevista

- Por que escrever a API antes do desenho interno economiza tempo?
- Por que agrupar endpoints por características não funcionais?
- O que numa API de entrevista não deve ser detalhado?

## Para Aprofundar

- Xu, Alex. *System Design Interview*. Byte Code, 2020.
- Fielding, Roy. *Architectural Styles and the Design of Network-based Software Architectures*,
  2000.
- Newman, Sam. *Building Microservices*. 2ª ed. O'Reilly, 2021.
