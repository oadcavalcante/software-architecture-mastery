---
id: interview-data-modeling
title: Modelagem de Dados na Entrevista
sidebar_position: 6
description: Comece pelos padrões de acesso, não pelas entidades — é o que decide o armazenamento.
doc_type: concept
level: 0
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor deriva o modelo e a escolha de armazenamento dos padrões de acesso, e
  justifica cada um com um requisito.
prerequisites: [interview-api-design]
related: [interview-api-design, high-level-architecture, interview-scaling]
canonical_for: [modelagem em entrevista, padrão de acesso como ponto de partida, escolha de armazenamento em entrevista]
content_version: 1
last_reviewed: 2026-08-29
---

# Modelagem de Dados na Entrevista

## Visão Geral

A modelagem numa entrevista tem uma ordem que a formação tradicional inverte:

```text
tradicional   entidades → relacionamentos → normalização → consultas
entrevista    padrões de acesso → modelo que os atende → armazenamento
```

A segunda ordem é a correta porque o que decide o armazenamento não é a natureza dos dados — é
**como eles são lidos e escritos**. Duas aplicações com as mesmas entidades e padrões de acesso
diferentes pedem armazenamentos diferentes.

E há uma consequência prática para a entrevista: começar pelos acessos produz uma justificativa
para cada decisão, e é a justificativa que está sendo avaliada.

## Problema

O padrão comum:

```text
candidato   "vou ter uma tabela de usuários, uma de posts,
            uma de follows, e uma de reações"
```

Está correto e não informa nada. Esse modelo serve a qualquer rede social, de mil ou de um
bilhão de usuários, com qualquer requisito de latência. Ele não foi derivado — foi lembrado.

A pergunta seguinte do entrevistador expõe o problema: "como você monta o feed?". Se o modelo não
foi pensado a partir dessa consulta, a resposta é uma junção sobre milhões de linhas, e a
conversa vai para um lugar ruim.

O erro oposto é escolher o armazenamento antes de saber os acessos:

```text
"vou usar um banco NoSQL porque precisa escalar"
```

Escalar quantas leituras, de que forma, com quais consultas? Sem responder isso, a escolha é
preferência.

## Conceitos Centrais

### Comece listando as consultas

```text
"quais são as leituras deste sistema?"

1. montar o feed de um usuário          altíssimo volume
2. ver o perfil e os posts de alguém     alto
3. contar reações de um post             altíssimo, aproximado
4. listar quem alguém segue              baixo
5. buscar por conteúdo                   médio
```

Cada uma dessas é um requisito de modelo. A número 1 é a que dimensiona, e é a que deve orientar
as decisões — as demais se acomodam.

E as escritas, com seus volumes:

```text
criar post           6 mil/s
seguir alguém        alguns milhares/s
reagir               ~30 mil/s
```

### Derive o modelo da consulta dominante

```text
consulta dominante   "posts de quem eu sigo, ordenados, paginados"

modelo A   consultar posts filtrando por autores seguidos
           → junção sobre grande volume; lento em escala
modelo B   lista materializada por usuário, mantida na escrita
           → leitura por chave; rápida
```

A escolha entre A e B não é sobre elegância — é sobre a razão entre leitura e escrita, e sobre a
distribuição de seguidores. Ver o
[case de rede social](/21-case-studies/social-network.md).

Fazer essa derivação em voz alta é o conteúdo da avaliação.

O que se busca não é que o candidato escolha B — que é a resposta conhecida para redes sociais
grandes —, e sim que ele mostre o cálculo que leva a B e diga sob qual condição A seria melhor.
Um candidato que propõe a lista materializada porque leu que é assim que se faz, e não consegue
dizer a partir de que razão leitura/escrita ela compensa, está recitando.

### Chaves antes de campos

Numa entrevista, os campos importam pouco; as **chaves de acesso** importam muito.

```text
posts        chave primária: (autor_id, criado_em)  ou  post_id?
             a escolha depende de qual consulta domina
feed         chave: usuario_id, com lista ordenada
follows      duas direções? (seguidor, seguido) e (seguido, seguidor)?
             depende de quais perguntas são feitas
```

A última linha é um exemplo típico: "quem eu sigo" e "quem me segue" são consultas diferentes, e
atender às duas com um índice só não é possível. Reconhecer isso e propor os dois índices é um
ponto.

E há um detalhe que vai além: as duas consultas têm perfis de volume muito diferentes. "Quem eu
sigo" é lida na montagem do feed e tem cardinalidade baixa; "quem me segue" é lida na distribuição
de um post e pode ter milhões de linhas para uma conta grande. Mencionar essa assimetria conecta
o modelo ao problema de escala, e é o tipo de observação que move a conversa para o nível
seguinte.

### Escolha o armazenamento com justificativa

```text
relacional          consulta não prevista, transação, integridade
chave-valor         acesso por chave conhecida, latência mínima
documento           agregado lido inteiro, atributos variáveis
coluna larga        escrita massiva, leitura por faixa de chave
grafo               travessia de múltiplos saltos
busca               texto e navegação facetada
série temporal      métrica por janela, agregação
```

E a frase que demonstra maturidade:

```text
"vou usar um relacional para o núcleo, porque o volume cabe e
 vamos precisar de consultas não previstas. O feed materializado
 vai para um armazenamento chave-valor, porque o acesso é sempre
 por identificador de usuário e a latência importa. E a busca
 vai para um índice dedicado."
```

Três armazenamentos, cada um com uma razão. Ver
[SQL vs. NoSQL](/20-trade-offs/sql-vs-nosql.md).

### Cuidado com poliglota gratuito

O oposto do erro anterior: propor cinco armazenamentos porque cada um é "o certo para o caso".
Cada um custa operação, competência e consistência entre eles.

```text
"poderia usar um banco de grafos para o social, mas as consultas
 são de um salto só — quem eu sigo, quem me segue. Um relacional
 com dois índices resolve, e é um armazenamento a menos para operar."
```

Justificar por que **não** adotar algo vale tanto quanto justificar por que adotar. Ver
[gerenciado vs. autogerido](/20-trade-offs/managed-vs-self-hosted.md) para o custo operacional.

### Particionamento: só quando o número pede

Propor chave de partição é esperado quando o volume justifica, e é erro quando não.

```text
"6 bilhões de posts, 4 TB — um relacional particionado por
 período atende. A chave de partição seria a data de criação,
 porque as consultas são sempre recentes."

"O feed materializado é particionado por usuario_id, porque
 o acesso é sempre por usuário e isso distribui uniformemente."
```

Escolher a chave errada é pior que não particionar: particionar posts por `autor_id` quando a
consulta é por data produz varredura de todas as partições.

A regra prática é que a chave de partição deve aparecer na cláusula de filtro da consulta
dominante. Se a consulta que domina o volume não filtra pela chave escolhida, o particionamento
transforma uma consulta que tocava um índice em uma que toca todas as partições — piorando
exatamente o que ele deveria melhorar.

### Distribuição de dados quentes

Um ponto que diferencia: mencionar que a distribuição de acesso é desigual e que isso cria pontos
quentes.

```text
"contas com milhões de seguidores concentram leitura. Se eu
 particionar por autor, essas partições ficam quentes. Uma saída
 é tratar as contas grandes de forma diferente."
```

Ver [pontos quentes](/11-scalability/hotspots.md).

## Modelo Mental

**Liste as consultas primeiro.** O modelo é derivado da consulta dominante, e o armazenamento é
derivado do modelo — cada um com uma justificativa em voz alta.

## Quando Usar

- Depois da API, antes ou junto do desenho de alto nível.
- Começando pelas consultas, não pelas entidades.
- Com uma justificativa por escolha de armazenamento.

## Quando Não Usar

**Listando entidades sem consultas.**

**Escolhendo armazenamento antes dos padrões de acesso.**

**Detalhando todos os campos** — chaves e relacionamentos bastam.

**Propondo poliglota** sem justificar cada armazenamento.

**Particionando** volumes que não pedem.

## Alternativas

- **Modelar apenas a consulta dominante** — quando o tempo aperta, ela é a que importa.
- **Descrever o modelo em texto** em vez de desenhar tabelas.
- **Deixar para depois do desenho** — modelar quando o gargalo aparecer é legítimo e mantém o
  ritmo.

## Trade-offs

| Modelar cedo | Modelar sob demanda |
|---|---|
| Base para o desenho | Cada decisão tem contexto |
| Pode antecipar demais | Interrompe o fluxo |

| Um armazenamento | Poliglota |
|---|---|
| Operação simples | Ferramenta certa por caso |
| Compromisso em alguns casos | Custo e consistência |

## Modos de Falha

**Entidades sem consultas.** Modelo genérico.

**Armazenamento escolhido por preferência.**

**Chave de partição errada.** Varredura de todas as partições.

**Poliglota sem justificativa.**

**Ignorar pontos quentes** numa distribuição desigual.

## Erros Comuns

**Começar por diagrama de entidades.**

**Não considerar as duas direções** de um relacionamento.

**Propor NoSQL por "escala"** sem número.

**Detalhar tipos de coluna.**

**Não mencionar índices** onde eles decidem a viabilidade da consulta.

## Exemplo de Entrevista

**Problema.** "Projete um sistema de reserva de assentos para eventos."

**Consultas, listadas primeiro:**

```text
leitura
  mapa de assentos disponíveis de uma sessão    altíssimo, no on-sale
  detalhe de um evento                          alto
  minhas reservas                               baixo

escrita
  reservar assentos                             pico extremo no on-sale
  confirmar pagamento                           idem
  liberar reserva expirada                      contínuo
```

**A consulta que dimensiona:** mapa de assentos no início da venda. Um evento popular tem dezenas
de milhares de pessoas consultando o mesmo mapa simultaneamente.

**A escrita que dimensiona:** reserva do mesmo assento por várias pessoas ao mesmo tempo. É um
problema de contenção, não de volume.

**Modelo derivado:**

```text
evento     (id, nome, data, local)
sessao     (id, evento_id, data_hora)
assento    (id, sessao_id, setor, fila, numero, preco)
reserva    (id, sessao_id, assento_id, usuario_id, estado,
            expira_em, criada_em)
           restrição de unicidade em (sessao_id, assento_id)
           para reservas ativas
```

**A justificativa, em voz alta:**

```text
"A restrição de unicidade no banco é a decisão central. Reservar
 um assento é uma operação que não pode ser aproximada: dois
 assentos vendidos para a mesma poltrona é um incidente com
 pessoas na porta do teatro.

 Isso descarta consistência eventual nessa operação e pede um
 armazenamento com transação — vou usar relacional.

 O mapa de assentos, que é a leitura pesada, não precisa ser
 exato: um assento mostrado como disponível e já reservado
 produz uma tentativa que falha, o que é aceitável. Então ele
 vai para cache, com invalidação por evento e janela de segundos."
```

**Particionamento:**

```text
"A contenção é por sessão, não global. Particionar por sessao_id
 distribui naturalmente: dois eventos diferentes não competem.

 Dentro de uma sessão popular, a contenção permanece — e é
 inerente ao problema. O que se pode fazer é reduzir a duração
 da transação e usar reserva com expiração curta, para que
 assentos não fiquem presos."
```

**Pergunta de acompanhamento provável:** "e se um evento tiver 100 mil assentos e 2 milhões de
pessoas na fila?"

A resposta correta reconhece que o problema deixa de ser de banco e passa a ser de **fila de
espera**: admitir usuários no sistema de reserva em taxa controlada, o que transforma um pico
impossível numa carga administrável. Reconhecer que a solução está fora do modelo de dados é o
ponto.

## Conceitos Relacionados

- [Desenho de API](/22-system-design-interviews/interview-api-design.md).
- [SQL vs. NoSQL](/20-trade-offs/sql-vs-nosql.md).
- [Modelagem de Dados](/07-data-architecture/data-modeling.md).
- [Pontos Quentes](/11-scalability/hotspots.md).

## Exercício Prático

Liste as consultas de um sistema de comentários aninhados e derive o modelo a partir delas.

Depois responda: qual consulta você atenderia mal com um modelo relacional normalizado, e o que
você mudaria? A resposta mostra por que a ordem "consultas primeiro" importa.

## Perguntas de Entrevista

- Por que listar consultas antes de entidades?
- Por que a chave de partição errada é pior que não particionar?
- Quando propor mais de um tipo de armazenamento é justificado?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Sadalage, Pramod; Fowler, Martin. *NoSQL Distilled*. Addison-Wesley, 2012.
- Xu, Alex. *System Design Interview*. Byte Code, 2020.
